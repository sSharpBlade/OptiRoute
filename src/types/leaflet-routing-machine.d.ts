import "leaflet";

declare module "leaflet" {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints?: L.LatLng[];
      lineOptions?: {
        styles?: Array<{
          color?: string;
          weight?: number;
          opacity?: number;
        }>;
      };
      addWaypoints?: boolean;
      routeWhileDragging?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      show?: boolean;
      createMarker?: (i: number, waypoint: L.LatLng, n: number) => L.Marker;
      router?: any;
      plan?: any;
    }

    interface RoutingControl extends L.Control {
      addTo(map: L.Map): this;
    }

    function control(options?: RoutingControlOptions): RoutingControl;
  }
}
