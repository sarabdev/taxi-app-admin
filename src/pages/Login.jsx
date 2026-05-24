import { useState } from "react";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginApi({ email, password });
            login(data);
            navigate(data.user.role === "ADMIN" ? "/admin" : "/driver");
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full rounded-2xl bg-white p-5 shadow-lg sm:p-8"
                >
                    {/* Header */}
                    <div className="mb-6 text-center sm:mb-8">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 sm:h-14 sm:w-14">
                            <Lock className="h-6 w-6 text-primary-600 sm:h-7 sm:w-7" />
                        </div>

                        <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                            Welcome Back
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Sign in to continue
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:py-3 sm:text-base"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:py-3 sm:text-base"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:text-base"
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500 sm:text-sm">
                        Admin & Driver access only
                    </div>
                </form>
            </div>
        </div>
    );
}