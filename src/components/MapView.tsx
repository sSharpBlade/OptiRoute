// src/components/MapView.tsx
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { LatLngExpression } from "leaflet";
import RoutingControl from "./RoutingControl";

type WaypointUI = { id: number; position: L.LatLng; label?: string };
type Mode = "driving" | "foot" | "bicycle";

// util para crear un marcador tipo “dot” de color
const dotIcon = (hex: string) =>
  L.divIcon({
    className: "",
    html: `<span style="
      display:inline-block;width:14px;height:14px;border-radius:9999px;
      background:${hex};box-shadow:0 0 0 2px #fff;"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export default function MapView({
  puntoA,
  labelA,
  puntoB,
  labelB,
  waypoints,
  onRoutesFound,
  onReversePick,
  onRouteReady,
  mode = "driving", // 👈 NUEVO
}: {
  puntoA: L.LatLng | null;
  labelA?: string;
  puntoB: L.LatLng | null;
  labelB?: string;
  waypoints: WaypointUI[];
  onRoutesFound?: (km: string, min: string) => void;
  onReversePick?: (target: "origen" | "destino" | { stopId: number }, ll: L.LatLng) => void;
  onRouteReady?: (route: any) => void;
  mode?: Mode; // 👈 NUEVO
}) {
  const ambatoCenter: LatLngExpression = [-1.2491, -78.6167];

  function SizeFixer() {
    const map = useMap();
    useEffect(() => {
      const t = setTimeout(() => map.invalidateSize(), 120);
      return () => clearTimeout(t);
    }, [map]);
    return null;
  }

  // Click en el mapa: llena origen → destino → primera parada vacía
  const MapClick = () => {
    useMapEvents({
      click(e) {
        const ll = e.latlng;
        if (!puntoA) {
          onReversePick?.("origen", ll);
        } else if (!puntoB) {
          onReversePick?.("destino", ll);
        } else {
          const empty = waypoints.find((w) => !w.position); // por si manejas paradas “vacías”
          if (empty) onReversePick?.({ stopId: empty.id }, ll);
        }
      },
    });
    return null;
  };

  return (
    <MapContainer center={ambatoCenter} zoom={13} className="h-full w-full" scrollWheelZoom>
      <SizeFixer />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClick />

      {puntoA && (
        <Marker position={puntoA} icon={dotIcon("#16a34a") /* green-600 */}>
          <Popup>
            <b>Origen</b>
            <br />
            {labelA ?? ""}
          </Popup>
        </Marker>
      )}

      {puntoB && (
        <Marker position={puntoB} icon={dotIcon("#dc2626") /* red-600 */}>
          <Popup>
            <b>Destino</b>
            <br />
            {labelB ?? ""}
          </Popup>
        </Marker>
      )}

      {waypoints.map((wp, i) => (
        <Marker key={wp.id} position={wp.position} icon={dotIcon("#7c3aed") /* violet-600 */}>
          <Popup>
            <b>Parada {i + 1}</b>
            <br />
            {wp.label ?? ""}
          </Popup>
        </Marker>
      ))}

      {puntoA && puntoB && (
        <RoutingControl
          puntoA={puntoA}
          puntoB={puntoB}
          waypoints={waypoints.map((w) => w.position)}
          onFound={(km, min) => onRoutesFound?.(km, min)}
          onRoute={(route) => onRouteReady?.(route)}
          mode={mode} // 👈 reenvía el modo al router OSRM
        />
      )}
    </MapContainer>
  );
}
