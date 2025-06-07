"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"

interface EventCardProps {
  event: {
    id: string
    title: string
    settled: boolean
    createdAt: string
    updatedAt: string
  }
}

interface PriceData {
  yesPrice: string
  noPrice: string
}

export function EventCard({ event }: EventCardProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`/api/events/${event.id}/quote`)
        
        if (!response.ok) {
          setError(new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`))
          return
        }
        
        const data = await response.json()
        
        if (data.message === "success") {
          setPriceData({
            yesPrice: data.yesPrice,
            noPrice: data.noPrice
          })
        } else {
          setError(new Error(data.reason || "Failed to fetch prices"))
        }
      } catch (err) {
        setError(new Error(err instanceof Error ? err.message : "Failed to fetch prices for this event"))
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [event.id])

 
  if (error) {
    throw error
  }

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toFixed(2)}`
  }

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pt-1">
        <CardTitle className="text-sm leading-tight line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-1 pb-1">
        {loading ? (
          <div className="text-center py-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : priceData ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-800 dark:text-green-400">Yes</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {formatPrice(priceData.yesPrice)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-1.5 bg-red-50 dark:bg-red-950/20 rounded">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-xs font-medium text-red-800 dark:text-red-400">No</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {formatPrice(priceData.noPrice)}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
} 