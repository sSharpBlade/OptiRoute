import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression, LatLng } from "leaflet";
import RoutingControl from "./RoutingControl";
import "leaflet/dist/leaflet.css";

interface Waypoint {
  id: number;
  position: LatLng;
}

const MapView = () => {
  const ambatoCenter: LatLngExpression = [-1.2491, -78.6167];

  const [puntoA, setPuntoA] = useState<LatLng | null>(null);
  const [puntoB, setPuntoB] = useState<LatLng | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!puntoA) {
          setPuntoA(e.latlng);
        } else if (!puntoB) {
          setPuntoB(e.latlng);
        } else {
          setWaypoints([...waypoints, { id: idCounter, position: e.latlng }]);
          setIdCounter(idCounter + 1);
        }
      },
    });
    return null;
  };

  const moveWaypoint = (index: number, direction: "up" | "down") => {
    const newWaypoints = [...waypoints];
    if (direction === "up" && index > 0) {
      [newWaypoints[index - 1], newWaypoints[index]] = [newWaypoints[index], newWaypoints[index - 1]];
    } else if (direction === "down" && index < newWaypoints.length - 1) {
      [newWaypoints[index + 1], newWaypoints[index]] = [newWaypoints[index], newWaypoints[index + 1]];
    }
    setWaypoints(newWaypoints);
  };

  return (
    <div className="flex w-full h-screen">
      {/* Mapa */}
      <div className="flex-1">
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

          {waypoints.map((wp, i) => (
            <Marker key={wp.id} position={wp.position}>
              <Popup>
                <b>Parada {i + 1}</b>
                <br />
                Lat: {wp.position.lat.toFixed(5)}, Lng: {wp.position.lng.toFixed(5)}
              </Popup>
            </Marker>
          ))}

          {puntoA && puntoB && <RoutingControl puntoA={puntoA} puntoB={puntoB} waypoints={waypoints.map((wp) => wp.position)} />}
        </MapContainer>
      </div>

      <div className="w-64 p-4 bg-gray-100 overflow-auto">
        <h2 className="font-bold mb-2">Paradas intermedias</h2>
        {waypoints.map((wp, i) => (
          <div key={wp.id} className="flex items-center justify-between mb-1">
            <span>Parada {i + 1}</span>
            <div className="flex flex-col">
              <button onClick={() => moveWaypoint(i, "up")} className="text-sm">
                ↑
              </button>
              <button onClick={() => moveWaypoint(i, "down")} className="text-sm">
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
