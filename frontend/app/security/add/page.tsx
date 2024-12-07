import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function ImportToken() {
  return (
    <div className="px-48 py-4 font-[family-name:var(--font-geist-mono)]">
      <Header />
      <h1 className="text-2xl font-bold mb-1 flex flex-row items-center mt-16">
        <Link
          href="/dashboard"
          className="text-gray-200 hover:text-gray-300 mr-2"
        >
          <FaArrowLeft className="inline-block mr-1" />
        </Link>
        <span>Import a digital security token</span>
      </h1>
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="text-gray-200 hover:text-gray-300 mr-2"
        >
          Dashboard
        </Link>

        <span className="text-gray-400 mx-2">&gt;</span>
        <span className="text-gray-200">Import a digital security token</span>
      </div>
      <div className="flex flex-col items-center justify-center p-6 mt-8">
        <div className="w-full max-w-3xl border border-white shadow-md rounded-xl p-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add digital security</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                ID or DLT address*{" "}
                  <span className="text-red-500">(Field is mandatory)</span>
                </label>
                <input
                  type="text"
                  placeholder="0.012345"
                  className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </form>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button className={`px-4 py-2 rounded-xl bg-purple-700 text-white`}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-purple-700 text-white rounded-xl">
              Add Digital Security
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
