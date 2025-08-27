import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression, LatLng } from "leaflet";
import RoutingControl from "./RoutingControl";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const ambatoCenter: LatLngExpression = [-1.2491, -78.6167];
  const [puntoA, setPuntoA] = useState<LatLng | null>(null);
  const [puntoB, setPuntoB] = useState<LatLng | null>(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!puntoA) {
          setPuntoA(e.latlng);
        } else if (!puntoB) {
          setPuntoB(e.latlng);
        } else {
          setPuntoA(e.latlng);
          setPuntoB(null);
        }
      },
    });
    return null;
  };

  return (
    <div className="w-full h-screen">
      <MapContainer center={ambatoCenter} zoom={13} className="w-full h-full" scrollWheelZoom={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapClickHandler />

        {puntoA && (
          <Marker position={puntoA}>
            <Popup>
              <b>Punto A (Origen)</b>
              <br />
              Lat: {puntoA.lat.toFixed(5)}, Lng: {puntoA.lng.toFixed(5)}
            </Popup>
          </Marker>
        )}

        {puntoB && (
          <Marker position={puntoB}>
            <Popup>
              <b>Punto B (Destino)</b>
              <br />
              Lat: {puntoB.lat.toFixed(5)}, Lng: {puntoB.lng.toFixed(5)}
            </Popup>
          </Marker>
        )}

        {puntoA && puntoB && <RoutingControl puntoA={puntoA} puntoB={puntoB} />}
      </MapContainer>
    </div>
  );
};

export default MapView;
