import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWalletSummary } from "../../api/walletAdmin";

export default function Earnings() {
    const nav = useNavigate();

    const [drivers, setDrivers] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWalletSummary();

                // NEW SHAPE
                setDrivers(res.drivers || []);
                setAdmin(res.admin || null);
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
                        Loading earnings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    Earnings
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review platform revenue, driver payouts, and pending driver balances.
                </p>
            </div>

            {/* ================= ADMIN EARNINGS ================= */}
            {admin && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <EarningCard
                        label="Gross Revenue"
                        value={`£${Number(admin.grossRevenue || 0).toFixed(2)}`}
                    />

                    <EarningCard
                        label="Paid to Drivers"
                        value={`£${Number(admin.driverPaid || 0).toFixed(2)}`}
                        valueClassName="text-blue-600"
                    />

                    <EarningCard
                        label="Platform Earnings"
                        value={`£${Number(admin.platformEarning || 0).toFixed(2)}`}
                        highlight
                        valueClassName="text-green-700"
                    />
                </div>
            )}

            {/* ================= DRIVER EARNINGS ================= */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Driver Earnings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View each driver's earned amount, paid amount, and remaining balance.
                    </p>
                </div>

                {/* Desktop / Tablet Table */}
                <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                    <table className="w-full min-w-[850px] text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Driver</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Earned</th>
                                <th className="px-4 py-3">Paid</th>
                                <th className="px-4 py-3">Balance</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {drivers.map((r) => (
                                <tr
                                    key={r.driverId}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 align-top">
                                        <div className="max-w-[180px] break-words font-medium text-gray-900">
                                            {r.name}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 align-top">
                                        <div className="max-w-[240px] break-words text-gray-700">
                                            {r.email || "—"}
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-gray-900">
                                        £{Number(r.earned || 0).toFixed(2)}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                        £{Number(r.paid || 0).toFixed(2)}
                                    </td>

                                    <td
                                        className={`whitespace-nowrap px-4 py-3 align-top font-semibold ${r.balance > 0
                                                ? "text-green-600"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        £{Number(r.balance || 0).toFixed(2)}
                                    </td>

                                    <td className="px-4 py-3 align-top text-right">
                                        <button
                                            className="text-sm font-medium text-primary-600 underline-offset-4 hover:underline"
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
                                        className="px-4 py-8 text-center text-sm text-gray-500"
                                        colSpan={6}
                                    >
                                        No driver data yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {drivers.map((r) => (
                        <div
                            key={r.driverId}
                            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="break-words text-base font-semibold text-gray-900">
                                        {r.name}
                                    </h3>

                                    <p className="mt-1 break-words text-sm text-gray-500">
                                        {r.email || "—"}
                                    </p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p
                                        className={`text-base font-bold ${r.balance > 0
                                                ? "text-green-600"
                                                : "text-gray-700"
                                            }`}
                                    >
                                        £{Number(r.balance || 0).toFixed(2)}
                                    </p>

                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                        balance
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <MobileInfoRow
                                    label="Earned"
                                    value={`£${Number(r.earned || 0).toFixed(2)}`}
                                />

                                <MobileInfoRow
                                    label="Paid"
                                    value={`£${Number(r.paid || 0).toFixed(2)}`}
                                />

                                <MobileInfoRow
                                    label="Balance"
                                    value={`£${Number(r.balance || 0).toFixed(2)}`}
                                    valueClassName={
                                        r.balance > 0
                                            ? "text-green-600"
                                            : "text-gray-800"
                                    }
                                />
                            </div>

                            <button
                                className="btn-secondary mt-4 w-full"
                                onClick={() =>
                                    nav(`/admin/earnings/${r.driverId}`)
                                }
                            >
                                View Ledger
                            </button>
                        </div>
                    ))}

                    {drivers.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                            No driver data yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EarningCard({ label, value, highlight, valueClassName = "text-gray-900" }) {
    return (
        <div
            className={`rounded-xl border bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${highlight
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100 bg-gray-50"
                }`}
        >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p
                className={`break-words text-2xl font-bold leading-tight sm:text-3xl ${valueClassName}`}
            >
                {value}
            </p>
        </div>
    );
}

function MobileInfoRow({ label, value, valueClassName = "text-gray-800" }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-gray-500">{label}</span>

            <span
                className={`break-words text-right text-sm font-medium ${valueClassName}`}
            >
                {value}
            </span>
        </div>
    );
}