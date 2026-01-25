import { useAuth } from "../auth/AuthContext";

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="font-semibold text-gray-800">
                Welcome, {user.email}
            </div>

            <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
            >
                Logout
            </button>
        </header>
    );
}
