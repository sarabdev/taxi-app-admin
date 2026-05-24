import { useEffect, useState } from "react";
import { fetchDrivers } from "../../api/drivers";
import { createPayout, fetchAdminPayouts } from "../../api/payouts";

export default function Payouts() {
    const [drivers, setDrivers] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [driverId, setDriverId] = useState("");
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    async function load() {
        setLoading(true);

        try {
            const [d, p] = await Promise.all([
                fetchDrivers(),
                fetchAdminPayouts(),
            ]);

            setDrivers(d);
            setPayouts(p);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load().catch((e) => {
            setError(e.message);
            setLoading(false);
        });
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setCreating(true);

        try {
            await createPayout({
                driverId,
                amount: Number(amount),
                method: "BANK",
                reference,
                note,
            });

            setAmount("");
            setReference("");
            setNote("");
            await load();
        } catch (e) {
            setError(e.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Create Payout */}
            <div className="card">
                <div className="mb-4">
                    <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                        Payouts
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Create driver payouts and review payout history.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleCreate}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <select
                        className="input-field"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        required
                    >
                        <option value="">Select Driver</option>

                        {drivers.map((d) => (
                            <option key={d._id} value={d._id}>
                                {d.name} ({d.phone || "no phone"})
                            </option>
                        ))}
                    </select>

                    <input
                        className="input-field"
                        placeholder="Amount"
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <input
                        className="input-field"
                        placeholder="Bank Ref (optional)"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                    />

                    <button
                        className="btn-primary w-full"
                        type="submit"
                        disabled={creating}
                    >
                        {creating ? "Creating..." : "Create Payout"}
                    </button>

                    <input
                        className="input-field sm:col-span-2 xl:col-span-4"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </form>
            </div>

            {/* Payout History */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Payout History
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View completed payout records with driver, amount, reference, and date.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Desktop / Tablet Table */}
                        <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                            <table className="w-full min-w-[750px] text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <th className="px-4 py-3">Driver</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Reference</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {payouts.map((p) => (
                                        <tr
                                            key={p._id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 align-top">
                                                <div className="max-w-[220px] break-words font-medium text-gray-900">
                                                    {p.driverId?.name || "—"}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 align-top font-semibold text-green-600">
                                                £{Number(p.amount || 0).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-3 align-top text-gray-700">
                                                {p.method || "—"}
                                            </td>

                                            <td className="px-4 py-3 align-top text-gray-700">
                                                <div className="max-w-[240px] break-words">
                                                    {p.reference || "—"}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}

                                    {payouts.length === 0 && (
                                        <tr>
                                            <td
                                                className="px-4 py-8 text-center text-sm text-gray-500"
                                                colSpan={5}
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
                            {payouts.map((p) => (
                                <div
                                    key={p._id}
                                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="break-words text-base font-semibold text-gray-900">
                                                {p.driverId?.name || "—"}
                                            </h3>

                                            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                                                {p.method || "—"}
                                            </p>
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
                                            value={new Date(
                                                p.createdAt
                                            ).toLocaleDateString()}
                                        />
                                    </div>
                                </div>
                            ))}

                            {payouts.length === 0 && (
                                <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                                    No payouts yet.
                                </div>
                            )}
                        </div>
                    </>
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