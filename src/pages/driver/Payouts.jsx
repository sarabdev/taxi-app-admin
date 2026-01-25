import { useEffect, useState } from "react";
import { fetchMyPayouts } from "../../api/payouts";

export default function DriverPayouts() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchMyPayouts().then(setData);
    }, []);

    if (!data) return <div>Loading payouts...</div>;

    return (
        <div className="card">
            <h1 className="text-xl font-bold mb-4">My Payouts</h1>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b text-left">
                        <th className="py-2">Amount</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {data.payouts.map((p) => (
                        <tr key={p._id} className="border-b last:border-0">
                            <td className="py-2">${Number(p.amount).toFixed(2)}</td>
                            <td>{p.method}</td>
                            <td>{p.reference || "—"}</td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
