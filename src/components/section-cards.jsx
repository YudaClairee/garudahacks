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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/revenue?months=12`);
      if (!response.ok) throw new Error('Failed to fetch revenue');
      
      const data = await response.json();
      console.log('Revenue data:', data); // Debug log
      setTotalRevenue(data.total_revenue || 0);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setError(err.message);
    }
  };

  // TAMBAH function yang hilang
  const fetchOrdersData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/orders?months=12`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      console.log('Orders data:', data); // Debug log
      setTotalOrders(data.total_orders || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchRevenueData(), fetchOrdersData()]);
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
            <p className="text-2xl font-bold">
              {loading ? "Loading..." : totalRevenue > 1000000 ? "Good" : "Fair"}
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
            <p className="text-2xl font-bold">
              {loading ? "Loading..." : Math.round(totalOrders * 1.15).toLocaleString('id-ID')}
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
