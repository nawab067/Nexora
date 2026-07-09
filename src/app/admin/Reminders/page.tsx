'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import RemindersView from "@/components/remindersview";
import { EmailReply } from "@/components/remindersview";

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

export default function RemindersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userid, setuserid] = useState<string | null>(null);
    const [reminders, setReminders] = useState<any[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(`${baseurl}/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setuserid(res.data.id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const fetchReminders = async (userId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseurl}/user/${userId}`);
            setReminders(response.data.data);
            console.log("Fetched reminders:", response.data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        } finally {
            setLoading(false);
        }
    };

    const syncReminders = async () => {
        if (!userid) return;

        try {
            setSyncing(true);
            setSyncError(null);

            const token = localStorage.getItem("token");

            await axios.post(
                `${baseurl}/sync/${userid}`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                }
            );


            await fetchReminders(userid);

        } catch (error: any) {
            console.error(error);
            setSyncError(
                error?.response?.data?.message ||
                "Failed to sync reminders"
            );
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        if (!userid) return;

        syncReminders();
    }, [userid]);

const handleReplyClick = async (reply: EmailReply) => {
    setSelectedReply(reply);
    setOpen(true);

    if (!reply.is_read) {
        console.log("Reply:", reply);
        const url= await axios.patch(
            `${baseurl}/read/${reply._id}`
        );
        console.log("Reply ID:", reply._id);
        console.log("PATCH URL:", url);

        setReminders(prev =>
            prev.map(r =>
                r._id === reply._id
                    ? { ...r, is_read: true }
                    : r
            )
        );
    }
};


    return (
        <div className="p-4">
            <RemindersView
                reminders={reminders}
                loading={loading || syncing}
                onSync={syncReminders}
                onReplyClick={handleReplyClick}
            />

            {syncError && (
                <p className="text-xs text-rose-500 mt-2">{syncError}</p>
            )}
        </div>
    );
}