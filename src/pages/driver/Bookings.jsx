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
        <div className="space-y-6">
            <h1 className="text-xl font-bold">My Bookings</h1>

            {/* Loading */}
            {loading && <div className="text-gray-500">Loading bookings…</div>}

            {/* Error */}
            {!loading && error && (
                <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
            )}

            {/* Empty */}
            {!loading && !error && bookings.length === 0 && (
                <div className="text-gray-500">No assigned bookings yet.</div>
            )}

            {/* Bookings */}
            <div className="space-y-4">
                {bookings.map((b) => (
                    <div key={b._id} className="card border space-y-3">
                        {/* Route */}
                        <div>
                            <div className="font-medium">{b.pickupLocation}</div>
                            <div className="text-sm text-gray-500">
                                → {b.dropoffLocation}
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span
                                className={`px-2 py-0.5 rounded font-semibold text-xs ${STATUS_STYLES[b.status]}`}
                            >
                                {b.status}
                            </span>

                            <span>
                                <b>Total:</b> £{b.pricing?.totalFare?.toFixed(2) ?? "—"}
                            </span>

                            <span>
                                <b>Date:</b>{" "}
                                {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Completion */}
                        {b.status === "ASSIGNED" && (
                            <div className="space-y-2">
                                <textarea
                                    className="input-field"
                                    placeholder="Completion note (optional)"
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />

                                <button
                                    className="btn-primary"
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
        </div>
    );
}
