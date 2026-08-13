"use server";

import type { SyllabusItem } from "@/db/schema";

export interface TagResult {
  topicIds: string[];
  confidence: "high" | "medium" | "low";
}

export async function tagSyllabusTopics(
  noteText: string,
  items: SyllabusItem[]
): Promise<TagResult> {
  // Gracefully skip if no API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-your-api-key-here") {
    return { topicIds: [], confidence: "low" };
  }

  const topicList = items
    .map((item) => `${item.id}: ${item.topicName} (${item.category}, ${item.stage})`)
    .join("\n");

  const prompt = `You are an expert Eiken Pre-1 English tutor assistant.

Given the following session note from a tutoring session, identify which Eiken Pre-1 syllabus topics were covered.

SESSION NOTE:
${noteText}

EIKEN PRE-1 SYLLABUS TOPICS (id: topic):
${topicList}

Return a JSON object with exactly this structure:
{
  "topics_covered": ["<id1>", "<id2>"],
  "confidence": "high" | "medium" | "low",
  "reasoning": "<brief explanation>"
}

Only include topic IDs where the note clearly indicates that topic was practiced or discussed. If the note is too short or vague, return an empty array.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI API error:", res.status, await res.text());
    return { topicIds: [], confidence: "low" };
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  const parsed = JSON.parse(content);
  const topicIds: string[] = Array.isArray(parsed.topics_covered)
    ? parsed.topics_covered.filter((id: unknown) => typeof id === "string" && items.some((i) => i.id === id))
    : [];

  return {
    topicIds,
    confidence: parsed.confidence ?? "medium",
  };
}
