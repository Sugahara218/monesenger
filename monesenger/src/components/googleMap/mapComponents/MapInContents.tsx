"use client"
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Poi } from "../GoogleMapContent";
import { parseAiText } from "@/components/timeLine/TimelineItem";
import { useState } from "react";
import { useLatLngController } from "../MapMove";
import { searchLocationID } from "@/app/_actions";

const himejiLocation = {
  lat:34.82754237260524, lng:134.6905761147147
}

export function MapInContents (props: { pois: Poi[] }){
  const [activeSerialKey, setActiveSerialKey] = useState<number | string | null>(null);
  const moveMap = useLatLngController();

  const handleItemClick = async (key: number | string) => {
    setActiveSerialKey(key); 
    if (typeof key === 'string') {
      if (key === "himeji") {
        moveMap(himejiLocation);
      } else {}
      return; 
    }
    
    const locationData = await searchLocationID(key);
    if (locationData && locationData.locations && locationData.locations[0]) {
      const coords = locationData.locations[0];
      moveMap({ lat: coords.lat, lng: coords.lng });
    } else {}
  };

  return (
    <div style={{background:"white",minWidth:"180px",maxWidth:"100%",display:"flex",flexDirection:"column",borderRadius:"16px",padding:"8px",boxShadow:"0 12px 40px rgba(0, 0, 0, 0.15)",margin:"4px",}}className="googleMapIncontents">
      <ScrollArea.Root
          type="always"
          style={{
            flex:1,
            overflow: "hidden",
            width:"100%",
          }}
        >
          <ScrollArea.Viewport
            style={{
              width: "100%",
              minHeight: "100%",
            }} className="scrollArea"
          >
            {props.pois.length > 0 ? <div style={{display:"flex"}}><h4 style={{marginBottom:"6px"}}>現在地のメッセージ:</h4><h3 style={{marginBottom:"6px"}}>{props.pois.length}件</h3></div> : <div><h3>現在地のメッセージ一覧</h3><br /><p>見つかりませんでした。</p><br /><p onClick={()=>moveMap(himejiLocation)} style={{
                    marginBottom:"6px",
                    cursor: "pointer",
                    borderRadius: '4px',
                    width:"95%",
                    background: "khaki",
                  }}>🔥姫路市がオススメです🔥</p></div>}
            {props.pois && props.pois.map((poi: Poi) => {
              const aiResponse = parseAiText(poi);
              const isSelected = activeSerialKey === poi.key;
              return (
                <div key={poi.key}>
                  <p onClick ={()=>handleItemClick(poi.key)}className="contentsInPopOver" 
                  style={{
                    marginBottom:"6px",
                    cursor: "pointer",
                    color: 'black', 
                    fontWeight: 'normal',
                    backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                    // padding: '4px 8px',
                    borderRadius: '4px',
                    width: "95%",
                    
                  }}>
                  {aiResponse.title}</p>
                </div>
              );
            })}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
          orientation="vertical"
          style={{
            width: "8px",
            background: "#f0f0f0", 
            borderRadius: "4px",
            display: 'flex',
            userSelect: 'none',
            touchAction: 'none',
            padding: '2px', 
            boxSizing: 'border-box',
            marginRight:"3px",
            marginTop:"4px",
            marginBottom:"4px"
          }}
        >
          <ScrollArea.Thumb
            style={{
              background: "#cccccc", 
              borderRadius: "4px",
              flex: 1,
              position: 'relative',
            }}
          />
        </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    </div>
  )
}