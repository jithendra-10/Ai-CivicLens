'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import { WifiOff } from 'lucide-react';

interface MapDisplayProps {
  location: {
    lat: number;
    lng: number;
  };
}

export function MapDisplay({ location }: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Diagnostic log to help debug API key issues.
  console.log('Attempting to use Google Maps API Key:', apiKey ? `"${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}"`: "Not Found");


  if (!apiKey) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground p-4">
            <WifiOff className="w-10 h-10 mb-2" />
            <p className="text-center text-sm font-semibold">Map Disabled</p>
            <p className="text-center text-xs">Google Maps API key is not configured.</p>
        </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={location}
        defaultZoom={15}
        mapId="civic-ai-map"
        disableDefaultUI={true}
      >
        <AdvancedMarker position={location} />
      </Map>
    </APIProvider>
  );
}
