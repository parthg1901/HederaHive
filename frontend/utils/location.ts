import { LngLatLike } from "mapbox-gl";

export function approximateCoordinates(latitude: number, longitude: number, offset = 0.01): LngLatLike {
    const latOffset = (Math.random() * 2 - 1) * offset;
    const lonOffset = (Math.random() * 2 - 1) * offset;

    return [
        longitude + lonOffset,
        latitude + latOffset
    ];
}