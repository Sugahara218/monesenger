'use client'
import { useMap } from '@vis.gl/react-google-maps';

export function useLatLngController() {
  const map = useMap();
  return ({ lat, lng }: { lat: number; lng: number }) => {
    map?.panTo({ lat, lng });
    map?.setZoom(17);
  };
}