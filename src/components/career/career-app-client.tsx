"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Database,
  FileSearch,
  Linkedin,
  LogIn,
  LogOut,
  MessageSquareText,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoadmapTimeline, type RoadmapMonth } from "@/components/career/roadmap-timeline";
import { ProjectCards, type ProjectItem } from "@/components/career/project-cards";
import {
  ToolOutputCard,
  ToolOutputSkeleton,
} from "@/components/career/tool-output-card";
import { StreamingMarkdown } from "@/components/career/streaming-markdown";
import { ResumeStructuredOutput } from "@/components/career/resume-structured-output";
import {
  LearningWeeksPanel,
  type LearningWeek,
} from "@/components/career/learning-weeks-panel";
import {
  InterviewPrepOutput,
  InterviewPrepSkeleton,
  JdAnalyzerOutput,
  JdAnalyzerSkeleton,
  LinkedInOptimizerOutput,
  LinkedInOptimizerSkeleton,
  StructuredEmptyState,
  StructuredToolOutputCard,
  interviewPrepToCopy,
  jdAnalysisToCopy,
  linkedInOptimizationToCopy,
  type InterviewPrepData,
  type JdAnalysisData,
  type LinkedInOptimizationData,
} from "@/components/career/structured-career-tools";
import { parseResumeFromMarkdown } from "@/lib/parse-resume-output";
import { cn } from "@/lib/utils";
import {
  createWorkTitle,
  toolLabels,
  type CareerWorkTool,
  type SavedCareerWork,
} from "@/lib/career-work";
import {
  isSupabaseBrowserConfigured,
  supabaseBrowser,
} from "@/lib/supabase-client";

function roadmapToCopy(months: RoadmapMonth[]): string {
  return months
    .map(
      (m) =>
        `${m.month}\nMilestones:\n${m.milestones?.map((x) => `• ${x}`).join("\n")}\nSkills:\n${m.skills?.map((x) => `• ${x}`).join("\n")}\nResources:\n${m.resources?.map((x) => `• ${x}`).join("\n")}`
    )
    .join("\n\n---\n\n");
}

function projectsToCopy(projects: ProjectItem[]): string {
  return projects
    .map(
      (p) =>
        `${p.name} (${p.difficulty})\n${p.description}\nWhy it impresses: ${p.impresses}\nSkills: ${p.skills?.join(", ")}`
    )
    .join("\n\n---\n\n");
}

function learningToCopy(weeks: LearningWeek[]): string {
  return weeks
    .map(
      (w) =>
        `Week ${w.week}\nGoals:\n${w.goals?.map((g) => `• ${g}`).join("\n")}\nResources:\n${w.resources?.map((r) => `• ${r.title}${r.detail ? ` — ${r.detail}` : ""}`).join("\n")}\nMilestone: ${w.milestone}`
    )
    .join("\n\n---\n\n");
}

function tryParseJsonObject<T>(raw: string): T | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return JSON.parse(t) as T;
  } catch {
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(t.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function streamCareer(
  tool: string,
  payload: Record<string, unknown>,
  onDelta: (accumulated: string) => void
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const res = await fetch("/api/career", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, payload }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return {
      ok: false,
      error:
        typeof j.error === "string" ? j.error : "Something went wrong.",
    };
  }
  const reader = res.body?.getReader();
  const dec = new TextDecoder();
  if (!reader) {
    return { ok: false, error: "No response stream." };
  }
  let acc = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
    onDelta(acc);
  }
  return { ok: true, text: acc };
}

async function fetchCareerJson<T>(
  tool: string,
  payload: Record<string, unknown>
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const res = await fetch("/api/career", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, payload }),
  });
  const text = await res.text();
  if (!res.ok) {
    const parsedError = tryParseJsonObject<{ error?: string }>(text);
    return {
      ok: false,
      error:
        typeof parsedError?.error === "string"
          ? parsedError.error
          : "Something went wrong.",
    };
  }
  const data = tryParseJsonObject<T>(text);
  if (!data) {
    return {
      ok: false,
      error:
        "Compass returned a response I could not read. Please try again.",
    };
  }
  return { ok: true, data };
}

