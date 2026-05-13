import { NextRequest } from "next/server";
import {
  extractResumeText,
  isSupportedResumeFile,
} from "@/lib/extract-resume-text";
import {
  getSupabaseAdmin,
  getSupabaseForRequest,
  getUserFromRequest,
  isSupabaseServerConfigured,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const RESUME_BUCKET = process.env.SUPABASE_RESUME_BUCKET ?? "resumes";

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid upload body." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Add a resume file." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return Response.json(
      { error: "Resume file is too large. Keep uploads under 8 MB." },
      { status: 400 }
    );
  }

  if (!isSupportedResumeFile(file.name, file.type)) {
    return Response.json(
      { error: "Upload a PDF, DOCX, or TXT resume." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    text = await extractResumeText({
      buffer,
      fileName: file.name,
      mimeType: file.type,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not read the resume file.";
    return Response.json({ error: message }, { status: 400 });
  }

  if (!text.trim()) {
    return Response.json(
      { error: "I could not find readable text in that resume." },
      { status: 400 }
    );
  }

  if (!isSupabaseServerConfigured) {
    return Response.json({
      text,
      saved: false,
      message:
        "Resume text extracted. Add Supabase env vars to save uploaded files.",
    });
  }

  const { user } = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ text, saved: false });
  }

  const supabase = getSupabaseAdmin() ?? getSupabaseForRequest(req);
  if (!supabase) {
    return Response.json({ text, saved: false });
  }

  const filePath = `${user.id}/${Date.now()}-${safeFileName(file.name)}`;
  const upload = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (upload.error) {
    return Response.json({
      text,
      saved: false,
      message:
        "Resume text extracted, but the original file could not be saved.",
    });
  }

  const insert = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      mime_type: file.type || null,
      file_size: file.size,
      extracted_text: text,
    })
    .select("id")
    .single();

  return Response.json({
    text,
    saved: !insert.error,
    resumeId: insert.data?.id ?? null,
    message: insert.error
      ? "Resume text extracted, but metadata could not be saved."
      : undefined,
  });
}
