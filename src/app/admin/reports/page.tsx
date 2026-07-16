'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ReportsPageproops from "@/components/reportsoverview";

interface AIPredictionType {
    predicted_leads: number;
    conversion_rate: string;
    confidence: string;
    prediction: string;
}


const baseurl = process.env.NEXT_PUBLIC_BASE_URL

interface customer {
    _id: string;
    name: string;
}
export default function RemindersPage() {
    const [userid, setUserid] = useState<string | null>(null);
    const [countleads, setcountleads] = useState<number>(0);
    const [countcustomer, setcountCustomer] = useState<number>(0);
    const [totalemailsent, settotalemailsent] = useState<number>(0);
    const [totalreplies, settotalreplies] = useState<number>(0);
    const [monthlyleads, setmonthlyleads] = useState<{ month: string; leads: number }[]>([]);
    const [emailanalytics, setemailanalytics] = useState<{ label: string; sent: number; replies: number; ignored: number }[]>([]);
    const [leadsdata, setleaddata] = useState<any[]>([]);
    const [leadanalytics, setleadanalytics] = useState<{
        label:string;
        value:number;
        count:number;
        color:string;
    }[]>([]);
    const [leadpipeline, setleadpipeline]= useState<
    { label: string; count: number; percentage: number;  }[]>([]);
    const[AIReply, setAIreply] =useState<{
        label:string;
        value:number;
    }[]>([]);
    const [aiInsights, setaiInsights] = useState<string>("");
    const[aiRecomendations,setaiRecomendations]=useState<string[]>([]);
    const [aiprediction, setaiprediction] = useState<AIPredictionType>({
        predicted_leads: 0,
        conversion_rate: "0%",
        confidence: "0%",
        prediction: "",
    });



    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(`${baseurl}/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserid(res.data.id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const fetchCountLeads = async () => {
        try {
            const response = await axios.get(`${baseurl}/get-total-counts-lead/${userid}`);
            setcountleads(response.data.data);
            console.log("Total Leads Count:", response.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (!userid) {
            return;
        } fetchCountLeads();
    }, [userid]);

    const fetchcountcustomer = async () => {
        try {
            const response = await axios.get(`${baseurl}/get-total-counts-customer/${userid}`);
            setcountCustomer(response.data.data);
        } catch (err) {
            console.error(err);
        }

    }
    useEffect(() => {
        if (!userid) {
            return;
        }
        fetchcountcustomer();
    }, [userid]);


    const fetchtotalemailsent = async () => {
        try {
            const res = await axios.get(`${baseurl}/get-total-email-sent/${userid}`);
            console.log("Total Emails Sent:", res.data.data);
            settotalemailsent(res.data.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (!userid) {
            return;
        }
        fetchtotalemailsent();
    }, [userid]);

    const fetchTotal_count_replies = async () => {
        try {
            const response = await axios.get(`${baseurl}/get-total-count-replies/${userid}`);
            settotalreplies(response.data.data);
        } catch (err) {
            console.error(err);
        }
    }
    useEffect(() => {
        if (!userid) {
            return;
        }
        fetchTotal_count_replies();
    }, [userid]);

    const fetchMonthlyLeads = async () => {
        try {
            const response = await axios.get(`${baseurl}/get-monthly-leads/${userid}`);
            setmonthlyleads(response.data.data);
            console.log("Monthly Leads:", response.data.data);
        } catch (err) {
            console.error(err);
        }
    }
    useEffect(() => {
        if (!userid) {
            return;
        }
        fetchMonthlyLeads();
    }, [userid]);

    const fetcemailAnalytics = async () => {
        try {
            const response = await axios.get(`${baseurl}/get-email-analytics/${userid}`);
            setemailanalytics(response.data.data);
            console.log("Email Analytics:", response.data.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (!userid) {
            return;
        }
        fetcemailAnalytics();
    }, [userid]);

    const fetcleadname_status = async () => {
        try {
            const response = await axios.get(
                `${baseurl}/get-customer-leadname-status/${userid}`
            );

            const leads = response.data.data;

            const updatedLeads = await Promise.all(
                leads.map(async (lead: any) => {
                    const customerResponse = await axios.get(
                        `${baseurl}/get-customer-name/${lead.customerid}`
                    );

                    const repliesResponse = await axios.get(
                        `${baseurl}/get-customer-replies/${lead.customerid}`
                    );

                    const predictscore= await axios.get(
                        `${baseurl}/predict-lead-score/${lead.customerid}`
                    )

                    return {
                        ...lead,

                        customer_name: customerResponse.data.name,
                        replies: repliesResponse.data.data,
                        score: predictscore.data.data.score,
                    };
                })
            );
            setleaddata(updatedLeads);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        console.log("leads:", leadsdata);
        if (!userid) {
            return;
        }
        fetcleadname_status();
    }, [userid]);


    const lead_source_analytics = async() =>{
        try{
            const response = await axios.get(`${baseurl}/get-lead-source-analytics/${userid}`);
            setleadanalytics(response.data.data);
            console.log(response.data.data);

        }catch(err){
            console.error(err);
        }
    }
    useEffect (()=>{
        if(!userid){
            return;
        }
        lead_source_analytics();
    },[userid]);

    const lead_pipeline_analytics= async()=>{
        try{
            const respnse = await axios.get(`${baseurl}/get-lead-pipeline/${userid}`);
            setleadpipeline(respnse.data.data);
            console.log(respnse.data.data);
        }catch(err){
            console.error(err);
        }
    }
    useEffect (()=>{
        if(!userid){
            return;
        }
        lead_pipeline_analytics();
    },[userid]);

    const Ai_replySentiments= async() =>{
        try{
            const response= await axios.get(`${baseurl}/get-ai-reply-sentiments/${userid}`);
             setAIreply(response.data.data);
            console.log(response.data.data);

        }catch(err){
            console.error(err);
        }
    }

    useEffect (()=>{
        if(!userid){
            return;
        }
        Ai_replySentiments();
    },[userid]);

    const AI_insights = async() =>{
        try{
            const response = await axios.get(`${baseurl}/get-ai-insights/${userid}`);
            setaiInsights(response.data.data);
        }catch(err){
            console.error(err);
        }
    }

    useEffect(()=>{
        if(!userid){
            return;
        }
        AI_insights();
    },[userid]);

    const AiRecomendation= async()=>{
        try{
            const response = await axios.get(`${baseurl}/get-ai-recommendations/${userid}`);
            console.log("Ai recomendation",response.data.data);
            setaiRecomendations(response.data.data);
            
        }catch(err){
            console.error(err);
        }
    }
    useEffect(()=>{
        if(!userid){
            return;
        }
        AiRecomendation();
    },[userid]);

    const FuturePredictions= async() =>{
        try{
            const response = await axios.get(`${baseurl}/get-ai-topics/${userid}`);
            setaiprediction(response.data.data);
            console.log(response.data.data);
        }catch(err){
            console.error(err);
        }
    }
    useEffect(()=>{
        if(!userid){
            return;
        }
        FuturePredictions();    
    },[userid]);

    return (
        <div className="p-4">
            <ReportsPageproops
                countleads={countleads}
                countcustomer={countcustomer}
                totalemailsent={totalemailsent}
                totalreplies={totalreplies}
                monthlyleads={monthlyleads}
                emailanalytics={emailanalytics}
                leadsdata={leadsdata}
                leadanalytics={leadanalytics}
                leadpipeline={leadpipeline}
                AIReply={AIReply}
                aiInsights={aiInsights}
                aiRecommendations={aiRecomendations}
                aiprediction={aiprediction}
            />
        </div>
    );
}