import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { OuraClient, getDateRange } from "@/lib/oura";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    const ouraToken = process.env.OURA_API_TOKEN;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!ouraToken) {
      return NextResponse.json({ error: "OURA_API_TOKEN not configured" }, { status: 500 });
    }
    if (!anthropicKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured. Add it to .env.local" }, { status: 500 });
    }

    // Fetch recent Oura data for context
    const client = new OuraClient(ouraToken);
    const range30 = getDateRange(30);
    const range7 = getDateRange(7);

    const [allData30, sleepPeriods7, personalInfo] = await Promise.allSettled([
      client.getAllData(range30),
      client.getSleepPeriods(range7),
      client.getPersonalInfo(),
    ]);

    const data30 = allData30.status === "fulfilled" ? allData30.value : {};
    const sleepDetail = sleepPeriods7.status === "fulfilled" ? sleepPeriods7.value : [];
    const profile = personalInfo.status === "fulfilled" ? personalInfo.value : null;

    const systemPrompt = `You are an expert health analyst and personal wellness coach. You have access to the user's Oura Ring data and should provide insightful, personalized analysis.

IMPORTANT GUIDELINES:
- Be conversational yet informative
- Reference specific data points and dates when answering
- Provide actionable recommendations when relevant
- Note trends and patterns in the data
- Compare metrics to typical healthy ranges when appropriate
- Be empathetic and encouraging
- If you don't have enough data to answer a question, say so honestly

USER PROFILE:
${profile ? JSON.stringify(profile, null, 2) : "Not available"}

LAST 30 DAYS SUMMARY DATA:
${JSON.stringify(data30, null, 2)}

LAST 7 DAYS DETAILED SLEEP:
${JSON.stringify(sleepDetail.map(s => ({
  day: s.day,
  total_sleep: Math.round(s.total_sleep_duration / 60),
  deep_sleep: Math.round(s.deep_sleep_duration / 60),
  rem_sleep: Math.round(s.rem_sleep_duration / 60),
  light_sleep: Math.round(s.light_sleep_duration / 60),
  avg_hr: s.average_heart_rate,
  avg_hrv: s.average_hrv,
  lowest_hr: s.lowest_heart_rate,
  efficiency: s.efficiency,
  temp_delta: s.temperature_delta,
  bedtime_start: s.bedtime_start,
  bedtime_end: s.bedtime_end,
})), null, 2)}

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
