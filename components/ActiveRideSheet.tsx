import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useEffect, useRef } from "react";
import {  Text } from "react-native";
import { useRide } from "~/providers/RideProvider";
import { Button } from "./Button"; // Assuming you have a Button component





export default function ActiveRideSheet() {
    const { ride, finishRide } = useRide(); // Assuming useRide hook provides ride context
    const bottomSheetRef = useRef<BottomSheet>(null);

useEffect(() => {
    if (ride) { 
        bottomSheetRef.current?.expand(); // Expand the bottom sheet when a ride is active
    } else{
        bottomSheetRef.current?.close(); // Close the bottom sheet when no ride is active
    }

}, [ride]);

return (
 
    <BottomSheet
    ref={bottomSheetRef}
            
      index={ride ? 0 : -1}
    snapPoints={[200]}
    enablePanDownToClose
    backgroundStyle={{backgroundColor:"#414442"}}>
    {ride && (
            <BottomSheetView style={{flex:1, padding: 10, gap: 20 }}>
            <Text>Ride in Progress</Text>

                <Button 
              title="Finish Journey" 
            
              onPress={() => finishRide()}
            />
            </BottomSheetView>     

    )}

</BottomSheet>
)
}