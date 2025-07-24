"use client"

import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import { Box, Coins, ConciergeBell, TrendingUpDown } from "lucide-react";
import { useState, useEffect } from "react";

export function SectionCards() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cashflowStatus, setCashflowStatus] = useState("Loading...");
  const [salesForecasting, setSalesForecasting] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/revenue?months=12`);
      if (!response.ok) throw new Error('Failed to fetch revenue');
      
      const data = await response.json();
      console.log('Revenue data:', data);
      setTotalRevenue(data.total_revenue || 0);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setError(err.message);
    }
  };

  const fetchOrdersData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/orders?months=12`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      console.log('Orders data:', data);
      setTotalOrders(data.total_orders || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    }
  };

  // NEW: Fetch AI analysis data
  const fetchAIAnalysisData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/dashboard/ai-analysis?location=Jakarta`);
      if (!response.ok) throw new Error('Failed to fetch AI analysis');
      
      const data = await response.json();
      console.log('AI Analysis data:', data);
      
      // Set cashflow status dari AI analysis
      const cashflow = data.cashflow_analysis;
      if (cashflow) {
        const statusText = `${cashflow.cashflow_status}`;
        setCashflowStatus(statusText);
      }
      
      // Set sales forecasting dari AI analysis
      const aiAnalysis = data.ai_analysis;
      if (aiAnalysis) {
        const forecastText = aiAnalysis.sales_forecast_next_month?.toLocaleString('id-ID') || "0";
        setSalesForecasting(`${forecastText} orders`);
      }
      
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      // Fallback ke status default kalau AI analysis gagal
      setCashflowStatus("Fair");
      setSalesForecasting("Calculating...");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRevenueData(), 
          fetchOrdersData(),
          fetchAIAnalysisData() // Add AI analysis fetch
        ]);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Function to get status color based on AI analysis
  const getStatusColor = (status) => {
    if (status.includes('EXCELLENT') || status.includes('OUTSTANDING')) return 'text-green-600';
    if (status.includes('GOOD')) return 'text-blue-600';
    if (status.includes('FAIR')) return 'text-yellow-600';
    if (status.includes('POOR') || status.includes('NEGATIVE')) return 'text-red-600';
    return 'text-gray-600';
  };

  // Function to get forecast trend color
  const getForecastColor = (forecast) => {
    // Parse number dari forecast string
    const numberMatch = forecast.match(/\d+/);
    if (numberMatch) {
      const num = parseInt(numberMatch[0]);
      if (num > 100) return 'text-green-600'; // High forecast
      if (num > 50) return 'text-blue-600';   // Medium forecast  
      if (num > 0) return 'text-yellow-600';  // Low forecast
    }
    return 'text-red-600'; // Very low or error
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-4">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <Coins className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            {loading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-2xl font-bold text-red-500">Error</p>
            ) : (
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            )}
          </div>
        </CardHeader>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <Box className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            {loading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-2xl font-bold text-red-500">Error</p>
            ) : (
              <p className="text-2xl font-bold">{totalOrders.toLocaleString('id-ID')}</p>
            )}
          </div>
        </CardHeader>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <ConciergeBell className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cashflow Status</p>
            <p className={`text-2xl font-bold ${getStatusColor(cashflowStatus)}`}>
              {loading ? "Loading..." : cashflowStatus}
            </p>
          </div>
        </CardHeader>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <TrendingUpDown className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sales Forecasting</p>
            <p className={`text-2xl font-bold ${getForecastColor(salesForecasting)}`}>
              {loading ? "Loading..." : salesForecasting}
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
