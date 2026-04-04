import { useEffect, useState } from 'react';
import type { GeoLocation } from '../types/types';

export default function useGeoLocation(pollInterval = 5000) {
  const [location, setLocation] = useState<GeoLocation>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocation({ lat: null, lng: null, loading: false, error: 'Geolocation not supported' });
      return;
    }

    let watchId: number | null = null;
    // Try to get current position first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setLocation({ lat: null, lng: null, loading: false, error: err.message });
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    // then watch position
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setLocation((s) => ({ ...s, loading: false, error: err.message }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    // fallback: poll if watchPosition not available
    const interval = !watchId
      ? setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, loading: false, error: null }),
            (err) => setLocation((s) => ({ ...s, loading: false, error: err.message })),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
          );
        }, pollInterval)
      : null;

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (interval) clearInterval(interval as number);
    };
  }, [pollInterval]);

  return location;
}
