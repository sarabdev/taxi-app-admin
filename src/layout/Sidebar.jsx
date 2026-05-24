import { NavLink } from "react-router-dom";

export default function Sidebar({ title, menu }) {
    return (
        <aside className="hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white p-4 lg:sticky lg:top-0 lg:block lg:p-6">
            <div className="flex h-full flex-col">
                <div className="mb-6">
                    <h2 className="break-words text-lg font-bold leading-tight text-gray-900 xl:text-xl">
                        {title}
                    </h2>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {menu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
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
            </div>
        </aside>
    );
}