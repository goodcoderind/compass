export type CareerWorkTool =
  | "resume"
  | "roadmap"
  | "projects"
  | "learning"
  | "interview"
  | "linkedin"
  | "jdanalyzer";

export type SavedCareerWork = {
  id: string;
  tool: CareerWorkTool;
  title: string;
  input: Record<string, unknown>;
  output: unknown;
  created_at: string;
};

export const toolLabels: Record<CareerWorkTool, string> = {
  resume: "Resume Review",
  roadmap: "Roadmap Generator",
  projects: "Portfolio Projects",
  learning: "Learning Plan",
  interview: "Interview Prep",
  linkedin: "LinkedIn Optimizer",
  jdanalyzer: "JD Analyzer",
};

export function createWorkTitle(
  tool: CareerWorkTool,
  input: Record<string, unknown>
): string {
  const role =
    typeof input.role === "string"
      ? input.role
      : typeof input.targetRole === "string"
        ? input.targetRole
        : "";
  const label = toolLabels[tool] ?? "Compass Output";
  return role.trim() ? `${label}: ${role.trim()}` : label;
}
