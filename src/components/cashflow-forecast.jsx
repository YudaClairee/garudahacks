"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
};

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
      const response = await fetch(
        "https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/insights/ai-analysis"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      // Transform API data ke format chart
      const transformedData = transformApiDataToChart(data);
      setChartData(transformedData);
    } catch (err) {
      console.error("Error fetching insight data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformApiDataToChart = (apiData) => {
    const { monthly_revenues, ai_insights } = apiData;
    const chartData = [];

    // Urutan bulan yang benar
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let lastActualValue = 0;
    let lastActualMonth = "";

    // Add historical data (actual revenue) dalam urutan yang benar
    if (monthly_revenues && Array.isArray(monthly_revenues)) {
      // Sort data by month order
      const sortedMonthlyData = monthly_revenues
        .map((monthData) => {
          const monthName = monthData.month.split(" ")[0];
          const monthShort = monthName.slice(0, 3);
          return {
            ...monthData,
            monthShort,
            monthIndex: monthOrder.indexOf(monthShort),
          };
        })
        .filter((item) => item.monthIndex !== -1 && item.revenue > 0)
        .sort((a, b) => a.monthIndex - b.monthIndex);

      sortedMonthlyData.forEach((monthData) => {
        chartData.push({
          month: monthData.monthShort,
          actual: monthData.revenue,
          type: "historical",
        });

        // Simpan data terakhir untuk connection point
        lastActualValue = monthData.revenue;
        lastActualMonth = monthData.monthShort;
      });
    }

    // Add forecast data dengan connection point
    if (ai_insights?.revenue_forecast && lastActualValue > 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString("en", { month: "long" }); // 0-11

      // Tentukan bulan forecast berdasarkan bulan terakhir yang ada data
      const lastMonthIndex = monthOrder.indexOf(lastActualMonth);
      const nextMonth1Index = (lastMonthIndex + 1) % 12;
      const nextMonth2Index = (lastMonthIndex + 2) % 12;

      const nextMonth1Name = monthOrder[nextMonth1Index];
      const nextMonth2Name = monthOrder[nextMonth2Index];

      if (ai_insights.revenue_forecast.last_month_projection) {
        chartData.push({
          month: currentMonth,
          actual: lastActualValue,
          optimistic: lastActualValue,
          baseline:
            lastActualValue,
          pessimistic: lastActualValue,
          type: "transition",
        });
      }
      // Bulan ke-1 forecast dengan connection point
      if (ai_insights.revenue_forecast.month_1) {
        chartData.push({
          month: nextMonth1Name,
          optimistic: ai_insights.revenue_forecast.month_1.hi_predict || 0,
          baseline: ai_insights.revenue_forecast.month_1.stagnancy || 0,
          pessimistic: ai_insights.revenue_forecast.month_1.bad_predict || 0,
          type: "forecast",
        });
      }

      // Bulan ke-2 forecast
      if (ai_insights.revenue_forecast.month_2) {
        chartData.push({
          month: nextMonth2Name,
          optimistic: ai_insights.revenue_forecast.month_2.hi_predict || 0,
          baseline: ai_insights.revenue_forecast.month_2.stagnancy || 0,
          pessimistic: ai_insights.revenue_forecast.month_2.bad_predict || 0,
          type: "forecast",
        });
      }
    }

    console.log("Transformed Chart Data:", chartData); // Debug log
    return chartData;
  };

  // Format currency untuk tooltip
  const formatCurrency = (value) => {
    if (!value || value === 0) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
          <CardDescription>Loading data from server...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Loading cashflow data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
          <CardDescription>Error loading forecast data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">Error: {error}</p>
              <button
                onClick={fetchInsightData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
          <CardDescription>No forecast data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No revenue data found</p>
              <p className="text-sm text-gray-400">
                Make sure you have some completed orders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Cashflow Forecast</CardTitle>
        <CardDescription>
          Actual data from database and AI prediction for 2 months ahead
        </CardDescription>
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
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
                tick={{ fontSize: 12 }}
                tickCount={6}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-2">
                          {label}
                        </p>
                        {payload.map((entry, index) => {
                          if (entry.value && entry.value > 0) {
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-gray-600">
                                  {chartConfig[entry.dataKey]?.label}:{" "}
                                  {formatCurrency(entry.value)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
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
                connectNulls={true} // Important: ini bikin garis nyambung
              />

              {/* Garis Forecast */}
              <Line
                dataKey="optimistic"
                type="monotone"
                stroke={chartConfig.optimistic.color}
                strokeWidth={2}
                dot={{
                  fill: chartConfig.optimistic.color,
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{ r: 5, fill: chartConfig.optimistic.color }}
                connectNulls={true}
              />

              <Line
                dataKey="baseline"
                type="monotone"
                stroke={chartConfig.baseline.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.baseline.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: chartConfig.baseline.color }}
                connectNulls={true}
              />

              <Line
                dataKey="pessimistic"
                type="monotone"
                stroke={chartConfig.pessimistic.color}
                strokeWidth={2}
                dot={{
                  fill: chartConfig.pessimistic.color,
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{ r: 5, fill: chartConfig.pessimistic.color }}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2">
        <div className="flex gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Data Actual</span>
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
        <p className="text-xs text-gray-500 mt-2">
          * Prediction based on AI analysis of historical sales data
        </p>
      </CardFooter>
    </Card>
  );
}
