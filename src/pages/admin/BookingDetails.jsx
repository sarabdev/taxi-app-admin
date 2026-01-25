import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBooking, updateBookingStatus } from "../../api/bookings";
import { fetchBookingActivity } from "../../api/activity";
import BookingTimeline from "../../components/BookingTimeline";

export default function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [b, l] = await Promise.all([
                    fetchBooking(id),
                    fetchBookingActivity(id),
                ]);

                setBooking(b);
                setLogs(l);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    if (loading) {
        return <div className="text-sm text-gray-500">Loading booking…</div>;
    }

    if (!booking) {
        return <div className="text-sm text-red-600">Booking not found</div>;
    }

    const p = booking.pricing || {};

    const statusColor = {
        PENDING: "bg-yellow-100 text-yellow-700",
        ASSIGNED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-gray-200 text-gray-600",
    }[booking.status];

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        setActionLoading(true);
        await updateBookingStatus(booking._id, "CANCELLED");
        setBooking({ ...booking, status: "CANCELLED" });

        const newLogs = await fetchBookingActivity(id);
        setLogs(newLogs);
        setActionLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="text-primary-600 underline text-sm"
            >
                ← Back to bookings
            </button>

            {/* Booking Overview */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">Booking Details</h1>
                    <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${statusColor}`}
                    >
                        {booking.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <b>Pickup:</b>
                        <div className="text-gray-700">
                            {booking.pickupLocation}
                        </div>
                    </div>

                    <div>
                        <b>Dropoff:</b>
                        <div className="text-gray-700">
                            {booking.dropoffLocation}
                        </div>
                    </div>

                    <div>
                        <b>Driver:</b>
                        <div className="text-gray-700">
                            {booking.assignedDriverId
                                ? `${booking.assignedDriverId.name} (${booking.assignedDriverId.userId?.email})`
                                : "—"}
                        </div>
                    </div>

                    <div>
                        <b>Car:</b>
                        <div className="text-gray-700">
                            {booking.carId?.name || "—"}
                        </div>
                    </div>

                    <div>
                        <b>Created:</b>
                        <div className="text-gray-700">
                            {new Date(booking.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fare Breakdown */}
            <div className="card">
                <h2 className="font-semibold mb-3">Fare Breakdown</h2>

                <ul className="text-sm space-y-1">
                    <li>
                        Base fare:
                        <span className="float-right">
                            £{Number(p.baseFare || 0).toFixed(2)}
                        </span>
                    </li>

                    <li>
                        Distance:
                        <span className="float-right">
                            {Number(p.distanceMiles || 0).toFixed(2)} miles × £
                            {Number(p.pricePerMile || 0).toFixed(2)}
                        </span>
                    </li>

                    <li>
                        Car discount:
                        <span className="float-right text-green-600">
                            −£{Number(p.carDiscountAmount || 0).toFixed(2)}
                        </span>
                    </li>

                    <li>
                        Coupon discount:
                        <span className="float-right text-green-600">
                            −£{Number(p.couponDiscountAmount || 0).toFixed(2)}
                        </span>
                    </li>

                    <li className="font-bold border-t pt-2">
                        Total:
                        <span className="float-right text-primary-600">
                            £{Number(p.totalFare || 0).toFixed(2)}
                        </span>
                    </li>
                </ul>
            </div>

            {/* Driver Completion Note */}
            {booking.completionNote && (
                <div className="card">
                    <h2 className="font-semibold mb-2">Driver Note</h2>
                    <p className="text-sm text-gray-700">
                        {booking.completionNote}
                    </p>
                </div>
            )}

            {/* Activity Timeline */}
            <div className="card">
                <h2 className="font-semibold mb-3">Activity Timeline</h2>
                <BookingTimeline logs={logs} />
            </div>

            {/* Admin Actions */}
            {booking.status !== "COMPLETED" &&
                booking.status !== "CANCELLED" && (
                    <div className="card border border-red-200 bg-red-50">
                        <h2 className="font-semibold mb-3 text-red-700">
                            Admin Actions
                        </h2>

                        <button
                            className="btn-secondary"
                            disabled={actionLoading}
                            onClick={handleCancel}
                        >
                            {actionLoading
                                ? "Cancelling…"
                                : "Cancel Booking"}
                        </button>
                    </div>
                )}
        </div>
    );
}
