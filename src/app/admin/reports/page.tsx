'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ReportsPageproops from "@/components/reportsoverview";

export default function RemindersPage() {
    return (
        <div className="p-4">
            <ReportsPageproops />
        </div>
    );
}