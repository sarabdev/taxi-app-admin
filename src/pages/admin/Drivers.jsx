import { useEffect, useState } from "react";
import {
    fetchDrivers,
    createDriver,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
} from "../../api/drivers";

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [credentials, setCredentials] = useState(null);

    const [editingDriverId, setEditingDriverId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        licenseNumber: "",
    });

    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        licenseNumber: "",
    });

    async function loadDrivers() {
        setLoading(true);
        const data = await fetchDrivers();
        setDrivers(data);
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
            const res = await createDriver(form);
            setCredentials(res.credentials);
            setForm({ name: "", email: "", phone: "", licenseNumber: "" });
            //setShowForm(false);
            await loadDrivers();
        } catch (e) {
            setError(e.message);
        }
    };

    /* ================= EDIT ================= */

    const startEdit = (driver) => {
        setEditingDriverId(driver._id);
        setEditForm({
            name: driver.name,
            phone: driver.phone || "",
            licenseNumber: driver.licenseNumber || "",
        });
    };

    const saveEdit = async (id) => {
        await updateDriver(id, editForm);
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
        if (!confirm(`Delete driver "${driver.name}" permanently?`)) return;
        await deleteDriver(driver._id);
        await loadDrivers();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Drivers</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? "Close" : "Add Driver"}
                </button>
            </div>

            {/* Create Driver Form */}
            {showForm && (
                <div className="card">
                    <h2 className="font-semibold mb-4">Create Driver</h2>

                    {error && (
                        <div className="mb-4 text-red-600 bg-red-50 p-2 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {credentials && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-300 p-4 rounded">
                            <p className="font-semibold text-sm mb-2">
                                ⚠️ Save these credentials now (shown once)
                            </p>
                            <p className="text-sm">
                                Email: <b>{credentials.email}</b>
                            </p>
                            <p className="text-sm">
                                Password: <b>{credentials.password}</b>
                            </p>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <input
                            className="input-field"
                            placeholder="Driver Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />

                        <input
                            className="input-field"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <input
                            className="input-field"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        <input
                            className="input-field"
                            placeholder="License Number"
                            value={form.licenseNumber}
                            onChange={(e) =>
                                setForm({ ...form, licenseNumber: e.target.value })
                            }
                        />

                        <button className="btn-primary md:col-span-2">
                            Create Driver
                        </button>
                    </form>
                </div>
            )}

            {/* Driver List */}
            <div className="card">
                <h2 className="font-semibold mb-4">Driver List</h2>

                {loading ? (
                    <div>Loading...</div>
                ) : drivers.length === 0 ? (
                    <div className="text-gray-500">No drivers found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2">Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>License</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((d) => (
                                <tr key={d._id} className="border-b last:border-0">
                                    <td className="py-2">
                                        {editingDriverId === d._id ? (
                                            <input
                                                className="input-field"
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, name: e.target.value })
                                                }
                                            />
                                        ) : (
                                            d.name
                                        )}
                                    </td>

                                    <td>{d.userId?.email}</td>

                                    <td>
                                        {editingDriverId === d._id ? (
                                            <input
                                                className="input-field"
                                                value={editForm.phone}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, phone: e.target.value })
                                                }
                                            />
                                        ) : (
                                            d.phone || "—"
                                        )}
                                    </td>

                                    <td>
                                        {editingDriverId === d._id ? (
                                            <input
                                                className="input-field"
                                                value={editForm.licenseNumber}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        licenseNumber: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            d.licenseNumber || "—"
                                        )}
                                    </td>

                                    <td>
                                        <button
                                            className={
                                                d.isActive
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                            onClick={() => toggleStatus(d)}
                                        >
                                            {d.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>

                                    <td className="text-right space-x-2">
                                        {editingDriverId === d._id ? (
                                            <>
                                                <button
                                                    className="text-blue-600"
                                                    onClick={() => saveEdit(d._id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="text-gray-500"
                                                    onClick={() => setEditingDriverId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="text-blue-600"
                                                    onClick={() => startEdit(d)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-red-600"
                                                    onClick={() => removeDriver(d)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
