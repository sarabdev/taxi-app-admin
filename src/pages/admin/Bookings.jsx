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
        await updateBookingStatus(booking._id, newStatus);
        await load();
        setUpdatingStatusId(null);
    };

    return (
        <div className="card">
            <h1 className="text-xl font-bold mb-4">Bookings</h1>

            <table className="w-full text-sm">
                <thead className="border-b">
                    <tr className="text-left text-gray-600">
                        <th className="py-2">Route</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Driver</th>
                        <th>Total</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {bookings.map((b) => (
                        <tr
                            key={b._id}
                            className="border-b last:border-0 hover:bg-gray-50"
                        >
                            {/* Route */}
                            <td className="py-2">
                                <div className="font-medium">{b.pickupLocation}</div>
                                <div className="text-xs text-gray-500">
                                    → {b.dropoffLocation}
                                </div>
                            </td>

                            {/* Date */}
                            <td>{new Date(b.createdAt).toLocaleDateString()}</td>

                            {/* Status */}
                            <td>
                                <select
                                    value={b.status}
                                    disabled={updatingStatusId === b._id}
                                    onChange={(e) =>
                                        handleStatusChange(b, e.target.value)
                                    }
                                    className={`text-xs font-semibold rounded px-2 py-1 border
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
                            <td>{b.assignedDriverId?.name || "—"}</td>

                            {/* Total */}
                            <td>£{b.pricing?.totalFare?.toFixed(2) ?? "—"}</td>

                            {/* Actions */}
                            <td className="text-right space-x-3">
                                <button
                                    className="text-primary-600 underline"
                                    onClick={() => navigate(`/admin/bookings/${b._id}`)}
                                >
                                    View Details
                                </button>

                                {b.status === "PENDING" && (
                                    <button
                                        className="text-blue-600 underline"
                                        onClick={() => setSelected(b)}
                                    >
                                        Assign
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Assign Driver Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="font-semibold mb-4">Assign Driver</h2>

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

                        <div className="flex gap-3 justify-end">
                            <button
                                className="btn-secondary"
                                onClick={() => setSelected(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
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
