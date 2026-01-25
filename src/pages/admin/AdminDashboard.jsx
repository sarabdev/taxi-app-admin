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
            <div className="card">
                <p className="text-gray-500">Loading dashboard…</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="card">
                <p className="text-red-600">Failed to load dashboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
                <p className="text-gray-600">
                    Overview of bookings, earnings, and system status.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className={`rounded-lg border p-5 bg-white shadow-sm
        ${highlight ? "border-green-300 bg-green-50" : ""}
        ${warning ? "border-yellow-300 bg-yellow-50" : ""}
      `}
        >
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p
                className={`text-2xl font-bold
          ${highlight ? "text-green-700" : ""}
          ${warning ? "text-yellow-700" : ""}
        `}
            >
                {value}
            </p>
        </div>
    );
}
