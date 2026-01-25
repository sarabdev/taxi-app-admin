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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-lg p-8"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Sign in to continue
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                placeholder="admin@example.com"
                                className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500">
                        Admin & Driver access only
                    </div>
                </form>
            </div>
        </div>
    );
}
