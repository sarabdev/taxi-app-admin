import { useEffect, useState } from "react";
import { fetchMyBookings, completeBooking } from "../../api/driverBookings";

const STATUS_STYLES = {
    ASSIGNED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-200 text-gray-600",
};

export default function DriverBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [completingId, setCompletingId] = useState(null);
    const [note, setNote] = useState("");

    async function load() {
        try {
            setLoading(true);
            const data = await fetchMyBookings();
            setBookings(data);
        } catch (e) {
            setError("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const handleComplete = async (bookingId) => {
        if (!confirm("Mark this booking as completed?")) return;

        try {
            setCompletingId(bookingId);
            await completeBooking(bookingId, { note });
            setNote("");
            await load();
        } catch (e) {
            alert("Failed to complete booking");
        } finally {
            setCompletingId(null);
        }
    };

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    My Bookings
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View assigned bookings and mark completed rides.
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="card">
                    <p className="text-sm text-gray-500 sm:text-base">
                        Loading bookings…
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && bookings.length === 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
                    No assigned bookings yet.
                </div>
            )}

            {/* Bookings */}
            {!loading && !error && bookings.length > 0 && (
                <div className="space-y-4">
                    {bookings.map((b) => (
                        <div
                            key={b._id}
                            className="card border border-gray-100 space-y-4"
                        >
                            {/* Top Row */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                {/* Route */}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Route
                                    </p>

                                    <div className="mt-1 break-words text-base font-semibold text-gray-900">
                                        {b.pickupLocation}
                                    </div>

                                    <div className="mt-1 break-words text-sm text-gray-500">
                                        → {b.dropoffLocation}
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status] ||
                                        "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {b.status}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                                <BookingInfo
                                    label="Total"
                                    value={`£${Number(
                                        b.pricing?.totalFare || 0
                                    ).toFixed(2)}`}
                                    strong
                                />

                                <BookingInfo
                                    label="Date"
                                    value={new Date(
                                        b.createdAt
                                    ).toLocaleDateString()}
                                />

                                <BookingInfo
                                    label="Status"
                                    value={b.status}
                                />
                            </div>

                            {/* Completion */}
                            {b.status === "ASSIGNED" && (
                                <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Completion Note
                                        </label>

                                        <textarea
                                            className="input-field min-h-[90px] resize-y"
                                            placeholder="Completion note (optional)"
                                            rows={3}
                                            value={note}
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
                                        />
                                    </div>

                                    <button
                                        className="btn-primary w-full sm:w-auto"
                                        disabled={completingId === b._id}
                                        onClick={() => handleComplete(b._id)}
                                    >
                                        {completingId === b._id
                                            ? "Completing…"
                                            : "Mark as Completed"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function BookingInfo({ label, value, strong }) {
    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p
                className={`mt-1 break-words text-sm ${strong
                        ? "font-semibold text-gray-900"
                        : "font-medium text-gray-700"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}