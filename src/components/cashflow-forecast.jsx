"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Data historis (6 bulan ke belakang) + proyeksi (6 bulan ke depan)
const chartData = [
  // Data historis (garis solid)
  { month: "January", actual: 2800000, type: "historical" },
  { month: "February", actual: 3200000, type: "historical" },
  { month: "March", actual: 2900000, type: "historical" },
  { month: "April", actual: 3500000, type: "historical" },
  { month: "May", actual: 4200000, type: "historical" },
  { month: "June", actual: 4000000, type: "historical" },
  { month: "July", actual: 4500000, type: "historical" },
  { month: "August", actual: 4800000, type: "historical" },
  { month: "September", actual: 5000000, type: "historical" },
  { month: "October", actual: 5200000, type: "historical" },
  { month: "November", actual: 5100000, optimistic: 5100000, baseline: 5100000, pessimistic: 5100000, type: "transition" },
  { month: "December", optimistic: 5400000, baseline: 5200000, pessimistic: 4900000, type: "forecast" },
  { month: "January", optimistic: 5700000, baseline: 5400000, pessimistic: 4900000, type: "forecast" },
  
  // Connection point - Juni punya data actual DAN semua skenario biar nyambung
  
]

const chartConfig = {
  actual: {
    label: "Actual",
    color: "#8b5cf6", // Purple untuk data historis
  },
  optimistic: {
    label: "Optimistic",
    color: "#22c55e", // Green untuk skenario optimis
  },
  baseline: {
    label: "Baseline", 
    color: "#3b82f6", // Blue untuk skenario baseline
  },
  pessimistic: {
    label: "Pessimistic",
    color: "#ef4444", // Red untuk skenario pesimis
  },
}

export function CashflowForecast() {
  // Format currency untuk tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 12 }}
                tickCount={5}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-600">
                              {chartConfig[entry.dataKey]?.label}: {formatCurrency(entry.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Garis Actual (data historis) - solid line */}
              <Line
                dataKey="actual"
                type="monotone"
                stroke={chartConfig.actual.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.actual.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: chartConfig.actual.color }}
                connectNulls={false}
              />
              
              {/* Garis Optimistic - smooth curve */}
              <Line
                dataKey="optimistic"
                type="monotone"
                stroke={chartConfig.optimistic.color}
                strokeWidth={2}
                strokeDasharray="0" // Solid line
                dot={{ fill: chartConfig.optimistic.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: chartConfig.optimistic.color }}
                connectNulls={false}
              />
              
              {/* Garis Baseline - smooth curve */}
              <Line
                dataKey="baseline"
                type="monotone"
                stroke={chartConfig.baseline.color}
                strokeWidth={2}
                strokeDasharray="0" // Solid line
                dot={{ fill: chartConfig.baseline.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: chartConfig.baseline.color }}
                connectNulls={false}
              />
              
              {/* Garis Pessimistic - smooth curve */}
              <Line
                dataKey="pessimistic"
                type="monotone"
                stroke={chartConfig.pessimistic.color}
                strokeWidth={2}
                strokeDasharray="0" // Solid line
                dot={{ fill: chartConfig.pessimistic.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: chartConfig.pessimistic.color }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Optimistic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Pessimistic</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
