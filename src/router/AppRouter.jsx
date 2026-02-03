import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminLayout from "../layout/AdminLayout";
import DriverLayout from "../layout/DriverLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import DriverDashboard from "../pages/driver/DriverDashboard";
import Bookings from "../pages/admin/Bookings";
import Wallet from "../pages/driver/Wallet";
import Payouts from "../pages/admin/Payouts";
import DriverPayouts from "../pages/driver/Payouts";
import Drivers from "../pages/admin/Drivers";
import DriverBookings from "../pages/driver/Bookings";
import Cars from "../pages/admin/Cars";
import Coupons from "../pages/admin/Coupons";
import BookingDetails from "../pages/admin/BookingDetails";
import Earnings from "../pages/admin/Earnings";
import DriverLedger from "../pages/admin/DriverLedger";
import Dashboard from "../pages/admin/Dashboard";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />

            <Route path="/login" element={<Login />} />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/bookings"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Bookings />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/cars"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Cars />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Dashboard />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />


            <Route
                path="/admin/coupons"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Coupons />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/driver/bookings"
                element={
                    <ProtectedRoute role="DRIVER">
                        <DriverLayout>
                            <DriverBookings />
                        </DriverLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/earnings"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Earnings />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/earnings/:driverId"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <DriverLedger />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/bookings/:id"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <BookingDetails />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/drivers"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Drivers />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/driver/wallet"
                element={
                    <ProtectedRoute role="DRIVER">
                        <DriverLayout>
                            <Wallet />
                        </DriverLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/driver"
                element={
                    <ProtectedRoute role="DRIVER">
                        <DriverLayout>
                            <DriverDashboard />
                        </DriverLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/driver/payouts"
                element={
                    <ProtectedRoute role="DRIVER">
                        <DriverLayout>
                            <DriverPayouts />
                        </DriverLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/cars"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Cars />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/payouts"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <Payouts />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}
