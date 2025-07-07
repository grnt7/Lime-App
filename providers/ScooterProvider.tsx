import { createContext, PropsWithChildren, useContext, useEffect, useState, useRef } from 'react'; // Import useRef
import * as Location from 'expo-location';
import { getDirections } from '../services/directions';
import  getDistance  from "@turf/distance";
import { point } from "@turf/helpers";

// --- START: Interface Definitions (Crucial for TypeScript) ---
interface Scooter {
    long: number;
    lat: number;
    id?: string;
    name?: string;
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
}
// --- END: Interface Definitions ---

const ScooterContext = createContext<ScooterContextType | undefined>(undefined);

export default function ScooterProvider({ children }: PropsWithChildren) {
    const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
    const [direction, setDirection] = useState<DirectionResponse | null>(null);
    const [isNearby, setIsNearby] = useState(false); // Correct state variable name

    // Use a ref to hold the latest selectedScooter without re-running the effect
    const selectedScooterRef = useRef<Scooter | null>(selectedScooter);

    // Keep selectedScooterRef up-to-date whenever selectedScooter state changes
    useEffect(() => {
        selectedScooterRef.current = selectedScooter;
    }, [selectedScooter]);


    // Derived state for easier access in context value
    const directionCoordinates = direction?.routes?.[0]?.geometry?.coordinates || null;
    const routeTime = direction?.routes?.[0]?.duration || null;
    const routeDistance = direction?.routes?.[0]?.distance || null;

    // --- DEBUGGING LOGS (keep these in!) ---
    console.log("PROVIDER RENDER: selectedScooter =", selectedScooter?.id);
    console.log("PROVIDER RENDER: isNearby =", isNearby);
    console.log("PROVIDER RENDER: Time: ", routeTime);
    console.log("PROVIDER RENDER: Distance: ", routeDistance);
    // ----------------------------------------


    // Effect for watching user location and updating isNearby state
    // This effect should run only ONCE on component mount and clean up on unmount.
    // Effect for watching user location and updating isNearby state
    //step 3
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const setupLocationWatch = async () => {
            console.log('DEBUG: setupLocationWatch called.'); // NEW LOG: Confirm function execution starts

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                console.log('DEBUG: Location permission status:', status); // NEW LOG: Check permission result

                if (status !== 'granted') {
                    console.error('PROVIDER: Location permission denied. Cannot check proximity.');
                    setIsNearby(false);
                    return; // Stop here if permission is not granted
                }

                console.log('DEBUG: Permissions granted. Attempting to start watchPositionAsync...'); // NEW LOG: Confirm before watch

                subscription = await Location.watchPositionAsync(
                    { distanceInterval: 5, accuracy: Location.Accuracy.High },
                    (newLocation) => {
                        console.log('PROVIDER LOCATION UPDATE: New Location:', newLocation.coords.longitude, newLocation.coords.latitude);
                        // Access the latest selectedScooter from the ref
                        const currentSelectedScooter = selectedScooterRef.current;
                        console.log('PROVIDER LOCATION UPDATE: current selectedScooter (from ref):', currentSelectedScooter?.id || 'none');

                        if (currentSelectedScooter) {
                            const from = point([newLocation.coords.longitude, newLocation.coords.latitude]);
                            const to = point([currentSelectedScooter.long, currentSelectedScooter.lat]);
                            const distanceCalculated = getDistance(from, to, { units: "meters" });
                            console.log('PROVIDER LOCATION UPDATE: Distance to scooter:', distanceCalculated, 'meters');

                            if (distanceCalculated < 610) {
                                if (!isNearby) {
                                    console.log("PROVIDER LOCATION UPDATE: Setting isNearby to TRUE (distance < 50)");
                                    setIsNearby(true);
                                }
                            } else {
                                if (isNearby) {
                                    console.log("PROVIDER LOCATION UPDATE: Setting isNearby to FALSE (distance >= 50)");
                                    setIsNearby(false);
                                }
                            }
                        } else {
                            if (isNearby) {
                                console.log("PROVIDER LOCATION UPDATE: No scooter selected, setting isNearby to FALSE");
                                setIsNearby(false);
                            }
                        }
                    }
                );
                console.log('DEBUG: watchPositionAsync successfully started.'); // NEW LOG: Confirm listener initiation
            } catch (error) {
                console.error('DEBUG: Error in setupLocationWatch:', error); // NEW LOG: Catch any errors during setup
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
    }, []); // Empty dependency array

        
    // Effect for fetching directions - this remains dependent on selectedScooter
    useEffect(() => {
        const fetchDirectionsForSelectedScooter = async () => {
            if (!selectedScooter || typeof selectedScooter.long !== 'number' || typeof selectedScooter.lat !== 'number') {
                setDirection(null);
                return;
            }

            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('PROVIDER: Location permission denied for directions. Cannot fetch directions.');
                    setDirection(null);
                    return;
                }

                const myLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const fromCoords = [myLocation.coords.longitude, myLocation.coords.latitude];
                const toCoords = [selectedScooter.long, selectedScooter.lat];

                console.log('PROVIDER: Fetching directions from:', fromCoords, 'to:', toCoords);
                const newDirection = await getDirections(fromCoords, toCoords);
                console.log('PROVIDER: Directions fetched successfully.');
                setDirection(newDirection);

            } catch (error) {
                console.error('PROVIDER: Error getting location or fetching directions:', error);
                setDirection(null);
            }
        };

        fetchDirectionsForSelectedScooter();

    }, [selectedScooter]); // This effect correctly depends on selectedScooter


    return (
        <ScooterContext.Provider value={{
            selectedScooter,
            setSelectedScooter,
            direction,
            setDirection,
            directionCoordinates,
            routeTime,
            routeDistance,
            isNearby, // Ensure this is included
        }}>
            {children}
        </ScooterContext.Provider>
    );
}

// Custom hook to use the scooter context
export const useScooter = () => {
    const context = useContext(ScooterContext);
    if (context === undefined) {
        throw new Error('useScooter must be used within a ScooterProvider');
    }
    return context;
};