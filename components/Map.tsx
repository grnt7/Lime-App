import Mapbox, { Camera, Images, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { point } from '@turf/turf';
import pin from '../assets/pin.png';
import locationicon from '../assets/location-icon.png';
import scooters from '../app/data/scooters.json';
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useScooter } from '../providers/ScooterProvider';
import { useRide } from '~/providers/RideProvider';
import ScooterMarkers from './ScooterMarkers';
import LineRoute from './LineRoute';
// Note: SelectedScooterSheet is a component, so it should not be used as a variable.

type MapboxTouchEvent = Mapbox.MapboxTouchEvent;
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export default function Map() {
  const { ride } = useRide();
const { setSelectedScooter, selectedScooter, directionCoordinates, resetScooterState, setUserLocation } = useScooter();
 
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

       // ⭐ ADD THIS: Fetch the current position after permission is granted
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  })();
}, []);

  

  
  const onPointPress = (event: MapboxTouchEvent) => {
    if (event.features[0].properties?.scooter) {
      setSelectedScooter(event.features[0].properties.scooter);
    }
  };
  
  console.log("DEBUG: `directionCoordinates` value:", directionCoordinates);
  console.log("DEBUG: `selectedScooter` value:", selectedScooter);

return (
    <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/dark-v11">
      <Camera followZoomLevel={16} followUserLocation />
      <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }} />
      <Images images={{ pin, locationicon }} />

      <ShapeSource id="startLocationMarkerSource">
        <SymbolLayer id="location-icon" style={{ iconImage: 'locationicon', iconSize: 0.5, iconAllowOverlap: true, iconAnchor: 'bottom' }} />
      </ShapeSource>

      {/* Show the route line only when a scooter is selected and a ride is not active. */}
      {selectedScooter && !ride && directionCoordinates && <LineRoute coordinates={directionCoordinates} />}

      {/* Renders all available scooters ONLY if no scooter is selected and there is no active ride. */}
      {!selectedScooter && !ride && <ScooterMarkers onScooterPress={onPointPress} />}

      {/* Renders the selected scooter pin ONLY if one is selected and there is no active ride. */}
      {selectedScooter && !ride && (
        <ShapeSource id="selected-scooter" shape={point([selectedScooter.long, selectedScooter.lat], { selectedScooter })}>
          <SymbolLayer id="selected-scooter-icon" style={{ iconImage: 'pin', iconSize: 0.5, iconAllowOverlap: true, iconAnchor: 'bottom' }} />
        </ShapeSource>
      )}

      {/* Renders the active ride's scooter pin ONLY during an active ride. */}
      {ride && selectedScooter && ( // Add the selectedScooter check here
        <ShapeSource id="active-ride-scooter" shape={point([selectedScooter.long, selectedScooter.lat])}>
          <SymbolLayer id="active-ride-scooter-icon" style={{ iconImage: 'pin', iconSize: 0.5, iconAllowOverlap: true, iconAnchor: 'bottom' }} />
        </ShapeSource>
      )}
    </MapView>
);
}