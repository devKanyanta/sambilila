import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateFlashcardsFromText(text: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
You are an API that outputs ONLY raw JSON.

TASK:
Convert the following text into flashcards.

RULES:
- Output valid JSON ONLY
- No markdown, no code blocks, no comments, no explanations
- No backticks or formatting
- Must be exactly an array

FORMAT:
[
  {"front":"Question here","back":"Answer here"}
]

TEXT:
${text}
`;

  const result = await model.generateContent(prompt);

  let raw = result.response.text();

  // --- SANITIZE GEMINI OUTPUT ---
  raw = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  // --- EXTRACT THE FIRST JSON ARRAY ---
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");

  if (start === -1 || end === -1) {
    console.error("Gemini malformed output:\n", raw);
    throw new Error("Gemini did not produce any JSON array");
  }

  const jsonString = raw.slice(start, end + 1);

  // --- PARSE ---
  let cards: { front: string; back: string }[];

  try {
    cards = JSON.parse(jsonString);
  } catch (err) {
    console.error("Gemini JSON parse failed:", err);
    console.error("RAW OUTPUT:\n", raw);
    throw new Error("Gemini returned invalid JSON");
  }

  // --- VALIDATE STRUCTURE ---
  if (!Array.isArray(cards)) {
    throw new Error("Gemini output is not an array");
  }

  const validated = cards.filter(
    (c) =>
      typeof c === "object" &&
      typeof c.front === "string" &&
      c.front.length > 0 &&
      typeof c.back === "string" &&
      c.back.length > 0
  );

  if (validated.length === 0) {
    console.error("Gemini output had no valid cards:", cards);
    throw new Error("No valid flashcards were generated");
  }

  // Safety cap for DB abuse
  return validated.slice(0, 40);
}
