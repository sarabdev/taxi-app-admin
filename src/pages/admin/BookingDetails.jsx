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
        return (
            <div className="w-full">
                <div className="card">
                    <p className="text-sm text-gray-500 sm:text-base">
                        Loading booking…
                    </p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="w-full">
                <div className="card">
                    <p className="text-sm font-medium text-red-600 sm:text-base">
                        Booking not found
                    </p>
                </div>
            </div>
        );
    }

    const p = booking.pricing || {};
    const returnTrip = booking.returnTrip || {};

    const statusColor = {
        PENDING: "bg-yellow-100 text-yellow-700",
        ASSIGNED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-gray-200 text-gray-600",
    }[booking.status];

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        setActionLoading(true);

        try {
            await updateBookingStatus(booking._id, "CANCELLED");
            setBooking({ ...booking, status: "CANCELLED" });

            const newLogs = await fetchBookingActivity(id);
            setLogs(newLogs);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Back */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-medium text-primary-600 underline-offset-4 hover:underline"
                >
                    ← Back to bookings
                </button>
            </div>

            {/* Booking Overview */}
            <div className="card">
                <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                            Booking Details
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Review booking information, pricing, activity, and admin actions.
                        </p>
                    </div>

                    <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                    >
                        {booking.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:gap-5">
                    <InfoItem
                        label="Journey Type"
                        value={booking.isReturnTrip ? "Return" : "One way"}
                    />

                    <InfoItem
                        label="Pickup"
                        value={booking.pickupLocation}
                    />

                    <InfoItem
                        label="Destination"
                        value={booking.dropoffLocation}
                    />

                    <InfoItem
                        label="Pickup Date"
                        value={formatDate(booking.pickupDate)}
                    />

                    <InfoItem
                        label="Pickup Time"
                        value={booking.pickupTime}
                    />

                    <InfoItem
                        label="Query Received"
                        value={formatReceivedAt(booking.createdAt)}
                    />

                    <InfoItem
                        label="Arrival Date & Time"
                        value={formatStoredDateTime(booking.flight?.arrivalDateTime)}
                    />

                    <InfoItem
                        label="Meet & Greet"
                        value={booking.flight?.meetAndGreet ? "Selected" : "Not selected"}
                    />

                    {booking.isReturnTrip && (
                        <>
                            <InfoItem
                                label="Return Pickup"
                                value={returnTrip.pickupLocation}
                            />

                            <InfoItem
                                label="Return Destination"
                                value={returnTrip.dropoffLocation}
                            />

                            <InfoItem
                                label="Return Date"
                                value={formatDate(returnTrip.pickupDate)}
                            />

                            <InfoItem
                                label="Return Time"
                                value={returnTrip.pickupTime}
                            />
                        </>
                    )}

                    <InfoItem
                        label="Driver"
                        value={
                            booking.assignedDriverId
                                ? `${booking.assignedDriverId.name} (${booking.assignedDriverId.userId?.email})`
                                : "—"
                        }
                    />

                    <InfoItem
                        label="Car"
                        value={booking.carId?.name || "—"}
                    />

                    <InfoItem
                        label="Car Type"
                        value={formatCarType(booking.carId?.type)}
                    />

                </div>
            </div>

            <div className="card">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                    Customer &amp; Passengers
                </h2>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Lead Passenger" value={booking.customerName} />
                    <InfoItem label="Confirmation Email" value={booking.customerEmail} />
                    <InfoItem label="Phone Number" value={booking.customerPhone} />
                    <InfoItem label="Passengers" value={booking.passengers ?? 1} />
                </div>
            </div>

            <div className="card">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                    Luggage
                </h2>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Luggage" value={formatLuggageCount(booking.luggage)} />
                    <InfoItem label="Large Bags (23kg)" value={booking.luggage?.largeBags23kg ?? 0} />
                    <InfoItem label="Small Bags (15kg)" value={booking.luggage?.smallBags15kg ?? 0} />
                    <InfoItem label="Shoulder Bags" value={booking.luggage?.shoulderBags ?? 0} />
                    <InfoItem label="Extra-large Item" value={formatExtraItem(booking.luggage?.extraLargeItemType)} />
                    <InfoItem label="Extra Item Note" value={booking.luggage?.extraLargeItemNote} />
                </div>
            </div>

            <div className="card">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                    Flight Details
                </h2>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Flight Number" value={booking.flight?.flightNumber} />
                    <InfoItem label="Arriving From" value={booking.flight?.arrivingFrom} />
                    <InfoItem label="Arrival Date & Time" value={formatStoredDateTime(booking.flight?.arrivalDateTime)} />
                    <InfoItem label="Meet & Greet" value={booking.flight?.meetAndGreet ? "Selected" : "Not selected"} />
                </div>
            </div>

            <div className="card">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                    Booking Record
                </h2>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Booking Reference" value={String(booking._id || "").slice(-8).toUpperCase()} />
                    <InfoItem label="Payment Reference" value={booking.paymentIntentId} />
                    <InfoItem label="Status" value={booking.status} />
                    <InfoItem label="Created At" value={formatStoredDateTime(booking.createdAt)} />
                    <InfoItem label="Completed At" value={formatStoredDateTime(booking.completedAt)} />
                </div>
            </div>

            {/* Fare Breakdown */}
            <div className="card">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                    Fare Breakdown
                </h2>

                <ul className="space-y-2 text-sm">
                    <FareRow
                        label="Base price per leg"
                        value={`£${Number(p.basePrice || 0).toFixed(2)}`}
                    />

                    <FareRow
                        label="Outbound fare"
                        value={`£${Number(p.baseFare || 0).toFixed(2)}`}
                    />

                    <FareRow
                        label="Outbound distance rate"
                        value={`${Number(p.distanceMiles || 0).toFixed(2)} miles × £${Number(
                            p.pricePerMile || 0
                        ).toFixed(2)}`}
                    />

                    {booking.isReturnTrip && (
                        <>
                            <FareRow
                                label="Return fare"
                                value={`£${Number(p.returnBaseFare || 0).toFixed(2)}`}
                            />

                            <FareRow
                                label="Return distance rate"
                                value={`${Number(p.returnDistanceMiles || 0).toFixed(2)} miles × £${Number(
                                    p.returnPricePerMile || p.pricePerMile || 0
                                ).toFixed(2)}`}
                            />
                        </>
                    )}

                    <FareRow
                        label="Car discount"
                        value={`−£${Number(p.carDiscountAmount || 0).toFixed(2)}`}
                        valueClassName="text-green-600"
                    />

                    <FareRow
                        label="Coupon discount"
                        value={`−£${Number(p.couponDiscountAmount || 0).toFixed(2)}`}
                        valueClassName="text-green-600"
                    />

                    <FareRow
                        label="Applied coupon"
                        value={p.appliedCoupon || "None"}
                    />

                    {booking.flight?.meetAndGreet && (
                        <FareRow
                            label="Meet & Greet service"
                            value={`£${Number(p.meetAndGreetFee || 0).toFixed(2)}`}
                        />
                    )}

                    {Number(p.airportPickupFee || 0) > 0 && (
                        <FareRow
                            label="Airport pickup fee"
                            value={`£${Number(p.airportPickupFee).toFixed(2)}`}
                        />
                    )}

                    <li className="flex items-center justify-between gap-4 border-t pt-3 font-bold">
                        <span>Total paid:</span>
                        <span className="text-right text-primary-600">
                            £{Number(p.totalFare || 0).toFixed(2)}
                        </span>
                    </li>
                </ul>
            </div>

            {/* Driver Completion Note */}
            {booking.completionNote && (
                <div className="card">
                    <h2 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                        Driver Note
                    </h2>

                    <p className="break-words text-sm leading-relaxed text-gray-700">
                        {booking.completionNote}
                    </p>
                </div>
            )}

            {/* Activity Timeline */}
            <div className="card">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                    Activity Timeline
                </h2>

                <div className="max-w-full overflow-x-auto">
                    <BookingTimeline logs={logs} />
                </div>
            </div>

            {/* Admin Actions */}
            {booking.status !== "COMPLETED" &&
                booking.status !== "CANCELLED" && (
                    <div className="card border border-red-200 bg-red-50">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-red-700 sm:text-lg">
                                    Admin Actions
                                </h2>

                                <p className="mt-1 text-sm text-red-600">
                                    Cancel this booking only if required.
                                </p>
                            </div>

                            <button
                                className="btn-secondary w-full sm:w-auto"
                                disabled={actionLoading}
                                onClick={handleCancel}
                            >
                                {actionLoading ? "Cancelling…" : "Cancel Booking"}
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}

/* ─────────────────────────────
 * Reusable detail row/card item
 * ───────────────────────────── */
function InfoItem({ label, value }) {
    const displayedValue = value === 0 ? 0 : value || "—";

    return (
        <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="break-words text-sm leading-relaxed text-gray-800">
                {displayedValue}
            </p>
        </div>
    );
}

/* ─────────────────────────────
 * Reusable fare row
 * ───────────────────────────── */
function formatDate(value) {
    if (!value) return "—";
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(parsed);
}

function formatLuggageCount(luggage = {}) {
    const count = Number(luggage.largeBags23kg || 0)
        + Number(luggage.smallBags15kg || 0)
        + Number(luggage.shoulderBags || 0);
    return `${count} ${count === 1 ? "item" : "items"}`;
}

function formatReceivedAt(value) {
    return value ? new Date(value).toLocaleString() : "—";
}

function formatStoredDateTime(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString();
}

function formatExtraItem(value) {
    const labels = {
        none: "None",
        extra_large_bag_35kg: "Extra-large bag (35kg)",
        wheelchair: "Wheelchair",
        pram: "Pram",
        golf_bag: "Golf bag",
        other: "Other",
    };

    return labels[value] || value || "None";
}

function formatCarType(value) {
    return value
        ? String(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "—";
}

function FareRow({ label, value, valueClassName = "text-gray-700" }) {
    return (
        <li className="flex items-start justify-between gap-4">
            <span className="text-gray-600">{label}:</span>

            <span className={`text-right font-medium ${valueClassName}`}>
                {value}
            </span>
        </li>
    );
}
