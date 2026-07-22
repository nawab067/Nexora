'use client';

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import RemindersView from "@/components/remindersview";
import { EmailReply } from "@/components/remindersview";

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

// Fast polling right after a manual sync, so we catch the backend's async
// IMAP fetch as soon as it actually lands, instead of guessing how long
// it takes and giving up too early.
const SYNC_POLL_INTERVAL_MS = 2000;

// Safety cap: if new replies genuinely haven't shown up after this long,
// stop the "Syncing..." spinner. This does NOT mean we stop looking —
// the background poll below keeps checking after this, so a slow IMAP
// fetch still surfaces its result on its own, without another click.
const SYNC_POLL_MAX_MS = 60000;

// Background poll so replies fetched by e.g. a scheduled sync, or a sync
// that took longer than SYNC_POLL_MAX_MS, also show up automatically.
const BACKGROUND_POLL_INTERVAL_MS = 15000;

function getToken() {
    return sessionStorage.getItem("token") ?? localStorage.getItem("token");
}

export default function RemindersPage() {
    const [loading, setLoading] = useState(true);
    const [userid, setuserid] = useState<string | null>(null);
    const [reminders, setReminders] = useState<EmailReply[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    const syncPollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const backgroundPollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Keep a live ref of the current reminders so poll callbacks (created
    // inside setInterval closures) can always compare against the latest
    // state instead of a stale snapshot.
    const remindersRef = useRef<EmailReply[]>([]);
    useEffect(() => {
        remindersRef.current = reminders;
    }, [reminders]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getToken();
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

    /**
     * Fetches the latest reminders and updates state.
     * If `previousIds` is provided, returns true when the freshly-fetched
     * data contains at least one id that wasn't in `previousIds` — i.e.
     * a genuinely new reply arrived, as opposed to "the fetch ran again
     * but got the same data back".
     */
    const fetchReminders = async (
        userId: string,
        previousIds?: Set<string>
    ): Promise<boolean> => {
        try {
            const response = await axios.get(`${baseurl}/user/${userId}`);
            const data: EmailReply[] = response.data.data;
            setReminders(data);
            if (previousIds) {
                return data.some((r) => !previousIds.has(r._id));
            }
            return false;
        } catch (error) {
            console.error("Error fetching reminders:", error);
            return false;
        }
    };

    const stopSyncPoll = () => {
        if (syncPollTimer.current) {
            clearInterval(syncPollTimer.current);
            syncPollTimer.current = null;
        }
        setSyncing(false);
    };

    const syncReminders = async () => {
        if (!userid) return;

        try {
            setSyncing(true);
            setSyncError(null);

            // Snapshot what we have *before* this sync, so we can tell the
            // exact moment new replies show up, rather than guessing how
            // long the backend's IMAP fetch will take.
            const preSyncIds = new Set(remindersRef.current.map((r) => r._id));

            const token = getToken();

            await axios.post(
                `${baseurl}/sync/${userid}`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            // First fetch right away in case the sync was already synchronous.
            const foundImmediately = await fetchReminders(userid, preSyncIds);
            if (foundImmediately) {
                stopSyncPoll();
                return;
            }

            // Otherwise the backend is still fetching from IMAP in the
            // background. Keep polling until new replies actually appear —
            // don't stop on a fixed timer that can fire before the mailbox
            // fetch is done (that's what was causing replies to only show
            // up after a second manual sync).
            if (syncPollTimer.current) clearInterval(syncPollTimer.current);
            const startedAt = Date.now();
            syncPollTimer.current = setInterval(async () => {
                if (Date.now() - startedAt > SYNC_POLL_MAX_MS) {
                    // Stop showing "Syncing..." after this long, but the
                    // background poll (set up below) keeps checking, so
                    // a slow reply still appears on its own shortly after.
                    stopSyncPoll();
                    return;
                }
                const found = await fetchReminders(userid, preSyncIds);
                if (found) stopSyncPoll();
            }, SYNC_POLL_INTERVAL_MS);
        } catch (error: any) {
            console.error(error);
            setSyncError(error?.response?.data?.message || "Failed to sync reminders");
            setSyncing(false);
        }
    };

    // Initial load + kick off first sync once we know who the user is.
    useEffect(() => {
        if (!userid) return;

        setLoading(true);
        fetchReminders(userid).finally(() => setLoading(false));
        syncReminders();

        // Background poll so replies fetched by e.g. a scheduled sync (or
        // one that finished after we stopped actively polling) also show
        // up automatically, without the user having to click Sync again.
        backgroundPollTimer.current = setInterval(() => {
            fetchReminders(userid);
        }, BACKGROUND_POLL_INTERVAL_MS);

        return () => {
            if (syncPollTimer.current) clearInterval(syncPollTimer.current);
            if (backgroundPollTimer.current) clearInterval(backgroundPollTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userid]);

    const handleReplyClick = async (reply: EmailReply) => {
        if (reply.is_read) return;

        try {
            await axios.patch(`${baseurl}/read/${reply._id}`);
            setReminders((prev) =>
                prev.map((r) => (r._id === reply._id ? { ...r, is_read: true } : r))
            );
        } catch (err) {
            console.error(err);
        }
    };

    // Update local state directly instead of reloading the whole page.
    const handleDeleted = (id: string) => {
        setReminders((prev) => prev.filter((r) => r._id !== id));
    };

    const handleBulkDeleted = (ids: string[]) => {
        const idSet = new Set(ids);
        setReminders((prev) => prev.filter((r) => !idSet.has(r._id)));
    };

    return (
        <div className="p-4">
            <RemindersView
                reminders={reminders}
                loading={loading || syncing}
                onSync={syncReminders}
                onReplyClick={handleReplyClick}
                onDeleted={handleDeleted}
                onBulkDeleted={handleBulkDeleted}
            />

            {syncError && <p className="text-xs text-rose-500 mt-2">{syncError}</p>}
        </div>
    );
}