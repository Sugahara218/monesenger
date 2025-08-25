'use client';
import {  ControlPosition, Map as GoogleMap, MapControl, MapEvent } from '@vis.gl/react-google-maps';
import { useUserLocation } from './UserLocation';
import { useEffect, useRef, useState } from 'react';
import { searchLocationsInBounds } from '@/app/_actions';
import { PoiMarkers } from './PoiMarkers';
import { getDistance } from 'geolib';
import { MapInContents } from './mapComponents/MapInContents';

export interface Poi {
  key: number;
  location: { lat: number; lng: number; };
  message_text:string;
  ai_text: string;
  serial_number:string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const defaultCenter = {
  lat: 35.6895014,
  lng: 139.6917337,
}

//小数第digits位までに整形 Todo:関数をまとめた場所に保管する
// function truncateDecimal(num:number, digits:number) {
//   const multiplier = Math.pow(10, digits);
//   return Math.trunc(num * multiplier) / multiplier;
// }

// Todo: コードを分離する
async function fetchAndFormatLocations(bounds: MapBounds): Promise<Poi[]> {

  const { north, south, east, west } = bounds;
  const response = await searchLocationsInBounds(north, south, east, west);


  if (!response || !response.locations) {
    console.log("位置情報が見つかりませんでした。");
    return [];
  }
  
  const poiLocations: Poi[] = response.locations
  .filter(item => 
    item.id &&
    item.location &&
    typeof item.location.lat === 'number' &&
    typeof item.location.lng === 'number'&&
    typeof item.message_text === 'string' && 
    typeof item.ai_text === 'string'
  )
  .map(item => ({
    key: item.id,
    location: {
      lat: item.location!.lat, 
      lng: item.location!.lng,
    },
    message_text: item.message_text,
    ai_text: item.ai_text,
    serial_number:item.serial_number,
  }));

  return poiLocations;
}


// Todo: 分離する
export function GoogleMapContent (){

  const { location } = useUserLocation(); 

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const cachedPois = useRef<Map<number, Poi>>(new Map());  
  const [visiblePois, setVisiblePois] = useState<Poi[]>([]); 

  const idleTimer = useRef<number | null>(null);
  const lastFetchedCenterRef = useRef<{ latitude: number, longitude: number } | null>(null);


  const handleIdle = (ev: MapEvent) => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(async () => {
      const map = ev.map;
      const bounds = map.getBounds();
      const zoom = map.getZoom() ?? 0;

      if (!bounds || zoom < 9) {
        setVisiblePois([]);
        return;
      }

      const currentCenter = map.getCenter();
      if (!currentCenter) {
        console.warn("マップの中心座標が取得できませんでした。");
        return;
      }

      const currentCenterLatLng = {
        latitude: currentCenter.lat(),
        longitude: currentCenter.lng(),
      };
      const THRESHOLD_DISTANCE_METERS = 500;

      if (lastFetchedCenterRef.current) {
        const distance = getDistance(
          lastFetchedCenterRef.current,
          currentCenterLatLng
        );
        
        if (visiblePois.length && distance < THRESHOLD_DISTANCE_METERS) {
          console.log("700 > "+distance+"スキップします。");
          return;
        }
      }

      // Todo:簡潔なコードが書けないか探す
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const north = ne.lat();
      const south = sw.lat();
      const east = ne.lng();
      const west = sw.lng();
      const news = { north, south, east, west };

      const newPois = await fetchAndFormatLocations(news);

      lastFetchedCenterRef.current = currentCenterLatLng;

      newPois.forEach(poi => {
        if (!cachedPois.current.has(poi.key)) {
          cachedPois.current.set(poi.key, poi);
        }
      });

      const poisInView: Poi[] = [];
      for (const poi of cachedPois.current.values()) {
        const { lat, lng } = poi.location;
        if (lat >= south && lat <= north && lng >= west && lng <= east) {
          poisInView.push(poi);
        }
      }
      setVisiblePois(poisInView);
    }, 200);
  };

  useEffect(() => {
    if (typeof location.lat === 'number' && typeof location.lng === 'number') {
      setMapCenter({
        lat: location.lat,
        lng: location.lng,
      });
    }
  }, [location]);
  
  return (
    <div style={{ width: '100%', height: 400 ,} } className='googleMapContents'>
      <GoogleMap
        key={`${mapCenter.lat},${mapCenter.lng}`}
        defaultZoom={13}
        defaultCenter={mapCenter}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || ''}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        onBoundsChanged={handleIdle}
      >
      <MapControl position={ControlPosition.TOP_LEFT}>
          <MapInContents pois={visiblePois}/>
      </MapControl>
        
        <PoiMarkers pois={visiblePois} />
      </GoogleMap>
    </div>
  );
};