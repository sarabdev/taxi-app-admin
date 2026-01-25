import { useEffect, useState } from "react";
import { createCoupon, deleteCoupon, fetchCoupons, toggleCoupon } from "../../api/coupons";

const empty = {
    code: "",
    type: "PERCENTAGE",
    value: 10,
    minAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
};

export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState("");

    async function load() {
        const data = await fetchCoupons();
        setCoupons(data);
    }

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const payload = {
                ...form,
                code: form.code.toUpperCase().trim(),
                value: Number(form.value),
                minAmount: Number(form.minAmount || 0),
                maxDiscount: form.maxDiscount === "" ? undefined : Number(form.maxDiscount),
                usageLimit: form.usageLimit === "" ? undefined : Number(form.usageLimit),
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
            };

            await createCoupon(payload);
            setForm(empty);
            await load();
        } catch (e) {
            setError(e.message);
        }
    };

    const onToggle = async (id) => {
        await toggleCoupon(id);
        await load();
    };

    const onDelete = async (id) => {
        if (!confirm("Delete this coupon?")) return;
        await deleteCoupon(id);
        await load();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Coupons</h1>

            <div className="card">
                <h2 className="font-semibold mb-4">Create Coupon</h2>

                {error && (
                    <div className="mb-4 text-red-600 bg-red-50 p-2 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        className="input-field"
                        placeholder="CODE (e.g. SAVE10)"
                        value={form.code}
                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                        required
                    />

                    <select
                        className="input-field"
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    >
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FIXED">Fixed</option>
                    </select>

                    <input
                        className="input-field"
                        type="number"
                        step="0.01"
                        placeholder="Value"
                        value={form.value}
                        onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                        required
                    />

                    <input
                        className="input-field"
                        type="number"
                        step="0.01"
                        placeholder="Min Amount (optional)"
                        value={form.minAmount}
                        onChange={(e) => setForm((p) => ({ ...p, minAmount: e.target.value }))}
                    />

                    <input
                        className="input-field"
                        type="number"
                        step="0.01"
                        placeholder="Max Discount cap (optional)"
                        value={form.maxDiscount}
                        onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                    />

                    <input
                        className="input-field"
                        type="number"
                        placeholder="Usage Limit (optional)"
                        value={form.usageLimit}
                        onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                    />

                    <input
                        className="input-field md:col-span-2"
                        type="date"
                        value={form.expiresAt}
                        onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                    />

                    <button className="btn-primary" type="submit">
                        Create
                    </button>
                </form>
            </div>

            <div className="card">
                <h2 className="font-semibold mb-4">All Coupons</h2>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Code</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Active</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((c) => (
                            <tr key={c._id} className="border-b last:border-0">
                                <td className="py-2 font-semibold">{c.code}</td>
                                <td>{c.type}</td>
                                <td>{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}</td>
                                <td>{c.minAmount ?? "—"}</td>
                                <td>{c.maxDiscount ?? "—"}</td>
                                <td>{c.isActive ? "Yes" : "No"}</td>
                                <td className="text-right space-x-3">
                                    <button className="text-primary-600 underline" onClick={() => onToggle(c._id)}>
                                        {c.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <button className="text-red-600 underline" onClick={() => onDelete(c._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td className="py-6 text-gray-500" colSpan={7}>
                                    No coupons yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
