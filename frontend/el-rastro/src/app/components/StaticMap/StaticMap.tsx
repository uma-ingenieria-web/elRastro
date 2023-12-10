"use client"

import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

export default function StaticMap({position, popup} : {position: [number, number], popup: string}) {
  return <MapContainer center={position} scrollWheelZoom={true} zoom={13} className="h-80" >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
      <Marker position={position}>
        <Popup>
          {popup}
        </Popup>
      </Marker>
  </MapContainer>
}
