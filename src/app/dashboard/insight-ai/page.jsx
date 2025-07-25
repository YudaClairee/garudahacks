"use client"

import { useState, useEffect } from "react";
import { CashflowForecast } from "@/components/cashflow-forecast";
import { Chatbot } from "@/components/chatbot";

export default function InsightAiPage() {
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsightData();
  }, []);

  const fetchInsightData = async () => {
    try {
      const response = await fetch('https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/insights/ai-analysis');
      if (response.ok) {
        const data = await response.json();
        setInsightData(data);
      }
    } catch (error) {
      console.error('Error fetching insight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Insight AI</h1>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-2 p-6 border border-gray-200 rounded-lg flex flex-col gap-4">
            <CashflowForecast />
            <Chatbot />
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col gap-10 border border-gray-200 rounded-lg p-6">
            {/* Cashflow Analysis - Data from API */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Cashflow Analysis</h2>
              <div className="flex flex-col gap-4">
                {loading ? (
                  <p className="text-gray-500">Loading data...</p>
                ) : insightData ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Revenue</h3>
                      <p className="text-lg font-medium">
                        {formatCurrency(insightData.total_revenue)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Profit</h3>
                      <p className="text-lg font-medium text-green-600">
                        {formatCurrency(insightData.total_profit)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Expenses</h3>
                      <p className="text-lg font-medium text-red-600">
                        {formatCurrency(insightData.total_expenses)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500">Error loading data</p>
                )}
              </div>
            </div>

            {/* AI Tips - Data from API */}
            <div className="flex flex-col gap-4 text-center bg-indigo-100 rounded-lg p-6">
              <h2 className="text-2xl font-bold dark:text-black">AI Tips</h2>
              {loading ? (
                <p className="text-gray-500">Loading tips...</p>
              ) : insightData?.ai_insights?.financial_tips ? (
                <div className="space-y-3">
                  {insightData.ai_insights.financial_tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 text-left">
                      <div className="bg-indigo-500 rounded-full p-1 w-3 h-3 mt-1 flex-shrink-0"></div>
                      <p className="text-sm text-gray-900">{tip}</p>
                    </div>
                  ))}
                  
                  {/* Trend Analysis */}
                  {insightData.ai_insights.trend_analytics && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Trend Analysis:</h4>
                      <p className="text-sm text-gray-700 text-left">
                        {insightData.ai_insights.trend_analytics}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No tips available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}