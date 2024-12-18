"use client";

import Header from "@/components/Header";
import { approximateCoordinates } from "@/utils/location";
import mapboxgl from "mapbox-gl";
import mapboxSdk from "@mapbox/mapbox-sdk";
import mapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { FaHouseUser } from "react-icons/fa";

import * as ReactDOM from "react-dom/client";
import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";
import { AccountId, ContractId } from "@hashgraph/sdk";
import { Interface } from "@ethersproject/abi";
import Link from "next/link";
import { PiPlusBold } from "react-icons/pi";
import CreateHiveModal from "@/components/HiveModal";
import Chatroom from "@/components/Chat";

interface IEstate {
  id: string;
  name: string;
  description: string;
  rental: number;
  estimatedValue: number | undefined;
  token: string;
  owner: string;
  zip: string;
  channel: string;
}

export interface IHive {
  name: string;
  channelId: string;
  totalParticipants: number;
  participantHBARBalance: number;
  participants: string[];
  topicId: string;
}

const CustomHouseMarker = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className="cursor-pointer hover:scale-110 transition-transform"
      onClick={onClick}
    >
      <FaHouseUser
        size={40}
        className="text-gray-200 bg-gray-600 rounded-full p-2 shadow-lg"
      />
    </div>
  );
};

const Home = () => {
  const [showHouseDetails, setShowHouseDetails] = useState(false);
  const [estates, setEstates] = useState<IEstate[]>([]);
  const [selectedEstate, setSelectedEstate] = useState<IEstate | null>(null);
  const { accountId, walletInterface } = useWalletInterface();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker[]>([]);
  const [hives, setHives] = useState<IHive[]>([]);
  const [hiveModal, setHiveModal] = useState(false);
  const [selectHive, selectedHive] = useState<IHive | null>(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER! + "/api/v1/estate/")
      .then((res) => res.json())
      .then((data) =>
        setEstates(
          data.map((estate: any) => ({
            id: estate._id,
            name: estate.name,
            description: estate.description,
            rental: estate.rental,
            estimatedValue: estate.estimatedValue,
            token: estate.token,
            zip: estate.location,
            owner: estate.owner,
            channel: estate.channel,
          }))
        )
      );
  }, []);

  useEffect(() => {
    if (accountId) {
      fetch(
        process.env.NEXT_PUBLIC_SERVER! +
          "/api/v1/channel/getChannelByParticipant/" +
          AccountId.fromString(accountId).toSolidityAddress()
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setHives(
            data.channels.map((hive: any) => ({
              name: hive.name,
              channelId: hive.channelId,
              totalParticipants: hive.totalParticipants,
              participantHBARBalance: hive.participantHBARBalance,
              participants: hive.participants,
              topicId: hive.topicId
            }))
          );
        });
    }
  }, [walletInterface]);
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

        const mapboxClient = mapboxSdk({
          accessToken: mapboxgl.accessToken,
        });

        const geocodingService = mapboxGeocoding(mapboxClient);

        map.current = new mapboxgl.Map({
          style: "mapbox://styles/mapbox/dark-v11",
          container: mapContainer.current!,
          center: approximateCoordinates(
            position.coords.latitude,
            position.coords.longitude
          ),
          zoom: 13,
        });

        estates.map((estate) => {
          geocodingService
            .forwardGeocode({
              query: estate.zip,
              autocomplete: false,
              limit: 1,
            })
            .send()
            .then((response: any) => {
              if (
                !response.body ||
                !response.body.features ||
                !response.body.features.length
              ) {
                console.error("Invalid response:", response);
                return;
              }

              const feature = response.body.features[0];
              const markerElement = document.createElement("div");

              const root = ReactDOM.createRoot(markerElement);
              root.render(
                <React.StrictMode>
                  <CustomHouseMarker
                    onClick={() => {
                      setSelectedEstate(estate);
                      if (showHouseDetails) {
                        map.current?.dragPan.enable();
                        map.current?.touchZoomRotate.enable();
                        map.current?.scrollZoom.enable();
                      } else {
                        map.current?.setCenter(
                          approximateCoordinates(
                            feature.center[1],
                            feature.center[0]
                          )
                        );
                        map.current?.dragPan.disable();
                        map.current?.touchZoomRotate.disable();
                        map.current?.scrollZoom.disable();
                      }

                      setShowHouseDetails((prevState) => !prevState);
                    }}
                  />
                </React.StrictMode>
              );
              markerRef.current.push(
                new mapboxgl.Marker(markerElement)
                  .setLngLat(
                    approximateCoordinates(feature.center[1], feature.center[0])
                  )
                  .addTo(map.current!)
              );
              map.current!.on("zoom", () => {
                const currentZoom = map.current?.getZoom() || 0;

                if (markerRef.current) {
                  if (currentZoom > 12) {
                    markerRef.current.forEach(
                      (marker) => (marker.getElement().style.display = "block")
                    );
                  } else {
                    markerRef.current.forEach(
                      (marker) => (marker.getElement().style.display = "none")
                    );
                  }
                }
              });
            })
            .catch((error: any) => {
              console.error("Geocoding error:", error);
            });
        });
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [estates]);

  const createHive = async (
    channelName: string,
    participants: string[],
    hbarDeposit: number
  ) => {
    if (walletInterface) {
      const closer = AccountId.fromString(
        process.env.NEXT_PUBLIC_SUPPLY_KEY_ID!
      ).toSolidityAddress();
      const accountIdEVM = AccountId.fromString(accountId).toSolidityAddress();

      const params = {
        participants: [...participants, closer, accountIdEVM],
        closer: closer,
        tokens: [],
        tokenAmounts: [],
        nftTokens: [],
        serialNumbers: [],
      };

      const abi = [
        "function openChannel(address[] participants, address closer, address[] tokens, uint256[] tokenAmounts, address[] nftTokens, int64[][] serialNumbers) external payable",
      ];

      const iface = new Interface(abi);

      const data = iface
        .encodeFunctionData("openChannel", [
          params.participants,
          params.closer,
          params.tokens,
          params.tokenAmounts,
          params.nftTokens,
          params.serialNumbers,
        ])
        .slice(2);
      const tx = await walletInterface.executeContractFunction(
        ContractId.fromString("0.0.5268920"),
        Buffer.from(data, "hex"),
        500000,
        hbarDeposit
      );
      const logs = await walletInterface.getEventsFromRecord(tx);
      const topicId = await walletInterface.createHCSTopic();
      await fetch(process.env.NEXT_PUBLIC_SERVER! + "/api/v1/channel/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: channelName,
          channelId: logs[0].args[0].toString(),
          topicId,
          participants: params.participants,
          closer: params.closer,
          tokens: params.tokens,
          tokenAmounts: params.tokenAmounts,
          nftTokens: params.nftTokens,
          serialNumbers: params.serialNumbers,
          hbarDeposit: hbarDeposit,
          creator: accountIdEVM,
          estateId: selectedEstate?.id,
        }),
      });

      setHives((prevState) => [
        ...prevState,
        {
          name: channelName,
          channelId: logs[0].args[0].toString(),
          totalParticipants: params.participants.length,
          participantHBARBalance: hbarDeposit,
          participants: params.participants,
          topicId,
        },
      ]);
      setShowHouseDetails(false);
      setSelectedEstate(null);

      map.current?.dragPan.enable();
      map.current?.touchZoomRotate.enable();
      map.current?.scrollZoom.enable();
    }
  };

  return (
    <div className="flex flex-row font-[family-name:var(--font-geist-mono)]">
      {/* Map Section */}
      <div className="pt-[10px] w-[70vw] h-screen" ref={mapContainer}>
        <Header />
      </div>

      {/* Sidebar Section */}
      {!selectHive && (
        <div className="w-[30vw] h-screen border-l border-gray-700 text-gray-200 p-6 shadow-2xl">
          {/* Sidebar Header */}
          <div className="mb-6 border-b border-gray-700 pb-4 flex flex-row justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-100 tracking-wide">
              {showHouseDetails ? "Estate Details" : "Your Hives"}
            </h1>
            <div className="flex flex-row gap-4">
              <button
                className="rounded-xl bg-purple-600 p-2"
                onClick={() => setHiveModal(true)}
              >
                <PiPlusBold size={20} />
              </button>
              <Link
                href={"/dashboard"}
                className="bg-purple-600 rounded-xl px-3 py-2"
              >
                Your Securities
              </Link>
            </div>
          </div>

          {showHouseDetails && selectedEstate ? (
            <div className="flex flex-col space-y-6">
              {/* Back Button */}
              <button
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition mb-6"
                onClick={() => {
                  setShowHouseDetails(false);
                  setSelectedEstate(null);

                  map.current?.dragPan.enable();
                  map.current?.touchZoomRotate.enable();
                  map.current?.scrollZoom.enable();
                }}
              >
                <IoChevronBackCircleOutline size={25} />
                Back
              </button>

              {/* Estate Details */}
              <div className="bg-[#2c2c2c] p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">
                  {selectedEstate.name}
                </h2>
                <p className="text-gray-400 mb-4">
                  {selectedEstate.description}
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-300">
                      Rental Income
                    </span>
                    <span>${selectedEstate.rental}</span>
                  </p>
                  <p className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-300">
                      Estimated Value
                    </span>
                    <span>${selectedEstate.estimatedValue}</span>
                  </p>
                  <p className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-300">
                      NFT Collection Address
                    </span>
                    <span>{selectedEstate.token}</span>
                  </p>
                  <p className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-300">Owner</span>
                    <span>{selectedEstate.owner}</span>
                  </p>
                  <p className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-300">
                      Area Postal Code
                    </span>
                    <span>{selectedEstate.zip}</span>
                  </p>
                </div>
              </div>
              {accountId === selectedEstate.owner ? (
                <button
                  className="bg-purple-600 w-full rounded-xl p-2"
                  onClick={async () => {
                    const participants: string[] = [];
                    await createHive(
                      selectedEstate.name + "'s Hive",
                      participants,
                      0
                    );
                  }}
                >
                  Create Hive
                </button>
              ) : (
                <button className="bg-purple-600 w-full rounded-xl p-2">
                  Request to Join Hive
                </button>
              )}
              <button className="border border-purple-600 w-full rounded-xl p-2">
                Pay Rent
              </button>
            </div>
          ) : hives.length === 0 ? (
            <div className="flex items-center justify-center text-gray-500">
              Create a hive to get started.
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              {hives.map((hive) => (
                <div
                  key={hive.channelId}
                  className="bg-[#2c2c2c] p-6 rounded-lg shadow cursor-pointer"
                  onClick={() => selectedHive(hive)}
                >
                  <h2 className="text-2xl font-bold text-gray-100 mb-2">
                    {hive.name}
                  </h2>
                  <p className="text-gray-400 mb-4">
                    {hive.totalParticipants} Participants
                  </p>
                  <p className="text-gray-400 mb-4">
                    HCS Topic - {hive.topicId}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center justify-between w-full">
                      <span className="font-semibold text-gray-300">
                        Your Balance
                      </span>
                      <span>{hive.participantHBARBalance} ℏ</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {hiveModal && (
        <CreateHiveModal
          onClose={() => setHiveModal(false)}
          onSubmit={createHive}
        />
      )}
      {selectHive && (
        <Chatroom
          hive={selectHive}
          onClose={() => selectedHive(null)}
        />
      )}
    </div>
  );
};

export default Home;
