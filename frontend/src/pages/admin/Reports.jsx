import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import toast from "react-hot-toast";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pending: 0,
    assigned: 0,
    completed: 0,
    total: 0,
  });

  // Fetch real metrics from Django backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          "http://127.0.0.1:8000/api/users/custom-admin/reports/job-metrics/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const data = await response.json();
        setMetrics(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching report metrics:", error);
        toast.error("Failed to load report data");
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Handle CSV Export
  const handleExportCSV = () => {
    try {
      const csvHeaders = "Status,Count\n";
      const csvRows = `Pending,${metrics.pending}\nAssigned,${metrics.assigned}\nCompleted,${metrics.completed}\nTotal,${metrics.total}\n`;

      const csvContent = "data:text/csv;charset=utf-8," + csvHeaders + csvRows;
      const encodedUri = encodeURI(csvContent);

      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `RecycleTrack_Job_Report_${new Date().toLocaleDateString()}.csv`,
      );
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  // Vibrant Green-Themed Chart Data
  const doughnutData = {
    labels: ["Pending", "Assigned", "Completed"],
    datasets: [
      {
        data: [metrics.pending, metrics.assigned, metrics.completed],
        // Vibrant Lime, Bright Emerald, Rich Green
        backgroundColor: ["#84cc16", "#10b981", "#22c55e"],
        hoverBackgroundColor: ["#65a30d", "#059669", "#16a34a"],
        borderWidth: 3,
        borderColor: "#ffffff", // Adds a crisp white separator between segments
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            System Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of collection jobs and system performance.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-green-200 transition duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Jobs",
            value: metrics.total,
            borderColor: "border-teal-500",
            bgColor: "bg-teal-50 dark:bg-teal-900/20",
            textColor: "text-teal-700 dark:text-teal-400",
            titleColor: "text-teal-600/80 dark:text-teal-500",
          },
          {
            title: "Pending Jobs",
            value: metrics.pending,
            borderColor: "border-lime-500",
            bgColor: "bg-lime-50 dark:bg-lime-900/20",
            textColor: "text-lime-700 dark:text-lime-400",
            titleColor: "text-lime-600/80 dark:text-lime-500",
          },
          {
            title: "Assigned Jobs",
            value: metrics.assigned,
            borderColor: "border-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-emerald-700 dark:text-emerald-400",
            titleColor: "text-emerald-600/80 dark:text-emerald-500",
          },
          {
            title: "Completed Jobs",
            value: metrics.completed,
            borderColor: "border-green-500",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-700 dark:text-green-400",
            titleColor: "text-green-600/80 dark:text-green-500",
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} backdrop-blur-md p-6 rounded-2xl shadow-sm border-l-4 ${card.borderColor} transition-transform hover:-translate-y-1 duration-300`}
          >
            <h3
              className={`text-sm font-bold uppercase tracking-wider ${card.titleColor}`}
            >
              {card.title}
            </h3>
            <p className={`text-4xl font-extrabold mt-2 ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            Job Distribution
          </h2>
          <div className="h-72 flex justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                maintainAspectRatio: false,
                cutout: "70%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        family: "'Inter', sans-serif",
                        weight: "bold",
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Text Summary */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            Performance Insights
          </h2>
          <div className="space-y-6 text-lg">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The system is currently tracking a total of{" "}
              <span className="font-extrabold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-lg">
                {metrics.total}
              </span>{" "}
              jobs across all regions.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Currently,{" "}
              <span className="font-extrabold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                {metrics.total > 0
                  ? Math.round((metrics.completed / metrics.total) * 100)
                  : 0}
                %
              </span>{" "}
              of all requested jobs have been successfully completed and
              processed.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              There are{" "}
              <span className="font-extrabold text-lime-600 bg-lime-50 dark:bg-lime-900/30 px-2 py-1 rounded-lg">
                {metrics.pending}
              </span>{" "}
              pending pickups that still require assignment to the fleet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
