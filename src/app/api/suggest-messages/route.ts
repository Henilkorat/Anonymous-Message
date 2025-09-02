import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Define prompt
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform. Avoid personal or sensitive topics. Example output: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'";

    // Call Hugging Face Inference API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Generate exactly three engaging, anonymous, and fun questions separated by ||. Keep each question short."
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 150
      })
      }
    );

    const data = await response.json();


       // ✅ Extract AI-generated content safely
    const content = data?.choices?.[0]?.message?.content || "";

    // ✅ Parse messages into an array
    const messagesArray = content
      ? content.split("||").map((msg: string) => msg.trim())
      : [
          "What's a hobby you've recently started?",
          "If you could have dinner with any historical figure, who would it be?",
          "What's a simple thing that makes you happy?",
        ];
      

    return NextResponse.json({ messages: messagesArray });
  } catch (error: any) {
    console.error("Error in /api/suggest-messages:", error);
    return NextResponse.json(
      {
        messages: [
          "What's a hobby you've recently started?",
          "If you could have dinner with any historical figure, who would it be?",
          "What's a simple thing that makes you happy?",
        ],
        error: { message: error.message },
      },
      { status: 500 }
    );
  }
}
