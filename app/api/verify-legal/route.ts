import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { LoadAPIKeyError } from "ai"

interface VerificationRequest {
  query?: string
  document?: string
  jurisdiction?: string
  lawType?: string
  type: "query" | "document"
}

// Simple in-memory storage for feedback (in production, use a database)
const feedbackStore = new Map<string, any[]>()

// --- Helper -------------------------
async function runLLM({
  systemPrompt,
  userPrompt,
}: {
  systemPrompt: string
  userPrompt: string
}) {
  try {
    // ❶ Primary attempt – OpenAI
    return await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
    })
  } catch (err: any) {
    const message = String(err?.message || "")
    const isQuota = message.includes("quota") || message.includes("Rate limit") || err?.status === 429

    // ❷ If quota error & Groq key exists, retry with Groq
    if (isQuota && process.env.GROQ_API_KEY) {
      console.warn("OpenAI quota exceeded – retrying with Groq")
      return await generateText({
        model: groq("llama3-70b-8192"), // fast, quality model
        system: systemPrompt,
        prompt: userPrompt,
      })
    }

    // ❸ Re-throw for outer catch block
    throw err
  }
}

function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getFeedbackAdjustment(content: string): { confidenceAdjustment: number; riskAdjustment: number } {
  // Get historical feedback for similar content
  const contentHash = content.toLowerCase().substring(0, 50) // Simple content matching
  const relevantFeedback = Array.from(feedbackStore.values())
    .flat()
    .filter((f) => f.contentHash === contentHash)

  if (relevantFeedback.length === 0) {
    return { confidenceAdjustment: 0, riskAdjustment: 0 }
  }

  // Calculate average feedback scores
  const avgRating = relevantFeedback.reduce((sum, f) => sum + f.rating, 0) / relevantFeedback.length
  const accuracyScore = relevantFeedback.filter((f) => f.accuracy === "accurate").length / relevantFeedback.length

  // Adjust confidence based on feedback
  let confidenceAdjustment = 0
  if (avgRating >= 4 && accuracyScore >= 0.8) {
    confidenceAdjustment = 10 // Increase confidence for highly rated analyses
  } else if (avgRating <= 2 || accuracyScore <= 0.3) {
    confidenceAdjustment = -15 // Decrease confidence for poorly rated analyses
  }

  // Adjust risk based on feedback
  let riskAdjustment = 0
  if (accuracyScore <= 0.5) {
    riskAdjustment = 1 // Increase risk level for inaccurate analyses
  }

  return { confidenceAdjustment, riskAdjustment }
}

export async function POST(request: NextRequest) {
  // Ensure the OpenAI key exists before making any request
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is missing. Please set OPENAI_API_KEY in your project settings." },
      { status: 500 },
    )
  }

  try {
    const body: VerificationRequest = await request.json()
    const { query, document, jurisdiction, lawType, type } = body

    if (!query && !document) {
      return NextResponse.json({ error: "Either query or document is required" }, { status: 400 })
    }

    const content = type === "query" ? query : document
    const jurisdictionContext = jurisdiction ? `under ${jurisdiction}` : "under Indian legal system"
    const lawTypeContext = lawType ? `focusing on ${lawType}` : "across all applicable legal areas"

    const systemPrompt = `You are an expert Indian legal AI assistant specializing in legal verification and analysis. Your role is to:

1. Analyze legal queries and documents for accuracy and compliance with Indian laws
2. Provide specific citations to relevant Indian laws, statutes, case law, and regulations
3. Assess risk levels and provide actionable recommendations
4. Maintain objectivity and indicate confidence levels based on legal precedents
5. Focus on Indian legal framework including IPC, CrPC, CPC, Constitution, and other relevant acts

IMPORTANT: Always include a disclaimer that this is not legal advice and recommend consulting with qualified legal professionals.

For each analysis, provide:
- Clear validity assessment with detailed reasoning
- Confidence percentage (30-95) based on legal certainty and precedent strength
- Comprehensive legal analysis with key points highlighted
- Specific Indian legal citations (sections, case law, acts)
- Risk level assessment (low/medium/high) with justification
- Actionable recommendations for compliance

Context: ${jurisdictionContext} ${lawTypeContext}

Format your response to clearly highlight:
- KEY LEGAL ISSUES
- APPLICABLE LAWS
- COMPLIANCE STATUS
- RISK FACTORS
- RECOMMENDED ACTIONS`

    const userPrompt = `Please provide a comprehensive legal analysis for this ${type === "query" ? "legal query" : "legal document"}:

"${content}"

Please structure your analysis with clear sections and highlight the most important legal points, compliance issues, and recommendations.`

    const { text } = await runLLM({ systemPrompt, userPrompt })

    // Parse the AI response and structure it
    const analysisId = generateAnalysisId()
    const result = parseAIResponse(text, content, analysisId, jurisdiction, lawType)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Legal verification error:", error)

    if (String(error?.message || "").includes("quota") || (error as any)?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Your OpenAI quota has been exceeded. " +
            "Add billing to your OpenAI account or set GROQ_API_KEY to use the Groq fallback.",
        },
        { status: 429 },
      )
    }

    // If the AI SDK throws a specific missing-key error, surface a helpful message
    if (LoadAPIKeyError.isInstance?.(error)) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Set the OPENAI_API_KEY environment variable in Vercel." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: "Failed to process legal verification. Please try again later." },
      { status: 500 },
    )
  }
}

