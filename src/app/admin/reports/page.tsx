'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ReportsPageproops from "@/components/reportsoverview";


const baseurl= process.env.NEXT_PUBLIC_BASE_URL

interface customer{
    _id:string;
    name:string;
}
export default function RemindersPage() {
    const [userid, setUserid] = useState<string | null>(null);
    const[countleads, setcountleads]= useState<number>(0);
    const[countcustomer, setcountCustomer]= useState<number>(0);
    const[totalemailsent, settotalemailsent]= useState<number>(0);
    const[totalreplies, settotalreplies]= useState<number>(0);
    const [monthlyleads, setmonthlyleads] = useState<{ month: string; leads: number }[]>([]);
    const [emailanalytics, setemailanalytics] = useState<{ label: string; sent: number; replies: number; ignored: number }[]>([]);
    const [leadsdata, setleaddata]= useState<any[]>([]);
    const [customername, setcustomername]= useState<string>("");


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

    const fetchCountLeads= async () =>{
        try{
            const response= await axios.get(`${baseurl}/get-total-counts-lead/${userid}`);
            setcountleads(response.data.data);
            console.log("Total Leads Count:", response.data);
        }catch(err){
            console.error(err);
        }
    }

    useEffect(() =>{
        if(!userid){
            return;
        }fetchCountLeads();
    }, [userid]);

    const fetchcountcustomer = async () =>{
        try{
            const response= await axios.get(`${baseurl}/get-total-counts-customer/${userid}`);
            setcountCustomer(response.data.data);
        }catch(err){
            console.error(err);
        }

    }
    useEffect(() => {
        if(!userid){
            return;
        }
        fetchcountcustomer();
    }, [userid]);


    const fetchtotalemailsent = async() =>{
        try{
            const res = await axios.get(`${baseurl}/get-total-email-sent/${userid}`);
            console.log("Total Emails Sent:", res.data.data);
            settotalemailsent(res.data.data);
        }catch(err){
            console.error(err);
        }
    }

    useEffect(()=>{
        if(!userid){
            return;
        }
        fetchtotalemailsent();
    }, [userid]);

    const fetchTotal_count_replies = async() =>{
        try{
            const response = await axios.get(`${baseurl}/get-total-count-replies/${userid}`);
            settotalreplies(response.data.data);
        }catch(err){
            console.error(err);
        }
    }
    useEffect(()=>{
        if(!userid)
        {
            return;
        }
        fetchTotal_count_replies();
    },[userid]);

     const fetchMonthlyLeads = async() =>{
        try{
            const response = await axios.get(`${baseurl}/get-monthly-leads/${userid}`);
            setmonthlyleads(response.data.data);
            console.log("Monthly Leads:", response.data.data);
        }catch(err){
            console.error(err);
        }
    }
    useEffect(()=>{
        if(!userid){
            return;
        }
        fetchMonthlyLeads();
    }, [userid]);

    const fetcemailAnalytics = async() =>{
        try{
            const response = await axios.get(`${baseurl}/get-email-analytics/${userid}`);
            setemailanalytics(response.data.data);
            console.log("Email Analytics:", response.data.data);
        }catch(err){
            console.error(err);
        }
    }

    useEffect(()=>{
        if(!userid){
            return;
        }
        fetcemailAnalytics();
    },[userid]);

    const fetcleadname_status = async () => {
    try {
        const response = await axios.get(
            `${baseurl}/get-customer-leadname-status/${userid}`
        );

        const leads = response.data.data;

        const updatedLeads = await Promise.all(
            leads.map(async (lead: any) => {
                const customer = await axios.get(
                    `${baseurl}/get-customer-name/${lead.customerid}`
                );
                console.log("Customer Name:", customer.data.name);

                return {
                    ...lead,
                    customer_name: customer.data.name,
                };
            })
        );

        setleaddata(updatedLeads);
       

        console.log("Leads with Customer Names:", leadsdata);

    } catch (err) {
        console.error(err);
    }
};

    useEffect(()=>{
        console.log("leads:", leadsdata);
        if(!userid)
        {

            return;
        }
        
        fetcleadname_status();
    }, [userid]);

useEffect(() => {
    console.log("Updated leads:", leadsdata);
}, [leadsdata]);
    





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
        />
        </div>
    );
}