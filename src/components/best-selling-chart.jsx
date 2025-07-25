"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
}

export function BestSellingChart() {
  const [timeRange, setTimeRange] = React.useState("Last 6 Months")
  // STEP 1: State untuk data
  const [chartData, setChartData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [aiInsight, setAiInsight] = React.useState("")

  // STEP 2: Function fetch AI analysis
  const fetchAIAnalysis = async () => {
    try {
      const response = await fetch(`https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/dashboard/ai-analysis?location=Jakarta`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI analysis')
      }
      
      const data = await response.json()
      
      // Extract AI insight for top sellers
      if (data.ai_analysis && data.ai_analysis.top_sellers_recommendation) {
        setAiInsight(data.ai_analysis.top_sellers_recommendation)
      }
    } catch (err) {
      console.error('Error fetching AI analysis:', err)
      setAiInsight("AI insights tidak tersedia saat ini.")
    }
  }

  // STEP 3: Function fetch top selling items  
  const fetchTopSellingData = async (months) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/items/top-selling?limit=5&months=${months}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch top selling data')
      }
      
      const data = await response.json()
      
      // STEP 4: Transform data
      const transformedData = data.top_selling_items.map(item => ({
        month: item.item_name, // Pake item_name sebagai label
        orders: item.total_sold // Total sold sebagai value
      }))
      
      setChartData(transformedData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching top selling:', err)
    } finally {
      setLoading(false)
    }
  }

  // STEP 5: Convert time range ke months
  const getMonthsFromTimeRange = (range) => {
    switch(range) {
      case "Last 7 Days": return 1
      case "Last 30 Days": return 1  
      case "Last 3 Months": return 3
      case "Last 6 Months": return 6
      default: return 6
    }
  }

  // STEP 6: useEffect untuk fetch data
  React.useEffect(() => {
    const months = getMonthsFromTimeRange(timeRange)
    fetchTopSellingData(months)
    fetchAIAnalysis() // Fetch AI insights
  }, [timeRange])

  return (
    <Card className="flex-1">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Best Selling</CardTitle>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 6 Months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="Last 6 Months" className="rounded-lg">
              Last 6 Months
            </SelectItem>
            <SelectItem value="Last 3 Months" className="rounded-lg">
              Last 3 Months
            </SelectItem>
            <SelectItem value="Last 30 Days" className="rounded-lg">
              Last 30 Days
            </SelectItem>
            <SelectItem value="Last 7 Days" className="rounded-lg">
              Last 7 Days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Loading dan error handling */}
        {loading && <div className="flex items-center justify-center h-[250px]">Loading...</div>}
        {error && <div className="flex items-center justify-center h-[250px] text-red-500">Error: {error}</div>}
        
        {!loading && !error && (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        value,
                        chartConfig[name]?.label || name,
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="orders"
                  fill="#777AE0"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium text-lg leading-none">
              AI Insight
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {aiInsight || "Loading insights..."}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 