function parseAIResponse(
  text: string,
  originalContent: string,
  analysisId: string,
  jurisdiction?: string,
  lawType?: string,
) {
  const textLower = text.toLowerCase()

  // Get feedback-based adjustments
  const { confidenceAdjustment, riskAdjustment } = getFeedbackAdjustment(originalContent)

  // Enhanced confidence calculation based on content analysis
  let confidence = 75 // Base confidence

  // Increase confidence for clear legal statements and specific citations
  if (textLower.includes("clearly") || textLower.includes("definitely") || textLower.includes("established")) {
    confidence += 15
  }

  // Increase confidence for specific legal references
  const specificLegalTerms = ["section", "article", "ipc", "crpc", "cpc", "supreme court", "high court", "act", "rule"]
  const legalTermCount = specificLegalTerms.filter((term) => textLower.includes(term)).length
  confidence += Math.min(legalTermCount * 3, 15)

  // Decrease confidence for uncertain language
  if (
    textLower.includes("may") ||
    textLower.includes("might") ||
    textLower.includes("possibly") ||
    textLower.includes("unclear") ||
    textLower.includes("depends on circumstances")
  ) {
    confidence -= 20
  }

  // Increase confidence for specific citations
  const citationCount = (text.match(/\d+\s+U\.S\.C\.|§|Article|Section|IPC|CrPC|CPC/g) || []).length
  confidence += Math.min(citationCount * 4, 20)

  // Decrease confidence for complex or ambiguous situations
  if (textLower.includes("complex") || textLower.includes("ambiguous") || textLower.includes("depends on")) {
    confidence -= 15
  }

  // Jurisdiction and law type specific adjustments
  if (jurisdiction && jurisdiction !== "Supreme Court of India") {
    confidence -= 5 // Slightly less confidence for specific jurisdictions
  }

  if (lawType && (lawType === "Constitutional Law" || lawType === "Administrative Law")) {
    confidence += 5 // Higher confidence for well-established areas
  }

  // Apply feedback adjustment
  confidence += confidenceAdjustment

  // Ensure confidence is within bounds
  confidence = Math.max(35, Math.min(95, confidence))

  // Enhanced risk assessment based on content
  let riskLevel: "low" | "medium" | "high" = "medium"

  // High risk indicators
  const highRiskTerms = [
    "criminal",
    "violation",
    "penalty",
    "fine",
    "lawsuit",
    "prosecution",
    "illegal",
    "prohibited",
    "breach",
    "liability",
    "damages",
    "imprisonment",
    "arrest",
    "warrant",
    "contempt",
    "fraud",
  ]
  const highRiskCount = highRiskTerms.filter((term) => textLower.includes(term)).length

  // Medium risk indicators
  const mediumRiskTerms = [
    "dispute",
    "disagreement",
    "non-compliance",
    "review required",
    "caution",
    "careful consideration",
    "notice",
    "warning",
    "procedural",
    "documentation",
    "verification",
  ]
  const mediumRiskCount = mediumRiskTerms.filter((term) => textLower.includes(term)).length

  // Low risk indicators
  const lowRiskTerms = [
    "compliant",
    "legal",
    "valid",
    "acceptable",
    "permitted",
    "allowed",
    "standard practice",
    "routine",
    "normal",
    "regular",
    "proper",
    "correct",
  ]
  const lowRiskCount = lowRiskTerms.filter((term) => textLower.includes(term)).length

  // Calculate risk based on term frequency and confidence
  if (highRiskCount >= 3 || (highRiskCount >= 2 && confidence < 60)) {
    riskLevel = "high"
  } else if (lowRiskCount >= 3 && confidence > 80 && highRiskCount === 0) {
    riskLevel = "low"
  } else if (lowRiskCount > highRiskCount && confidence > 75 && mediumRiskCount <= 1) {
    riskLevel = "low"
  } else if (highRiskCount > 0 || mediumRiskCount > 1 || confidence < 65) {
    riskLevel = "medium"
  }

  // Apply feedback-based risk adjustment
  if (riskAdjustment > 0) {
    if (riskLevel === "low") riskLevel = "medium"
    else if (riskLevel === "medium") riskLevel = "high"
  }

  // Enhanced validity assessment
  const validityIndicators = {
    positive: ["valid", "legal", "compliant", "permitted", "allowed", "constitutional", "lawful"],
    negative: ["invalid", "illegal", "violation", "prohibited", "unconstitutional", "unlawful", "breach"],
  }

  const positiveCount = validityIndicators.positive.filter((term) => textLower.includes(term)).length
  const negativeCount = validityIndicators.negative.filter((term) => textLower.includes(term)).length

  const isValid = positiveCount > negativeCount && (riskLevel !== "high" || confidence > 70)

  // Extract citations with improved patterns
  const citations = extractCitations(text)

  // Extract recommendations with better filtering
  const recommendations = extractRecommendations(text)

  // Create detailed verification status
  const verificationStatus = generateVerificationStatus(isValid, confidence, riskLevel, jurisdiction, lawType)

  return {
    isValid,
    confidence,
    analysis: text,
    citations,
    recommendations,
    riskLevel,
    analysisId,
    verificationStatus,
    jurisdiction: jurisdiction || "Indian Legal System",
    lawType: lawType || "General Legal Analysis",
  }
}

