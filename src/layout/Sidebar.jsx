import { NavLink } from "react-router-dom";

export default function Sidebar({ title, menu }) {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-8">{title}</h2>

            <nav className="space-y-2">
                {menu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}   // ✅ THIS IS THE FIX
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg text-sm font-medium transition
              ${isActive
                                ? "bg-primary-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
