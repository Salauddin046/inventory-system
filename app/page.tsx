"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {

  const [stats, setStats] =
    useState({

      totalMaterials: 0,

      totalInward: 0,

      totalOutward: 0,

      totalProjection: 0,

      totalLiveStock: 0

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

      setStats(result);

    } catch (error) {

      console.log(error);

    }

  }

  const cards = [

    {
      title: "Total Materials",
      value:
        stats.totalMaterials,
      color:
        "bg-blue-600"
    },

    {
      title: "Total Inward",
      value:
        stats.totalInward,
      color:
        "bg-green-600"
    },

    {
      title: "Total Outward",
      value:
        stats.totalOutward,
      color:
        "bg-red-600"
    },

    {
      title: "Projection Qty",
      value:
        stats.totalProjection,
      color:
        "bg-yellow-500"
    },

    {
      title: "Live Stock",
      value:
        stats.totalLiveStock,
      color:
        "bg-purple-600"
    }

  ];

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Inventory Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Live Inventory Monitoring System
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">

        {cards.map(
          (
            card,
            index
          ) => (

            <div
              key={index}
              className={`${card.color} text-white rounded-xl shadow-lg p-6`}
            >

              <h2 className="text-lg font-semibold">
                {card.title}
              </h2>

              <p className="text-3xl font-bold mt-4">
                {card.value}
              </p>

            </div>

          )
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Link
          href="/cat-master"
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
        >

          <h2 className="text-2xl font-bold mb-2">
            CAT Master
          </h2>

          <p className="text-gray-600">
            Manage Material Master Data
          </p>

        </Link>

        <Link
          href="/inward"
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
        >

          <h2 className="text-2xl font-bold mb-2">
            Inward Entry
          </h2>

          <p className="text-gray-600">
            Add Incoming Material Stock
          </p>

        </Link>

        <Link
          href="/outward"
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
        >

          <h2 className="text-2xl font-bold mb-2">
            Outward Entry
          </h2>

          <p className="text-gray-600">
            Issue Material Stock
          </p>

        </Link>

        <Link
          href="/projection-upload"
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
        >

          <h2 className="text-2xl font-bold mb-2">
            Projection Upload
          </h2>

          <p className="text-gray-600">
            Upload Projection Data
          </p>

        </Link>

        <Link
          href="/projection"
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
        >

          <h2 className="text-2xl font-bold mb-2">
            Projection Planning
          </h2>

          <p className="text-gray-600">
            Allocate & Issue Projection
          </p>

        </Link>

        <Link
          href="/live-stock"
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
        >

          <h2 className="text-2xl font-bold mb-2">
            Live Stock
          </h2>

          <p className="text-gray-600">
            Real-Time Stock Monitoring
          </p>

        </Link>

      </div>

    </div>

  );

}