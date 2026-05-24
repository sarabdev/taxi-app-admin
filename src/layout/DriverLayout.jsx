import { useState } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { driverMenu } from "./menu";
import { NavLink } from "react-router-dom";

export default function DriverLayout({ children }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <Sidebar title="Driver Panel" menu={driverMenu} />

                {/* Mobile Sidebar Overlay */}
                {mobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setMobileSidebarOpen(false)}
                            aria-label="Close menu"
                        />

                        {/* Drawer */}
                        <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white p-4 shadow-xl">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <h2 className="break-words text-lg font-bold leading-tight text-gray-900">
                                    Driver Panel
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
                                {driverMenu.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.exact}
                                        onClick={() => setMobileSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${isActive
                                                ? "bg-primary-600 text-white shadow-sm"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        <span className="block truncate">
                                            {item.label}
                                        </span>
                                    </NavLink>
                                ))}
                            </nav>
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <Header onMenuClick={() => setMobileSidebarOpen(true)} />

                    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="mx-auto w-full max-w-7xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}