import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const MapView = () => {
  // Coordenadas de Ambato, Ecuador
  const ambatoCenter: LatLngExpression = [-1.2491, -78.6167];

  return (
    <div className="w-full h-screen">
      <MapContainer center={ambatoCenter} zoom={13} className="w-full h-full" scrollWheelZoom={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marcador inicial en Ambato */}
        <Marker position={ambatoCenter}>
          <Popup>Ambato, Ecuador</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
