import mammoth from "mammoth";
import { createRequire } from "module";

const supportedExtensions = [".pdf", ".docx", ".txt"];
const nodeRequire = createRequire(import.meta.url);

type PdfParseResult = {
  text: string;
};

function extensionFor(fileName: string): string {
  const lower = fileName.toLowerCase();
  return supportedExtensions.find((ext) => lower.endsWith(ext)) ?? "";
}

export async function extractResumeText({
  buffer,
  fileName,
  mimeType,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<string> {
  const extension = extensionFor(fileName);

  if (extension === ".txt" || mimeType.startsWith("text/")) {
    return buffer.toString("utf8").trim();
  }

  if (
    extension === ".docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (extension === ".pdf" || mimeType === "application/pdf") {
    const pdfParse = nodeRequire("pdf-parse/lib/pdf-parse.js") as (
      dataBuffer: Buffer
    ) => Promise<PdfParseResult>;
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  throw new Error("Upload a PDF, DOCX, or TXT resume.");
}

export function isSupportedResumeFile(fileName: string, mimeType: string) {
  return Boolean(
    extensionFor(fileName) ||
      mimeType === "application/pdf" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType.startsWith("text/")
  );
}
