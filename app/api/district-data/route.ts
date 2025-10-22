import { type NextRequest, NextResponse } from "next/server"

const dataCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

// Mock data generator - in production, this would fetch from data.gov.in API
function generateMockData(district: string) {
  const seed = district.charCodeAt(0)
  const baseJobs = 5000 + ((seed * 1000) % 10000)
  const baseWorkers = 3000 + ((seed * 800) % 8000)

  return {
    district,
    state: "Maharashtra",
    jobsCreated: Math.floor(baseJobs + Math.random() * 2000),
    workersEmployed: Math.floor(baseWorkers + Math.random() * 1500),
    avgWagesPerDay: 190 + Math.floor(Math.random() * 50),
    completionRate: 65 + Math.floor(Math.random() * 30),
    lastUpdated: new Date().toISOString(),
    previousMonth: {
      jobsCreated: Math.floor(baseJobs * 0.85),
      workersEmployed: Math.floor(baseWorkers * 0.85),
    },
  }
}

function getCachedData(key: string) {
  const cached = dataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  dataCache.delete(key)
  return null
}

function setCachedData(key: string, data: unknown) {
  dataCache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  try {
    const district = request.nextUrl.searchParams.get("district")

    if (!district) {
      return NextResponse.json({ error: "District parameter required", code: "MISSING_DISTRICT" }, { status: 400 })
    }

    if (typeof district !== "string" || district.trim().length === 0) {
      return NextResponse.json({ error: "Invalid district parameter", code: "INVALID_DISTRICT" }, { status: 400 })
    }

    const cacheKey = `district-${district.toLowerCase()}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      const response = NextResponse.json(cachedData)
      response.headers.set("Cache-Control", "public, max-age=3600")
      response.headers.set("X-Cache", "HIT")
      return response
    }

    // Generate fresh data if not cached
    const data = generateMockData(district)
    setCachedData(cacheKey, data)

    const response = NextResponse.json(data)
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600")
    response.headers.set("X-Cache", "MISS")
    response.headers.set("ETag", `"${Buffer.from(JSON.stringify(data)).toString("base64").slice(0, 16)}"`)
    return response
  } catch (error) {
    console.error("[district-data API] Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: "Failed to fetch district data",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
