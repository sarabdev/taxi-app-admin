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

    async function load() {
        setLoading(true);
        const [d, p] = await Promise.all([fetchDrivers(), fetchAdminPayouts()]);
        setDrivers(d);
        setPayouts(p);
        setLoading(false);
    }

    useEffect(() => {
        load().catch((e) => setError(e.message));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");

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
        }
    };

    return (
        <div className="space-y-6">
            <div className="card">
                <h1 className="text-xl font-bold mb-4">Payouts</h1>

                {error && (
                    <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    <button className="btn-primary" type="submit">
                        Create Payout
                    </button>

                    <input
                        className="input-field md:col-span-4"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </form>
            </div>

            <div className="card">
                <h2 className="font-semibold mb-4">Payout History</h2>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2">Driver</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Reference</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((p) => (
                                <tr key={p._id} className="border-b last:border-0">
                                    <td className="py-2">{p.driverId?.name || "—"}</td>
                                    <td>${Number(p.amount).toFixed(2)}</td>
                                    <td>{p.method}</td>
                                    <td>{p.reference || "—"}</td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
