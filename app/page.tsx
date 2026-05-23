"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "./components/LogoutButton";

interface DashboardData {
  totalMaterials: number;
  totalInward: number;
  totalOutward: number;
  totalProjection: number;
  liveStock: number;
  openJobCards: number;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    totalMaterials: 0,
    totalInward: 0,
    totalOutward: 0,
    totalProjection: 0,
    liveStock: 0,
    openJobCards: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const result = await response.json();
      setDashboard({
        totalMaterials: Number(result?.totalMaterials || 0),
        totalInward: Number(result?.totalInward || 0),
        totalOutward: Number(result?.totalOutward || 0),
        totalProjection: Number(result?.totalProjection || 0),
        liveStock: Number(result?.liveStock || 0),
        openJobCards: Number(result?.openJobCards || 0),
      });
    } catch (error) {
      console.error(error);
    }
  }

  const cards = [
    {
      title: "Total Materials",
      value: dashboard.totalMaterials,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Total Inward",
      value: dashboard.totalInward,
      color: "from-green-500 to-green-700",
    },
    {
      title: "Total Outward",
      value: dashboard.totalOutward,
      color: "from-red-500 to-red-700",
    },
    {
      title: "Open Job Cards",
      value: dashboard.openJobCards,
      color: "from-orange-500 to-orange-700",
    },
    {
      title: "Live Stock",
      value: dashboard.liveStock,
      color: "from-purple-500 to-fuchsia-700",
    },
  ];

  const modules = [
    {
      title: "CAT Master",
      description: "Manage Material Master Data",
      link: "/cat-master",
    },
    {
      title: "Inward Entry",
      description: "Add Incoming Material Stock",
      link: "/inward",
    },
    {
      title: "Outward Entry",
      description: "Issue Material Stock",
      link: "/outward",
    },
    {
      title: "Job Cards",
      description: "Raise and Issue Material Requests",
      link: "/job-cards",
    },
    {
      title: "Live Stock",
      description: "Real-Time Stock Monitoring",
      link: "/live-stock",
    },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Inventory Dashboard</h1>
          <p className="text-gray-600 text-lg">Live Inventory Monitoring System</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${card.color} text-white rounded-xl shadow-md p-4`}
          >
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-3xl font-bold">{Number(card.value || 0)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {modules.map((module, index) => (
          <Link key={index} href={module.link}>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 p-6 cursor-pointer h-full">
              <h2 className="text-2xl font-bold mb-3">{module.title}</h2>
              <p className="text-gray-600 text-base">{module.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}