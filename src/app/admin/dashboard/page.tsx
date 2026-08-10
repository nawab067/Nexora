'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminDashboardView from "@/components/dashboardview";


interface SalesCards {
  conversionRate: {
    value: number;
    unit: string;
  };
  averageDealValue: {
    value: number;
    unit: string;
  };
  projectedRevenue: {
    value: number;
    unit: string;
  };
}
interface RevenueChartItem {
  day: string;
  this_week: number;
  last_week: number;
}

interface LeadPipeline{
  label: string;
  count: number;
  percentage: number;
}

interface RevenueVelocity {
  chart: RevenueChartItem[];
  growth_percentage: number;
  total_last_week: number;
  total_this_week: number;
}
export default function AdminDashboardContainer() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [useremail, setUseremail] = useState<string | null>(null);
  const [leadcount, setleadcount] = useState<string | null>(null);
const [userid, setUserid] = useState<string | null>(null);
  const [salesCards, setSalesCards] = useState<SalesCards | null>(null);
const [revenueVelocity, setRevenueVelocity] =
  useState<RevenueVelocity | null>(null);
  const [leadPipelineData, setLeadPipelineData] = useState<LeadPipeline[] | null>(null);
  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const response = await axios.get(`${baseurl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserid(response.data.id);

        setUseremail(response.data.email);
        
        setLoading(false);

      } catch (error) {
        console.log("Unauthorized");

        router.replace("/auth/login");
      }
    };

    verifyUser();
  }, [router, baseurl]);

  useEffect(() => {
    console.log("Dashboard Loaded");
  }, []);

  async function fetchleadCount() {
    try {
      const response = await axios.get(`${baseurl}/leadcount`);
      setleadcount(response.data);
    } catch (error) {
      console.log("Error fetching lead count");
    }
  }

  useEffect(() => {
    fetchleadCount();
  }, []);

  const fetch_revenue_velocity= async()=>{
    try{
      const response = await axios.get(`${baseurl}/get-revenue-velocity/${userid}`);
      setRevenueVelocity(response.data.data);
      console.log("Revenue Velocity:", response.data);

    }catch(error){
      console.log("Error fetching revenue velocity");
    }
  }
  const leadPipeline= async()=>{
    try{
      const response = await axios.get(`${baseurl}/get-lead-pipeline/${userid}`);
      setLeadPipelineData(response.data.data);
      console.log("Lead Pipeline:", response.data);

    }catch(error){
      console.error("Error fetching lead pipeline");
    }
  }

  const fetchUsername= async()=>{
    try{
      const response = await axios.get(`${baseurl}/admin/users/${userid}`);
      setUsername(response.data);

    }catch(error){
      console.error("Error fetching username");
    }
  }

  const fetch_stats_cards= async()=>{
    try{
       const response = await axios.get(`${baseurl}/get-invoice-status-count/${userid}`);
       setSalesCards(response.data.data);
       console.log(response.data);

    }catch(error){
      console.error("Error fetching stats cards");
    }
  }
  useEffect(()=>{
    if(!userid){
      return;
    }
    fetch_revenue_velocity();
    leadPipeline();
    fetchUsername();
    fetch_stats_cards();
  },[userid]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }



  return (
    <AdminDashboardView
      username={username}
      useremail={useremail}
      leadcount={leadcount}
      revenueVelocity={revenueVelocity}
      leadPipelineData={leadPipelineData}
      salesCards={salesCards}
    />
  );
}