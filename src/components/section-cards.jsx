"use client"

import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import { Box, Coins, ConciergeBell, TrendingUpDown } from "lucide-react";
import { useState, useEffect } from "react";

export function SectionCards() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [cashflowStatus, setCashflowStatus] = useState("Loading...");
  const [salesForecasting, setSalesForecasting] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/revenue?months=1`);
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      const data = await response.json();
      setTotalRevenue(data.total_revenue || 0);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err.message);
    }
  };

  // SINGLE API CALL - ambil semua data dari AI analysis endpoint
  const fetchAllDashboardData = async () => {
    try {
      const response = await fetch(`https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/dashboard/ai-analysis?location=Jakarta`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      console.log('Dashboard AI Analysis data:', data);
      
      // Set total revenue dari YTD data
      // setTotalRevenue(data.total_revenue_ytd || 0);
      
      // Set total sales dari YTD data
      setTotalSales(data.total_sales_ytd || 0);
      
      // Set cashflow status dari AI analysis
      const cashflow = data.cashflow_analysis;
      if (cashflow) {
        setCashflowStatus(cashflow.cashflow_status);
      }
      
      // Set sales forecasting dari AI analysis
      const aiAnalysis = data.ai_analysis;
      if (aiAnalysis) {
        const forecastText = aiAnalysis.sales_forecast_next_month?.toLocaleString('id-ID') || "0";
        setSalesForecasting(`${forecastText} orders`);
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      // Fallback values
      setCashflowStatus("Fair");
      setSalesForecasting("Calculating...");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchRevenueData(), fetchAllDashboardData()]); // Single API call
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
            <Coins className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
            <Box className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            {loading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-2xl font-bold text-red-500">Error</p>
            ) : (
              <p className="text-2xl font-bold">{totalSales.toLocaleString('id-ID')}</p>
            )}
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
            <ConciergeBell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cashflow Status</p>
            <p className={`text-2xl font-bold ${getStatusColor(cashflowStatus)}`}>
              {loading ? "Loading..." : cashflowStatus}
            </p>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
            <TrendingUpDown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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
