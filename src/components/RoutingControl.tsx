import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

interface RoutingProps {
  puntoA: L.LatLng;
  puntoB: L.LatLng;
}

const RoutingControl = ({ puntoA, puntoB }: RoutingProps) => {
  const map = useMap();

  useEffect(() => {
    if (!puntoA || !puntoB) return;

    const control = L.Routing.control({
      waypoints: [puntoA, puntoB],
      lineOptions: {
        styles: [{ color: "blue", weight: 4 }],
      },
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [puntoA, puntoB, map]);

  return null;
};

export default RoutingControl;
