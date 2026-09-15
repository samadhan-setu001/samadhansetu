"use client";

import { useCallback, useState } from "react";

export interface GeoResult {
  lat: number;
  long: number;
  accuracy: number;
}

interface GeoState {
  loading: boolean;
  error: string | null;
  position: GeoResult | null;
}

/**
 * Wraps the browser Geolocation API (design doc section 1.4 — no native app,
 * location comes from `navigator.geolocation`). Section 11 calls for
 * rejecting submissions where GPS accuracy is worse than ~50m; we surface
 * `accuracy` so callers (LiveCameraCapture) can enforce that soft check.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    loading: false,
    error: null,
    position: null
  });

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ loading: false, error: "Geolocation isn't available in this browser.", position: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          }
        });
      },
      (err) => {
        setState({ loading: false, error: err.message || "Couldn't get your location.", position: null });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...state, request };
}
