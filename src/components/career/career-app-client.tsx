"use client";

import { useCallback, useMemo, useState } from "react";
import {
  FileSearch,
  Linkedin,
  MessageSquareText,
} from "lucide-react";
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

export function CareerAppClient() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Coaching tools
        </h1>
        <p className="mt-2 text-muted">
          Pick a tool, add your context, and get structured output you can act
          on today — no account wall, no generic PDFs.
        </p>
      </div>

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
          <ResumeTab />
        </TabsContent>
        <TabsContent value="roadmap">
          <RoadmapTab />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>
        <TabsContent value="learning">
          <LearningTab />
        </TabsContent>
        <TabsContent value="interview">
          <InterviewPrepTab />
        </TabsContent>
        <TabsContent value="linkedin">
          <LinkedInOptimizerTab />
        </TabsContent>
        <TabsContent value="jdanalyzer">
          <JdAnalyzerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResumeTab() {
  const [resume, setResume] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [output, setOutput] = useState("");
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
    setError("");
    setResponseId((n) => n + 1);
  }, []);

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

function RoadmapTab() {
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

function ProjectsTab() {
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

function LearningTab() {
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

function InterviewPrepTab() {
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

function LinkedInOptimizerTab() {
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

function JdAnalyzerTab() {
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
