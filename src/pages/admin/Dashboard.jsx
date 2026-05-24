import { useEffect, useState } from "react";
import { fetchDashboard } from "../../api/dashboard";

function Stat({ label, value, highlight, warning }) {
    return (
        <div
            className={`min-w-0 rounded-xl border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 lg:p-6
                ${highlight ? "border-green-300 bg-green-50" : "border-gray-100"}
                ${warning ? "border-yellow-300 bg-yellow-50" : ""}
            `}
        >
            <div className="truncate text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm">
                {label}
            </div>

            <div
                className={`mt-2 break-words text-xl font-bold leading-tight sm:text-2xl lg:text-3xl
                    ${highlight ? "text-green-700" : "text-gray-900"}
                    ${warning ? "text-yellow-700" : ""}
                `}
            >
                {value}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDashboard().then(setData);
    }, []);

    if (!data) {
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

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="card">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-gray-500 sm:text-base">
                    Overview of bookings, revenue, driver earnings, and pending payouts.
                </p>
            </div>

            {/* Booking Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Stat
                    label="Bookings Today"
                    value={data.bookingsToday}
                />

                <Stat
                    label="Pending Bookings"
                    value={data.pendingBookings}
                    warning
                />

                <Stat
                    label="Completed Bookings"
                    value={data.completedBookings}
                    highlight
                />
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Stat
                    label="Total Revenue"
                    value={`£${Number(data.totalRevenue || 0).toFixed(2)}`}
                    highlight
                />

                <Stat
                    label="Driver Earnings (80%)"
                    value={`£${Number(data.totalDriverEarnings || 0).toFixed(2)}`}
                />

                <Stat
                    label="Pending Payouts"
                    value={`£${Number(data.pendingPayouts || 0).toFixed(2)}`}
                    warning
                />
            </div>
        </div>
    );
}