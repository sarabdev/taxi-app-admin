import { useEffect, useState } from "react";
import { fetchDashboard } from "../../api/dashboard";

function Stat({ label, value }) {
    return (
        <div className="card">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDashboard().then(setData);
    }, []);

    if (!data) return <div>Loading dashboard…</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Stat label="Bookings Today" value={data.bookingsToday} />
                <Stat label="Pending Bookings" value={data.pendingBookings} />
                <Stat label="Completed Bookings" value={data.completedBookings} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Stat label="Total Revenue" value={`$${data.totalRevenue}`} />
                <Stat label="Driver Earnings (80%)" value={`$${data.totalDriverEarnings}`} />
                <Stat label="Pending Payouts" value={`$${data.pendingPayouts}`} />
            </div>
        </div>
    );
}
