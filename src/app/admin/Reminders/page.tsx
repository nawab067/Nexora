'use client';

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import RemindersView from "@/components/remindersview";
import { EmailReply } from "@/components/remindersview";

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

function getToken() {
    return (
        sessionStorage.getItem("token") ??
        localStorage.getItem("token")
    );
}

const SYNC_POLL_INTERVAL = 2000;
const SYNC_POLL_DURATION = 30000;

export default function RemindersPage() {

    const [loading, setLoading] = useState(true);
    const [userid, setUserid] = useState<string | null>(null);
    const [reminders, setReminders] = useState<EmailReply[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    const remindersRef = useRef<EmailReply[]>([]);

    useEffect(() => {
        remindersRef.current = reminders;
    }, [reminders]);


    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const token = getToken();

                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${baseurl}/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUserid(response.data.id);

            } catch (error) {

                console.error(
                    "Error fetching user:",
                    error
                );

                setLoading(false);
            }
        };

        fetchUser();

    }, []);


    // ==========================================
    // FETCH REMINDERS
    // ==========================================

    const fetchReminders = async (
        userId: string
    ): Promise<EmailReply[]> => {

        try {

            const response = await axios.get(
                `${baseurl}/user/${userId}`
            );

            const data: EmailReply[] =
                response.data?.data ?? [];

            setReminders(data);

            return data;

        } catch (error) {

            console.error(
                "Error fetching reminders:",
                error
            );

            return [];

        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!userid) {
            return;
        }

        setLoading(true);

        fetchReminders(userid)
            .finally(() => {
                setLoading(false);
            });

    }, [userid]);


    // ==========================================
    // SYNC EMAILS
    // ==========================================

    const syncReminders = async () => {

        if (!userid || syncing) {
            return;
        }

        try {

            setSyncing(true);
            setSyncError(null);

            // ----------------------------------
            // SAVE CURRENT REPLY IDS
            // ----------------------------------

            const previousIds = new Set(
                remindersRef.current.map(
                    (reply) => reply._id
                )
            );

            const token = getToken();

            // ----------------------------------
            // START BACKEND SYNC
            // ----------------------------------

            await axios.post(
                `${baseurl}/sync/${userid}`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );


            const startTime = Date.now();

            
            const poll = async () => {

    await new Promise((resolve) =>
        setTimeout(resolve, SYNC_POLL_INTERVAL)
    );

    const data = await fetchReminders(userid);

    const newReplyFound = data.some(
        (reply) => !previousIds.has(reply._id)
    );

    if (newReplyFound) {
        console.log("New customer reply found!");
        setSyncing(false);
        return;
    }

    if (
        Date.now() - startTime >=
        SYNC_POLL_DURATION
    ) {
        console.log("Sync polling finished.");
        setSyncing(false);
        return;
    }

    setTimeout(poll, SYNC_POLL_INTERVAL);
};

            await poll();

        } catch (error: any) {

            console.error(
                "Sync error:",
                error
            );

            setSyncError(
                error?.response?.data?.message ??
                "Failed to sync emails"
            );

            setSyncing(false);
        }
    };



    const handleReplyClick = async (
        reply: EmailReply
    ) => {

        if (reply.is_read) {
            return;
        }

        try {

            await axios.patch(
                `${baseurl}/read/${reply._id}`
            );

            setReminders((prev) =>
                prev.map((r) =>
                    r._id === reply._id
                        ? {
                            ...r,
                            is_read: true,
                        }
                        : r
                )
            );

        } catch (error) {

            console.error(
                "Error marking reply as read:",
                error
            );
        }
    };



    const handleDeleted = (
        id: string
    ) => {

        setReminders((prev) =>
            prev.filter(
                (r) => r._id !== id
            )
        );
    };




    const handleBulkDeleted = (
        ids: string[]
    ) => {

        const idSet = new Set(ids);

        setReminders((prev) =>
            prev.filter(
                (r) => !idSet.has(r._id)
            )
        );
    };



    return (

        <div className="p-4">

            <RemindersView
                reminders={reminders}
                loading={loading}
                syncing={syncing}
                onSync={syncReminders}
                onReplyClick={handleReplyClick}
                onDeleted={handleDeleted}
                onBulkDeleted={handleBulkDeleted}
            />

            {syncError && (
                <p className="mt-2 text-xs text-rose-500">
                    {syncError}
                </p>
            )}

        </div>
    );
}