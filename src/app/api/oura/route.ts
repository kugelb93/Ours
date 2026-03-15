import { NextRequest, NextResponse } from "next/server";
import { OuraClient, getDateRange } from "@/lib/oura";

function getClient(): OuraClient {
  const token = process.env.OURA_API_TOKEN;
  if (!token) throw new Error("OURA_API_TOKEN not configured");
  return new OuraClient(token);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "all";
  const days = parseInt(searchParams.get("days") || "14", 10);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  const range = startDate && endDate
    ? { start_date: startDate, end_date: endDate }
    : getDateRange(days);

  try {
    const client = getClient();

    switch (type) {
      case "personal_info":
        return NextResponse.json(await client.getPersonalInfo());
      case "daily_sleep":
        return NextResponse.json(await client.getDailySleep(range));
      case "sleep":
        return NextResponse.json(await client.getSleepPeriods(range));
      case "daily_activity":
        return NextResponse.json(await client.getDailyActivity(range));
      case "daily_readiness":
        return NextResponse.json(await client.getDailyReadiness(range));
      case "heartrate": {
        const hrRange = {
          start_datetime: `${range.start_date}T00:00:00+00:00`,
          end_datetime: `${range.end_date}T23:59:59+00:00`,
        };
        return NextResponse.json(await client.getHeartRate(hrRange));
      }
      case "daily_spo2":
        return NextResponse.json(await client.getDailySpO2(range));
      case "daily_stress":
        return NextResponse.json(await client.getDailyStress(range));
      case "workouts":
        return NextResponse.json(await client.getWorkouts(range));
      case "daily_resilience":
        return NextResponse.json(await client.getDailyResilience(range));
      case "daily_cardiovascular_age":
        return NextResponse.json(await client.getDailyCardiovascularAge(range));
      case "vo2_max":
        return NextResponse.json(await client.getVo2Max(range));
      case "sessions":
        return NextResponse.json(await client.getSessions(range));
      case "sleep_time":
        return NextResponse.json(await client.getSleepTime(range));
      case "tags":
        return NextResponse.json(await client.getTags(range));
      case "ring_configuration":
        return NextResponse.json(await client.getRingConfiguration());
      case "all":
        return NextResponse.json(await client.getAllData(range));
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
