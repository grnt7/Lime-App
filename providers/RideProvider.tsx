import { createContext, useContext, PropsWithChildren, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "~/lib/supabase";
import { Alert } from "react-native";
import { useRef } from 'react'; // Import useRef

// 1. Define the interface for the context value.
interface RideContextType {
  ride: any | null; // Use a more specific type than 'any' if you can, e.g., 'Ride'
  startRide: (scooterId: number) => Promise<void>;
}

interface RideContextType {
  ride: any | null;
  startRide: (scooterId: number) => Promise<void>;
  // Add the new function signature here
  finishRide: () => Promise<void>;
}

// 2. Create the context with the defined type and an initial value of null.
const RideContext = createContext<RideContextType | null>(null);

export default function RideProvider({ children }: PropsWithChildren) {
  const { userId } = useAuth();
  const [ride, setRide] = useState<any | null>(null);

  

  useEffect(() => {
    const fetchActiveRide = async () => {
      if (!userId) {
        setRide(null);
        return;
      }

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

  const startRide = async (scooterId: number) => {
    if (ride) {
      Alert.alert("Ride In Progress", "You cannot start a new ride while one is active.");
      return;
    }

    const { data, error } = await supabase
      .from('rides')
      .insert([{ user_id: userId, scooter_id: scooterId }])
      .select();

    if (error) {
      Alert.alert("Error starting journey", error.message);
      console.error(error);
    } else {
      Alert.alert("Ride Started", "Your journey has successfully begun!");
      setRide(data[0]);
    }
  };

  const value = { ride, startRide };

  const finishRide = async () => {

    if (!ride) {
     
      return;
    }


    const {data, error} = await supabase
    .from('rides')
    .update({'finished_at': new Date() })
    .eq('id', ride.id);



    if (error) {
      Alert.alert("Error finishing ride", error.message);
      console.error(error);
    } else {
      Alert.alert("Ride Finished", "Your journey has successfully ended!");
      setRide(null); // Clear the ride state
    }
  };

  return <RideContext.Provider value={ {startRide, ride, finishRide}}>{children}</RideContext.Provider>;
}

// 3. Update the useRide hook to handle the null value.
export const useRide = () => {
  const context = useContext(RideContext);
  if (context === null) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
    
