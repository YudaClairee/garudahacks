"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

// const ordersData = [
//   {
//     orderId: "#87961",
//     customerName: "Mark Allen",
//     date: "May 25, 2023",
//     time: "10:30 AM",
//     amount: "$120",
//     paymentType: "Online",
//     status: "pending",
//   },
//   {
//     orderId: "#87961",
//     customerName: "Mark Allen", 
//     date: "May 25, 2023",
//     time: "10:30 AM",
//     amount: "$120",
//     paymentType: "Online",
//     status: "pending",
//   },
//   {
//     orderId: "#87961",
//     customerName: "Mark Allen",
//     date: "May 25, 2023", 
//     time: "10:30 AM",
//     amount: "$120",
//     paymentType: "Online",
//     status: "pending",
//   },
//   {
//     orderId: "#87961",
//     customerName: "Mark Allen",
//     date: "May 25, 2023",
//     time: "10:30 AM", 
//     amount: "$120",
//     paymentType: "Online",
//     status: "pending",
//   },
// ]

export function OpportunityTable() {
  const [opportunityData, setOpportunityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchOpportunityData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/dashboard/ai-analysis?location=Jakarta`);
      if (!response.ok) throw new Error('Failed to fetch opportunity data');
      const data = await response.json();
      setOpportunityData(data.ai_analysis.crowd_analysis.recommendation);
    } catch (err) {
      console.error('Error fetching opportunity data:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await fetchOpportunityData(); // Single API call
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);


  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Opportunity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-row gap-6">
        <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8650.482493288953!2d106.65448186500466!3d-6.228933178515297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fbdc774920bd%3A0xc1bd189fe0e44b8c!2sRestoran%20Pagi%20Sore%20Alam%20Sutera!5e0!3m2!1sid!2sid!4v1753352825078!5m2!1sid!2sid"
  width="600"
  height="450"
  className="rounded-xl bg-zinc-100 p-4 flex-2"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
<div className="flex-1 flex flex-col gap-y-2">
  <h2 className="text-xl font-semibold">Recommendation</h2>
  <p>{opportunityData}</p>
</div>
        </div>
      </CardContent>
    </Card>
  )
} 