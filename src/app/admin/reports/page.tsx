"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ReportsPageproops from "@/components/reportsoverview";
import { Button } from "@/components/ui/button";

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

interface DashboardData {
  countLeads: number;
  customers: number;
  emails: number;
  replies: number;
  monthly: any[];
  pipeline: any[];
  emailAnalytics: any[];
  leadAnalytics: any[];
  averageScore: number;
  conversionRate: number;
  prediction: {
    predicted_leads: number;
    conversion_rate: string;
    confidence: string;
    prediction: string;
  };
  insights: string;
  recommendations: string[];
  replySentiments: any[];
  leadsData: any[];
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData>({
    countLeads: 0,
    customers: 0,
    emails: 0,
    replies: 0,
    monthly: [],
    pipeline: [],
    emailAnalytics: [],
    leadAnalytics: [],
    averageScore: 0,
    conversionRate: 0,

    prediction: {
      predicted_leads: 0,
      conversion_rate: "0%",
      confidence: "0%",
      prediction: "",
    },

    insights: "",
    recommendations: [],
    replySentiments: [],
    leadsData: [],
  });
  const [userid, setUserid] = useState<string | null>(null);
  const [leadsdata, setleaddata] = useState<any[]>([]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) return;

        const res = await axios.get(`${baseurl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserid(res.data.id);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);
  const fetchDashboard = async () => {
    if (!userid) return;

    console.log("Fetching fresh dashboard...");

    const response = await axios.get(`${baseurl}/dashboard/${userid}`);

    setDashboard(response.data.data);

    sessionStorage.setItem(
      `dashboard-${userid}`,
      JSON.stringify({
        data: response.data.data,
        time: Date.now(),
      }),
    );
  };
  const loadDashboard = async () => {
    try {
      const cacheKey = `dashboard-${userid}`;

      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        const FIVE_MINUTES = 5 * 60 * 1000;

        if (Date.now() - parsed.time < FIVE_MINUTES) {
          console.log("Loaded from Cache");

          setDashboard(parsed.data);

          return;
        }
      }

      await fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (!userid || loaded) return;

  loadDashboard();
  setLoaded(true);
}, [userid, loaded]);

  const refreshDashboard = async () => {
    if (!userid) return;

    try {
      setRefreshing(true);

      sessionStorage.removeItem(`dashboard-${userid}`);

      await fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Reports...
      </div>
    );
  }

  return (
    <ReportsPageproops
      refreshing={refreshing}
      onRefresh={refreshDashboard}
      countleads={dashboard.countLeads}
      countcustomer={dashboard.customers}
      totalemailsent={dashboard.emails}
      totalreplies={dashboard.replies}
      monthlyleads={dashboard.monthly}
      emailanalytics={dashboard.emailAnalytics}
      leadpipeline={dashboard.pipeline}
      leadanalytics={dashboard.leadAnalytics}
      averagescore={dashboard.averageScore}
      conversionrate={dashboard.conversionRate}
      aiprediction={dashboard.prediction}
      aiInsights={dashboard.insights}
      aiRecommendations={dashboard.recommendations}
      AIReply={dashboard.replySentiments}
      leadsdata={dashboard.leadsData}
    />
  );
}
