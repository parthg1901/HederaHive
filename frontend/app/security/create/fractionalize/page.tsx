"use client";
import { useState, useCallback } from "react";
import Header from "@/components/Header";
import { REGULATIONS } from "@/config/constants";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { PinataSDK } from "pinata-web3";
import { useRouter } from "next/navigation";
import { Status } from "@hashgraph/sdk";

interface FractionalizationState {
  details: {
    name: string;
    symbol: string;
    decimals: number;
    cadastralNumber: string;
    controllable: boolean;
    blocklistEnabled: boolean;
    approvalListEnabled: boolean;
  };
  configuration: {
    nominalValue: number;
    rentalIncome: number;
    estimatedValue: number;
    currency: string;
    numberOfShares: number;
    totalValue: number;
  };
  estate: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    type: "Residential" | "Commercial" | "Industrial" | "Agricultural";
    description: string;
  };
  regulation: {
    jurisdiction: string;
    regulationType: string;
    regulationSubType: string;
    rules: Array<{
      restriction: string;
      rule: string;
    }>;
  };
}

export default function Fractionalize() {
  const [step, setStep] = useState(1);
  const { walletInterface, accountId } = useWalletInterface();
  const router = useRouter();

  const [formState, setFormState] = useState<FractionalizationState>({
    details: {
      name: "",
      symbol: "",
      decimals: 6,
      cadastralNumber: "",
      controllable: false,
      blocklistEnabled: false,
      approvalListEnabled: false,
    },
    configuration: {
      nominalValue: 0,
      rentalIncome: 0,
      estimatedValue: 0,
      currency: "USD",
      numberOfShares: 0,
      totalValue: 0,
    },
    estate: {
      name: "",
      address: "",
      city: "",
      zipCode: "",
      type: "Residential",
      description: "",
    },
    regulation: {
      jurisdiction: "United States Jurisdiction",
      regulationType: "",
      regulationSubType: "",
      rules: [],
    },
  });

  const updateFormState = useCallback(
    <K extends keyof FractionalizationState>(
      section: K,
      updates: Partial<FractionalizationState[K]>
    ) => {
      setFormState((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...updates },
      }));
    },
    []
  );

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formState.details.name &&
          formState.details.symbol &&
          formState.details.cadastralNumber &&
          formState.details.decimals > 0
        );
      case 2:
        return !!(
          formState.configuration.nominalValue > 0 &&
          formState.configuration.numberOfShares > 0
        );
      case 3:
        return !!(
          formState.estate.name &&
          formState.estate.address &&
          formState.estate.city &&
          formState.estate.zipCode
        );
      case 4:
        return !!(
          formState.regulation.regulationType &&
          formState.regulation.regulationSubType
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev < 4 ? prev + 1 : prev));
    } else {
      console.error("Please fill out all required fields");
    }
  };

  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = async () => {
    try {
      if (!validateStep(4)) {
        console.error("Please complete all steps");
        return;
      }

      const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
        pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
      });
      const metadata: any = {
        name: formState.details.name,
        description: formState.estate.description,
        image: "ipfs://bafkreigpicqb23nzryvr2kcj7vvh7xwln5nxnpxu6mmhjhapej77zl2tma",

        type: "image/jpeg",
        format: "HIP412@2.0.0",
        properties: {
          cadastral: formState.details.cadastralNumber,
          estate: {
            address: formState.estate.address,
            city: formState.estate.city,
            zipCode: formState.estate.zipCode,
            type: formState.estate.type,
          },
          regulation: {
            type: formState.regulation.regulationType,
            subtype: formState.regulation.regulationSubType,
          },
        },
        attributes: [],
      };
    
      if (formState.configuration.nominalValue) {
        metadata.attributes.push({
          trait_type: "Nominal Value",
          value: formState.configuration.nominalValue,
        });
      }
      if (formState.configuration.rentalIncome) {
        metadata.attributes.push({
          trait_type: "Rental Income",
          value: formState.configuration.rentalIncome,
        });
      }
      if (formState.configuration.estimatedValue) {
        metadata.attributes.push({
          trait_type: "Estimated Value",
          value: formState.configuration.estimatedValue,
        });
      }
      if (formState.configuration.currency) {
        metadata.attributes.push({
          trait_type: "Currency",
          value: formState.configuration.currency,
        });
      }
      if (formState.configuration.numberOfShares) {
        metadata.attributes.push({
          trait_type: "Number of Shares",
          value: formState.configuration.numberOfShares,
        });
      }
      if (formState.configuration.totalValue) {
        metadata.attributes.push({
          trait_type: "Total Value",
          value: formState.configuration.totalValue,
        });
      }
      const uploadResponse = await pinata.upload.json(metadata, {
        metadata: {
          name: `${formState.details.name} - Fractionalization Metadata`,
        }
      });

      const tokenId = await walletInterface?.createNFT(formState.details.name, formState.details.symbol, formState.configuration.numberOfShares)
      console.log("Fractionalization metadata successfully uploaded!");
      const receipt = await walletInterface?.mintNFTs(tokenId!, [Buffer.from("ipfs://"+uploadResponse.IpfsHash)]);
      if (receipt?.status === Status.Success && accountId) {
        console.log("NFT Created Successfully");

        const res = await fetch(process.env.NEXT_PUBLIC_SERVER! + "/api/v1/estate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formState.details.name,
            description: formState.estate.description,
            rental: formState.configuration.rentalIncome,
            location: formState.estate.zipCode,
            estimatedValue: formState.configuration.estimatedValue,
            owner: accountId,
            token: tokenId!.toString(),
          })
        })
        if (res.status === 201) {
          router.replace("/dashboard");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      console.error("Failed to submit fractionalization details");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepDetails
            details={formState.details}
            updateDetails={(updates) => updateFormState("details", updates)}
          />
        );
      case 2:
        return (
          <StepConfiguration
            configuration={formState.configuration}
            updateConfiguration={(updates) =>
              updateFormState("configuration", updates)
            }
          />
        );
      case 3:
        return (
          <StepEstate
            estate={formState.estate}
            updateEstate={(updates) => updateFormState("estate", updates)}
          />
        );
      case 4:
        return (
          <StepRegulation
            regulation={formState.regulation}
            updateRegulation={(updates) =>
              updateFormState("regulation", updates)
            }
          />
        );
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
        <span>Fractionalize Real Estate</span>
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
        <span className="text-gray-200">Fractionalize</span>
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
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-4 py-2 rounded-md ${
                step === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={step === 4 ? handleSubmit : nextStep}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {step === 4 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StepDetails = ({
  details,
  updateDetails,
}: {
  details: FractionalizationState["details"];
  updateDetails: (updates: Partial<FractionalizationState["details"]>) => void;
}) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">General Details</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Name*
        </label>
        <input
          type="text"
          value={details.name}
          onChange={(e) => updateDetails({ name: e.target.value })}
          placeholder="Property Security Name"
          className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Symbol*</label>
        <input
          type="text"
          value={details.symbol}
          onChange={(e) => updateDetails({ symbol: e.target.value })}
          placeholder="PROP"
          className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Decimals*</label>
        <input
          type="number"
          value={details.decimals}
          onChange={(e) =>
            updateDetails({ decimals: parseInt(e.target.value) })
          }
          placeholder="6"
          className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Cadastral/Property ID*
        </label>
        <input
          type="text"
          value={details.cadastralNumber}
          onChange={(e) => updateDetails({ cadastralNumber: e.target.value })}
          placeholder="Property Identification Number"
          className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={details.controllable}
            onChange={(e) => updateDetails({ controllable: e.target.checked })}
            className="rounded"
          />
          <span>Controllable</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={details.blocklistEnabled}
            onChange={(e) =>
              updateDetails({ blocklistEnabled: e.target.checked })
            }
            className="rounded"
          />
          <span>Blocklist</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={details.approvalListEnabled}
            onChange={(e) =>
              updateDetails({ approvalListEnabled: e.target.checked })
            }
            className="rounded"
          />
          <span>Approval List</span>
        </label>
      </div>
    </div>
  </div>
);

const StepConfiguration = ({
  configuration,
  updateConfiguration,
}: {
  configuration: FractionalizationState["configuration"];
  updateConfiguration: (
    updates: Partial<FractionalizationState["configuration"]>
  ) => void;
}) => {
  const calculateTotalValue = (shares: number, nominalValue: number) => {
    return shares * nominalValue;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nominal Value*
          </label>
          <input
            type="number"
            value={configuration.nominalValue}
            onChange={(e) => {
              const nominalValue = parseFloat(e.target.value);
              updateConfiguration({
                nominalValue,
                totalValue: calculateTotalValue(
                  configuration.numberOfShares,
                  nominalValue
                ),
              });
            }}
            placeholder="1000.00"
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Shares*
          </label>
          <input
            type="number"
            value={configuration.numberOfShares}
            onChange={(e) => {
              const shares = parseFloat(e.target.value);
              updateConfiguration({
                numberOfShares: shares,
                totalValue: calculateTotalValue(
                  shares,
                  configuration.nominalValue
                ),
              });
            }}
            placeholder="100"
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Estimated Property Value
          </label>
          <input
            type="number"
            value={configuration.estimatedValue}
            onChange={(e) =>
              updateConfiguration({
                estimatedValue: parseFloat(e.target.value),
              })
            }
            placeholder="100,000.00"
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Rental Income
          </label>
          <input
            type="number"
            value={configuration.rentalIncome}
            onChange={(e) =>
              updateConfiguration({ rentalIncome: parseFloat(e.target.value) })
            }
            placeholder="1000.00"
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Total Value</label>
          <input
            type="number"
            value={configuration.totalValue}
            disabled
            className="w-full p-2 border rounded-md bg-transparent cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

const StepEstate = ({
  estate,
  updateEstate,
}: {
  estate: FractionalizationState["estate"];
  updateEstate: (updates: Partial<FractionalizationState["estate"]>) => void;
}) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Property Details</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Estate Name*</label>
        <input
          type="text"
          placeholder="Estate Name"
          value={estate.name}
          onChange={(e) => updateEstate({ name: e.target.value })}
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Estate Address*
        </label>
        <input
          type="text"
          value={estate.address}
          onChange={(e) => updateEstate({ address: e.target.value })}
          placeholder="Estate Address"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">City*</label>
        <input
          type="text"
          value={estate.city}
          onChange={(e) => updateEstate({ city: e.target.value })}
          placeholder="City"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Zip Code*</label>
        <input
          type="number"
          value={estate.zipCode}
          onChange={(e) => updateEstate({ zipCode: e.target.value })}
          placeholder="Zip Code"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Estate Type*</label>
        <select
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => updateEstate({ type: e.target.value as any })}
        >
          <option
            selected={estate.type === "Residential"}
            value="Residential"
            className="bg-black"
          >
            Residential
          </option>
          <option
            selected={estate.type === "Commercial"}
            value="Commercial"
            className="bg-black"
          >
            Commercial
          </option>
          <option
            selected={estate.type === "Industrial"}
            value="Industrial"
            className="bg-black"
          >
            Industrial
          </option>
          <option
            selected={estate.type === "Agricultural"}
            value="Agricultural"
            className="bg-black"
          >
            Agricultural
          </option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Estate Description*
        </label>
        <textarea
          value={estate.description}
          onChange={(e) => updateEstate({ description: e.target.value })}
          placeholder="Estate Description"
          className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  </div>
);

const StepRegulation = ({
  updateRegulation,
}: {
  regulation: FractionalizationState["regulation"];
  updateRegulation: (
    updates: Partial<FractionalizationState["regulation"]>
  ) => void;
}) => {
  const [selectedReg, setSelectedReg] = useState<
    keyof typeof REGULATIONS | null
  >(null);
  const [selectedSubType, setSelectedSubType] = useState<
    keyof (typeof REGULATIONS)[keyof typeof REGULATIONS]["rules"] | ""
  >("");

  const handleRegulationChange = (e: any) => {
    setSelectedReg(e.target.value);
    updateRegulation({ regulationType: e.target.value });
    setSelectedSubType("");
    updateRegulation({ regulationSubType: "" });
  };

  const handleSubTypeChange = (e: any) => {
    setSelectedSubType(e.target.value);
    updateRegulation({ regulationSubType: e.target.value });
    if (selectedReg && selectedSubType) {
      updateRegulation({
        rules: REGULATIONS[selectedReg].rules[selectedSubType] as {
          restriction: string;
          rule: string;
        }[],
      });
    }
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
