import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWalletSummary } from "../../api/walletAdmin";

export default function Earnings() {
    const nav = useNavigate();

    const [drivers, setDrivers] = useState([]);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        async function load() {
            const res = await fetchWalletSummary();

            // NEW SHAPE
            setDrivers(res.drivers || []);
            setAdmin(res.admin || null);
        }

        load();
    }, []);

    return (
        <div className="space-y-6">

            {/* ================= ADMIN EARNINGS ================= */}
            {admin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Gross Revenue</p>
                        <p className="text-2xl font-bold">
                            £{admin.grossRevenue.toFixed(2)}
                        </p>
                    </div>

                    <div className="card bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Paid to Drivers</p>
                        <p className="text-2xl font-bold text-blue-600">
                            £{admin.driverPaid.toFixed(2)}
                        </p>
                    </div>

                    <div className="card bg-green-50 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Platform Earnings</p>
                        <p className="text-2xl font-bold text-green-700">
                            £{admin.platformEarning.toFixed(2)}
                        </p>
                    </div>
                </div>
            )}

            {/* ================= DRIVER EARNINGS ================= */}
            <div className="card">
                <h1 className="text-xl font-bold mb-4">Driver Earnings</h1>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-gray-600">
                            <th className="py-2">Driver</th>
                            <th>Email</th>
                            <th>Earned</th>
                            <th>Paid</th>
                            <th>Balance</th>
                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {drivers.map((r) => (
                            <tr key={r.driverId} className="border-b last:border-0">
                                <td className="py-2 font-medium">{r.name}</td>
                                <td>{r.email || "—"}</td>
                                <td>£{r.earned.toFixed(2)}</td>
                                <td>£{r.paid.toFixed(2)}</td>
                                <td
                                    className={
                                        r.balance > 0
                                            ? "text-green-600 font-semibold"
                                            : "text-gray-600"
                                    }
                                >
                                    £{r.balance.toFixed(2)}
                                </td>
                                <td className="text-right">
                                    <button
                                        className="text-primary-600 underline"
                                        onClick={() =>
                                            nav(`/admin/earnings/${r.driverId}`)
                                        }
                                    >
                                        View Ledger
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {drivers.length === 0 && (
                            <tr>
                                <td
                                    className="py-6 text-gray-500 text-center"
                                    colSpan={6}
                                >
                                    No driver data yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
