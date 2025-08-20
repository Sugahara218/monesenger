'use client';
import {  Map as GoogleMap, MapEvent } from '@vis.gl/react-google-maps';
import { useUserLocation } from './UserLocation';
import { useEffect, useRef, useState } from 'react';
// import {Marker, MarkerClusterer} from '@googlemaps/markerclusterer';
import { searchLocationsInBounds } from '@/app/_actions';
import { PoiMarkers } from './PoiMarkers';


export interface Poi {
  key: number;
  location: { lat: number; lng: number; };
  message_text:string;
  ai_text: string;
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









//小数第4位までに整形
function truncateDecimal(num:number, digits:number) {
  const multiplier = Math.pow(10, digits);
  return Math.trunc(num * multiplier) / multiplier;
}

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
  }));

  return poiLocations;
}



export function GoogleMapContent (){

  const { location } = useUserLocation(); 

  // 1. 地図の中心をstateとして管理する
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const cachedPois = useRef<Map<number, Poi>>(new Map());  
  const [visiblePois, setVisiblePois] = useState<Poi[]>([]); 

  // const [pois, setPois] = useState<Poi[]>([]);

  const idleTimer = useRef<number | null>(null);
  const prevBoundsRef = useRef<MapBounds | null>(null);

  const handleIdle = (ev: MapEvent) => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(async () => {
      const map = ev.map;
      const bounds = map.getBounds();
      const zoom = map.getZoom() ?? 0;

      if (!bounds || zoom < 11) {
        setVisiblePois([]);
        return;
      }

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const north = truncateDecimal(ne.lat(), 5);
      const south = truncateDecimal(sw.lat(), 5);
      const east = truncateDecimal(ne.lng(), 5);
      const west = truncateDecimal(sw.lng(), 5);

      const news = { north, south, east, west };

      // 前回の bounds と比較（小数点4桁）
      const prev = prevBoundsRef.current;
      if (
        prev &&
        prev.north === news.north &&
        prev.south === news.south &&
        prev.east === news.east &&
        prev.west === news.west
      ) {
        // 変化なければ API 呼ばない
        return;
      }
      prevBoundsRef.current = news;

      const newPois = await fetchAndFormatLocations(news);

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
    }, 800);
  };



  // 2. location stateが変更されたら副作用としてmapCenterを更新する
  useEffect(() => {
    if (typeof location.lat === 'number' && typeof location.lng === 'number') {
      setMapCenter({
        lat: location.lat,
        lng: location.lng,
      });
    }
  }, [location]);
  // console.log(location);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <GoogleMap
        key={`${mapCenter.lat},${mapCenter.lng}`}
        defaultZoom={13}
        defaultCenter={mapCenter}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || ''}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        onIdle={handleIdle}
      >
        <PoiMarkers pois={visiblePois} />
      </GoogleMap>
    </div>
  );
};



