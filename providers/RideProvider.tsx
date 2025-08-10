import { createContext, useContext, PropsWithChildren, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "~/lib/supabase";
import { Alert } from "react-native";
import { useRef } from 'react';
import * as Location from 'expo-location';
import getDistance from "@turf/distance";
import { point } from "@turf/helpers";
import { fetchDirectionBasedOnCoords } from "~/services/directions";

// 1. Define the interface for the context value.
interface RideContextType {
  ride: any | null; // Use a more specific type than 'any' if you can, e.g., 'Ride'
  startRide: (scooterId: number) => Promise<void>;
  finishRide: () => Promise<void>;
}

// 2. Create the context with the defined type and an initial value of null.
const RideContext = createContext<RideContextType | null>(null);

export default function RideProvider({ children }: PropsWithChildren) {
  const { userId } = useAuth();
  const [ride, setRide] = useState<any | null>(null);

  // New state to track distance and duration for the UI
  const [totalDistance, setTotalDistance] = useState(0);
  const [rideDuration, setRideDuration] = useState(0);
  
  // Ref to store the path and last location without causing re-renders
  const ridePathRef = useRef<number[][]>([]);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const rideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  
  useEffect(() => {
    const fetchActiveRide = async () => {
      if (!userId) {
        setRide(null);
        return;
      }

      console.log("Fetching active ride for user:", userId);
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', userId)
        .is('finished_at', null)
        .single();
      
      setRide(data || null);
    };

    fetchActiveRide();
  }, [userId]);

   useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;
        
        const setupLocationWatch = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('RideProvider: Location permission denied.');
                return;
            }
            
            // Start watching location
            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 5 },
                (newLocation) => {
                    if (ride) { // Only track if a ride is active
                        const from = lastLocationRef.current ? point([lastLocationRef.current.coords.longitude, lastLocationRef.current.coords.latitude]) : null;
                        const to = point([newLocation.coords.longitude, newLocation.coords.latitude]);
                        
                        if (from) {
                            const distanceCalculated = getDistance(from, to, { units: "meters" });
                            setTotalDistance(prev => prev + distanceCalculated);
                        }

                        ridePathRef.current.push([newLocation.coords.longitude, newLocation.coords.latitude]);
                        lastLocationRef.current = newLocation;
                    }
                }
            );

            // Start a timer to track ride duration
            rideIntervalRef.current = setInterval(() => {
                setRideDuration(prev => prev + 1);
            }, 1000);
        };

        if (ride) {
            setupLocationWatch();
            ridePathRef.current = []; // Reset the path when a new ride starts
            setTotalDistance(0);
            setRideDuration(0);
        } else {
            // Clean up when the ride ends
            if (locationSubscription) {
                locationSubscription.remove();
            }
            if (rideIntervalRef.current) {
                clearInterval(rideIntervalRef.current);
            }
            // Optional: Save the final ride path, distance, and duration to Supabase here
        }

        return () => {
            if (locationSubscription) locationSubscription.remove();
            if (rideIntervalRef.current) clearInterval(rideIntervalRef.current);
        };
    }, [ride]);

  const startRide = async (scooterId: number) => {
    console.log("startRide function called for scooterId:", scooterId);
    
    if (ride) {
      Alert.alert("Ride In Progress", "You cannot start a new ride while one is active.");
      return;
    }
    
    if (!userId) {
        Alert.alert("Authentication Error", "You must be logged in to start a ride.");
        console.error("userId is null, cannot start ride.");
        return;
    }

    const { data, error } = await supabase
      .from('rides')
      .insert([{ user_id: userId, scooter_id: scooterId }])
      .select();

    if (error) {
      Alert.alert("Error starting journey", error.message);
      console.error("Supabase insert failed:", error);
    } else {
      Alert.alert("Ride Started", "Your journey has successfully begun!");
      console.log("Ride successfully started. New ride data:", data[0]);
      setRide(data[0]);
    }
  };

  const finishRide = async () => {
    console.log("DEBUG: finishRide function called.");
    console.log("DEBUG: Current ride state:", ride);
    
    if (!ride) {
      console.log("DEBUG: No active ride found.");
      return;
    }

    try {
      let updateData;
      let supabaseUpdateResult;

      // If the ride path is too short, use the locally tracked data
      if (ridePathRef.current.length < 2) {
        console.log("DEBUG: Ride path too short, using local data.");
        updateData = {
          'finished_at': new Date(),
          routeDuration: rideDuration,
          routeDistance: totalDistance,
          routeCoords: JSON.stringify(ridePathRef.current),
        };
      } else {
        console.log("DEBUG: Attempting to fetch directions based on ride path...");
        const actualRoute = await fetchDirectionBasedOnCoords(ridePathRef.current);

        // Defensive checks for valid data
        if (!actualRoute || !actualRoute.routes || !actualRoute.routes.matchings || actualRoute.routes.matchings.length === 0) {
          throw new Error('Invalid route data from directions service.');
        }
       
        const ridePath = actualRoute.routes.matchings[0].geometry.coordinates;
        const rideRouteDuration = actualRoute.routes.matchings[0].duration;
        const rideRouteDistance = actualRoute.routes.matchings[0].distance;
        
        updateData = {
          'finished_at': new Date(),
          routeDuration: rideRouteDuration,
          routeDistance: rideRouteDistance,
          routeCoords: JSON.stringify(ridePath),
        };
      }

      console.log("DEBUG: Updating ride in Supabase with data:", updateData);
      supabaseUpdateResult = await supabase
        .from('rides')
        .update(updateData)
        .eq('id', ride.id);

      if (supabaseUpdateResult.error) {
        console.error("Supabase update failed:", supabaseUpdateResult.error);
        throw supabaseUpdateResult.error;
      }
      
      console.log("DEBUG: Supabase update successful.");
      Alert.alert("Ride Finished", "Your journey has successfully ended!");
      setRide(null); 
    
    } catch (error) {
      console.error("Error during finishRide:", error);
      Alert.alert("Error finishing ride", error.message);
    }
  };

  return <RideContext.Provider value={{ startRide, ride, finishRide }}>{children}</RideContext.Provider>;
}

// 3. Update the useRide hook to handle the null value.
export const useRide = () => {
  const context = useContext(RideContext);
  if (context === null) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
