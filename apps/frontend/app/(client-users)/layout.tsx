import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export default function ClientUsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />

        </div>
    );
}