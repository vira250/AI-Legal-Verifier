"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Users, MessageSquare } from "lucide-react"

interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  accuracyStats: Record<string, number>
  helpfulnessStats: Record<string, number>
}

export default function FeedbackStatsPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/feedback")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading feedback statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Failed to load feedback statistics</div>
      </div>
    )
  }

  const getPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Feedback Analytics</h1>
          <p className="text-lg text-gray-600">AI Analysis Performance Metrics</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Feedback */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold mr-2">{stats.averageRating}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= stats.averageRating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {getPercentage(stats.accuracyStats.accurate || 0, stats.totalFeedback)}%
                  </p>
                  <p className="text-sm text-gray-600">Accuracy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helpfulness Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {getPercentage(
                      (stats.helpfulnessStats.very_helpful || 0) + (stats.helpfulnessStats.helpful || 0),
                      stats.totalFeedback,
                    )}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Helpful Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Accuracy Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Distribution</CardTitle>
              <CardDescription>How users rate the accuracy of our legal analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.accuracyStats).map(([key, count]) => {
                  const percentage = getPercentage(count, stats.totalFeedback)
                  const label = key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                  const color =
                    key === "accurate" ? "bg-green-500" : key === "somewhat_accurate" ? "bg-yellow-500" : "bg-red-500"

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${color} mr-3`} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                        <Badge variant="outline">
                          {count} ({percentage}%)
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Helpfulness Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Helpfulness Distribution</CardTitle>
              <CardDescription>How users rate the helpfulness of our recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.helpfulnessStats).map(([key, count]) => {
                  const percentage = getPercentage(count, stats.totalFeedback)
                  const label = key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                  const color =
                    key === "very_helpful" ? "bg-green-500" : key === "helpful" ? "bg-blue-500" : "bg-gray-500"

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${color} mr-3`} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                        <Badge variant="outline">
                          {count} ({percentage}%)
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {stats.totalFeedback === 0 && (
          <div className="text-center mt-8 p-8 bg-white rounded-lg shadow">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
            <p className="text-gray-600">Start using the Legal Verifier and provide feedback to see analytics here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
