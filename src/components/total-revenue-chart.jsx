"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
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

// const chartData = [
//   { month: "Senin", revenue: 100 },
//   { month: "Selasa", revenue: 150 },
//   { month: "Rabu", revenue: 200 },
//   { month: "Kamis", revenue: 180 },
//   { month: "Jumat", revenue: 250 },
//   { month: "Sabtu", revenue: 300 },
//   { month: "Minggu", revenue: 350 },
// ]

const chartConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-1))",
  },
}

export function TotalRevenueChart() {
  const [timeRange, setTimeRange] = React.useState("12m")
  // STEP 1: Tambah state untuk data dan loading
  const [chartData, setChartData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  // STEP 2: Function untuk fetch data
  const fetchRevenueData = async (months) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/revenue?months=${months}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data')
      }
      
      const data = await response.json()
      
      // STEP 3: Transform data dari backend ke format chart
      const transformedData = Object.entries(data.monthly_revenues || {})
        .map(([month, revenue]) => ({
          month: month, // "2024-01" format
          revenue: revenue
        }))
        .sort((a, b) => a.month.localeCompare(b.month)) // Sort by month
      
      setChartData(transformedData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching revenue:', err)
    } finally {
      setLoading(false)
    }
  }

  // STEP 4: Convert timeRange ke months number
  const getMonthsFromTimeRange = (range) => {
    switch(range) {
      case "7d": return 1
      case "30d": return 1  
      case "90d": return 3
      case "12m": return 12
      default: return 12
    }
  }

  // STEP 5: useEffect untuk fetch data ketika timeRange berubah
  React.useEffect(() => {
    const months = getMonthsFromTimeRange(timeRange)
    fetchRevenueData(months)
  }, [timeRange]) // Re-fetch ketika timeRange berubah

  // STEP 6: Format month untuk display yang lebih bagus
  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  }

  return (
    <Card className="flex-1">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total Revenue</CardTitle>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="12m" className="rounded-lg">
              Last 12 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* STEP 7: Tambah loading dan error handling */}
        {loading && (
          <div className="flex items-center justify-center h-[250px]">
            <div>Loading...</div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-500">Error: {error}</div>
          </div>
        )}
        
        {!loading && !error && (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                {/* Chart config tetap sama */}
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatMonth} // Format month display
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} // Format rupiah
                />
                {/* Tooltip dan Area tetap sama */}
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return value
                      }}
                      formatter={(value, name) => [
                        `$${value}`,
                        chartConfig[name]?.label || name,
                      ]}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="#777AE0"
                  stroke="#777AE0"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
} 