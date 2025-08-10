// In ScooterProvider.tsx
import { createContext, PropsWithChildren, useContext, useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { getDirections } from '../services/directions';
import getDistance from "@turf/distance";
import { point } from "@turf/helpers";
import { supabase } from '~/lib/supabase';
import { useRide } from './RideProvider';

interface Scooter {
  long: number;
  lat: number;
  id?: number;
  battery?: number;
  dist_meters?: number;
}
interface RouteGeometry {
  coordinates: number[][];
  type: 'LineString';
}
interface Route {
  geometry: RouteGeometry;
  duration: number;
  distance: number;
}
interface DirectionResponse {
  routes: Route[];
}
interface ScooterContextType {
  selectedScooter: Scooter | null;
  setSelectedScooter: (scooter: Scooter | null) => void;
  direction: DirectionResponse | null;
  setDirection: (direction: DirectionResponse | null) => void;
  directionCoordinates: number[][] | null;
  routeTime: number | null;
  routeDistance: number | null;
  isNearby: boolean;
  nearbyScooters: Scooter[];
  resetScooterState: () => void;
  // ADD THIS
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
}

const ScooterContext = createContext<ScooterContextType | undefined>(undefined);

export default function ScooterProvider({ children }: PropsWithChildren) {
  const [nearbyScooters, setNearbyScooters] = useState<Scooter[]>([]);
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [direction, setDirection] = useState<DirectionResponse | null>(null);
  const [isNearby, setIsNearby] = useState(false);
  const { ride } = useRide();

  const selectedScooterRef = useRef<Scooter | null>(selectedScooter);

  useEffect(() => {
    selectedScooterRef.current = selectedScooter;
  }, [selectedScooter]);

  const directionCoordinates = direction?.routes?.[0]?.geometry?.coordinates || null;
  const routeTime = direction?.routes?.[0]?.duration || null;
  const routeDistance = direction?.routes?.[0]?.distance || null;

  //console.log("PROVIDER RENDER: selectedScooter =", selectedScooter?.id);
  //console.log("PROVIDER RENDER: isNearby =", isNearby);
  //console.log("PROVIDER RENDER: Time: ", routeTime);
  //console.log("PROVIDER RENDER: Distance: ", routeDistance);

  const resetScooterState = () => {
    //console.log("PROVIDER: Resetting scooter state...");
    setSelectedScooter(null);
    setDirection(null);
    setIsNearby(false);
  };
  
  // ✅ FIX 1: This useEffect is now a top-level call and correctly uses `resetScooterState`.
  // It only resets the state when a ride is no longer active.
  useEffect(() => {
    if (!ride) { 
      resetScooterState();
    }
  }, [ride]);
  
  // ✅ FIX 2: Added logic to fetch scooters from Supabase.
  useEffect(() => {
    const fetchScooters = async () => {
      console.log("PROVIDER: Fetching scooters from Supabase...");
      const { data, error } = await supabase.from('scooters').select('*');
      if (error) {
        console.error("Error fetching scooters:", error);
      } else {
        setNearbyScooters(data as Scooter[]);
        console.log("Scooters fetched:", data);
      }
    };
    fetchScooters();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    const setupLocationWatch = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('PROVIDER: Location permission denied. Cannot check proximity.');
                setIsNearby(false);
                return;
            }
            subscription = await Location.watchPositionAsync(
                { distanceInterval: 5, accuracy: Location.Accuracy.High },
                (newLocation) => {
                    const currentSelectedScooter = selectedScooterRef.current;
                    if (currentSelectedScooter) {
                        const from = point([newLocation.coords.longitude, newLocation.coords.latitude]);
                        const to = point([currentSelectedScooter.long, currentSelectedScooter.lat]);
                        const distanceCalculated = getDistance(from, to, { units: "meters" });
                        const threshold = 700;
                        setIsNearby(distanceCalculated < threshold);
                    } else {
                        setIsNearby(false);
                    }
                }
            );
            //console.log('DEBUG: watchPositionAsync successfully started.');
        } catch (error) {
            console.error('DEBUG: Error in setupLocationWatch:', error);
            setIsNearby(false);
        }
    };
    setupLocationWatch();
    return () => {
        if (subscription) {
            console.log("PROVIDER LOCATION WATCH CLEANUP: Removing location subscription.");
            subscription.remove();
        }
    };
}, [selectedScooter]);

  useEffect(() => {
    const fetchDirectionsForSelectedScooter = async () => {
        try {
            const myLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const fromCoords = [myLocation.coords.longitude, myLocation.coords.latitude];
            const toCoords = [selectedScooter.long, selectedScooter.lat];
            const newDirection = await getDirections(fromCoords, toCoords);
            setDirection(newDirection);
        } catch (error) {
            console.error('Error fetching directions:', error);
            setDirection(null);
        }
    };
    if (selectedScooter) {
        fetchDirectionsForSelectedScooter();
    } else {
        setDirection(null);
    }
  }, [selectedScooter]);

  return (
    <ScooterContext.Provider value={{
      selectedScooter,
      setSelectedScooter,
      direction,
      directionCoordinates,
      routeTime,
      routeDistance,
      isNearby,
      nearbyScooters,
      resetScooterState,
    }}>
      {children}
    </ScooterContext.Provider>
  );
}

export const useScooter = () => {
  const context = useContext(ScooterContext);
  if (context === undefined) {
    throw new Error('useScooter must be used within a ScooterProvider');
  }
  return context;
};