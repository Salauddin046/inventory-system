"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {

  const [dashboard, setDashboard] =
    useState({

      totalMaterials: 0,

      totalInward: 0,

      totalOutward: 0,

      totalProjection: 0,

      liveStock: 0

    });

  useEffect(() => {

    fetchDashboard();

  }, []);

  async function fetchDashboard() {

    try {

      const response =
        await fetch(
          "/api/dashboard",
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      setDashboard({

        totalMaterials:
          Number(
            result?.totalMaterials || 0
          ),

        totalInward:
          Number(
            result?.totalInward || 0
          ),

        totalOutward:
          Number(
            result?.totalOutward || 0
          ),

        totalProjection:
          Number(
            result?.totalProjection || 0
          ),

        liveStock:
          Number(
            result?.liveStock || 0
          )

      });

    } catch (error) {

      console.log(error);

    }

  }

  const cards = [

    {
      title: "Total Materials",
      value:
        dashboard.totalMaterials,
      color:
        "from-blue-500 to-indigo-600"
    },

    {
      title: "Total Inward",
      value:
        dashboard.totalInward,
      color:
        "from-green-500 to-green-700"
    },

    {
      title: "Total Outward",
      value:
        dashboard.totalOutward,
      color:
        "from-red-500 to-red-700"
    },

    {
      title: "Projection Qty",
      value:
        dashboard.totalProjection,
      color:
        "from-yellow-500 to-yellow-700"
    },

    {
      title: "Live Stock",
      value:
        dashboard.liveStock,
      color:
        "from-purple-500 to-fuchsia-700"
    }

  ];

  const modules = [

    {
      title: "CAT Master",
      description:
        "Manage Material Master Data",
      link: "/cat-master"
    },

    {
      title: "Inward Entry",
      description:
        "Add Incoming Material Stock",
      link: "/inward"
    },

    {
      title: "Outward Entry",
      description:
        "Issue Material Stock",
      link: "/outward"
    },

    {
      title: "Projection Upload",
      description:
        "Upload Projection Data",
      link: "/projection-upload"
    },

    {
      title: "Projection Planning",
      description:
        "Allocate & Issue Projection",
      link: "/projection"
    },

    {
      title: "Live Stock",
      description:
        "Real-Time Stock Monitoring",
      link: "/live-stock"
    }

  ];

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-5xl font-bold mb-2">
        Inventory Dashboard
      </h1>

      <p className="text-gray-600 mb-10 text-xl">
        Live Inventory Monitoring System
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

        {cards.map(
          (card, index) => (

            <div
              key={index}
              className={`
                bg-gradient-to-r
                ${card.color}
                text-white
                rounded-2xl
                shadow-lg
                p-6
              `}
            >

              <h2 className="text-2xl font-semibold mb-4">
                {card.title}
              </h2>

              <p className="text-5xl font-bold">

                {Number(
                  card.value || 0
                )}

              </p>

            </div>

          )
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {modules.map(
          (module, index) => (

            <Link
              key={index}
              href={module.link}
            >

              <div
                className="
                  bg-white
                  rounded-2xl
                  shadow-md
                  hover:shadow-xl
                  transition
                  duration-300
                  p-8
                  cursor-pointer
                "
              >

                <h2 className="text-4xl font-bold mb-4">
                  {module.title}
                </h2>

                <p className="text-gray-600 text-xl">
                  {
                    module.description
                  }
                </p>

              </div>

            </Link>

          )
        )}

      </div>

    </div>

  );

}