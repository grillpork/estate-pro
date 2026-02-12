import Analysis from "../components/Analysis";

const DashboardPage = () => {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-black text-2xl font-bold mb-4">Dashboard</h1>
      <Analysis />
    </div>
  );
};

export default DashboardPage;
