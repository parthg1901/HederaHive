"use client";
import Header from "@/components/Header";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  const [isHolderOpen, setIsHolderOpen] = useState(true);

  return (
    <div className="py-6 px-10 min-h-screen font-[family-name:var(--font-geist-mono)]">
      <Header />
      <div className="px-8">
        <div className="flex justify-between items-center mb-6 mt-14">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-purple-100 border border-purple-700 rounded-xl">
              + Import a digital security token
            </button>
            <Link href={"/security/create"} className="px-4 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-600">
              Create new digital security
            </Link>
          </div>
        </div>

        {/* Admin Section */}
        <div className="mb-8 border border-white rounded-xl">
          <div className="flex justify-between items-center p-6 bg-purple-700 rounded-xl">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setIsAdminOpen(!isAdminOpen)}
            >
              <h2 className="text-lg font-medium mr-2">Admin</h2>
              <span
                className={`transform transition-transform ${
                  isAdminOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </div>
            <button className="text-sm text-white hover:underline">
              See all
            </button>
          </div>
          {isAdminOpen && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-purple-700 border-dashed rounded flex items-center justify-center h-48">
                  <button className="text-white">
                    + Add your Favorite
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Holder Section */}
        <div className="mb-8 border border-white rounded-xl">
            <div className="flex justify-between items-center p-6 bg-purple-700 rounded-xl">
                <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsHolderOpen(!isHolderOpen)}
                >
                <h2 className="text-lg font-medium mr-2">Holder</h2>
                <span
                    className={`transform transition-transform ${
                    isHolderOpen ? "rotate-180" : "rotate-0"
                    }`}
                >
                    ▼
                </span>
                </div>
                <button className="text-sm text-white hover:underline">
                See all
                </button>
            </div>
            {isHolderOpen && (
                <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-purple-700 border-dashed rounded flex items-center justify-center h-48">
                    <button className="text-white">
                        + Add your Favorite
                    </button>
                    </div>
                </div>
                </div>
            )}
            </div>
      </div>
    </div>
  );
}
