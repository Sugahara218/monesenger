'use client'

import { Marker, MarkerClusterer } from "@googlemaps/markerclusterer";
import { AdvancedMarker, InfoWindow, Pin, useMap } from "@vis.gl/react-google-maps";
import React, { useEffect, useRef, useState } from "react";
import { Poi } from "./GoogleMapContent";
import { parseAiText } from "../timeLine/TimelineItem";

export const PoiMarkers = (props: { pois: Poi[] }) => {
    const map = useMap();
    const [markers, setMarkers] = useState<{[key: string]: Marker}>({});
    const clusterer = useRef<MarkerClusterer | null>(null);
    const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  
    useEffect(() => {
      if (!map) return;
      if (!clusterer.current) {
        clusterer.current = new MarkerClusterer({map});
      }
    }, [map]);
  
    useEffect(()=>{
      setMarkers({});
    },[props.pois])
  
    // Update markers, if the markers array has changed
    useEffect(() => {
      clusterer.current?.clearMarkers();
      const markerValues = Object.values(markers);
      if(markerValues.length > 0){
        clusterer.current?.addMarkers(markerValues);
      }
      
    }, [markers]);
  
    const setMarkerRef = (marker: Marker | null, key: string) => {
      if (marker && markers[key]) return;
      if (!marker && !markers[key]) return;
  
      setMarkers(prev => {
        if (marker) {
          return {...prev, [key]: marker};
        } else {
          const newMarkers = {...prev};
          delete newMarkers[key];
          return newMarkers;
        }
      });
    };
  
    return (
        <>
          {props.pois.map((poi: Poi) => {
           
            const aiResponse = parseAiText(poi);
      
            
            return (
              <React.Fragment key={poi.key}>
                <AdvancedMarker
                  position={poi.location}
                  ref={marker => setMarkerRef(marker, String(poi.key))}
                  onClick={() => setActiveMarkerId(poi.key)}
                >
                  <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
                </AdvancedMarker>
                
                {/* 
                  activeMarkerIdとpoi.keyが一致する場合にのみ、
                  InfoWindowコンポーネントを描画します。
                */}
                {activeMarkerId === poi.key && (
                  <InfoWindow
                    position={poi.location} 
                    pixelOffset={[0, -40]}
                    onCloseClick={() => setActiveMarkerId(null)}
                    headerContent={<h3>{aiResponse.title}</h3>}
                  >
                    <p>{aiResponse.summary}</p>
                    <hr />
                    <p>{poi.message_text}</p>
                  </InfoWindow>
                )}
              </React.Fragment>
            );
          })}
        </>
      );
  };