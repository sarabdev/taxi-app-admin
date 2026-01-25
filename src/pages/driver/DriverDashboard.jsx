import { useEffect, useState } from "react";
import { fetchDriverDashboard } from "../../api/dashboard";

export default function DriverDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchDriverDashboard();
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
                <p className="text-red-600">Failed to load dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-1">Driver Dashboard</h1>
                <p className="text-gray-600">
                    Your bookings, earnings, and wallet overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    label="Assigned Bookings"
                    value={stats.assignedBookings}
                />
                <StatCard
                    label="Completed Bookings"
                    value={stats.completedBookings}
                />
                <StatCard
                    label="Today’s Bookings"
                    value={stats.bookingsToday}
                />
            </div>

            {/* Wallet */}
            <div className="card">
                <h2 className="font-semibold mb-4">Wallet Summary</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <WalletItem
                        label="Total Earned"
                        value={`£${stats.totalEarned.toFixed(2)}`}
                    />
                    <WalletItem
                        label="Total Paid"
                        value={`£${stats.totalPaid.toFixed(2)}`}
                    />
                    <WalletItem
                        label="Available Balance"
                        value={`£${stats.balance.toFixed(2)}`}
                        highlight
                    />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────
 * Small UI helpers
 * ───────────────────────────── */

function StatCard({ label, value }) {
    return (
        <div className="card">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function WalletItem({ label, value, highlight }) {
    return (
        <div
            className={`rounded-lg p-4 border ${highlight
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200"
                }`}
        >
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    );
}
