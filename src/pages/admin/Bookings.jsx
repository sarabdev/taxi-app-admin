import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchBookings,
    assignBooking,
    updateBookingStatus,
} from "../../api/bookings";
import { fetchDrivers } from "../../api/drivers";

const STATUS_OPTIONS = ["PENDING", "ASSIGNED", "COMPLETED", "CANCELLED"];

export default function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [driverId, setDriverId] = useState("");
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    async function load() {
        const [b, d] = await Promise.all([fetchBookings(), fetchDrivers()]);
        setBookings(b);
        setDrivers(d);
    }

    useEffect(() => {
        load();
    }, []);

    // ✅ ASSIGN DRIVER (also sets status ASSIGNED in backend)
    const handleAssign = async () => {
        if (!selected || !driverId) return;

        await assignBooking(selected._id, driverId);
        setSelected(null);
        setDriverId("");
        await load();
    };

    // ✅ STATUS CHANGE HANDLER
    const handleStatusChange = async (booking, newStatus) => {
        if (!newStatus || booking.status === newStatus) return;

        // 🚫 ASSIGNED requires driver → open modal instead
        if (newStatus === "ASSIGNED") {
            setSelected(booking);
            return;
        }

        setUpdatingStatusId(booking._id);

        try {
            await updateBookingStatus(booking._id, newStatus);
            await load();
        } finally {
            setUpdatingStatusId(null);
        }
    };

    return (
        <div className="card">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-1 sm:mb-5">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                    Bookings
                </h1>

                <p className="text-sm text-gray-500">
                    Manage booking status, assign drivers, and view booking details.
                </p>
            </div>

            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white md:block">
                <table className="w-full min-w-[850px] text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-3">Route</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Driver</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((b) => (
                            <tr
                                key={b._id}
                                className="transition-colors hover:bg-gray-50"
                            >
                                {/* Route */}
                                <td className="px-4 py-3 align-top">
                                    <div className="max-w-[280px]">
                                        <div className="break-words font-medium text-gray-900">
                                            {b.pickupLocation}
                                        </div>

                                        <div className="mt-1 break-words text-xs text-gray-500">
                                            → {b.dropoffLocation}
                                        </div>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="whitespace-nowrap px-4 py-3 align-top text-gray-700">
                                    {new Date(b.createdAt).toLocaleDateString()}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 align-top">
                                    <select
                                        value={b.status}
                                        disabled={updatingStatusId === b._id}
                                        onChange={(e) =>
                                            handleStatusChange(b, e.target.value)
                                        }
                                        className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60
                                            ${b.status === "PENDING"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : b.status === "ASSIGNED"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : b.status === "COMPLETED"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* Driver */}
                                <td className="px-4 py-3 align-top text-gray-700">
                                    <div className="max-w-[180px] break-words">
                                        {b.assignedDriverId?.name || "—"}
                                    </div>
                                </td>

                                {/* Total */}
                                <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-gray-900">
                                    £{b.pricing?.totalFare?.toFixed(2) ?? "—"}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 align-top text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-3">
                                        <button
                                            className="text-sm font-medium text-primary-600 underline-offset-4 hover:underline"
                                            onClick={() =>
                                                navigate(`/admin/bookings/${b._id}`)
                                            }
                                        >
                                            View Details
                                        </button>

                                        {b.status === "PENDING" && (
                                            <button
                                                className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
                                                onClick={() => setSelected(b)}
                                            >
                                                Assign
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {bookings.length === 0 && (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-4 py-8 text-center text-sm text-gray-500"
                                >
                                    No bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
                {bookings.map((b) => (
                    <div
                        key={b._id}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Route
                                </p>

                                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                    {b.pickupLocation}
                                </p>

                                <p className="mt-1 break-words text-xs text-gray-500">
                                    → {b.dropoffLocation}
                                </p>
                            </div>

                            <p className="shrink-0 text-right text-sm font-semibold text-gray-900">
                                £{b.pricing?.totalFare?.toFixed(2) ?? "—"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
                            <MobileInfoRow
                                label="Date"
                                value={new Date(b.createdAt).toLocaleDateString()}
                            />

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-gray-500">
                                    Status
                                </span>

                                <select
                                    value={b.status}
                                    disabled={updatingStatusId === b._id}
                                    onChange={(e) =>
                                        handleStatusChange(b, e.target.value)
                                    }
                                    className={`max-w-[160px] rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60
                                        ${b.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : b.status === "ASSIGNED"
                                                ? "bg-blue-100 text-blue-700"
                                                : b.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <MobileInfoRow
                                label="Driver"
                                value={b.assignedDriverId?.name || "—"}
                            />
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <button
                                className="btn-secondary w-full sm:flex-1"
                                onClick={() =>
                                    navigate(`/admin/bookings/${b._id}`)
                                }
                            >
                                View Details
                            </button>

                            {b.status === "PENDING" && (
                                <button
                                    className="btn-primary w-full sm:flex-1"
                                    onClick={() => setSelected(b)}
                                >
                                    Assign
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {bookings.length === 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                        No bookings found.
                    </div>
                )}
            </div>

            {/* ✅ Assign Driver Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl sm:p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Assign Driver
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Select a driver to assign this booking.
                            </p>
                        </div>

                        <select
                            className="input-field mb-4"
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                        >
                            <option value="">Select driver</option>
                            {drivers.map((d) => (
                                <option key={d._id} value={d._id}>
                                    {d.name} ({d.userId?.email})
                                </option>
                            ))}
                        </select>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                className="btn-secondary w-full sm:w-auto"
                                onClick={() => {
                                    setSelected(null);
                                    setDriverId("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn-primary w-full sm:w-auto"
                                disabled={!driverId}
                                onClick={handleAssign}
                            >
                                Assign
                            </button>
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