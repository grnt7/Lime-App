import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { getDirections } from '../services/directions'; // Ensure this path is correct

// --- START: Interface Definitions (Crucial for TypeScript) ---
// Define the interface for your scooter object (adjust based on your scooters.json structure)
interface Scooter {
    long: number;
    lat: number;
    id?: string; // Example: if ID is optional
    name?: string; // Example: if name is optional
    // Add any other properties that exist on your scooter objects
}

// Define the expected structure for your direction data (from directions.ts)
interface RouteGeometry {
  coordinates: number[][]; // Array of [longitude, latitude] pairs
  type: 'LineString';
}

interface Route {
  geometry: RouteGeometry;
  duration: number; // Assuming your Mapbox directions response includes these (e.g., in seconds)
  distance: number; // Assuming your Mapbox directions response includes these (e.g., in meters)
}

interface DirectionResponse {
  routes: Route[];
  // Add other top-level properties from your Mapbox directions API response if needed
}

// Define the interface for your Context's value
interface ScooterContextType {
    selectedScooter: Scooter | null;
    setSelectedScooter: (scooter: Scooter | null) => void;
    direction: DirectionResponse | null;
    setDirection: (direction: DirectionResponse | null) => void; // Expose setter if Map needs it later (optional)
    directionCoordinates: number[][] | null;
    routeTime: number | null;
    routeDistance: number | null;
}
// --- END: Interface Definitions ---


// Correctly type createContext
const ScooterContext = createContext<ScooterContextType | undefined>(undefined);

export default function ScooterProvider({ children }: PropsWithChildren) {
    // Type useState calls with explicit null initial values
    const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
    const [direction, setDirection] = useState<DirectionResponse | null>(null);
    const [isNearby, setIsNearby] = useState(false);


    useEffect(() => {
        const fetchDirectionsForSelectedScooter = async () => {
            // If no scooter is selected or its coordinates are invalid, clear previous directions and stop
            if (!selectedScooter || typeof selectedScooter.long !== 'number' || typeof selectedScooter.lat !== 'number') {
                setDirection(null);
                return;
            }

            try {
                // Ensure location permissions are granted within this context as well
                // This is a good place to do a quick check, though Map.tsx might handle primary permission request
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('PROVIDER: Location permission denied. Cannot fetch directions.');
                    setDirection(null); // Clear direction on permission denial
                    return;
                }

                // Get user's current location
                const myLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

                const fromCoords = [myLocation.coords.longitude, myLocation.coords.latitude];
                // *** FIX: 'to' coordinates come from the 'selectedScooter' state ***
                const toCoords = [selectedScooter.long, selectedScooter.lat]; 

                console.log('PROVIDER: FROM (user location):', fromCoords);
                console.log('PROVIDER: TO (selected scooter):', toCoords);

                const newDirection = await getDirections(fromCoords, toCoords);
                setDirection(newDirection);

            } catch (error) {
                console.error('PROVIDER: Error getting location or fetching directions:', error);
                setDirection(null); // Clear direction on error
            }
        };

        // Call the async function
        fetchDirectionsForSelectedScooter();

    }, [selectedScooter]); // Rerun this effect whenever selectedScooter changes

    console.log("PROVIDER: Selected Scooter:", selectedScooter);

    return (
        <ScooterContext.Provider value={{
            selectedScooter,
            setSelectedScooter,
            direction,
            setDirection, // Exposing setDirection in context for completeness, though Map.tsx won't use it directly for route now
            directionCoordinates: direction?.routes?.[0]?.geometry.coordinates || null,
            duration: direction?.routes?.[0]?.duration || null,
            distance: direction?.routes?.[0]?.distance || null,
           
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
