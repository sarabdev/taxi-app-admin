import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDriverLedger } from "../../api/walletAdmin";

export default function DriverLedger() {
    const { driverId } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDriverLedger(driverId).then(setData);
    }, [driverId]);

    if (!data) {
        return (
            <div className="w-full">
                <div className="card">
                    <p className="text-sm text-gray-500 sm:text-base">
                        Loading ledger...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Back */}
            <div>
                <button
                    onClick={() => nav(-1)}
                    className="inline-flex items-center text-sm font-medium text-primary-600 underline-offset-4 hover:underline"
                >
                    ← Back
                </button>
            </div>

            {/* Ledger Summary */}
            <div className="card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                            Driver Ledger
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View driver balance and transaction history.
                        </p>
                    </div>

                    <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 sm:min-w-[220px] sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                            Balance
                        </p>

                        <p className="mt-1 break-words text-2xl font-bold text-primary-900 sm:text-3xl">
                            £{Number(data.balance || 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Transactions
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Review credit and debit entries for this driver.
                    </p>
                </div>

                {/* Desktop / Tablet Table */}
                <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                    <table className="w-full min-w-[850px] text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Ref</th>
                                <th className="px-4 py-3">Note</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {data.transactions.map((t) => (
                                <tr
                                    key={t._id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 align-top">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${t.type === "CREDIT"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {t.type}
                                        </span>
                                    </td>

                                    <td
                                        className={`whitespace-nowrap px-4 py-3 align-top font-semibold ${t.type === "CREDIT"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {t.type === "CREDIT" ? "+" : "-"}£
                                        {Number(t.amount || 0).toFixed(2)}
                                    </td>

                                    <td className="px-4 py-3 align-top text-gray-700">
                                        {t.referenceType || "—"}
                                    </td>

                                    <td className="px-4 py-3 align-top text-gray-700">
                                        <div className="max-w-[300px] break-words">
                                            {t.note || "—"}
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                        {new Date(t.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {data.transactions.length === 0 && (
                                <tr>
                                    <td
                                        className="px-4 py-8 text-center text-sm text-gray-500"
                                        colSpan={5}
                                    >
                                        No transactions yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {data.transactions.map((t) => (
                        <div
                            key={t._id}
                            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${t.type === "CREDIT"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {t.type}
                                </span>

                                <span
                                    className={`shrink-0 text-right text-base font-bold ${t.type === "CREDIT"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {t.type === "CREDIT" ? "+" : "-"}£
                                    {Number(t.amount || 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <MobileInfoRow
                                    label="Reference"
                                    value={t.referenceType || "—"}
                                />

                                <MobileInfoRow
                                    label="Note"
                                    value={t.note || "—"}
                                />

                                <MobileInfoRow
                                    label="Date"
                                    value={new Date(t.createdAt).toLocaleString()}
                                />
                            </div>
                        </div>
                    ))}

                    {data.transactions.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                            No transactions yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MobileInfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-gray-500">{label}</span>

            <span className="break-words text-right text-sm font-medium text-gray-800">
                {value}
            </span>
        </div>
    );
}