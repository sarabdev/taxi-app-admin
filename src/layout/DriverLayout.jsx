import Sidebar from "./Sidebar";
import Header from "./Header";
import { driverMenu } from "./menu";

export default function DriverLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar title="Driver Panel" menu={driverMenu} />

            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
