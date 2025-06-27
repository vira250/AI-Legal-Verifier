import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for feedback (in production, use a database like Supabase)
const feedbackStore = new Map<string, any[]>()

interface FeedbackRequest {
  analysisId: string
  rating: number
  accuracy: "accurate" | "somewhat_accurate" | "inaccurate"
  helpfulness: "very_helpful" | "helpful" | "not_helpful"
  comments: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json()
    const { analysisId, rating, accuracy, helpfulness, comments } = body

    if (!analysisId || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    // Store feedback
    const feedbackEntry = {
      analysisId,
      rating,
      accuracy,
      helpfulness,
      comments,
      timestamp: new Date().toISOString(),
      contentHash: analysisId.substring(0, 50), // Simple content matching
    }

    if (!feedbackStore.has(analysisId)) {
      feedbackStore.set(analysisId, [])
    }
    feedbackStore.get(analysisId)!.push(feedbackEntry)

    // Log feedback for monitoring (in production, send to analytics)
    console.log("Feedback received:", {
      analysisId,
      rating,
      accuracy,
      helpfulness,
      hasComments: comments.length > 0,
    })

    return NextResponse.json({ success: true, message: "Feedback submitted successfully" })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get feedback statistics
    const allFeedback = Array.from(feedbackStore.values()).flat()

    if (allFeedback.length === 0) {
      return NextResponse.json({
        totalFeedback: 0,
        averageRating: 0,
        accuracyStats: {},
        helpfulnessStats: {},
      })
    }

    const totalFeedback = allFeedback.length
    const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback

    // Calculate accuracy distribution
    const accuracyStats = allFeedback.reduce(
      (acc, f) => {
        acc[f.accuracy] = (acc[f.accuracy] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate helpfulness distribution
    const helpfulnessStats = allFeedback.reduce(
      (acc, f) => {
        acc[f.helpfulness] = (acc[f.helpfulness] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      accuracyStats,
      helpfulnessStats,
    })
  } catch (error) {
    console.error("Feedback stats error:", error)
    return NextResponse.json({ error: "Failed to get feedback stats" }, { status: 500 })
  }
}
