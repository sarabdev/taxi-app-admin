import { useEffect, useState } from "react";
import { createCar, deleteCar, fetchCars, updateCar } from "../../api/cars";

const emptyCar = {
    name: "",
    type: "salon_car",
    image: "",
    capacity: { passengers: null, luggage: null },
    basePrice: null,
    airportPricing: {},
    features: [],
    description: "",
    discounts: [
        {
            type: "PERCENTAGE",
            value: 10,
            condition: "RETURN_TRIP",
            isActive: true,
        },
    ],
};

const AIRPORTS = [
    { name: "Edinburgh Airport", code: "EDI" },
    { name: "Glasgow Airport", code: "GLA" },
];

const DEFAULT_PRICE_PER_MILE = 3;
const defaultBands = () => [
    { upToMiles: 10, pricePerMile: DEFAULT_PRICE_PER_MILE },
    { upToMiles: null, pricePerMile: DEFAULT_PRICE_PER_MILE },
];

function defaultAirportPricing() {
    return Object.fromEntries(
        AIRPORTS.map((airport) => [airport.code, { bands: defaultBands() }])
    );
}

function normalizeNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function normalizeAirportPricing(pricing) {
    return Object.fromEntries(
        AIRPORTS.map((airport) => {
            const sourceBands = pricing?.[airport.code]?.bands;
            const bands = Array.isArray(sourceBands) && sourceBands.length
                ? sourceBands.map((band) => ({
                    upToMiles:
                        band.upToMiles === null || band.upToMiles === ""
                            ? null
                            : normalizeNumber(band.upToMiles),
                    pricePerMile: normalizeNumber(band.pricePerMile),
                }))
                : defaultBands();
            return [airport.code, { bands }];
        })
    );
}

function allBandRates(car) {
    return AIRPORTS.flatMap((airport) =>
        (car.airportPricing?.[airport.code]?.bands || []).map((band) =>
            Number(band.pricePerMile)
        )
    ).filter((rate) => Number.isFinite(rate) && rate > 0);
}