type SaveCareerWorkArgs = {
  tool: CareerWorkTool;
  title?: string;
  input: Record<string, unknown>;
  output: unknown;
};

type SaveCareerWork = (args: SaveCareerWorkArgs) => Promise<{
  ok: boolean;
  error?: string;
}>;

type AuthMessageTone = "info" | "success" | "error";

type CareerTabProps = {
  canSave: boolean;
  saveWork: SaveCareerWork;
  getAccessToken: () => Promise<string | null>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSavedArray<T>(output: unknown, key: string): T[] | null {
  if (!isRecord(output) || !Array.isArray(output[key])) return null;
  return output[key] as T[];
}

function formatSavedOutput(item: SavedCareerWork): string {
  const { output } = item;
  if (typeof output === "string") return output;

  switch (item.tool) {
    case "roadmap": {
      const months = getSavedArray<RoadmapMonth>(output, "months");
      if (months?.length) return roadmapToCopy(months);
      break;
    }
    case "projects": {
      const projects = getSavedArray<ProjectItem>(output, "projects");
      if (projects?.length) return projectsToCopy(projects);
      break;
    }
    case "learning": {
      const weeks = getSavedArray<LearningWeek>(output, "weeks");
      if (weeks?.length) return learningToCopy(weeks);
      break;
    }
    case "interview":
      if (isRecord(output) && Array.isArray(output.questions)) {
        return interviewPrepToCopy(output as InterviewPrepData);
      }
      break;
    case "linkedin":
      if (isRecord(output) && isRecord(output.headline)) {
        return linkedInOptimizationToCopy(output as LinkedInOptimizationData);
      }
      break;
    case "jdanalyzer":
      if (isRecord(output) && Array.isArray(output.mustHave)) {
        return jdAnalysisToCopy(output as JdAnalysisData);
      }
      break;
    case "resume":
      break;
  }

  return JSON.stringify(output, null, 2);
}

async function copySavedOutput(item: SavedCareerWork) {
  try {
    const text = `${item.title}\n${toolLabels[item.tool]}\n\n${formatSavedOutput(
      item
    )}`;
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore clipboard failures */
  }
}

export function CareerAppClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageTone, setAuthMessageTone] =
    useState<AuthMessageTone>("info");
  const [authLoading, setAuthLoading] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedCareerWork[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const canSave = Boolean(isSupabaseBrowserConfigured && session);

  const getAccessToken = useCallback(async () => {
    if (!supabaseBrowser) return null;
    const { data } = await supabaseBrowser.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const loadSavedItems = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setSavedItems([]);
      return;
    }
    setSavedLoading(true);
    try {
      const res = await fetch("/api/work-items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        items?: SavedCareerWork[];
        configured?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setSaveStatus(data.error ?? "Could not load saved work.");
        return;
      }
      if (data.configured === false) {
        setSaveStatus("Server Supabase keys are missing. Outputs cannot save yet.");
      }
      setSavedItems(data.items ?? []);
    } finally {
      setSavedLoading(false);
    }
  }, [getAccessToken]);

  const saveWork = useCallback<SaveCareerWork>(
    async ({ tool, title, input, output }) => {
      setSaveStatus("Saving output…");
      const token = await getAccessToken();
      if (!token) {
        const error = "Sign in before running a tool to save outputs.";
        setSaveStatus(error);
        return { ok: false, error };
      }
      const res = await fetch("/api/work-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tool,
          title: title || createWorkTitle(tool, input),
          input,
          output,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        item?: SavedCareerWork;
        error?: string;
      };
      if (!res.ok) {
        const error = data.error ?? "Could not save this output.";
        setSaveStatus(`Save failed: ${error}`);
        return { ok: false, error };
      }
      if (data.item) {
        setSavedItems((items) => [data.item as SavedCareerWork, ...items]);
        setSaveStatus("Saved to My Work.");
        return { ok: true };
      }
      const error = "Saved response did not include an item.";
      setSaveStatus(`Save failed: ${error}`);
      return { ok: false, error };
    },
    [getAccessToken]
  );

  const deleteSavedItem = useCallback(
    async (id: string) => {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(`/api/work-items?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSavedItems((items) => items.filter((item) => item.id !== id));
      }
    },
    [getAccessToken]
  );

  useEffect(() => {
    if (!supabaseBrowser) return;

    supabaseBrowser.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data } = supabaseBrowser.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      void loadSavedItems();
    } else {
      setSavedItems([]);
    }
  }, [loadSavedItems, session]);

  async function signIn() {
    setAuthMessage("");
    setAuthMessageTone("info");
    if (!supabaseBrowser) {
      setAuthMessageTone("error");
      setAuthMessage("Add Supabase environment variables to enable sign in.");
      return;
    }
    const email = authEmail.trim();
    if (!email) {
      setAuthMessageTone("error");
      setAuthMessage("Enter your email to get a magic link.");
      return;
    }
    setAuthLoading(true);
    setAuthMessage("Sending magic link...");
    try {
      const { error } = await supabaseBrowser.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/app`
              : undefined,
        },
      });
      if (error) {
        setAuthMessageTone("error");
        setAuthMessage(`Sign in failed: ${error.message}`);
        return;
      }
      setAuthMessageTone("success");
      setAuthMessage("Magic link sent. Check your email.");
    } catch (error) {
      setAuthMessageTone("error");
      setAuthMessage(
        error instanceof Error
          ? `Sign in failed: ${error.message}`
          : "Sign in failed. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    setAuthMessage("");
    setAuthMessageTone("info");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Coaching tools
        </h1>
        <p className="mt-2 text-muted">
          Pick a tool, add your context, and get structured output you can act
          on today. Sign in to save your resumes and generated work.
        </p>
      </div>

      <AccountAndSavedWork
        session={session}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authLoading={authLoading}
        authMessage={authMessage}
        authMessageTone={authMessageTone}
        savedItems={savedItems}
        savedLoading={savedLoading}
        saveStatus={saveStatus}
        onSignIn={signIn}
        onSignOut={signOut}
        onDelete={deleteSavedItem}
      />

      <Tabs defaultValue="resume" className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max min-w-full justify-start sm:w-full sm:min-w-0">
            <TabsTrigger
              value="resume"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              Resume Review
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              Roadmap Generator
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              Portfolio Projects
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              Learning Plan
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              Interview Prep
            </TabsTrigger>
            <TabsTrigger
              value="linkedin"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              LinkedIn Optimizer
            </TabsTrigger>
            <TabsTrigger
              value="jdanalyzer"
              className="px-2.5 text-xs sm:flex-1 sm:px-3 sm:text-sm"
            >
              JD Analyzer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resume">
          <ResumeTab
            canSave={canSave}
            saveWork={saveWork}
            getAccessToken={getAccessToken}
          />
        </TabsContent>
        <TabsContent value="roadmap">
          <RoadmapTab canSave={canSave} saveWork={saveWork} getAccessToken={getAccessToken} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab canSave={canSave} saveWork={saveWork} getAccessToken={getAccessToken} />
        </TabsContent>
        <TabsContent value="learning">
          <LearningTab canSave={canSave} saveWork={saveWork} getAccessToken={getAccessToken} />
        </TabsContent>
        <TabsContent value="interview">
          <InterviewPrepTab canSave={canSave} saveWork={saveWork} getAccessToken={getAccessToken} />
        </TabsContent>
        <TabsContent value="linkedin">
          <LinkedInOptimizerTab canSave={canSave} saveWork={saveWork} getAccessToken={getAccessToken} />
        </TabsContent>
        <TabsContent value="jdanalyzer">
          <JdAnalyzerTab canSave={canSave} saveWork={saveWork} getAccessToken={getAccessToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccountAndSavedWork({
  session,
  authEmail,
  setAuthEmail,
  authLoading,
  authMessage,
  authMessageTone,
  savedItems,
  savedLoading,
  saveStatus,
  onSignIn,
  onSignOut,
  onDelete,
}: {
  session: Session | null;
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authLoading: boolean;
  authMessage: string;
  authMessageTone: AuthMessageTone;
  savedItems: SavedCareerWork[];
  savedLoading: boolean;
  saveStatus: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <section className="mb-8 grid gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Save className="h-4 w-4 text-accent-secondary" />
          <h2 className="text-sm font-semibold text-foreground">
            Save your work
          </h2>
        </div>
        {isSupabaseBrowserConfigured ? (
          session ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {session.user.email}
                </span>
                . New outputs save automatically.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted">
                Sign in with a magic link to save uploaded resumes and generated
                results.
              </p>
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onSignIn();
                }}
              >
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="shrink-0"
                >
                  <LogIn className="h-4 w-4" />
                  {authLoading ? "Sending…" : "Send link"}
                </Button>
              </form>
              {authMessage ? (
                <p
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    authMessageTone === "error"
                      ? "border-red-400/30 bg-red-400/10 text-red-200"
                      : authMessageTone === "success"
                        ? "border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary"
                        : "border-border bg-card text-muted"
                  )}
                  role={authMessageTone === "error" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {authMessage}
                </p>
              ) : null}
            </div>
          )
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            Supabase is not configured yet. The tools still work, but saved work
            and resume file storage unlock after you add the Supabase env vars.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">My Work</h2>
          </div>
          {savedLoading ? (
            <span className="text-xs text-muted">Loading…</span>
          ) : null}
        </div>
        {saveStatus ? (
          <p
            className={cn(
              "mb-3 rounded-md border px-3 py-2 text-sm",
              saveStatus.toLowerCase().includes("failed") ||
                saveStatus.toLowerCase().includes("missing") ||
                saveStatus.toLowerCase().includes("could not")
                ? "border-red-400/30 bg-red-400/10 text-red-200"
                : "border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary"
            )}
            role="status"
          >
            {saveStatus}
          </p>
        ) : null}
        {session ? (
          savedItems.length ? (
            <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
              {savedItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-md border border-border bg-card px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span>{toolLabels[item.tool]}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copySavedOutput(item)}
                        className="h-8 px-2 text-xs text-muted hover:text-foreground"
                      >
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                        className="h-8 w-8 text-muted hover:text-red-300"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              Saved outputs will appear here after you run a tool.
            </p>
          )
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            Sign in to see your saved resume reviews, roadmaps, LinkedIn
            rewrites, JD analyses, and interview prep.
          </p>
        )}
      </div>
    </section>
  );
}

function ResumeTab({ canSave, saveWork, getAccessToken }: CareerTabProps) {
  const [resume, setResume] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [output, setOutput] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const parsedResume = useMemo(() => {
    if (loading || !output.trim()) return null;
    return parseResumeFromMarkdown(output);
  }, [loading, output]);

  const reset = useCallback(() => {
    setResume("");
    setTargetRole("");
    setOutput("");
    setResumeFileName("");
    setUploadMessage("");
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function uploadResume(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploadMessage("");
    setResumeFileName(file.name);
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = await getAccessToken();
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as {
        text?: string;
        saved?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.text) {
        setError(data.error ?? "Could not read that resume file.");
        return;
      }
      setResume(data.text);
      setUploadMessage(
        data.saved
          ? `${file.name} imported and saved.`
          : data.message ?? `${file.name} imported.`
      );
    } catch {
      setError("Upload failed. Try a PDF, DOCX, or TXT file.");
    } finally {
      setUploadingResume(false);
    }
  }

  async function analyze() {
    setError("");
    setOutput("");
    setResponseId((n) => n + 1);
    if (!resume.trim() || !targetRole.trim()) {
      setError("Add your resume text and a target role so the coach can be specific.");
      return;
    }
    setLoading(true);
    try {
      const result = await streamCareer(
        "resume",
        { resume, role: targetRole },
        setOutput
      );
      if (!result.ok) setError(result.error);
      if (result.ok && canSave) {
        await saveWork({
          tool: "resume",
          input: { role: targetRole, resume },
          output: result.text,
        });
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const showStructured = Boolean(!loading && parsedResume);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border bg-card p-4">
          <Label htmlFor="resume-upload" className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-accent-secondary" />
            Upload resume
          </Label>
          <p className="mt-1 text-sm text-muted">
            PDF, DOCX, or TXT. Compass will extract the text into the editor
            below{canSave ? " and save the original file." : "."}
          </p>
          <div className="mt-3 flex min-h-10 items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(e) => uploadResume(e.target.files?.[0])}
              disabled={uploadingResume || loading}
              className="sr-only"
            />
            <label
              htmlFor="resume-upload"
              className={cn(
                "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-card",
                (uploadingResume || loading) &&
                  "pointer-events-none opacity-60"
              )}
            >
              Choose file
            </label>
            <span className="min-w-0 truncate text-sm text-foreground">
              {resumeFileName || "No file chosen"}
            </span>
          </div>
          {uploadMessage ? (
            <p className="mt-2 text-sm text-accent-secondary" role="status">
              {uploadMessage}
            </p>
          ) : null}
          {uploadingResume ? (
            <p className="mt-2 text-sm text-muted">Reading resume…</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="resume-text">Resume text</Label>
          <Textarea
            id="resume-text"
            placeholder="Paste your resume here (plain text is fine)."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="min-h-[220px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-role">Target role</Label>
          <Input
            id="target-role"
            placeholder="e.g. Senior product designer, fintech"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
        <Button type="button" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div>
        {loading && !output ? (
          <ToolOutputSkeleton />
        ) : (
          <ToolOutputCard
            animationKey={responseId}
            textToCopy={output}
            onStartOver={reset}
            disabledCopy={!output}
          >
            {output ? (
              showStructured && parsedResume ? (
                <ResumeStructuredOutput data={parsedResume} />
              ) : (
                <StreamingMarkdown content={output} />
              )
            ) : (
              <p className="text-sm leading-relaxed text-[#6B6A80]">
                Your ATS score, strengths, improvements, and a sample bullet
                rewrite will stream here after you run an analysis.
              </p>
            )}
          </ToolOutputCard>
        )}
      </div>
    </div>
  );
}

function RoadmapTab({ canSave, saveWork }: CareerTabProps) {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [timeline, setTimeline] = useState("");
  const [streamText, setStreamText] = useState("");
  const [months, setMonths] = useState<RoadmapMonth[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const reset = useCallback(() => {
    setRole("");
    setSkills("");
    setTimeline("");
    setStreamText("");
    setMonths(null);
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function build() {
    setError("");
    setStreamText("");
    setMonths(null);
    setResponseId((n) => n + 1);
    if (!role.trim() || !skills.trim() || !timeline.trim()) {
      setError("Fill in role, skills, and timeline.");
      return;
    }
    setLoading(true);
    try {
      const result = await streamCareer(
        "roadmap",
        { role, skills, timeline },
        setStreamText
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const data = tryParseJsonObject<{ months?: RoadmapMonth[] }>(
        result.text
      );
      if (data?.months?.length) setMonths(data.months);
      if (canSave) {
        await saveWork({
          tool: "roadmap",
          input: { role, skills, timeline },
          output: data?.months?.length ? { months: data.months } : result.text,
        });
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rm-role">What role are you targeting?</Label>
          <Input
            id="rm-role"
            placeholder="e.g. Backend engineer, data platform"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rm-skills">Current skills (comma separated)</Label>
          <Input
            id="rm-skills"
            placeholder="Python, SQL, basic AWS, Git"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rm-time">Timeline</Label>
          <Input
            id="rm-time"
            placeholder="e.g. 6 months"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          />
        </div>
        <Button type="button" onClick={build} disabled={loading}>
          {loading ? "Building…" : "Build my roadmap"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div>
        {loading && !streamText ? (
          <ToolOutputSkeleton />
        ) : (
          <ToolOutputCard
            animationKey={responseId}
            textToCopy={
              months?.length ? roadmapToCopy(months) : streamText
            }
            onStartOver={reset}
            disabledCopy={!streamText && !months?.length}
          >
            {months?.length ? (
              <RoadmapTimeline months={months} light />
            ) : streamText ? (
              <StreamingMarkdown content={streamText} />
            ) : (
              <p className="text-sm leading-relaxed text-[#6B6A80]">
                You will get a vertical timeline with milestones, skills, and
                resources for each month of your plan.
              </p>
            )}
          </ToolOutputCard>
        )}
      </div>
    </div>
  );
}

function ProjectsTab({ canSave, saveWork }: CareerTabProps) {
  const [targetRole, setTargetRole] = useState("");
  const [stack, setStack] = useState("");
  const [level, setLevel] = useState("");
  const [streamText, setStreamText] = useState("");
  const [projects, setProjects] = useState<ProjectItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const reset = useCallback(() => {
    setTargetRole("");
    setStack("");
    setLevel("");
    setStreamText("");
    setProjects(null);
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function suggest() {
    setError("");
    setStreamText("");
    setProjects(null);
    setResponseId((n) => n + 1);
    if (!targetRole.trim() || !stack.trim() || !level) {
      setError("Choose role, stack or domain, and experience level.");
      return;
    }
    setLoading(true);
    try {
      const result = await streamCareer(
        "projects",
        { role: targetRole, stack, level },
        setStreamText
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const data = tryParseJsonObject<{ projects?: ProjectItem[] }>(
        result.text
      );
      if (data?.projects?.length) setProjects(data.projects);
      if (canSave) {
        await saveWork({
          tool: "projects",
          input: { role: targetRole, stack, level },
          output: data?.projects?.length
            ? { projects: data.projects }
            : result.text,
        });
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2 xl:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pj-role">Target role</Label>
          <Input
            id="pj-role"
            placeholder="e.g. ML engineer, healthcare"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pj-stack">Tech stack / domain</Label>
          <Input
            id="pj-stack"
            placeholder="e.g. React, TypeScript, Node — or climate policy research"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Experience level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="1-2 yrs">1-2 yrs</SelectItem>
              <SelectItem value="3-5 yrs">3-5 yrs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={suggest} disabled={loading}>
          {loading ? "Suggesting…" : "Suggest projects"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className={cn(!loading && !projects && !streamText && "xl:col-span-1")}>
        {loading && !streamText ? (
          <ToolOutputSkeleton />
        ) : (
          <ToolOutputCard
            animationKey={responseId}
            textToCopy={
              projects?.length ? projectsToCopy(projects) : streamText
            }
            onStartOver={reset}
            disabledCopy={!streamText && !projects?.length}
          >
            {projects?.length ? (
              <ProjectCards projects={projects} light />
            ) : streamText ? (
              <StreamingMarkdown content={streamText} />
            ) : (
              <p className="text-sm leading-relaxed text-[#6B6A80]">
                Four project ideas tailored to your role and stack, with
                recruiter-facing rationale and difficulty tags.
              </p>
            )}
          </ToolOutputCard>
        )}
      </div>
    </div>
  );
}

function LearningTab({ canSave, saveWork }: CareerTabProps) {
  const [goalRole, setGoalRole] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [streamText, setStreamText] = useState("");
  const [weeks, setWeeks] = useState<LearningWeek[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const reset = useCallback(() => {
    setGoalRole("");
    setHoursPerWeek("");
    setKnowledge("");
    setStreamText("");
    setWeeks(null);
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function create() {
    setError("");
    setStreamText("");
    setWeeks(null);
    setResponseId((n) => n + 1);
    if (!goalRole.trim() || !hoursPerWeek.trim() || !knowledge.trim()) {
      setError("Describe your goal role, weekly hours, and where you are today.");
      return;
    }
    setLoading(true);
    try {
      const result = await streamCareer(
        "learning",
        { role: goalRole, hours: hoursPerWeek, level: knowledge },
        setStreamText
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const data = tryParseJsonObject<{ weeks?: LearningWeek[] }>(
        result.text
      );
      if (data?.weeks?.length) setWeeks(data.weeks);
      if (canSave) {
        await saveWork({
          tool: "learning",
          input: { role: goalRole, hours: hoursPerWeek, level: knowledge },
          output: data?.weeks?.length ? { weeks: data.weeks } : result.text,
        });
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lp-goal">Goal role</Label>
          <Input
            id="lp-goal"
            placeholder="e.g. Staff software engineer, platform"
            value={goalRole}
            onChange={(e) => setGoalRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lp-hours">Time per week (hours)</Label>
          <Input
            id="lp-hours"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 8"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lp-level">Current knowledge level</Label>
          <Textarea
            id="lp-level"
            placeholder="Self-describe: courses taken, years coding, gaps in system design, etc."
            value={knowledge}
            onChange={(e) => setKnowledge(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <Button type="button" onClick={create} disabled={loading}>
          {loading ? "Creating…" : "Create plan"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div>
        {loading && !streamText ? (
          <ToolOutputSkeleton />
        ) : (
          <ToolOutputCard
            animationKey={responseId}
            textToCopy={
              weeks?.length ? learningToCopy(weeks) : streamText
            }
            onStartOver={reset}
            disabledCopy={!streamText && !weeks?.length}
          >
            {weeks?.length ? (
              <div>
                <div className="mb-6 border-b border-[#e4e4ee] pb-4">
                  <h3 className="text-lg font-semibold text-[#111118]">
                    Learning plan
                  </h3>
                  <p className="mt-1 text-sm text-[#6B6A80]">
                    Four weeks with goals, resources, and measurable milestones.
                  </p>
                </div>
                <LearningWeeksPanel weeks={weeks} />
              </div>
            ) : streamText ? (
              <StreamingMarkdown content={streamText} />
            ) : (
              <p className="text-sm leading-relaxed text-[#6B6A80]">
                A four-week plan: weekly goals, concrete resources, and a
                milestone you can verify.
              </p>
            )}
          </ToolOutputCard>
        )}
      </div>
    </div>
  );
}

function InterviewPrepTab({ canSave, saveWork }: CareerTabProps) {
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [prep, setPrep] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const reset = useCallback(() => {
    setTargetRole("");
    setJobDescription("");
    setExperienceLevel("");
    setPrep(null);
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function generate() {
    setError("");
    setPrep(null);
    setResponseId((n) => n + 1);
    if (!targetRole.trim() || !jobDescription.trim() || !experienceLevel) {
      setError("Add the target role, job description, and experience level.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchCareerJson<InterviewPrepData>("interview", {
        role: targetRole,
        jd: jobDescription,
        level: experienceLevel,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPrep(result.data);
      if (canSave) {
        await saveWork({
          tool: "interview",
          input: {
            role: targetRole,
            jd: jobDescription,
            level: experienceLevel,
          },
          output: result.data,
        });
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ip-role">Target role</Label>
          <Input
            id="ip-role"
            placeholder="e.g. Product manager, AI tooling"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ip-jd">Job description</Label>
          <Textarea
            id="ip-jd"
            placeholder="Paste the JD here."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[220px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Your experience level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="1-2 years">1-2 years</SelectItem>
              <SelectItem value="3-5 years">3-5 years</SelectItem>
              <SelectItem value="5+ years">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "Generate interview prep"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div>
        {loading ? (
          <InterviewPrepSkeleton />
        ) : (
          <StructuredToolOutputCard
            animationKey={responseId}
            textToCopy={prep ? interviewPrepToCopy(prep) : ""}
            onStartOver={reset}
            disabledCopy={!prep}
          >
            {prep ? (
              <InterviewPrepOutput data={prep} />
            ) : (
              <StructuredEmptyState
                icon={MessageSquareText}
                text="Your tailored interview questions, answer frameworks, hidden evaluation signals, and one smart question to ask will appear here."
              />
            )}
          </StructuredToolOutputCard>
        )}
      </div>
    </div>
  );
}

function LinkedInOptimizerTab({ canSave, saveWork }: CareerTabProps) {
  const [targetRole, setTargetRole] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [experience, setExperience] = useState("");
  const [optimization, setOptimization] =
    useState<LinkedInOptimizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const reset = useCallback(() => {
    setTargetRole("");
    setHeadline("");
    setAbout("");
    setExperience("");
    setOptimization(null);
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function optimize() {
    setError("");
    setOptimization(null);
    setResponseId((n) => n + 1);
    if (
      !targetRole.trim() ||
      !headline.trim() ||
      !about.trim() ||
      !experience.trim()
    ) {
      setError("Add the role, headline, About section, and recent experience.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchCareerJson<LinkedInOptimizationData>(
        "linkedin",
        {
          role: targetRole,
          headline,
          about,
          experience,
        }
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOptimization(result.data);
      if (canSave) {
        await saveWork({
          tool: "linkedin",
          input: {
            role: targetRole,
            headline,
            about,
            experience,
          },
          output: result.data,
        });
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="li-role">Target role you want to attract</Label>
          <Input
            id="li-role"
            placeholder="e.g. Data analyst, healthcare analytics"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="li-headline">Current LinkedIn headline</Label>
          <Textarea
            id="li-headline"
            placeholder="Paste your current headline."
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="min-h-[90px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="li-about">Current LinkedIn About section</Label>
          <Textarea
            id="li-about"
            placeholder="Paste your current About section."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="li-experience">
            Current LinkedIn Experience (paste your most recent role)
          </Label>
          <Textarea
            id="li-experience"
            placeholder="Paste your most recent role."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <Button type="button" onClick={optimize} disabled={loading}>
          {loading ? "Optimizing…" : "Optimize my LinkedIn"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div>
        {loading ? (
          <LinkedInOptimizerSkeleton />
        ) : (
          <StructuredToolOutputCard
            animationKey={responseId}
            textToCopy={
              optimization ? linkedInOptimizationToCopy(optimization) : ""
            }
            onStartOver={reset}
            disabledCopy={!optimization}
          >
            {optimization ? (
              <LinkedInOptimizerOutput data={optimization} />
            ) : (
              <StructuredEmptyState
                icon={Linkedin}
                text="Your profile rewrite will appear as before-and-after sections, plus the three keywords your target role expects to see."
              />
            )}
          </StructuredToolOutputCard>
        )}
      </div>
    </div>
  );
}

function JdAnalyzerTab({ canSave, saveWork }: CareerTabProps) {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JdAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseId, setResponseId] = useState(0);

  const reset = useCallback(() => {
    setRole("");
    setJobDescription("");
    setAnalysis(null);
    setError("");
    setResponseId((n) => n + 1);
  }, []);

  async function analyze() {
    setError("");
    setAnalysis(null);
    setResponseId((n) => n + 1);
    if (!role.trim() || !jobDescription.trim()) {
      setError("Add the role and full job description.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchCareerJson<JdAnalysisData>("jdanalyzer", {
        role,
        jd: jobDescription,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAnalysis(result.data);
      if (canSave) {
        await saveWork({
          tool: "jdanalyzer",
          input: { role, jd: jobDescription },
          output: result.data,
        });
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jd-role">Role you&apos;re applying for</Label>
          <Input
            id="jd-role"
            placeholder="e.g. Customer success manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-text">Paste the full job description</Label>
          <Textarea
            id="jd-text"
            placeholder="Paste the full JD here."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[280px]"
          />
        </div>
        <Button type="button" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze this JD"}
        </Button>
        {error ? (
          <p className="text-sm text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div>
        {loading ? (
          <JdAnalyzerSkeleton />
        ) : (
          <StructuredToolOutputCard
            animationKey={responseId}
            textToCopy={analysis ? jdAnalysisToCopy(analysis) : ""}
            onStartOver={reset}
            disabledCopy={!analysis}
          >
            {analysis ? (
              <JdAnalyzerOutput data={analysis} />
            ) : (
              <StructuredEmptyState
                icon={FileSearch}
                text="The JD breakdown will separate must-have skills, nice-to-haves, ATS keywords, likely questions, and any real red flags."
              />
            )}
          </StructuredToolOutputCard>
        )}
      </div>
    </div>
  );
}
