"use client"
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong!</CardTitle>
          <CardDescription>
            We encountered an error while loading the dashboard. This could be due to a network issue or server problem.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
} 