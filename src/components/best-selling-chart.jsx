"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

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

const chartData = [
  { month: "Tiramissu", orders: 200 },
  { month: "Red Velvet", orders: 150 },
  { month: "Matcha", orders: 500 },
  { month: "Vanilla", orders: 300 },
  { month: "Choco", orders: 800 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
}

export function BestSellingChart() {
  const [timeRange, setTimeRange] = React.useState("Last 6 Months")

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
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
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
      </CardContent>
    </Card>
  )
} 