export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>
    <div>
        <h1 className="text-blue-400">About Layout</h1>
    </div>
    {children}
    </div>;
}