function bandSummary(car, code) {
    const count = car.airportPricing?.[code]?.bands?.length || 0;
    return count ? `${count} band${count === 1 ? "" : "s"}` : "—";
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
        setForm({
            ...emptyCar,
            airportPricing: defaultAirportPricing(),
        });
        setError("");
        setOpen(true);
    };

    const onEdit = (car) => {
        setMode("edit");

        setForm({
            ...car,
            airportPricing: normalizeAirportPricing(car.airportPricing),
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

    const updateBand = (airportCode, index, patch) => {
        setForm((previous) => {
            const bands = [...previous.airportPricing[airportCode].bands];
            bands[index] = { ...bands[index], ...patch };
            return {
                ...previous,
                airportPricing: {
                    ...previous.airportPricing,
                    [airportCode]: { bands },
                },
            };
        });
    };

    const addBand = (airportCode) => {
        setForm((previous) => {
            const bands = [...previous.airportPricing[airportCode].bands];
            const unlimitedIndex = bands.findIndex((band) => band.upToMiles == null);
            const insertAt = unlimitedIndex === -1 ? bands.length : unlimitedIndex;
            const previousLimit = insertAt > 0 ? Number(bands[insertAt - 1].upToMiles) : 0;
            bands.splice(insertAt, 0, {
                upToMiles: previousLimit + 10,
                pricePerMile: DEFAULT_PRICE_PER_MILE,
            });
            return {
                ...previous,
                airportPricing: {
                    ...previous.airportPricing,
                    [airportCode]: { bands },
                },
            };
        });
    };

    const removeBand = (airportCode, index) => {
        setForm((previous) => ({
            ...previous,
            airportPricing: {
                ...previous.airportPricing,
                [airportCode]: {
                    bands: previous.airportPricing[airportCode].bands.filter(
                        (_, bandIndex) => bandIndex !== index
                    ),
                },
            },
        }));
    };

    const setReturnTripDiscount = (patch) => {
        setForm((p) => {
            const existing = (p.discounts || []).find(
                (d) => d.condition === "RETURN_TRIP"
            );

            const rest = (p.discounts || []).filter(
                (d) => d.condition !== "RETURN_TRIP"
            );

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
                airportPricing: normalizeAirportPricing(form.airportPricing),
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
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                        Cars
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage car types, airport distance bands, capacity, features, and discounts.
                    </p>
                </div>

                <button className="btn-primary w-full sm:w-auto" onClick={onCreate}>
                    Add Car
                </button>
            </div>

            <div className="card">
                {/* Desktop / Tablet Table */}
                <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                    <table className="w-full min-w-[850px] text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Base Price</th>
                                <th className="px-4 py-3">Airport Bands</th>
                                <th className="px-4 py-3">Per-Mile Range</th>
                                <th className="px-4 py-3">Return Discount</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {cars.map((c) => {
                                const rd = (c.discounts || []).find(
                                    (d) =>
                                        d.condition === "RETURN_TRIP" &&
                                        d.isActive
                                );

                                const rdLabel = rd
                                    ? rd.type === "PERCENTAGE"
                                        ? `${rd.value}%`
                                        : `£${rd.value}`
                                    : "—";

                                const rates = allBandRates(c);

                                const rateLabel =
                                    rates.length > 0
                                        ? `£${Math.min(...rates).toFixed(2)} – £${Math.max(
                                            ...rates
                                        ).toFixed(2)}`
                                        : "—";

                                return (
                                    <tr
                                        key={c._id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 align-top">
                                            <div className="max-w-[220px] break-words font-medium text-gray-900">
                                                {c.name}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 align-top text-gray-700">
                                            <span className="capitalize">
                                                {c.type.replaceAll("_", " ")}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-gray-900">
                                            £{Number(c.basePrice || 0).toFixed(2)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-gray-700">
                                            <div>
                                                Edinburgh: {bandSummary(c, "EDI")}
                                            </div>
                                            <div className="mt-1">
                                                Glasgow: {bandSummary(c, "GLA")}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 align-top">
                                            <span className="text-xs font-medium text-gray-700">
                                                {rateLabel}
                                            </span>

                                            <div className="text-[10px] uppercase tracking-wide text-gray-400">
                                                airport bands
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 align-top text-gray-700">
                                            {rdLabel}
                                        </td>

                                        <td className="px-4 py-3 align-top text-right">
                                            <div className="flex flex-wrap items-center justify-end gap-3">
                                                <button
                                                    className="text-sm font-medium text-primary-600 underline-offset-4 hover:underline"
                                                    onClick={() => onEdit(c)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="text-sm font-medium text-red-600 underline-offset-4 hover:underline"
                                                    onClick={() => handleDelete(c._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {cars.length === 0 && (
                                <tr>
                                    <td
                                        className="px-4 py-8 text-center text-sm text-gray-500"
                                        colSpan={7}
                                    >
                                        No cars yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {cars.map((c) => {
                        const rd = (c.discounts || []).find(
                            (d) => d.condition === "RETURN_TRIP" && d.isActive
                        );

                        const rdLabel = rd
                            ? rd.type === "PERCENTAGE"
                                ? `${rd.value}%`
                                : `£${rd.value}`
                            : "—";

                        const rates = allBandRates(c);

                        const rateLabel =
                            rates.length > 0
                                ? `£${Math.min(...rates).toFixed(2)} – £${Math.max(
                                    ...rates
                                ).toFixed(2)}`
                                : "—";

                        return (
                            <div
                                key={c._id}
                                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="break-words text-base font-semibold text-gray-900">
                                            {c.name}
                                        </h2>

                                        <p className="mt-1 text-xs capitalize text-gray-500">
                                            {c.type.replaceAll("_", " ")}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold text-gray-900">
                                            £{Number(c.basePrice || 0).toFixed(2)}
                                        </p>

                                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                            base
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-gray-100 pt-3">
                                    <MobileInfoRow
                                        label="Edinburgh"
                                        value={bandSummary(c, "EDI")}
                                    />

                                    <MobileInfoRow
                                        label="Glasgow"
                                        value={bandSummary(c, "GLA")}
                                    />

                                    <MobileInfoRow
                                        label="Per Mile"
                                        value={rateLabel}
                                    />

                                    <MobileInfoRow
                                        label="Return Discount"
                                        value={rdLabel}
                                    />
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <button
                                        className="btn-secondary w-full sm:flex-1"
                                        onClick={() => onEdit(c)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="w-full rounded-lg border-2 border-red-500 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 sm:flex-1 sm:px-6 sm:py-3 sm:text-base"
                                        onClick={() => handleDelete(c._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {cars.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                            No cars yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                    {mode === "create" ? "Create Car" : "Edit Car"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Fill car details, pricing, capacity, features, and return trip discount.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 sm:p-6">
                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <input
                                        className="input-field"
                                        placeholder="Car Name"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                name: e.target.value,
                                            }))
                                        }
                                        required
                                    />

                                    <select
                                        className="input-field"
                                        value={form.type}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                type: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="salon_car">Salon Car</option>
                                        <option value="executive_car">Executive Car</option>
                                        <option value="estate_car">Estate Car</option>
                                        <option value="people_carrier">People Carrier</option>
                                        <option value="executive_people_carrier">
                                            Executive People Carrier
                                        </option>
                                        <option value="minibus_8_seater">
                                            8 Seater Minibus
                                        </option>
                                    </select>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Base Price
                                        </label>

                                        <input
                                            className="input-field w-full md:max-w-[240px]"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="£"
                                            value={form.basePrice}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    basePrice: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
                                        <input
                                            className="input-field"
                                            type="number"
                                            placeholder="Passengers"
                                            value={form.capacity?.passengers ?? 0}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    capacity: {
                                                        ...(p.capacity || {}),
                                                        passengers: e.target.value,
                                                    },
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
                                                    capacity: {
                                                        ...(p.capacity || {}),
                                                        luggage: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>

                                    {/* Airport distance-band pricing */}
                                    <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                                        <div className="mb-4">
                                            <h3 className="font-semibold text-gray-900">
                                                Airport Distance Bands
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-500">
                                                The nearest airport is selected automatically. Fare per leg is base price + journey miles × the matching band rate.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                            {AIRPORTS.map((airport) => (
                                                <div
                                                    key={airport.code}
                                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                                >
                                                    <div className="mb-4 flex items-center justify-between gap-3">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">
                                                                {airport.name}
                                                            </h4>
                                                            <p className="mt-0.5 text-xs font-medium text-gray-500">
                                                                {airport.code} pricing
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
                                                            onClick={() => addBand(airport.code)}
                                                        >
                                                            + Add band
                                                        </button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {(form.airportPricing?.[airport.code]?.bands || []).map(
                                                            (band, index, bands) => {
                                                                const isUnlimited = index === bands.length - 1;
                                                                const previousLimit = index === 0
                                                                    ? 0
                                                                    : bands[index - 1].upToMiles;

                                                                return (
                                                                    <div
                                                                        key={`${airport.code}-${index}`}
                                                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                                                    >
                                                                        <div className="mb-4 flex items-start justify-between gap-3">
                                                                            <div>
                                                                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
                                                                                    Band {index + 1}
                                                                                </p>
                                                                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                                                                    {isUnlimited
                                                                                        ? `Over ${previousLimit || 0} miles`
                                                                                        : `${previousLimit || 0}–${band.upToMiles || "…"} miles`}
                                                                                </p>
                                                                            </div>

                                                                            {!isUnlimited && bands.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                                                    onClick={() => removeBand(airport.code, index)}
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                            <div>
                                                                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                                                                    {isUnlimited ? "Distance" : "Upper limit (miles)"}
                                                                                </label>
                                                                                {isUnlimited ? (
                                                                                    <div className="input-field flex items-center border-gray-200 bg-gray-50 font-medium text-gray-600">
                                                                                        {previousLimit || 0}+ miles
                                                                                    </div>
                                                                                ) : (
                                                                                    <input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        min={Number(previousLimit || 0) + 0.01}
                                                                                        className="input-field"
                                                                                        aria-label={`${airport.name} band upper miles`}
                                                                                        value={band.upToMiles ?? ""}
                                                                                        onChange={(e) =>
                                                                                            updateBand(airport.code, index, {
                                                                                                upToMiles: e.target.value,
                                                                                            })
                                                                                        }
                                                                                        required
                                                                                    />
                                                                                )}
                                                                            </div>

                                                                            <div>
                                                                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                                                                    Rate (£ per mile)
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min="0.01"
                                                                                    className="input-field"
                                                                                    value={band.pricePerMile ?? ""}
                                                                                    onChange={(e) =>
                                                                                        updateBand(airport.code, index, {
                                                                                            pricePerMile: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    required
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <textarea
                                    className="input-field min-h-[110px] resize-y"
                                    placeholder="Description"
                                    value={form.description || ""}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            description: e.target.value,
                                        }))
                                    }
                                />

                                {/* Features */}
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <div className="mb-3">
                                        <h3 className="font-semibold text-gray-900">
                                            Features
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Add features such as GPS, child seat, WiFi, or extra luggage space.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            className="input-field"
                                            placeholder="Add feature (e.g. GPS)"
                                            value={featureInput}
                                            onChange={(e) =>
                                                setFeatureInput(e.target.value)
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn-secondary w-full sm:w-auto"
                                            onClick={addFeature}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(form.features || []).map((f, idx) => (
                                            <span
                                                key={`${f}-${idx}`}
                                                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                            >
                                                {f}

                                                <button
                                                    type="button"
                                                    className="ml-2 text-gray-500 hover:text-red-600"
                                                    onClick={() => removeFeature(idx)}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Return trip discount */}
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <div className="mb-3">
                                        <h3 className="font-semibold text-gray-900">
                                            Return Trip Discount
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            This discount applies when the customer books a return trip.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        <select
                                            className="input-field"
                                            value={
                                                (form.discounts || []).find(
                                                    (d) =>
                                                        d.condition === "RETURN_TRIP"
                                                )?.type || "PERCENTAGE"
                                            }
                                            onChange={(e) =>
                                                setReturnTripDiscount({
                                                    type: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="PERCENTAGE">
                                                Percentage
                                            </option>
                                            <option value="FIXED">Fixed</option>
                                        </select>

                                        <input
                                            className="input-field"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={
                                                (form.discounts || []).find(
                                                    (d) =>
                                                        d.condition === "RETURN_TRIP"
                                                )?.type === "PERCENTAGE"
                                                    ? 100
                                                    : undefined
                                            }
                                            value={
                                                (form.discounts || []).find(
                                                    (d) =>
                                                        d.condition === "RETURN_TRIP"
                                                )?.value ?? 10
                                            }
                                            onChange={(e) =>
                                                setReturnTripDiscount({
                                                    value: Number(e.target.value),
                                                })
                                            }
                                            placeholder="Value"
                                        />

                                        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    (form.discounts || []).find(
                                                        (d) =>
                                                            d.condition ===
                                                            "RETURN_TRIP"
                                                    )?.isActive ?? true
                                                }
                                                onChange={(e) =>
                                                    setReturnTripDiscount({
                                                        isActive: e.target.checked,
                                                    })
                                                }
                                            />
                                            Active
                                        </label>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-4 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                                    <button
                                        type="button"
                                        className="btn-secondary w-full sm:w-auto"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="btn-primary w-full sm:w-auto"
                                        type="submit"
                                    >
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
