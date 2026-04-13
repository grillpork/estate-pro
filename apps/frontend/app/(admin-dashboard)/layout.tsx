import SideBar from "./components/layout/SideBar";
import AdminNavbar from "./components/layout/AdminNavbar";
import { SidebarProvider } from "./components/context/SidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden">
        <SideBar />
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <AdminNavbar />
          <main className="flex-1 overflow-auto bg-[#0F0F12]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
