import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";

export default function ClientUsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0f]">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <ConditionalFooter />
        </div>
    );
}