import { useAuth } from "../auth/AuthContext";

export default function Header({ onMenuClick }) {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
            {/* Left Side */}
            <div className="flex min-w-0 items-center gap-3">
                {/* Mobile Menu Button */}
                {onMenuClick && (
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden"
                        aria-label="Open menu"
                    >
                        ☰
                    </button>
                )}

                <div className="min-w-0">
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Welcome
                    </p>

                    <p className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                        {user?.email || "User"}
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <button
                type="button"
                onClick={logout}
                className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:px-4"
            >
                Logout
            </button>
        </header>
    );
}