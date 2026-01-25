import { useEffect, useState } from "react";
import { createCar, deleteCar, fetchCars, updateCar } from "../../api/cars";

const emptyCar = {
    name: "",
    type: "sedan",
    image: "",
    capacity: { passengers: null, luggage: null },
    pricePerMile: null,
    basePrice: null,
    features: [],
    description: "",
    discounts: [],
};

function normalizeNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

export default function Cars() {
    const [cars, setCars] = useState([]);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("create"); // create | edit
    const [form, setForm] = useState(emptyCar);
    const [featureInput, setFeatureInput] = useState("");
    const [error, setError] = useState("");

    async function load() {
        const data = await fetchCars();
        setCars(data);
    }

    useEffect(() => {
        load();
    }, []);

    const onCreate = () => {
        setMode("create");
        setForm(emptyCar);
        setError("");
        setOpen(true);
    };

    const onEdit = (car) => {
        setMode("edit");
        setForm({
            ...car,
            capacity: car.capacity || { passengers: 4, luggage: 2 },
            features: car.features || [],
            discounts: car.discounts || [],
        });
        setError("");
        setOpen(true);
    };

    const addFeature = () => {
        const f = featureInput.trim();
        if (!f) return;
        setForm((p) => ({ ...p, features: [...(p.features || []), f] }));
        setFeatureInput("");
    };

    const removeFeature = (idx) => {
        setForm((p) => ({
            ...p,
            features: p.features.filter((_, i) => i !== idx),
        }));
    };

    // Discounts: Only manage RETURN_TRIP discount (best practice v1)
    const setReturnTripDiscount = (patch) => {
        setForm((p) => {
            const existing = (p.discounts || []).find((d) => d.condition === "RETURN_TRIP");
            const rest = (p.discounts || []).filter((d) => d.condition !== "RETURN_TRIP");

            const next = {
                type: existing?.type || "PERCENTAGE",
                value: existing?.value ?? 10,
                condition: "RETURN_TRIP",
                isActive: existing?.isActive ?? true,
                ...patch,
            };

            return { ...p, discounts: [...rest, next] };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const payload = {
                ...form,
                basePrice: normalizeNumber(form.basePrice),
                pricePerMile: normalizeNumber(form.pricePerMile),
                capacity: {
                    passengers: normalizeNumber(form.capacity?.passengers, 0),
                    luggage: normalizeNumber(form.capacity?.luggage, 0),
                },
            };

            if (mode === "create") await createCar(payload);
            else await updateCar(form._id, payload);

            setOpen(false);
            await load();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this car?")) return;
        await deleteCar(id);
        await load();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cars</h1>
                <button className="btn-primary" onClick={onCreate}>
                    Add Car
                </button>
            </div>

            <div className="card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="py-2">Name</th>
                            <th>Type</th>
                            <th>Base</th>
                            <th>Per Mile</th>
                            <th>Return Discount</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((c) => {
                            const rd = (c.discounts || []).find((d) => d.condition === "RETURN_TRIP" && d.isActive);
                            const rdLabel = rd
                                ? rd.type === "PERCENTAGE"
                                    ? `${rd.value}%`
                                    : `$${rd.value}`
                                : "—";

                            return (
                                <tr key={c._id} className="border-b last:border-0">
                                    <td className="py-2">{c.name}</td>
                                    <td>{c.type}</td>
                                    <td>${Number(c.basePrice || 0).toFixed(2)}</td>
                                    <td>${Number(c.pricePerMile || 0).toFixed(2)}</td>
                                    <td>{rdLabel}</td>
                                    <td className="text-right space-x-3">
                                        <button className="text-primary-600 underline" onClick={() => onEdit(c)}>
                                            Edit
                                        </button>
                                        <button className="text-red-600 underline" onClick={() => handleDelete(c._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {cars.length === 0 && (
                            <tr>
                                <td className="py-6 text-gray-500" colSpan={6}>
                                    No cars yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                {mode === "create" ? "Create Car" : "Edit Car"}
                            </h2>
                            <button className="text-gray-500" onClick={() => setOpen(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">

                            {error && (
                                <div className="mb-4 text-red-600 bg-red-50 p-2 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="input-field"
                                        placeholder="Car Name"
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        required
                                    />

                                    <select
                                        className="input-field"
                                        value={form.type}
                                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                                    >
                                        <option value="sedan">sedan</option>
                                        <option value="executive">executive</option>
                                        <option value="suv">suv</option>
                                        <option value="luxury">luxury</option>
                                        <option value="van">van</option>
                                    </select>

                                    {/* <input
                                    className="input-field md:col-span-2"
                                    placeholder="Image URL"
                                    value={form.image || ""}
                                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                                /> */}

                                    <input
                                        className="input-field"
                                        type="number"
                                        step="0.01"
                                        placeholder="Base Price"
                                        value={form.basePrice}
                                        onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                                        required
                                    />

                                    <input
                                        className="input-field"
                                        type="number"
                                        step="0.01"
                                        placeholder="Price Per Mile"
                                        value={form.pricePerMile}
                                        onChange={(e) => setForm((p) => ({ ...p, pricePerMile: e.target.value }))}
                                        required
                                    />

                                    <input
                                        className="input-field"
                                        type="number"
                                        placeholder="Passengers"
                                        value={form.capacity?.passengers ?? 0}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                capacity: { ...(p.capacity || {}), passengers: e.target.value },
                                            }))
                                        }
                                    />

                                    <input
                                        className="input-field"
                                        type="number"
                                        placeholder="Luggage"
                                        value={form.capacity?.luggage ?? 0}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                capacity: { ...(p.capacity || {}), luggage: e.target.value },
                                            }))
                                        }
                                    />
                                </div>

                                <textarea
                                    className="input-field min-h-[100px]"
                                    placeholder="Description"
                                    value={form.description || ""}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                />

                                {/* Features */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">Features</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            className="input-field"
                                            placeholder="Add feature (e.g. GPS)"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                        />
                                        <button type="button" className="btn-secondary" onClick={addFeature}>
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(form.features || []).map((f, idx) => (
                                            <span key={`${f}-${idx}`} className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                                                {f}{" "}
                                                <button
                                                    type="button"
                                                    className="text-gray-500 ml-2"
                                                    onClick={() => removeFeature(idx)}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Return trip discount */}
                                <div className="border rounded-xl p-4">
                                    <div className="font-semibold mb-3">Return Trip Discount</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <select
                                            className="input-field"
                                            value={
                                                (form.discounts || []).find((d) => d.condition === "RETURN_TRIP")?.type ||
                                                "PERCENTAGE"
                                            }
                                            onChange={(e) => setReturnTripDiscount({ type: e.target.value })}
                                        >
                                            <option value="PERCENTAGE">Percentage</option>
                                            <option value="FIXED">Fixed</option>
                                        </select>

                                        <input
                                            className="input-field"
                                            type="number"
                                            step="0.01"
                                            value={
                                                (form.discounts || []).find((d) => d.condition === "RETURN_TRIP")?.value ?? 10
                                            }
                                            onChange={(e) => setReturnTripDiscount({ value: Number(e.target.value) })}
                                            placeholder="Value"
                                        />

                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    (form.discounts || []).find((d) => d.condition === "RETURN_TRIP")?.isActive ??
                                                    true
                                                }
                                                onChange={(e) => setReturnTripDiscount({ isActive: e.target.checked })}
                                            />
                                            Active
                                        </label>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-3">
                                        This discount applies when the customer books a return trip.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn-primary" type="submit">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
