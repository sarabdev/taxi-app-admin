import { useEffect, useState } from "react";
import {
    fetchDrivers,
    createDriver,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
} from "../../api/drivers";

import { fetchCars } from "../../api/cars";

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [cars, setCars] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [error, setError] = useState("");
    const [credentials, setCredentials] = useState(null);

    const [editingDriverId, setEditingDriverId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        homeAddress: "",
        assignedCarId: "",
        licenseNumber: "",
        licenseDocument: null,
    });

    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        city: "",
        homeAddress: "",
        assignedCarId: "",
        licenseNumber: "",
        licenseDocument: null,
    });

    async function loadDrivers() {
        setLoading(true);

        const [driversData, carsData] = await Promise.all([
            fetchDrivers(),
            fetchCars(),
        ]);

        setDrivers(driversData);
        setCars(carsData);

        setLoading(false);
    }

    useEffect(() => {
        loadDrivers();
    }, []);

    /* ================= CREATE ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setCredentials(null);

        try {
            const payload = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    payload.append(key, value);
                }
            });

            const res = await createDriver(payload);

            setCredentials(res.credentials);

            setForm({
                name: "",
                email: "",
                phone: "",
                city: "",
                homeAddress: "",
                assignedCarId: "",
                licenseNumber: "",
                licenseDocument: null,
            });

            await loadDrivers();
        } catch (e) {
            setError(e.message);
        }
    };

    /* ================= EDIT ================= */

    const startEdit = (driver) => {
        setEditingDriverId(driver._id);

        setEditForm({
            name: driver.name || "",
            phone: driver.phone || "",
            city: driver.city || "",
            homeAddress: driver.homeAddress || "",
            assignedCarId: driver.assignedCarId?._id || "",
            licenseNumber: driver.licenseNumber || "",
            licenseDocument: null,
        });
    };

    const saveEdit = async (id) => {
        const payload = new FormData();

        Object.entries(editForm).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                payload.append(key, value);
            }
        });

        await updateDriver(id, payload);

        setEditingDriverId(null);

        await loadDrivers();
    };

    /* ================= STATUS ================= */

    const toggleStatus = async (driver) => {
        await updateDriverStatus(driver._id, !driver.isActive);
        await loadDrivers();
    };

    /* ================= DELETE ================= */

    const removeDriver = async (driver) => {
        if (!confirm(`Delete driver "${driver.name}" permanently?`)) {
            return;
        }

        await deleteDriver(driver._id);

        await loadDrivers();
    };

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                        Drivers
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage drivers, assigned cars, license details, and account status.
                    </p>
                </div>

                <button
                    className="btn-primary w-full sm:w-auto"
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? "Close" : "Add Driver"}
                </button>
            </div>

            {/* Create Driver */}
            {showForm && (
                <div className="card">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                            Create Driver
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Add driver profile, login email, car assignment, and license document.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    {credentials && (
                        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-yellow-800">
                                ⚠ Save these credentials now
                            </p>

                            <div className="space-y-1 text-sm text-yellow-900">
                                <p className="break-words">
                                    Email: <b>{credentials.email}</b>
                                </p>

                                <p className="break-words">
                                    Password: <b>{credentials.password}</b>
                                </p>
                            </div>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                        <input
                            className="input-field"
                            placeholder="Driver Name"
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name: e.target.value,
                                })
                            }
                            required
                        />

                        <input
                            className="input-field"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value,
                                })
                            }
                            required
                        />

                        <input
                            className="input-field"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    phone: e.target.value,
                                })
                            }
                        />

                        <input
                            className="input-field"
                            placeholder="City"
                            value={form.city}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    city: e.target.value,
                                })
                            }
                            required
                        />

                        <input
                            className="input-field md:col-span-2"
                            placeholder="Home Address"
                            value={form.homeAddress}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    homeAddress: e.target.value,
                                })
                            }
                            required
                        />

                        <select
                            className="input-field"
                            value={form.assignedCarId}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    assignedCarId: e.target.value,
                                })
                            }
                        >
                            <option value="">Select Car</option>

                            {cars.map((car) => (
                                <option key={car._id} value={car._id}>
                                    {car.name}
                                </option>
                            ))}
                        </select>

                        <input
                            className="input-field"
                            placeholder="License Number"
                            value={form.licenseNumber}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    licenseNumber: e.target.value,
                                })
                            }
                        />

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                License Document
                            </label>

                            <input
                                type="file"
                                className="input-field"
                                accept=".pdf,image/*"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        licenseDocument: e.target.files[0],
                                    })
                                }
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Accepted formats: PDF or image.
                            </p>
                        </div>

                        <button className="btn-primary w-full md:col-span-2">
                            Create Driver
                        </button>
                    </form>
                </div>
            )}

            {/* Driver List */}
            <div className="card">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Driver List
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View driver details, license documents, and status.
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
                        Loading...
                    </div>
                ) : drivers.length === 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                        No drivers found.
                    </div>
                ) : (
                    <>
                        {/* Desktop / Tablet Table */}
                        <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white lg:block">
                            <table className="w-full min-w-[1200px] text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">City</th>
                                        <th className="px-4 py-3">Car</th>
                                        <th className="px-4 py-3">License</th>
                                        <th className="px-4 py-3">Document</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {drivers.map((d) => (
                                        <tr
                                            key={d._id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 align-top">
                                                <div className="max-w-[180px] break-words font-medium text-gray-900">
                                                    {d.name}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <div className="max-w-[220px] break-words text-gray-700">
                                                    {d.userId?.email}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                                {d.phone || "—"}
                                            </td>

                                            <td className="px-4 py-3 align-top text-gray-700">
                                                {d.city || "—"}
                                            </td>

                                            <td className="px-4 py-3 align-top text-gray-700">
                                                <div className="max-w-[160px] break-words">
                                                    {d.assignedCarId?.name || "—"}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top text-gray-700">
                                                <div className="max-w-[160px] break-words">
                                                    {d.licenseNumber || "—"}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                {d.licenseDocument ? (
                                                    <a
                                                        href={`${import.meta.env.VITE_API_BASE}${d.licenseDocument}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-medium text-blue-600 underline-offset-4 hover:underline"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <button
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${d.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                    onClick={() => toggleStatus(d)}
                                                >
                                                    {d.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </button>
                                            </td>

                                            <td className="px-4 py-3 align-top text-right">
                                                <div className="flex flex-wrap items-center justify-end gap-3">
                                                    <button
                                                        className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
                                                        onClick={() => startEdit(d)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="text-sm font-medium text-red-600 underline-offset-4 hover:underline"
                                                        onClick={() =>
                                                            removeDriver(d)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile / Tablet Cards */}
                        <div className="space-y-4 lg:hidden">
                            {drivers.map((d) => (
                                <div
                                    key={d._id}
                                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="break-words text-base font-semibold text-gray-900">
                                                {d.name}
                                            </h3>

                                            <p className="mt-1 break-words text-sm text-gray-500">
                                                {d.userId?.email || "—"}
                                            </p>
                                        </div>

                                        <button
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${d.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                            onClick={() => toggleStatus(d)}
                                        >
                                            {d.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </div>

                                    <div className="space-y-2 border-t border-gray-100 pt-3">
                                        <MobileInfoRow
                                            label="Phone"
                                            value={d.phone || "—"}
                                        />

                                        <MobileInfoRow
                                            label="City"
                                            value={d.city || "—"}
                                        />

                                        <MobileInfoRow
                                            label="Car"
                                            value={d.assignedCarId?.name || "—"}
                                        />

                                        <MobileInfoRow
                                            label="License"
                                            value={d.licenseNumber || "—"}
                                        />

                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-sm text-gray-500">
                                                Document
                                            </span>

                                            {d.licenseDocument ? (
                                                <a
                                                    href={`${import.meta.env.VITE_API_BASE}${d.licenseDocument}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-800">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <button
                                            className="btn-secondary w-full sm:flex-1"
                                            onClick={() => startEdit(d)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="w-full rounded-lg border-2 border-red-500 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 sm:flex-1 sm:px-6 sm:py-3 sm:text-base"
                                            onClick={() => removeDriver(d)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
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