function generateVerificationStatus(
  isValid: boolean,
  confidence: number,
  riskLevel: string,
  jurisdiction?: string,
  lawType?: string,
) {
  const status = isValid ? "LEGALLY COMPLIANT" : "COMPLIANCE ISSUES DETECTED"
  const confidenceLevel = confidence >= 80 ? "HIGH" : confidence >= 60 ? "MEDIUM" : "LOW"
  const riskDescription =
    riskLevel === "high"
      ? "IMMEDIATE ATTENTION REQUIRED"
      : riskLevel === "medium"
        ? "REVIEW RECOMMENDED"
        : "MINIMAL CONCERNS"

  return {
    status,
    confidenceLevel,
    riskDescription,
    jurisdiction: jurisdiction || "Indian Legal System",
    lawType: lawType || "General Legal Analysis",
    summary: `${status} - ${confidenceLevel} CONFIDENCE - ${riskDescription}`,
  }
}

function extractCitations(text: string): string[] {
  const citations: string[] = []

  // Enhanced patterns for Indian legal citations
  const patterns = [
    /Section\s+\d+[A-Z]*\s+of\s+[^.]+/gi,
    /Article\s+\d+[A-Z]*\s+of\s+[^.]+/gi,
    /IPC\s+Section\s+\d+[A-Z]*/gi,
    /CrPC\s+Section\s+\d+[A-Z]*/gi,
    /CPC\s+Section\s+\d+[A-Z]*/gi,
    /\d+\s+U\.S\.C\.\s+§\s*\d+/g,
    /\d+\s+CFR\s+\d+/g,
    /\w+\s+v\.\s+\w+/g,
    /AIR\s+\d+\s+SC\s+\d+/gi,
    /$$\d{4}$$\s+\d+\s+SCC\s+\d+/gi,
  ]

  patterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      citations.push(...matches)
    }
  })

  // Add Indian legal framework citations if none found
  if (citations.length === 0) {
    citations.push("Constitution of India - Relevant Articles")
    citations.push("Indian Penal Code, 1860 - Applicable Sections")
    citations.push("Code of Criminal Procedure, 1973")
    citations.push("Indian Evidence Act, 1872")
  }

  return citations.slice(0, 6) // Limit to 6 most relevant citations
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = []

  // Look for recommendation keywords with better context
  const recLines = text
    .split("\n")
    .filter(
      (line) =>
        line.toLowerCase().includes("recommend") ||
        line.toLowerCase().includes("should") ||
        line.toLowerCase().includes("must") ||
        line.toLowerCase().includes("consider") ||
        line.toLowerCase().includes("advise") ||
        line.toLowerCase().includes("ensure"),
    )
    .filter((line) => line.trim().length > 20) // Filter out short lines

  recommendations.push(...recLines.slice(0, 4))

  // Add enhanced default recommendations if none found
  if (recommendations.length === 0) {
    recommendations.push("Consult with a qualified legal practitioner for detailed advice")
    recommendations.push("Review all applicable Indian laws and regulations")
    recommendations.push("Ensure compliance with jurisdictional requirements")
    recommendations.push("Maintain proper documentation for legal compliance")
  }

  return recommendations
}
