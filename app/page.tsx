"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Loader2,
  Scale,
  FileText,
  Search,
  Shield,
  BarChart3,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Rocket,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

interface VerificationResult {
  isValid: boolean
  confidence: number
  analysis: string
  citations: string[]
  recommendations: string[]
  riskLevel: "low" | "medium" | "high"
  analysisId?: string
  verificationStatus?: {
    status: string
    confidenceLevel: string
    riskDescription: string
    jurisdiction: string
    lawType: string
    summary: string
  }
  jurisdiction?: string
  lawType?: string
}

interface FeedbackData {
  rating: number
  accuracy: "accurate" | "somewhat_accurate" | "inaccurate"
  helpfulness: "very_helpful" | "helpful" | "not_helpful"
  comments: string
}

export default function LegalVerifier() {
  const [query, setQuery] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [lawType, setLawType] = useState("")
  const [confidence, setConfidence] = useState([72])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [showAnimations, setShowAnimations] = useState(false)
  const [showInputSection, setShowInputSection] = useState(false)
  const [inputCentered, setInputCentered] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    accuracy: "accurate",
    helpfulness: "helpful",
    comments: "",
  })

  const handleStartVerification = () => {
    setShowInputSection(true)
  }

  const handleVerification = async () => {
    if (!query.trim()) return

    setLoading(true)
    setAnalysisLoading(true)
    setShowFeedback(false)
    setFeedbackSubmitted(false)

    // If this is the first verification, animate input to left
    // if (inputCentered) {
    //   setInputCentered(false)
    // }

    try {
      const response = await fetch("/api/verify-legal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          document: "",
          jurisdiction: jurisdiction || "Supreme Court of India",
          lawType: lawType || "General Legal Analysis",
          type: "query",
        }),
      })

      if (!response.ok) {
        throw new Error("Verification failed")
      }

      if (response.ok) {
        setInputCentered(false)
      }

      const data = await response.json()

      // Set new results and trigger animations
      setResult(data)
      setShowFeedback(true)

      // Reset and trigger animations
      setShowAnimations(false)
      setTimeout(() => setShowAnimations(true),100)
    } catch (error) {
      console.error("Error:", error)

      // If first verification, animate input to left
      // if (inputCentered) {
      //   setInputCentered(false)
      // }

      setResult({
        isValid: false,
        confidence: 0,
        analysis: "An error occurred during verification. Please try again.",
        citations: [],
        recommendations: ["Please check your input and try again"],
        riskLevel: "high",
      })

      setTimeout(() => setShowAnimations(true), 100)
    } finally {
      setLoading(false)
      setAnalysisLoading(false)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!result?.analysisId || feedback.rating === 0) return

    setFeedbackLoading(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisId: result.analysisId,
          ...feedback,
        }),
      })

      if (response.ok) {
        setFeedbackSubmitted(true)
        setTimeout(() => setShowFeedback(false), 2000)
      }
    } catch (error) {
      console.error("Feedback submission error:", error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white scanlines">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="pixel-font-5xl text-cyan-300 mb-4 tracking-wider glitch" data-text="AI LEGAL VERIFIER">
            AI LEGAL VERIFIER
          </h1>
          <p className="pixel-font-2xl text-cyan-400 mb-2 tracking-wide">INDIAN LEGAL VERIFICATION SYSTEM</p>
          <p className="pixel-font-lg text-yellow-300">न्यायाधीश AI • भारतीय कानून उत्थान</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <Button
            variant="outline"
            className="pixel-button bg-blue-800/50 border-cyan-400 text-cyan-300 hover:bg-cyan-400/20 pixel-font-lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            PREVIOUS CASE
          </Button>
          <Button
            variant="outline"
            className="pixel-button bg-blue-800/50 border-cyan-400 text-cyan-300 hover:bg-cyan-400/20 pixel-font-lg"
          >
            <Search className="h-4 w-4 mr-2" />
            IPC SCAN
          </Button>
          <Button
            variant="outline"
            className="pixel-button bg-yellow-600/50 border-yellow-400 text-yellow-300 hover:bg-yellow-400/20 pixel-font-lg"
          >
            <Shield className="h-4 w-4 mr-2" />
            FRAUD DETECT
          </Button>
          <Button
            variant="outline"
            className="pixel-button bg-green-600/50 border-green-400 text-green-300 hover:bg-green-400/20 pixel-font-lg"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            CASE ANALYSIS
          </Button>
        </div>

        {/* Initial Landing Section - Only show when no input section is visible */}
        {!showInputSection && (
          <div className="text-center py-16 mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full"></div>
              <div className="absolute inset-4 border-4 border-cyan-400/50 rounded-full"></div>
              <div className="absolute inset-8 border-4 border-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Scale className="h-24 w-24 text-cyan-400" />
              </div>
            </div>

            <h2 className="pixel-font-3xl text-cyan-300 mb-6">LEGAL AI SYSTEM READY</h2>
            <p className="text-cyan-400 pixel-font-xl mb-8">ADVANCED INDIAN LEGAL VERIFICATION ENGINE</p>
            <p className="text-yellow-300 pixel-font-lg mb-12">न्याय के लिए तैयार • Ready for Justice</p>

            {/* System Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-cyan-400/30">
                <div className="pixel-font-3xl text-cyan-400 mb-2">50K+</div>
                <div className="pixel-font-lg text-cyan-300">SC JUDGMENTS</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-purple-400/30">
                <div className="pixel-font-3xl text-purple-400 mb-2">2</div>
                <div className="pixel-font-lg text-purple-300">AI MODELS</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-yellow-400/30">
                <div className="pixel-font-3xl text-yellow-400 mb-2">2.5M</div>
                <div className="pixel-font-lg text-yellow-300">LEGAL DOCS</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-green-400/30">
                <div className="pixel-font-3xl text-green-400 mb-2">96%</div>
                <div className="pixel-font-lg text-green-300">ACCURACY</div>
              </div>
            </div>

            {/* System Status */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-green-400/30">
                <h3 className="pixel-font-xl text-green-300 mb-4">SYSTEM STATUS</h3>
                <div className="space-y-3 pixel-font-lg text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-green-100">IPC DATABASE</span>
                    <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">ONLINE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-100">SC JUDGMENTS</span>
                    <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">READY</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-100">ALL INDIAN LANGUAGE </span>
                    <Badge className="bg-orange-600/30 text-orange-300 border-orange-400/30 pixel-font">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-100">AI MODELS</span>
                    <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">LOADED</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg border border-purple-400/30">
                <h3 className="pixel-font-xl text-purple-300 mb-4">LEGAL COVERAGE</h3>
                <div className="grid grid-cols-2 gap-3 pixel-font text-left">
                   <div className="text-purple-100">Criminal Laws</div>
                    <div className="text-purple-100">Civil Laws</div>
                    <div className="text-purple-100">Corporate Laws</div>
                    <div className="text-purple-100">Contract Act</div>
                    <div className="text-purple-100">Tax Laws</div>
                    <div className="text-purple-100">Labour Laws</div>
                    <div className="text-purple-100">Family Laws</div>
                    <div className="text-purple-100">Property Laws</div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartVerification}
              className="h-16 px-12 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white pixel-font-2xl font-bold pixel-button"
            >
              <Plus className="h-6 w-6 mr-3" />
              START LEGAL VERIFICATION
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>

          </div>
        )}

        {/* Input and Results Section - Dynamic Layout */}
        {showInputSection && (
          <div
            className={`transition-all duration-500 ease-in-out ${
              inputCentered ? "flex justify-center" : "grid lg:grid-cols-2 gap-4 items-start"
            }`}
          >
            {/* Input Section */}
            <Card
              className={`bg-slate-800/50 border-cyan-400/30 shadow-2xl pixel-border transition-all duration-500 ease-in-out ${
                inputCentered ? "w-full max-w-2xl slide-in-up" : "slide-to-left"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Scale className="h-5 w-5 text-cyan-400 mr-2" />
                  <h2 className="pixel-font-lg text-cyan-300">INPUT LEGAL CONTENT</h2>
                  {result && (
                    <Badge className="ml-auto bg-green-600/30 text-green-300 border-green-400/30 pixel-font">
                      ANALYSIS READY
                    </Badge>
                  )}
                </div>
                <p className="text-cyan-400 pixel-font mb-4">ENTER INDIAN LEGAL DOCUMENT FOR AI VERIFICATION</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-cyan-300 pixel-font mb-2">LEGAL CONTENT • [REQUIRED]</label>
                    <Textarea
                      placeholder="ENTER LEGAL STATEMENT, IPC SECTION, CONTRACT CLAUSE, OR LEGAL DOCUMENT FOR VERIFICATION AGAINST INDIAN LAWS..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[150px] bg-slate-900/50 border-cyan-400/30 text-cyan-100 placeholder:text-cyan-600 pixel-font"
                    />
                    <div className="text-right mt-1">
                      <span className="text-cyan-400 pixel-font text-xs">CHARACTERS: {query.length}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-yellow-300 pixel-font mb-2">JURISDICTION</label>
                      <Select value={jurisdiction} onValueChange={setJurisdiction}>
                        <SelectTrigger className="bg-slate-900/50 border-cyan-400/30 text-cyan-100 pixel-font">
                          <SelectValue placeholder="SELECT COURT" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-cyan-400/30 pixel-font">
                          <SelectItem value="supreme-court" className="pixel-font">
                            SUPREME COURT OF INDIA
                          </SelectItem>
                          <SelectItem value="high-court" className="pixel-font">
                            HIGH COURT
                          </SelectItem>
                          <SelectItem value="district-court" className="pixel-font">
                            DISTRICT COURT
                          </SelectItem>
                          <SelectItem value="sessions-court" className="pixel-font">
                            SESSIONS COURT
                          </SelectItem>
                          <SelectItem value="magistrate-court" className="pixel-font">
                            MAGISTRATE COURT
                          </SelectItem>
                          <SelectItem value="tribunal" className="pixel-font">
                            TRIBUNAL
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-yellow-300 pixel-font mb-2">LAW TYPE</label>
                      <Select value={lawType} onValueChange={setLawType}>
                        <SelectTrigger className="bg-slate-900/50 border-cyan-400/30 text-cyan-100 pixel-font">
                          <SelectValue placeholder="SELECT LAW TYPE" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-cyan-400/30 pixel-font">
                          <SelectItem value="criminal-law" className="pixel-font">
                            CRIMINAL LAW
                          </SelectItem>
                          <SelectItem value="civil-law" className="pixel-font">
                            CIVIL LAW
                          </SelectItem>
                          <SelectItem value="constitutional-law" className="pixel-font">
                            CONSTITUTIONAL LAW
                          </SelectItem>
                          <SelectItem value="corporate-law" className="pixel-font">
                            CORPORATE LAW
                          </SelectItem>
                          <SelectItem value="family-law" className="pixel-font">
                            FAMILY LAW
                          </SelectItem>
                          <SelectItem value="property-law" className="pixel-font">
                            PROPERTY LAW
                          </SelectItem>
                          <SelectItem value="labour-law" className="pixel-font">
                            LABOUR LAW
                          </SelectItem>
                          <SelectItem value="tax-law" className="pixel-font">
                            TAX LAW
                          </SelectItem>
                          <SelectItem value="administrative-law" className="pixel-font">
                            ADMINISTRATIVE LAW
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-yellow-300 pixel-font mb-2">CONFIDENCE: {confidence[0]}%</label>
                    <div className="flex items-center space-x-3">
                      <span className="pixel-font text-cyan-400 text-xs">[MIN]</span>
                      <Slider
                        value={confidence}
                        onValueChange={setConfidence}
                        max={100}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="pixel-font text-cyan-400 text-xs">[HIGH]</span>
                    </div>
                  </div>

                  {/* Status Indicators - Compact */}
                  <div className="grid grid-cols-2 gap-3 pixel-font text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-green-400">IPC: ONLINE</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-green-400">SC: READY</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                        <span className="text-orange-400">ALL LANGUAGE: ACTIVE</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                        <span className="text-orange-400">REGIONAL: READY</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleVerification}
                    disabled={loading || !query.trim()}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white pixel-font-lg font-bold pixel-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ANALYZING...
                      </>
                    ) : result ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        RE-ANALYZE LEGAL CONTENT
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        INITIATE LEGAL VERIFICATION
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section - Only show when there are results */}
            {result && (
              <Card
                className={`bg-slate-800/50 border-purple-400/30 shadow-2xl pixel-border transition-all duration-500 ease-in-out relative ${
                  showAnimations ? "slide-in-from-right opacity-100" : "opacity-100"
                }`}
              >
                {/* Loading Overlay */}
                {analysisLoading && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
                      <p className="pixel-font-lg text-cyan-300">UPDATING ANALYSIS...</p>
                      <p className="pixel-font text-cyan-400 mt-2">PROCESSING NEW LEGAL CONTENT</p>
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Database className="h-5 w-5 text-purple-400 mr-2" />
                    <h2 className="pixel-font-lg text-purple-300">LEGAL ANALYSIS RESULTS</h2>
                    {analysisLoading && (
                      <Badge className="ml-auto bg-orange-600/30 text-orange-300 border-orange-400/30 pixel-font animate-pulse">
                        UPDATING
                      </Badge>
                    )}
                  </div>
                  <p className="text-purple-400 pixel-font mb-4">AI POWERED INDIAN LEGAL VERIFICATION</p>

                  <div className="space-y-4">
                    {/* Enhanced Verification Status */}
                    {result.verificationStatus && (
                      <div
                        className={`highlight-box rounded-lg p-4 ${showAnimations ? "launch-animation" : ""} ${
                          analysisLoading ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        <h3 className="pixel-font-lg text-cyan-300 mb-3 important-text">VERIFICATION STATUS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="bg-slate-900/50 p-3 rounded border border-cyan-400/30">
                            <div className="flex items-center mb-1">
                              {result.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400 mr-2" />
                              )}
                              <span className="pixel-font important-text text-sm">
                                {result.verificationStatus.status}
                              </span>
                            </div>
                            <p className="pixel-font text-cyan-200 text-xs">Legal Compliance Status</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded border border-purple-400/30">
                            <div className="pixel-font text-purple-300 mb-1 text-sm">
                              {result.verificationStatus.confidenceLevel} CONFIDENCE
                            </div>
                            <div className="pixel-font text-green-300 mb-1 text-sm">{result.confidence}%</div>
                            <p className="pixel-font text-purple-200 text-xs">Analysis Certainty</p>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-yellow-400/30">
                          <div className="flex items-center mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                            <span className="pixel-font text-yellow-300 text-sm">
                              {result.verificationStatus.riskDescription}
                            </span>
                          </div>
                          <p className="pixel-font text-yellow-200 text-xs">Risk Assessment</p>
                        </div>
                        <div className="mt-3 p-2 bg-blue-900/30 rounded border border-blue-400/30">
                          <p className="pixel-font important-text text-sm">{result.verificationStatus.summary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Horizontal Analysis Section - Only show when there are results */}
        {result && (
          <div className="mt-8 space-y-8">
            {/* Comprehensive AI Analysis - Full Width */}
            <Card
              className={`bg-slate-900/50 border-cyan-400/30 shadow-2xl pixel-border relative ${
                showAnimations ? "slide-in-up delay-200" : ""
              } ${analysisLoading ? "opacity-75" : "opacity-100"}`}
            >
              {/* Loading Overlay for Analysis */}
              {analysisLoading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
                    <p className="pixel-font text-cyan-300">REGENERATING ANALYSIS...</p>
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                <h3 className="pixel-font-2xl text-cyan-300 mb-4 important-text flex items-center">
                  <Database className="h-6 w-6 mr-3" />
                  COMPREHENSIVE AI ANALYSIS
                  {analysisLoading && (
                    <Badge className="ml-auto bg-cyan-600/30 text-cyan-300 border-cyan-400/30 pixel-font animate-pulse">
                      UPDATING
                    </Badge>
                  )}
                </h3>
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-slate-700">
                  <div className="text-cyan-100 pixel-font-lg leading-relaxed whitespace-pre-line pr-2">
                    {result.analysis}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Citations and Recommendations - Horizontal Layout */}
            <div className="horizontal-section">
              {/* Citations */}
              {result.citations.length > 0 && (
                <Card
                  className={`bg-slate-900/50 border-yellow-400/30 shadow-2xl pixel-border relative ${
                    showAnimations ? "slide-in-left delay-300" : ""
                  } ${analysisLoading ? "opacity-75" : "opacity-100"}`}
                >
                  {analysisLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <RefreshCw className="h-6 w-6 text-yellow-400 animate-spin" />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <h3 className="pixel-font-xl text-yellow-300 mb-4 important-text flex items-center">
                      <FileText className="h-5 w-5 mr-3" />
                      LEGAL CITATIONS
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-slate-700">
                      {result.citations.map((citation, index) => (
                        <div
                          key={index}
                          className="flex items-start bg-yellow-900/20 p-3 rounded border border-yellow-400/20"
                        >
                          <Badge
                            variant="outline"
                            className="mr-3 mt-0.5 bg-yellow-800/30 text-yellow-300 border-yellow-400/30 pixel-font"
                          >
                            {index + 1}
                          </Badge>
                          <span className="text-yellow-100 pixel-font">{citation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card
                  className={`bg-slate-900/50 border-orange-400/30 shadow-2xl pixel-border relative ${
                    showAnimations ? "slide-in-right delay-400" : ""
                  } ${analysisLoading ? "opacity-75" : "opacity-100"}`}
                >
                  {analysisLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <RefreshCw className="h-6 w-6 text-orange-400 animate-spin" />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <h3 className="pixel-font-xl text-orange-300 mb-4 important-text flex items-center">
                      <Shield className="h-5 w-5 mr-3" />
                      ACTIONABLE RECOMMENDATIONS
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-slate-700">
                      {result.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start bg-orange-900/20 p-3 rounded border border-orange-400/20"
                        >
                          <div className="w-3 h-3 bg-orange-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                          <span className="text-orange-100 pixel-font">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Database Status Section - Only show with results */}
            <Card
              className={`bg-slate-800/50 border-green-400/30 shadow-2xl pixel-border digital-glow ${
                showAnimations ? "fade-in-scale delay-500" : ""
              } ${analysisLoading ? "opacity-75" : "opacity-100"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <Database className="h-6 w-6 text-green-400 mr-3" />
                  <h2 className="pixel-font-2xl text-green-300">INDIAN LEGAL DATABASE STATUS</h2>
                </div>

                {/* Statistics - Horizontal Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-900/50 p-4 rounded border border-cyan-400/30 text-center">
                    <div className="pixel-font-3xl text-cyan-300">50K+</div>
                    <div className="pixel-font-lg text-cyan-400">SC JUDGMENTS</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded border border-purple-400/30 text-center">
                    <div className="pixel-font-3xl text-purple-300">2</div>
                    <div className="pixel-font-lg text-purple-400">AI MODELS</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded border border-yellow-400/30 text-center">
                    <div className="pixel-font-3xl text-yellow-300">2.5M</div>
                    <div className="pixel-font-lg text-yellow-400">LEGAL DOCS</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded border border-green-400/30 text-center">
                    <div className="pixel-font-3xl text-green-300">96%</div>
                    <div className="pixel-font-lg text-green-400">ACCURACY</div>
                  </div>
                </div>

                {/* Modules and Courts - Horizontal Layout */}
                <div className="horizontal-section">
                  {/* Active Legal Modules */}
                  <div>
                    <h3 className="pixel-font-xl text-green-300 mb-4">ACTIVE LEGAL MODULES</h3>
                    <div className="space-y-3 pixel-font-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-100">IPC-ANALYZER</span>
                        <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">ONLINE</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-100">SC-JUDGMENT-AI</span>
                        <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">ONLINE</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-100">BARE-ACTS-DB</span>
                        <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">ONLINE</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-100">HINDI-LEGAL-NLP</span>
                        <Badge className="bg-orange-600/30 text-orange-300 border-orange-400/30 pixel-font">
                          ACTIVE
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Court Databases */}
                  <div>
                    <h3 className="pixel-font-xl text-purple-300 mb-4">COURT DATABASES</h3>
                    <div className="space-y-3 pixel-font-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">SUPREME COURT</span>
                        <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">SYNCED</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">HIGH COURTS</span>
                        <Badge className="bg-blue-600/30 text-blue-300 border-blue-400/30 pixel-font">UPDATING</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">DISTRICT COURTS</span>
                        <Badge className="bg-yellow-600/30 text-yellow-300 border-yellow-400/30 pixel-font">
                          PARTIAL
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">TRIBUNALS</span>
                        <Badge className="bg-green-600/30 text-green-300 border-green-400/30 pixel-font">READY</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Acts Coverage - Full Width */}
                <div className="mt-8 horizontal-full">
                  <h3 className="pixel-font-xl text-yellow-300 mb-4">LEGAL ACTS COVERAGE</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pixel-font-lg">
                    <div className="text-yellow-100">Criminal Laws</div>
                    <div className="text-yellow-100">Civil Laws</div>
                    <div className="text-yellow-100">Constitutional Laws</div>
                    <div className="text-yellow-100">Contract Act</div>
                    <div className="text-yellow-100">Tax Laws</div>
                    <div className="text-yellow-100">Labour Laws</div>
                    <div className="text-yellow-100">Family Laws</div>
                    <div className="text-yellow-100">Property Laws</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
