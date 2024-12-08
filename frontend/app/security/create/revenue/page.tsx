"use client";
import Header from "@/components/Header";
import { REGULATIONS } from "@/config/constants";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function Revenue() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => (prev < 5 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepDetails />;
      case 2:
        return <StepConfiguration />;
      case 3:
        return <StepEstate />;
      case 4:
        return <StepRegulation />;
      default:
        return null;
    }
  };

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
        <span>Shared Revenue</span>
      </h1>
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="text-gray-200 hover:text-gray-300 mr-2"
        >
          Dashboard
        </Link>
        <span className="text-gray-400 mx-2">&gt;</span>
        <Link
          href="/security/create"
          className="hover:text-gray-300 text-gray-200"
        >
          Create a digital security
        </Link>

        <span className="text-gray-400 mx-2">&gt;</span>
        <span className="text-gray-200">Revenue</span>
      </div>
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl border border-white shadow-md rounded-xl p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {["Details", "Configuration", "Coupon", "Regulation"].map(
              (label, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center w-full"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === index + 1
                        ? "bg-purple-700 text-white"
                        : step > index + 1
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div
                    className={`h-1 flex-grow ${
                      step > index + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              )
            )}
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              className={`px-4 py-2 rounded-xl ${
                step === 1
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : "bg-purple-700 text-white"
              }`}
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-purple-700 text-white rounded-xl"
              onClick={nextStep}
            >
              {step === 4 ? "Submit" : "Next step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StepDetails = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">General Details</h2>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Name* <span className="text-red-500">(Field is mandatory)</span>
        </label>
        <input
          type="text"
          placeholder="Enter name"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Symbol*</label>
        <input
          type="text"
          placeholder="Enter Symbol"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Decimals*</label>
        <input
          type="number"
          placeholder="6"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Cadastral/Property Identification Number*
        </label>
        <input
          type="text"
          placeholder="12345-6789"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="h-4 w-4" />
          <span>Controllable</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="h-4 w-4" />
          <span>Blocklist</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="h-4 w-4" />
          <span>Approval list</span>
        </label>
      </div>
    </form>
  </div>
);

const StepConfiguration = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Configuration</h2>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nominal value*</label>
        <input
          type="number"
          placeholder="1000.00"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Property Rental Income*
        </label>
        <input
          type="number"
          placeholder="1000.00"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <input
          type="string"
          placeholder="USD"
          value="USD"
          disabled
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">No. of shares*</label>
        <input
          type="number"
          placeholder="100.00"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Total Value*</label>
        <input
          type="number"
          placeholder="100,000.00"
          disabled
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-not-allowed"
        />
      </div>
    </form>
  </div>
);

const StepEstate = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Property Details</h2>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Estate Name*</label>
        <input
          type="text"
          placeholder="Estate Name"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Estate Address*
        </label>
        <input
          type="text"
          placeholder="Estate Address"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">City*</label>
        <input
          type="text"
          placeholder="City"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Zip Code*</label>
        <input
          type="number"
          placeholder="Zip Code"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Estate Type*</label>
        <select className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="Residential" className="bg-black">
            Residential
          </option>
          <option value="Commercial" className="bg-black">
            Commercial
          </option>
          <option value="Industrial" className="bg-black">
            Industrial
          </option>
          <option value="Agricultural" className="bg-black">
            Agricultural
          </option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Estate Description*
        </label>
        <textarea
          placeholder="Estate Description"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </form>
  </div>
);

const StepRegulation = () => {
  const [selectedReg, setSelectedReg] = useState<
    keyof typeof REGULATIONS | null
  >(null);
  const [selectedSubType, setSelectedSubType] = useState<
    keyof (typeof REGULATIONS)[keyof typeof REGULATIONS]["rules"] | ""
  >("");

  const handleRegulationChange = (e: any) => {
    setSelectedReg(e.target.value);
    setSelectedSubType("");
  };

  const handleSubTypeChange = (e: any) => {
    setSelectedSubType(e.target.value);
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Regulation</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Jurisdiction</label>
          <input
            type="text"
            placeholder="Jusicdiction"
            value="United States Jurisdiction"
            disabled
            className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Regulation Type*
          </label>
          <select
            className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={handleRegulationChange}
            defaultValue=""
          >
            <option value="" disabled selected className="bg-black">
              Select Regulation
            </option>
            {Object.entries(REGULATIONS).map(([reg, details]) => (
              <option key={reg} value={reg} className="bg-black">
                {details.name}
              </option>
            ))}
          </select>
        </div>
        {selectedReg && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Regulation Sub Type*
            </label>
            <select
              className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleSubTypeChange}
              defaultValue=""
            >
              <option value="" selected className="bg-black">
                Select Regulation Sub Type
              </option>
              {REGULATIONS[selectedReg].subtypes.map((subType) => (
                <option key={subType} value={subType} className="bg-black">
                  {subType}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedReg && selectedSubType && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Rules</h3>
            <ul className="list-disc pl-4">
              {(
                REGULATIONS[selectedReg].rules[selectedSubType] as {
                  restriction: string;
                  rule: string;
                }[]
              ).map(({ restriction, rule }) => (
                <li key={restriction}>
                  <span className="font-semibold">{restriction}:</span> {rule}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};