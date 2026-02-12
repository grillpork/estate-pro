import SideBar from "./components/layout/SideBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen">
      <div className="flex h-full">
        <SideBar />
        <main className="flex-1 p-4 h-full overflow-auto bg-sky-100/50">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
