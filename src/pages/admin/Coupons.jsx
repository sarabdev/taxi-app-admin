import { useEffect, useState } from "react";
import {
    createCoupon,
    deleteCoupon,
    fetchCoupons,
    toggleCoupon,
} from "../../api/coupons";

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

    useEffect(() => {
        load();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const payload = {
                ...form,
                code: form.code.toUpperCase().trim(),
                value: Number(form.value),
                minAmount: Number(form.minAmount || 0),
                maxDiscount:
                    form.maxDiscount === ""
                        ? undefined
                        : Number(form.maxDiscount),
                usageLimit:
                    form.usageLimit === ""
                        ? undefined
                        : Number(form.usageLimit),
                expiresAt: form.expiresAt
                    ? new Date(form.expiresAt).toISOString()
                    : undefined,
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
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    Coupons
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Create, manage, activate, and delete discount coupons.
                </p>
            </div>

            {/* Create Coupon */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Create Coupon
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Add coupon details such as discount type, limits, and expiry date.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <input
                        className="input-field"
                        placeholder="CODE (e.g. SAVE10)"
                        value={form.code}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, code: e.target.value }))
                        }
                        required
                    />

                    <select
                        className="input-field"
                        value={form.type}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, type: e.target.value }))
                        }
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
                        onChange={(e) =>
                            setForm((p) => ({ ...p, value: e.target.value }))
                        }
                        required
                    />

                    <input
                        className="input-field"
                        type="number"
                        step="0.01"
                        placeholder="Min Amount (optional)"
                        value={form.minAmount}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, minAmount: e.target.value }))
                        }
                    />

                    <input
                        className="input-field"
                        type="number"
                        step="0.01"
                        placeholder="Max Discount cap (optional)"
                        value={form.maxDiscount}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                maxDiscount: e.target.value,
                            }))
                        }
                    />

                    <input
                        className="input-field"
                        type="number"
                        placeholder="Usage Limit (optional)"
                        value={form.usageLimit}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                usageLimit: e.target.value,
                            }))
                        }
                    />

                    <input
                        className="input-field sm:col-span-2 xl:col-span-2"
                        type="date"
                        value={form.expiresAt}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                expiresAt: e.target.value,
                            }))
                        }
                    />

                    <button
                        className="btn-primary w-full xl:w-auto"
                        type="submit"
                    >
                        Create
                    </button>
                </form>
            </div>

            {/* All Coupons */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        All Coupons
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View coupon status, discount values, and available actions.
                    </p>
                </div>

                {/* Desktop / Tablet Table */}
                <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                    <table className="w-full min-w-[800px] text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Value</th>
                                <th className="px-4 py-3">Min</th>
                                <th className="px-4 py-3">Max</th>
                                <th className="px-4 py-3">Active</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {coupons.map((c) => (
                                <tr
                                    key={c._id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 align-top">
                                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold tracking-wide text-gray-800">
                                            {c.code}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 align-top text-gray-700">
                                        {c.type}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-gray-900">
                                        {c.type === "PERCENTAGE"
                                            ? `${c.value}%`
                                            : `£${c.value}`}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                        {c.minAmount ?? "—"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                        {c.maxDiscount ?? "—"}
                                    </td>

                                    <td className="px-4 py-3 align-top">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${c.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {c.isActive ? "Yes" : "No"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 align-top text-right">
                                        <div className="flex flex-wrap items-center justify-end gap-3">
                                            <button
                                                className="text-sm font-medium text-primary-600 underline-offset-4 hover:underline"
                                                onClick={() => onToggle(c._id)}
                                            >
                                                {c.isActive
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>

                                            <button
                                                className="text-sm font-medium text-red-600 underline-offset-4 hover:underline"
                                                onClick={() => onDelete(c._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {coupons.length === 0 && (
                                <tr>
                                    <td
                                        className="px-4 py-8 text-center text-sm text-gray-500"
                                        colSpan={7}
                                    >
                                        No coupons yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {coupons.map((c) => (
                        <div
                            key={c._id}
                            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold tracking-wide text-gray-800">
                                        {c.code}
                                    </span>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {c.type}
                                    </p>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${c.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {c.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <MobileInfoRow
                                    label="Value"
                                    value={
                                        c.type === "PERCENTAGE"
                                            ? `${c.value}%`
                                            : `£${c.value}`
                                    }
                                />

                                <MobileInfoRow
                                    label="Min Amount"
                                    value={c.minAmount ?? "—"}
                                />

                                <MobileInfoRow
                                    label="Max Discount"
                                    value={c.maxDiscount ?? "—"}
                                />
                            </div>

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                <button
                                    className="btn-secondary w-full sm:flex-1"
                                    onClick={() => onToggle(c._id)}
                                >
                                    {c.isActive ? "Deactivate" : "Activate"}
                                </button>

                                <button
                                    className="w-full rounded-lg border-2 border-red-500 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 sm:flex-1 sm:px-6 sm:py-3 sm:text-base"
                                    onClick={() => onDelete(c._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {coupons.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                            No coupons yet.
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