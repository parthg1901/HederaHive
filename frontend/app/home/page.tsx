"use client";

import Header from '@/components/Header';
import { approximateCoordinates } from '@/utils/location';
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';

const Home = () => {
    const mapContainer = useRef<any>(null);
    const map = useRef<mapboxgl.Map | any>(null);

    useEffect(() => {
        if (mapContainer) {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
    
                    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
                    map.current = new mapboxgl.Map({
                        style: "mapbox://styles/mapbox/dark-v11",
                        container: mapContainer.current,
                        center: approximateCoordinates(position.coords.latitude, position.coords.longitude),
                        zoom: 13,
                    })
                    new mapboxgl.Marker({ color: 'black' })
                        .setLngLat(approximateCoordinates(position.coords.latitude, position.coords.longitude))
                        .addTo(map.current);
                });  
              }
          
        
            return () => {
                if (map.current) {
                    map.current.remove()
                }
            }
        }
      }, [navigator, navigator.geolocation, mapContainer])

    return (
        <div>
            <div className='pt-[10px] w-[70vw] h-screen' ref={mapContainer}>
                <Header />
            </div>
        </div>
    )
}

export default Home;