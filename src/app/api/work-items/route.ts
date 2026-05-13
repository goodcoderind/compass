import { NextRequest } from "next/server";
import {
  createWorkTitle,
  type CareerWorkTool,
  type SavedCareerWork,
} from "@/lib/career-work";
import {
  getSupabaseAdmin,
  getSupabaseForRequest,
  getUserFromRequest,
  isSupabaseServerConfigured,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validTools: CareerWorkTool[] = [
  "resume",
  "roadmap",
  "projects",
  "learning",
  "interview",
  "linkedin",
  "jdanalyzer",
];

export async function GET(req: NextRequest) {
  if (!isSupabaseServerConfigured) {
    return Response.json({ items: [], configured: false });
  }

  const { user, error } = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error }, { status: 401 });
  }

  const supabase = getSupabaseAdmin() ?? getSupabaseForRequest(req);
  if (!supabase) {
    return Response.json({ items: [], configured: false });
  }

  const { data, error: queryError } = await supabase
    .from("career_outputs")
    .select("id, tool, title, input, output, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (queryError) {
    return Response.json({ error: queryError.message }, { status: 500 });
  }

  return Response.json({
    items: (data ?? []) as SavedCareerWork[],
    configured: true,
  });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseServerConfigured) {
    return Response.json(
      { saved: false, error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { user, error } = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ saved: false, error }, { status: 401 });
  }

  let body: {
    tool?: CareerWorkTool;
    title?: string;
    input?: Record<string, unknown>;
    output?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.tool || !validTools.includes(body.tool)) {
    return Response.json({ error: "Invalid tool." }, { status: 400 });
  }

  if (!body.input || typeof body.input !== "object" || !body.output) {
    return Response.json(
      { error: "Saved work requires input and output." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin() ?? getSupabaseForRequest(req);
  if (!supabase) {
    return Response.json(
      { saved: false, error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const title = body.title?.trim() || createWorkTitle(body.tool, body.input);
  const { data, error: insertError } = await supabase
    .from("career_outputs")
    .insert({
      user_id: user.id,
      tool: body.tool,
      title,
      input: body.input,
      output: body.output,
    })
    .select("id, tool, title, input, output, created_at")
    .single();

  if (insertError) {
    const blockedByRls = insertError.message
      .toLowerCase()
      .includes("row-level security");
    return Response.json(
      {
        error: blockedByRls
          ? "Supabase blocked the save with row-level security. Run the career_outputs insert policy SQL in Supabase, then try again."
          : insertError.message,
      },
      { status: 500 }
    );
  }

  return Response.json({ saved: true, item: data as SavedCareerWork });
}

export async function DELETE(req: NextRequest) {
  if (!isSupabaseServerConfigured) {
    return Response.json(
      { deleted: false, error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { user, error } = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ deleted: false, error }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing work item id." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin() ?? getSupabaseForRequest(req);
  if (!supabase) {
    return Response.json(
      { deleted: false, error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { error: deleteError } = await supabase
    .from("career_outputs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ deleted: true });
}
