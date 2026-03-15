import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { message, history, ouraData } = await request.json();

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured. Add it to .env.local to enable chat." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert health analyst and personal wellness coach. You have access to the user's Oura Ring data and should provide insightful, personalized analysis.

IMPORTANT GUIDELINES:
- Be conversational yet informative
- Reference specific data points and dates when answering
- Provide actionable recommendations when relevant
- Note trends and patterns in the data
- Compare metrics to typical healthy ranges when appropriate
- Be empathetic and encouraging
- If you don't have enough data to answer a question, say so honestly

USER'S OURA RING DATA (last 30 days):
${JSON.stringify(ouraData, null, 2)}

Today's date is ${new Date().toISOString().split("T")[0]}.`;

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    return NextResponse.json({ response: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
