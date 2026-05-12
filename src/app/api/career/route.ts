import OpenAI from "openai";
import { NextRequest } from "next/server";

export type CareerTool =
  | "resume"
  | "roadmap"
  | "projects"
  | "learning"
  | "interview"
  | "linkedin"
  | "jdanalyzer";

type Payload = Record<string, unknown>;

const SYSTEM_PROMPT = `You are Compass, a sharp, direct AI career coach. 
You give specific, actionable advice tailored to the 
user's actual situation. You never pad responses with 
filler or generic encouragement. You speak like a 
senior professional who genuinely wants to help, 
not a recruiter trying to sound motivational.`;

function buildPrompt(tool: string, payload: Payload): string {
  switch (tool) {
    case "resume":
      return `Analyze this resume for the role of ${payload.role}. 
Resume: ${payload.resume}

Be direct and specific. Use this EXACT Markdown structure (headings must match):

## ATS Score
Put the numeric score as **XX**/100 (e.g. **78**/100) on its own line or first line of this section.

## Strengths
Exactly 3 bullet points using "- " at the start of each line.

## Improvements
Exactly 3 bullet points using "- " at the start of each line. Include the exact rewrite suggestion in each bullet.

## Example bullet
**Before:** <paste the weakest original bullet from their resume verbatim>
**After:** <one strong action-impact rewrite>

Use **bold** where shown. No other top-level ## sections.`;

    case "roadmap":
      return `Build a ${payload.timeline} roadmap for someone targeting 
${payload.role} with current skills: ${payload.skills}. 
Month-by-month plan, specific milestones, skills to acquire, resources. No fluff.

Respond with ONLY valid JSON (no markdown fences, no other text) in this exact shape:
{"months":[{"month":"string","milestones":["..."],"skills":["..."],"resources":["..."]}]}`;

    case "projects":
      return `Suggest 4 portfolio projects for someone targeting 
${payload.role} in ${payload.stack} at ${payload.level} experience. 
Each: name, one-line description, why it impresses recruiters, 
skills demonstrated, difficulty level. Be specific.

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"projects":[{"name":"...","description":"...","impresses":"...","skills":["..."],"difficulty":"Beginner"|"Intermediate"|"Advanced"}]}`;

    case "learning":
      return `Create a 4-week learning plan for ${payload.role}, 
${payload.hours} hours/week, knowledge level: ${payload.level}. 
Week by week: goals, specific resources, measurable milestone.

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"weeks":[{"week":1,"goals":["..."],"resources":[{"title":"...","detail":"..."}],"milestone":"..."}]}`;

    case "interview":
      return `Generate interview prep for someone targeting 
${payload.role} at ${payload.level} experience level.
Job description: ${payload.jd}

Return JSON only, no markdown, no preamble:
{
  "questions": [
    { 
      "question": "string", 
      "howToAnswer": "string", 
      "type": "Behavioural" | "Technical" | "Situational" 
    }
  ],
  "theyAreTesting": [
    { "title": "string", "explanation": "string" }
  ],
  "questionToAsk": { "question": "string", "whyItWorks": "string" }
}

The questions array must contain exactly 10 items.
The theyAreTesting array must contain exactly 3 items.`;

    case "linkedin":
      return `Optimize this LinkedIn profile for someone 
targeting ${payload.role}.

Current headline: ${payload.headline}
Current about: ${payload.about}
Current experience: ${payload.experience}

Return JSON only, no markdown, no preamble:
{
  "headline": { "current": "string", "optimized": "string" },
  "about": { "current": "string", "optimized": "string" },
  "experience": { "current": "string", "optimized": "string" },
  "missingKeywords": [
    { "keyword": "string", "whyItMatters": "string" }
  ]
}

The missingKeywords array must contain exactly 3 items.`;

    case "jdanalyzer":
      return `Analyze this job description for the role of ${payload.role}.

JD: ${payload.jd}

Return JSON only, no markdown, no preamble:
{
  "mustHave": ["string"],
  "niceToHave": ["string"],
  "keywords": ["string"],
  "expectedQuestions": ["string"],
  "redFlags": ["string"]
}

The mustHave array must contain 5-7 items.
The niceToHave array must contain 3-5 items.
The keywords array must contain 8-12 exact phrases from the JD.
The expectedQuestions array must contain 4-5 items.
The redFlags array must contain 0-4 items and must be empty if there are no real red flags.`;

    default:
      return String(payload.message ?? "");
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY on the server." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const openai = new OpenAI({ apiKey });

  let body: { tool?: string; payload?: Payload };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tool = body.tool;
  const payload = body.payload ?? {};
  const validTools: CareerTool[] = [
    "resume",
    "roadmap",
    "projects",
    "learning",
    "interview",
    "linkedin",
    "jdanalyzer",
  ];
  if (!tool || !validTools.includes(tool as CareerTool)) {
    return new Response(JSON.stringify({ error: "Invalid or missing tool." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userContent = buildPrompt(tool, payload);
  if (!userContent.trim()) {
    return new Response(JSON.stringify({ error: "Could not build prompt." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const jsonTools: CareerTool[] = ["interview", "linkedin", "jdanalyzer"];
  if (jsonTools.includes(tool as CareerTool)) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      });
      const content = completion.choices[0]?.message?.content ?? "";
      return new Response(content, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed.";
      return new Response(JSON.stringify({ error: message }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  let stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed.";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream failed.";
        controller.enqueue(encoder.encode(`\n\n[Error] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
