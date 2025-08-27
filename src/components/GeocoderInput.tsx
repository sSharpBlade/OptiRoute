import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngExpression } from "leaflet";

type Suggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

interface GeocoderInputProps {
  label: string;
  placeholder?: string;
  initialText?: string;
  onSelect: (coords: LatLngExpression, displayName: string) => void;
  // para activar "reverse fill" si haces click en el mapa:
  externalText?: string;
}

const debounce = (fn: (...args: any[]) => void, ms = 300) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function GeocoderInput({
  label,
  placeholder = "Escribe una dirección o lugar...",
  initialText = "",
  onSelect,
  externalText,
}: GeocoderInputProps) {
  const [value, setValue] = useState(initialText);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // si viene un texto externo (reverse geocode), reflejar
  useEffect(() => {
    if (externalText !== undefined) setValue(externalText);
  }, [externalText]);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q || q.length < 2) {
          setItems([]);
          setOpen(false);
          return;
        }
        setLoading(true);
        try {
          const url = new URL("https://nominatim.openstreetmap.org/search");
          url.searchParams.set("q", q);
          url.searchParams.set("format", "jsonv2");
          url.searchParams.set("addressdetails", "1");
          url.searchParams.set("limit", "8");
          // buena práctica para Nominatim: incluye "namedetails" o "email" si tienes
          url.searchParams.set("namedetails", "1");

          const res = await fetch(url.toString(), {
            headers: {
              // algunos navegadores ignoran user-agent; no pasa nada.
              "Accept": "application/json",
            },
          });
          const data: Suggestion[] = await res.json();
          setItems(data);
          setOpen(true);
        } catch {
          setItems([]);
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }, 350),
    []
  );

  useEffect(() => {
    fetchSuggestions(value);
  }, [value, fetchSuggestions]);

  // cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePick = (s: Suggestion) => {
    const coords: LatLngExpression = [parseFloat(s.lat), parseFloat(s.lon)];
    onSelect(coords, s.display_name);
    setValue(s.display_name);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && items.length > 0) {
      e.preventDefault();
      handlePick(items[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        className="w-full mt-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="absolute z-[1000] mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">Sin resultados</div>
          )}
          {!loading &&
            items.map((s) => (
              <button
                key={s.place_id}
                className="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => handlePick(s)}
              >
                {s.display_name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
