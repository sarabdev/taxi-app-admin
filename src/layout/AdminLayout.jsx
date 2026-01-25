import Sidebar from "./Sidebar";
import Header from "./Header";
import { adminMenu } from "./menu";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar title="Admin Panel" menu={adminMenu} />

            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
