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
                        Failed to load dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="card">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    Driver Dashboard
                </h1>

                <p className="mt-1 text-sm leading-relaxed text-gray-600 sm:text-base">
                    Your bookings, earnings, and wallet overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Assigned Bookings"
                    value={stats.assignedBookings}
                />

                <StatCard
                    label="Completed Bookings"
                    value={stats.completedBookings}
                    highlight
                />

                <StatCard
                    label="Today’s Bookings"
                    value={stats.bookingsToday}
                />
            </div>

            {/* Wallet */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Wallet Summary
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Track your total earnings, paid amount, and available balance.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <WalletItem
                        label="Total Earned"
                        value={`£${Number(stats.totalEarned || 0).toFixed(2)}`}
                    />

                    <WalletItem
                        label="Total Paid"
                        value={`£${Number(stats.totalPaid || 0).toFixed(2)}`}
                    />

                    <WalletItem
                        label="Available Balance"
                        value={`£${Number(stats.balance || 0).toFixed(2)}`}
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

function StatCard({ label, value, highlight }) {
    return (
        <div
            className={`min-w-0 rounded-xl border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 lg:p-6 ${highlight
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100"
                }`}
        >
            <p className="mb-1 truncate text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm">
                {label}
            </p>

            <p
                className={`break-words text-2xl font-bold leading-tight sm:text-3xl ${highlight ? "text-green-700" : "text-gray-900"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

function WalletItem({ label, value, highlight }) {
    return (
        <div
            className={`min-w-0 rounded-xl border p-4 shadow-sm sm:p-5 ${highlight
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
        >
            <p className="mb-1 truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p
                className={`break-words text-xl font-bold leading-tight sm:text-2xl ${highlight ? "text-green-700" : "text-gray-900"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}