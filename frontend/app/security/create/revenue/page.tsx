"use client";
import Header from "@/components/Header";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function MultiStepForm() {
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
        return <StepCoupon />;
      case 4:
        return <StepRegulation />;
      case 5:
        return <StepReview />;
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
            {["Details", "Configuration", "Coupon", "Regulation", "Review"].map(
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
              {step === 5 ? "Submit" : "Next step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StepDetails = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Bond details</h2>
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
    <p>Configuration step content goes here.</p>
  </div>
);

const StepCoupon = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Coupon</h2>
    <p>Coupon step content goes here.</p>
  </div>
);

const StepRegulation = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Regulation</h2>
    <p>Regulation step content goes here.</p>
  </div>
);

const StepReview = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Review</h2>
    <p>Review step content goes here.</p>
  </div>
);
