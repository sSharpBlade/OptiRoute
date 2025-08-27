"use client";
import { useMemo, useState } from "react";
import L, { LatLng, type LatLngExpression } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  MapPin,
  Navigation,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import GeocoderInput from "./GeocoderInput";
import MapView from "./MapView";
import { reverseGeocode } from "../lib/geocode";

type Stop = { id: number; coords: LatLng | null; label: string };
type Mode = "driving" | "foot" | "bicycle";

export default function RouteCalculator() {
  const [originCoords, setOriginCoords] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<LatLng | null>(null);
  const [destinationLabel, setDestinationLabel] = useState("");
  const [stops, setStops] = useState<Stop[]>([{ id: 1, coords: null, label: "" }]);

  const [summary, setSummary] = useState<{ km: string; min: string } | null>(null);
  const [steps, setSteps] = useState<any[]>([]);

  // NUEVO: modo, hora pico, gasolina
  const [mode, setMode] = useState<Mode>("driving");
  const [horaPico, setHoraPico] = useState<boolean>(false);
  const [fuelLper100km, setFuelLper100km] = useState<number>(8.5); // consumo promedio
  const [fuelPrice, setFuelPrice] = useState<number>(2.5);         // $/L (ajústalo a Ecuador)

  // ---------- helpers ----------
  const addStop = () => {
    setStops((s) => [
      ...s,
      { id: s.length ? Math.max(...s.map((x) => x.id)) + 1 : 1, coords: null, label: "" },
    ]);
  };

  const removeStop = (id: number) => setStops((s) => s.filter((x) => x.id !== id));

  // Reordenar (↑ / ↓)
  const moveStopUp = (index: number) => {
    setStops((prev) => {
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveStopDown = (index: number) => {
    setStops((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const onPickOrigin = (coords: LatLngExpression, display: string) => {
    const ll = L.latLng(coords as [number, number]);
    setOriginCoords(ll);
    setOriginLabel(display);
  };

  const onPickDestination = (coords: LatLngExpression, display: string) => {
    const ll = L.latLng(coords as [number, number]);
    setDestinationCoords(ll);
    setDestinationLabel(display);
  };

  const onPickStop = (index: number, coords: LatLngExpression, display: string) => {
    const ll = L.latLng(coords as [number, number]);
    setStops((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], coords: ll, label: display };
      return clone;
    });
  };

  const calculateRoute = () => {
    if (!originCoords || !destinationCoords) return;
    setSummary(null);
    setSteps([]);
  };

  // Duración ajustada (hora pico aplica 30% más si driving)
  const adjustedMinutes = useMemo(() => {
    if (!summary?.min) return null;
    const base = Number(summary.min);
    if (Number.isNaN(base)) return null;
    const factor = horaPico && mode === "driving" ? 1.3 : 1;
    return Math.round(base * factor);
  }, [summary, horaPico, mode]);

  // ETA estimada a partir de adjustedMinutes
  const eta = useMemo(() => {
    if (!adjustedMinutes) return null;
    const etaDate = new Date(Date.now() + adjustedMinutes * 60 * 1000);
    return etaDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }, [adjustedMinutes]);

  // Costo de gasolina (solo driving)
  const fuelCost = useMemo(() => {
    if (!summary || mode !== "driving") return 0;
    const km = parseFloat(summary.km);
    if (Number.isNaN(km)) return 0;
    const litros = (km * fuelLper100km) / 100;
    return +(litros * fuelPrice).toFixed(2);
  }, [summary, mode, fuelLper100km, fuelPrice]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo global */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="h-6 w-6 text-blue-600" />
            Ruta Óptima – Ambato
          </h1>
        </div>
      </header>

      <div className="pt-20 p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">
            {/* Panel izquierdo con scroll propio */}
            <div className="lg:col-span-1 overflow-auto max-h-[calc(100vh-6rem)]">
              <Card className="shadow-lg">
                <CardHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Planificar Ruta
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">


                  {/* Origen */}
                  <section className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Origen
                    </label>
                    <GeocoderInput
                      label=""
                      placeholder="Ej. Parque Cevallos, Ambato"
                      externalText={originLabel}
                      onSelect={onPickOrigin}
                    />
                    <p className="text-[11px] text-gray-500">
                      También puedes hacer click en el mapa para autocompletar.
                    </p>
                  </section>

                  {/* Paradas */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600">Paradas (opcional)</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addStop}
                        className="h-8 text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir
                      </Button>
                    </div>

                    {stops.map((stop, idx) => (
                      <div key={stop.id} className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-500">Parada #{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveStopUp(idx)}
                                disabled={idx === 0}
                                title="Subir"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveStopDown(idx)}
                                disabled={idx === stops.length - 1}
                                title="Bajar"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              {stops.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeStop(stop.id)}
                                  className="h-7 w-7 text-red-600 border-red-600 hover:bg-red-50"
                                  title="Eliminar"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <GeocoderInput
                            label=""
                            placeholder={`Parada ${idx + 1}`}
                            externalText={stop.label}
                            onSelect={(coords, name) => onPickStop(idx, coords, name)}
                          />
                        </div>
                      </div>
                    ))}
                  </section>

                  {/* Destino */}
                  <section className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Destino
                    </label>
                    <GeocoderInput
                      label=""
                      placeholder="Ej. Universidad Técnica de Ambato"
                      externalText={destinationLabel}
                      onSelect={onPickDestination}
                    />
                  </section>

                  {/* Resumen / ETA / Gasolina */}
                  <div className="rounded-xl bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">Resumen</div>
                      <div className="text-sm text-gray-700">
                        {summary ? `${summary.km} km · ${summary.min} min` : "—"}
                      </div>
                    </div>

                    {mode === "driving" && (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Hora pico</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={horaPico}
                              onChange={(e) => setHoraPico(e.target.checked)}
                            />
                            <span>{horaPico ? "Sí" : "No"}</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <label className="space-y-1">
                            <span className="text-gray-600">Consumo (L/100km)</span>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full rounded-md border px-2 py-1"
                              value={fuelLper100km}
                              onChange={(e) => setFuelLper100km(parseFloat(e.target.value))}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-gray-600">Precio por litro ($)</span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full rounded-md border px-2 py-1"
                              value={fuelPrice}
                              onChange={(e) => setFuelPrice(parseFloat(e.target.value))}
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Costo estimado combustible</span>
                          <span className="font-medium">${fuelCost.toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {adjustedMinutes != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          ETA {horaPico && mode === "driving" ? "(con tráfico)" : ""}
                        </span>
                        <span className="font-medium">{eta}</span>
                      </div>
                    )}
                  </div>

                  {/* Indicaciones */}
                  {steps.length > 0 && (
                    <div className="mt-1 rounded-xl border overflow-hidden">
                      <div className="px-4 py-3 font-semibold border-b bg-white">Indicaciones</div>
                      <ol className="max-h-64 overflow-auto divide-y">
                        {steps.map((st: any, i: number) => (
                          <li key={i} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex gap-3">
                              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                              <div className="text-sm leading-5">
                                <div className="text-gray-900">{st.text}</div>
                                <div className="text-xs text-gray-500">
                                  {(st.distance / 1000).toFixed(2)} km · {(st.time / 60).toFixed(0)} min
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mapa */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-6rem)] shadow-lg">
                <CardContent className="p-0 h-full">
                  <div className="h-full">
                    <MapView
                      puntoA={originCoords}
                      labelA={originLabel}
                      puntoB={destinationCoords}
                      labelB={destinationLabel}
                      waypoints={stops
                        .filter((s) => s.coords)
                        .map((s) => ({ id: s.id, position: s.coords!, label: s.label }))}
                      onRoutesFound={(km, min) => setSummary({ km, min })}
                      onRouteReady={(route) => setSteps(route.instructions ?? [])}
                      mode={mode} // 👈 pásalo a RoutingControl a través de MapView
                      onReversePick={async (target, ll) => {
                        const name = await reverseGeocode(ll.lat, ll.lng);
                        if (target === "origen") {
                          setOriginCoords(ll);
                          if (name) setOriginLabel(name);
                        } else if (target === "destino") {
                          setDestinationCoords(ll);
                          if (name) setDestinationLabel(name);
                        } else {
                          setStops((prev) =>
                            prev.map((s) =>
                              s.id === (target as any).stopId
                                ? { ...s, coords: ll, label: name ?? s.label }
                                : s
                            )
                          );
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
