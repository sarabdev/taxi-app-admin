import { useEffect, useState } from "react";
import { fetchDashboard } from "../../api/dashboard";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchDashboard();
                setStats(data);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <div className="w-full">
                <div className="card">
                    <p className="text-sm text-gray-500 sm:text-base">
                        Loading dashboard…
                    </p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="w-full">
                <div className="card">
                    <p className="text-sm font-medium text-red-600 sm:text-base">
                        Failed to load dashboard
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="card">
                <div className="flex flex-col gap-1 sm:gap-2">
                    <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                        Admin Dashboard
                    </h1>

                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                        Overview of bookings, earnings, and system status.
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
                <StatBox
                    title="Bookings Today"
                    value={stats.bookingsToday}
                />

                <StatBox
                    title="Completed Bookings"
                    value={stats.completedBookings}
                />

                <StatBox
                    title="Pending Bookings"
                    value={stats.pendingBookings}
                />

                <StatBox
                    title="Total Revenue"
                    value={`£${stats.totalRevenue.toFixed(2)}`}
                    highlight
                />

                <StatBox
                    title="Driver Earnings"
                    value={`£${stats.totalDriverEarnings.toFixed(2)}`}
                />

                <StatBox
                    title="Admin Earnings"
                    value={`£${stats.adminEarnings.toFixed(2)}`}
                    highlight
                />

                <StatBox
                    title="Pending Payouts"
                    value={`£${stats.pendingPayouts.toFixed(2)}`}
                    warning
                />
            </div>
        </div>
    );
}

/* ─────────────────────────────
 * Small reusable stat card
 * ───────────────────────────── */
function StatBox({ title, value, highlight, warning }) {
    return (
        <div
            className={`min-w-0 rounded-xl border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 lg:p-6
                ${highlight ? "border-green-300 bg-green-50" : "border-gray-100"}
                ${warning ? "border-yellow-300 bg-yellow-50" : ""}
            `}
        >
            <p className="mb-1 truncate text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm">
                {title}
            </p>

            <p
                className={`break-words text-xl font-bold leading-tight sm:text-2xl lg:text-3xl
                    ${highlight ? "text-green-700" : "text-gray-900"}
                    ${warning ? "text-yellow-700" : ""}
                `}
            >
                {value}
            </p>
        </div>
    );
}