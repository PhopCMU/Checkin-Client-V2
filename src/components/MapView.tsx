import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";
import type { Zone } from "../types/types";
import type { GeoLocation } from "../types/types";

// Fix default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "",
  iconUrl: "",
  shadowUrl: "",
});

// Custom icons
const createUserIcon = () =>
  L.divIcon({
    className: "user-pin",
    html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createZoneIcon = (color: string) =>
  L.divIcon({
    className: "zone-pin",
    html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    "></div>
  `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

function AutoCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isFinite(lat) || !isFinite(lng)) return;
    map.setView([lat, lng], 17, { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface Props {
  zones: Zone[];
  location: GeoLocation;
  height?: string;
}

const MapView: React.FC<Props> = ({ zones, location, height = "400px" }) => {
  const [mapReady, setMapReady] = useState(false);

  const center: LatLngExpression = useMemo(() => {
    if (location.lat && location.lng) return [location.lat, location.lng];
    const z = zones[0];
    return z ? [z.lat, z.lng] : [13.7563, 100.5018]; // Bangkok as fallback
  }, [location.lat, location.lng, zones]);

  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Map Locations</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-linear-to-r from-blue-500 to-purple-500"></div>
              <span>Your</span>
            </div>
          </div>
        </div>

        <div
          className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200"
          style={{ height }}
        >
          {!mapReady ? (
            <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Navigation className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-3" />
                <p className="text-gray-500">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={16}
              minZoom={16}
              maxZoom={16}
              zoomControl={false}
              doubleClickZoom={false}
              dragging={false}
              touchZoom={false}
              boxZoom={false}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              className="rounded-2xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {location.lat && location.lng && (
                <>
                  <Marker
                    position={[location.lat, location.lng]}
                    icon={createUserIcon()}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-semibold text-gray-800">
                          Your Location
                        </div>
                        <div className="text-sm text-gray-600">
                          Lat: {location.lat.toFixed(6)}, Lng:{" "}
                          {location.lng.toFixed(6)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <AutoCenter lat={location.lat} lng={location.lng} />
                </>
              )}

              {zones.map((zone: any) => (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={[zone.lat, zone.lng]}
                    radius={zone.radius}
                    pathOptions={{
                      color: zone.color || "#10b981",
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: "5, 5",
                    }}
                  />
                  <Marker
                    position={[zone.lat, zone.lng]}
                    icon={createZoneIcon(zone.color || "#10b981")}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-800">
                            {zone.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {zone.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          Radius: {zone.radius}m • Capacity:{" "}
                          {zone.capacity || "Unlimited"}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          )}
        </div>

        {/* <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map((zone: any) => (
            <div
              key={zone.id}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-300"
            >
              <div
                className="w-3 h-3 rounded-full flex"
                style={{ backgroundColor: zone.color || '#10b981' }}
              ></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{zone.name}</div>
                <div className="text-xs text-gray-500">{zone.description}</div>
              </div>
              <div className="text-sm font-semibold text-gray-700">{zone.radius}m</div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default MapView;
