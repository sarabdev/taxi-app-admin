import { useEffect, useState } from "react";
import { fetchMyWallet } from "../../api/wallet";

export default function Wallet() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchMyWallet().then(setData);
    }, []);

    if (!data) return <div>Loading wallet...</div>;

    return (
        <div className="space-y-6">
            <div className="card">
                <h1 className="text-xl font-bold">Wallet Balance</h1>
                <p className="text-3xl font-semibold mt-2">
                    ${data.balance.toFixed(2)}
                </p>
            </div>

            <div className="card">
                <h2 className="font-semibold mb-4">Transactions</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Type</th>
                            <th>Amount</th>
                            <th>Note</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.transactions.map((t) => (
                            <tr key={t._id} className="border-b last:border-0">
                                <td className="py-2">{t.type}</td>
                                <td
                                    className={
                                        t.type === "CREDIT"
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {t.type === "CREDIT" ? "+" : "-"}${t.amount}
                                </td>
                                <td>{t.note}</td>
                                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
