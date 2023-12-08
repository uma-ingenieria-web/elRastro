"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const defaultIcon = new L.Icon({
  iconUrl: defaultIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface UserLocation {
  lat: number;
  lng: number;
}

const Map = (location : UserLocation) => {

  return (
    <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
        <Marker key={0} position={[location.lat, location.lng]} icon={defaultIcon}>
          <Popup>
          </Popup>
        </Marker>
    </MapContainer>
  );
};

export default Map;
