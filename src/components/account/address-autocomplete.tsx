"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface AddressData {
  formatted_address: string;
  lat: number;
  lng: number;
  place_id: string;
  country: string;
  province: string;
  city: string;
  zip: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: AddressData) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onBlur,
  placeholder,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const initAutocomplete = () => {
      const google = (window as any).google;
      if (!google || !inputRef.current) return;
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["address"] }
      );
      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place.place_id) return;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?place_id=${place.place_id}&key=${apiKey}`
          );
          const data = await res.json();
          if (data.status === "OK" && data.results[0]) {
            const result = data.results[0];
            const comps = result.address_components;
            const get = (type: string) =>
              comps.find((c: any) => c.types.includes(type))?.long_name || "";
            onSelect({
              formatted_address: result.formatted_address,
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
              place_id: result.place_id,
              country: get("country"),
              province: get("administrative_area_level_1"),
              city: get("locality") || get("administrative_area_level_2") || "",
              zip: get("postal_code"),
            });
          }
        } catch (err) {
          console.error("Geocode error", err);
        }
      });
    };

    if ((window as any).google && (window as any).google.maps) {
      initAutocomplete();
      return;
    }

    const script = document.getElementById("google-maps");
    if (!script) {
      const newScript = document.createElement("script");
      newScript.id = "google-maps";
      newScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      newScript.async = true;
      newScript.onload = initAutocomplete;
      document.head.appendChild(newScript);
    } else {
      script.addEventListener("load", initAutocomplete);
    }
  }, []);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}
