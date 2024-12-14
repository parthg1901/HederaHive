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

interface IEstate {
  name: string;
  description: string;
  rental: number;
  estimatedValue: number | undefined;
  token: string;
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
  const [, setShowHouseDetails] = useState(false);
  const [estates, setEstates] = useState<IEstate[]>([]);

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

        const markerElement = document.createElement("div");

        const root = ReactDOM.createRoot(markerElement);
        root.render(
          <React.StrictMode>
            <CustomHouseMarker
              onClick={() => setShowHouseDetails((prevState) => !prevState)}
            />
          </React.StrictMode>
        );

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
    <div>
      <div className="pt-[10px] w-[70vw] h-screen" ref={mapContainer}>
        <Header />
      </div>
    </div>
  );
};

export default Home;
