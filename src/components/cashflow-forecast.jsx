"use client"

import { useState, useEffect } from "react";
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
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsightData();
  }, []);

  const fetchInsightData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/insights/ai-analysis');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data ke format chart
      const transformedData = transformApiDataToChart(data);
      setChartData(transformedData);
      
    } catch (err) {
      console.error('Error fetching insight data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformApiDataToChart = (apiData) => {
    const { monthly_revenues, ai_insights } = apiData;
    const chartData = [];

    // Add historical data (actual revenue)
    monthly_revenues.forEach((monthData, index) => {
      const monthName = monthData.month.split(' ')[0]; // Get just month name
      
      if (monthData.revenue > 0) { // Only show months with actual data
        chartData.push({
          month: monthName,
          actual: monthData.revenue,
          type: "historical"
        });
      }
    });

    // Get current month for forecast starting point
    const currentDate = new Date();
    const nextMonth1 = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextMonth2 = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);

    // Add forecast data
    if (ai_insights?.revenue_forecast) {
      chartData.push({
        month: nextMonth1.toLocaleString('en', { month: 'long' }).slice(0, 3),
        optimistic: ai_insights.revenue_forecast.month_1.hi_predict,
        baseline: ai_insights.revenue_forecast.month_1.stagnancy,
        pessimistic: ai_insights.revenue_forecast.month_1.bad_predict,
        type: "forecast"
      });

      chartData.push({
        month: nextMonth2.toLocaleString('en', { month: 'long' }).slice(0, 3),
        optimistic: ai_insights.revenue_forecast.month_2.hi_predict,
        baseline: ai_insights.revenue_forecast.month_2.stagnancy,
        pessimistic: ai_insights.revenue_forecast.month_2.bad_predict,
        type: "forecast"
      });
    }

    return chartData;
  };

  // Format currency untuk tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
        <CardDescription>Data actual dan prediksi AI untuk 2 bulan ke depan</CardDescription>
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
              
              {/* Garis Actual (data historis) */}
              <Line
                dataKey="actual"
                type="monotone"
                stroke={chartConfig.actual.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.actual.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: chartConfig.actual.color }}
                connectNulls={false}
              />
              
              {/* Garis Forecast */}
              <Line
                dataKey="optimistic"
                type="monotone"
                stroke={chartConfig.optimistic.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.optimistic.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: chartConfig.optimistic.color }}
                connectNulls={false}
              />
              
              <Line
                dataKey="baseline"
                type="monotone"
                stroke={chartConfig.baseline.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.baseline.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: chartConfig.baseline.color }}
                connectNulls={false}
              />
              
              <Line
                dataKey="pessimistic"
                type="monotone"
                stroke={chartConfig.pessimistic.color}
                strokeWidth={2}
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
