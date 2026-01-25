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

    if (!data) return <div>Loading ledger...</div>;

    return (
        <div className="space-y-4">
            <button onClick={() => nav(-1)} className="text-primary-600 underline">
                ← Back
            </button>

            <div className="card">
                <h1 className="text-xl font-bold">Driver Ledger</h1>
                <p className="text-3xl font-semibold mt-2">
                    Balance: ${Number(data.balance).toFixed(2)}
                </p>
            </div>

            <div className="card">
                <h2 className="font-semibold mb-4">Transactions</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Type</th>
                            <th>Amount</th>
                            <th>Ref</th>
                            <th>Note</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.transactions.map((t) => (
                            <tr key={t._id} className="border-b last:border-0">
                                <td className="py-2">{t.type}</td>
                                <td className={t.type === "CREDIT" ? "text-green-600" : "text-red-600"}>
                                    {t.type === "CREDIT" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                                </td>
                                <td>{t.referenceType}</td>
                                <td>{t.note || "—"}</td>
                                <td>{new Date(t.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                        {data.transactions.length === 0 && (
                            <tr>
                                <td className="py-6 text-gray-500" colSpan={5}>
                                    No transactions yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
