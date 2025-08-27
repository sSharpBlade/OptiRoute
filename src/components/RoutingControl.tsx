// src/components/RoutingControl.tsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

interface RoutingProps {
  puntoA: L.LatLng;
  puntoB: L.LatLng;
  waypoints?: L.LatLng[];
  onFound?: (km: string, min: string) => void;
  onRoute?: (route: any) => void;
  mode?: "driving" | "foot" | "bicycle"; // 👈 soporte de modo
}

const RC_KEY = "__lrm_control__";

const RoutingControl = ({
  puntoA,
  puntoB,
  waypoints = [],
  onFound,
  onRoute,
  mode = "driving",
}: RoutingProps) => {
  const map = useMap();

  // refs para callbacks actuales
  const onFoundRef = useRef(onFound);
  const onRouteRef = useRef(onRoute);
  onFoundRef.current = onFound;
  onRouteRef.current = onRoute;

  // 1) Crear / recrear el control cuando cambia el modo
  useEffect(() => {
    const anyMap = map as unknown as Record<string, any>;
    const LR: any = (L as any).Routing;

    // Si ya existe y el modo cambió → desmontar y recrear
    const prev = anyMap[RC_KEY] as any;
    if (prev?.mode && prev.mode !== mode && prev.control) {
      try {
        prev.control.off("routesfound", prev.onRoutesfound);
        prev.control.off("routeselected", prev.onRouteselected);
        prev.control.off("routingerror", prev.onRoutingerror);
        prev.control.remove();
      } catch {}
      anyMap[RC_KEY] = undefined;
    }

    if (!anyMap[RC_KEY]) {
      const control: any = LR.control({
        waypoints: [],
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false, // panel nativo off: UI custom
        autoRoute: false,

        // 🎨 estilos
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 5, opacity: 0.9 }], // blue-600
        },
        showAlternatives: true,
        altLineOptions: {
          styles: [{ color: "#94a3b8", weight: 4, opacity: 0.7, dashArray: "6,6" }], // slate-400 dashed
        },

        router: LR.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: mode, // 👈 driving | foot | bicycle
          timeout: 30000,
          steps: true,
          language: "es",
          overview: "full",
          geometries: "polyline",
        }),
      }).addTo(map as any);

      anyMap[RC_KEY] = { control, mode };
    } else {
      // si ya existía, sólo actualiza el modo guardado
      anyMap[RC_KEY].mode = mode;
    }
  }, [map, mode]);

  // 2) (Re)enlaza listeners siempre (HMR/StrictMode-safe)
  useEffect(() => {
    const anyMap = map as unknown as Record<string, any>;
    const entry = anyMap[RC_KEY];
    if (!entry) return;

    const control: any = entry.control;

    const handleRoute = (route: any) => {
      if (!route) return;

      const s = route.summary;
      const totalDistance =
        s?.totalDistance ??
        route?.distance ??
        (Array.isArray(route.legs)
          ? route.legs.reduce((acc: number, l: any) => acc + (l?.distance ?? 0), 0)
          : undefined);

      const totalTime =
        s?.totalTime ??
        route?.duration ??
        (Array.isArray(route.legs)
          ? route.legs.reduce((acc: number, l: any) => acc + (l?.duration ?? 0), 0)
          : undefined);

      if (typeof totalDistance !== "number" || typeof totalTime !== "number") {
        // eslint-disable-next-line no-console
        console.warn("No se pudo derivar summary de la ruta:", route);
        return;
      }

      const km = (totalDistance / 1000).toFixed(2);
      const min = (totalTime / 60).toFixed(1);
      onFoundRef.current?.(km, min);
      onRouteRef.current?.(route);
    };

    const onRoutesfound = (e: any) => handleRoute(e?.routes?.[0]);
    const onRouteselected = (e: any) => handleRoute(e?.route);
    const onRoutingerror = (e: any) => {
      // eslint-disable-next-line no-console
      console.error("LRM routingerror:", e?.error || e);
    };

    // desengancha handlers viejos si existían
    if (entry.onRoutesfound) control.off("routesfound", entry.onRoutesfound);
    if (entry.onRouteselected) control.off("routeselected", entry.onRouteselected);
    if (entry.onRoutingerror) control.off("routingerror", entry.onRoutingerror);

    // engancha handlers actuales
    control.on("routesfound", onRoutesfound);
    control.on("routeselected", onRouteselected);
    control.on("routingerror", onRoutingerror);

    // guarda refs para próximo ciclo
    entry.onRoutesfound = onRoutesfound;
    entry.onRouteselected = onRouteselected;
    entry.onRoutingerror = onRoutingerror;
  }, [map, mode]);

  // 3) Actualiza waypoints y dispara route()
  useEffect(() => {
    const anyMap = map as unknown as Record<string, any>;
    const entry = anyMap[RC_KEY];
    if (!entry || !puntoA || !puntoB) return;

    const control: any = entry.control;
    const wps = [puntoA, ...(waypoints || []), puntoB];

    try {
      control.setWaypoints(wps);
      if ((control as any)._map) control.route();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error al rutear:", err);
    }
  }, [map, puntoA, puntoB, JSON.stringify(waypoints)]);

  return null;
};

export default RoutingControl;
