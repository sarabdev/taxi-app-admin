import { useEffect, useState } from "react";
import { fetchMyPayouts } from "../../api/payouts";

export default function DriverPayouts() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchMyPayouts().then(setData);
    }, []);

    if (!data) {
        return (
            <div className="w-full">
                <div className="card">
                    <p className="text-sm text-gray-500 sm:text-base">
                        Loading payouts...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="mb-4">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    My Payouts
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View your payout amount, payment method, reference, and date.
                </p>
            </div>

            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                <table className="w-full min-w-[650px] text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Date</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {data.payouts.map((p) => (
                            <tr
                                key={p._id}
                                className="transition-colors hover:bg-gray-50"
                            >
                                <td className="whitespace-nowrap px-4 py-3 align-top font-semibold text-green-600">
                                    £{Number(p.amount || 0).toFixed(2)}
                                </td>

                                <td className="px-4 py-3 align-top text-gray-700">
                                    {p.method || "—"}
                                </td>

                                <td className="px-4 py-3 align-top text-gray-700">
                                    <div className="max-w-[260px] break-words">
                                        {p.reference || "—"}
                                    </div>
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}

                        {data.payouts.length === 0 && (
                            <tr>
                                <td
                                    className="px-4 py-8 text-center text-sm text-gray-500"
                                    colSpan={4}
                                >
                                    No payouts yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
                {data.payouts.map((p) => (
                    <div
                        key={p._id}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Method
                                </p>

                                <h2 className="mt-1 break-words text-base font-semibold text-gray-900">
                                    {p.method || "—"}
                                </h2>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-base font-bold text-green-600">
                                    £{Number(p.amount || 0).toFixed(2)}
                                </p>

                                <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                    payout
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-gray-100 pt-3">
                            <MobileInfoRow
                                label="Reference"
                                value={p.reference || "—"}
                            />

                            <MobileInfoRow
                                label="Date"
                                value={new Date(p.createdAt).toLocaleDateString()}
                            />
                        </div>
                    </div>
                ))}

                {data.payouts.length === 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                        No payouts yet.
                    </div>
                )}
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