// pages/create-digital-security.js
import Header from "@/components/Header";
import Link from "next/link";
import { FaMoneyBillAlt, FaChartLine, FaArrowLeft } from "react-icons/fa";

const CreateDigitalSecurity = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto mt-14 py-8 font-[family-name:var(--font-geist-mono)] w-full">
        <h1 className="text-2xl font-bold mb-1 flex flex-row items-center">
          <Link
            href="/dashboard"
            className="text-gray-200 hover:text-gray-300 mr-2"
          >
            <FaArrowLeft className="inline-block mr-1" />
          </Link>
          <span>
            Create a Digital Security
          </span>
        </h1>
        <div className="flex items-center mb-16">
          <Link
            href="/dashboard"
            className="text-gray-200 hover:text-gray-300 mr-2"
          >
            Dashboard
          </Link>
          <span className="text-gray-400 mx-2">&gt;</span>
          <span className="text-gray-200">Create a digital security</span>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">
          Tokenize your real estate.
        </h1>
        <p className="text-gray-200 mb-8 text-center">
          Choose the type of digital security to start the process.
        </p>

        <div className="grid grid-cols-2 gap-4 w-1/2 justify-center mx-auto">
          <Link href="/security/create/revenue" className="shadow-md rounded-xl overflow-hidden border border-white">
            <div className="bg-purple-700 px-4 py-3 flex items-center justify-center">
              <FaMoneyBillAlt className="text-4xl text-primary" />
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-lg font-medium mb-2">Revenue-Share</h3>
              <p className="text-gray-200">
                Tokenize your real estate and share rental income with token
                holders.
              </p>
            </div>
          </Link>

          <Link href="/security/create/fractionalize" className="border border-white shadow-md rounded-xl overflow-hidden">
            <div className="bg-purple-700 px-4 py-3 flex items-center justify-center">
              <FaChartLine className="text-4xl text-primary" />
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-lg font-medium mb-2">Fractional Ownership</h3>
              <p className="text-gray-200">
                Offer fractional ownership of your property through tokens and
                share the rental income.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateDigitalSecurity;
