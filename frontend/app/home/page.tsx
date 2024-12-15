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

interface IEstate {
  name: string;
  description: string;
  rental: number;
  estimatedValue: number | undefined;
  token: string;
  owner: string;
  zip: string;
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

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER! + "/api/v1/estate/")
      .then((res) => res.json())
      .then((data) =>
        setEstates(
          data.map((estate: any) => ({
            name: estate.name,
            description: estate.description,
            rental: estate.rental,
            estimatedValue: estate.estimatedValue,
            token: estate.token,
            zip: estate.location,
            owner: estate.owner,
          }))
        )
      );
  }, []);
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
              markerRef.current = new mapboxgl.Marker(markerElement)
                .setLngLat(
                  approximateCoordinates(feature.center[1], feature.center[0])
                )
                .addTo(map.current!);
              map.current!.on("zoom", () => {
                const currentZoom = map.current?.getZoom() || 0;

                if (markerRef.current) {
                  if (currentZoom > 12) {
                    markerRef.current.getElement().style.display = "block";
                  } else {
                    markerRef.current.getElement().style.display = "none";
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

  return (
    <div className="flex flex-row font-[family-name:var(--font-geist-mono)]">
      {/* Map Section */}
      <div className="pt-[10px] w-[70vw] h-screen" ref={mapContainer}>
        <Header />
      </div>

      {/* Sidebar Section */}
      <div className="w-[30vw] h-screen border-l border-gray-700 text-gray-200 p-6 shadow-2xl">
        {/* Sidebar Header */}
        <div className="mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-semibold text-gray-100 tracking-wide">
            Estate Details
          </h1>
        </div>

        {showHouseDetails && selectedEstate ? (
          <div>
            {/* Back Button */}
            <button
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition mb-6"
              onClick={() => {
                setShowHouseDetails(false);
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
              <p className="text-gray-400 mb-4">{selectedEstate.description}</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-300">
                    Rental Income
                  </span>
                  <span className="ml-1">${selectedEstate.rental}</span>
                </p>
                <p className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-300">
                    Estimated Value
                  </span>
                  <span className="ml-1">${selectedEstate.estimatedValue}</span>
                </p>
                <p className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-300">
                    NFT Collection Address
                  </span>
                  <span className="ml-1">{selectedEstate.token}</span>
                </p>
                <p className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-300">Owner</span>
                  <span className="ml-1">{selectedEstate.owner}</span>
                </p>
                <p className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-300">
                    Area Postal Code
                  </span>
                  <span className="ml-1">{selectedEstate.zip}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a property marker to view details.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
