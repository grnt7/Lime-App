import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet"
import { useEffect, useRef } from "react";
import { StyleSheet, Text, Image, View, Alert, TouchableOpacity,} from "react-native"
import { Button } from "./Button";
import { useScooter } from "~/providers/ScooterProvider";
import scooterImage from '~/assets/scooter.png'; // Adjust the path to your scooter image
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/providers/AuthProvider";
import { useRide } from "~/providers/RideProvider";

export default function SelectedScooterSheet() {

    // FIX 1: Destructure setSelectedScooter from useScooter()
    const { selectedScooter, routeTime, routeDistance, isNearby, setSelectedScooter } = useScooter();
    const isDisabled = !selectedScooter || !isNearby;
    const bottomSheetRef = useRef<BottomSheet>(null);

    const { startRide, ride } = useRide();
   

    // --- DEBUGGING LOGS (from previous suggestion) ---
   //console.log("SHEET RENDER: selectedScooter =", selectedScooter?.id);
    //console.log("SHEET RENDER: isNearby =", isNearby);
    //console.log("SHEET BUTTON: Button disabled state will be:", !isNearby);
    // -------------------------------------------------

    useEffect(() => {
        if (selectedScooter) {
            bottomSheetRef.current?.expand(); // Expand the bottom sheet when a scooter is selected
        } else {
            bottomSheetRef.current?.close(); // Close the bottom sheet when no scooter is selected
        }
    }, [selectedScooter]);

    // CONDITIONAL RENDERING: Only render the BottomSheet if a scooter is selected
    // FIX 2: Removed duplicate conditional render check
    if (!selectedScooter) {
        return null;
    }



    return (
        <BottomSheet
            ref={bottomSheetRef}
            // Ensure index is -1 when selectedScooter is null, so it starts closed
            index={selectedScooter ? 0 : -1}
            snapPoints={[200]}
            enablePanDownToClose
            backgroundStyle={{backgroundColor:"#414442"}}
            // Optional: Close sheet when dragging down and clear selected scooter
            onClose={() => setSelectedScooter(null)} // This ensures selectedScooter is cleared if user closes sheet
        >
            <BottomSheetView style={styles.sheetContent}>
                  <TouchableOpacity onPress={() => setSelectedScooter(null)} style={styles.closeButton}>
                        <FontAwesome6 name="xmark" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                <View style={styles.headerContainer}>
                    {/* ✅ ADDED CLOSE BUTTON */}
                  
                    <Image source={scooterImage} style={styles.scooterImage}/>
                    <View style={styles.textContainer}>
                        <Text style={styles.scooterName}>Lime - S</Text>
                        <Text style={styles.scooterId}>id-{selectedScooter.id} . Madison Avenue</Text>
                    </View>
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricItem}>
                            <FontAwesome6 name="person-walking" size={24} color="#42E100" />
                            <Text style={styles.metricText}>
                                {routeDistance !== null ? `${(routeDistance/1000).toFixed(1)} km` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <FontAwesome6 name="clock-four" size={24} color="#42E100" />
                            <Text style={styles.metricText}>
                                {routeTime !== null ? `${(routeTime/60).toFixed(0)} min` : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>
<View style={styles.buttonWrapper}>
    {/* Only render the "Start Journey" button if a ride is NOT active */}
    {!ride && (
        <Button 
            title="Start Journey" 
            onPress={() => {
                if (selectedScooter?.id) {
                    startRide(selectedScooter.id);
                }
            }} 
            disabled={!isNearby} 
        />
    )}
</View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    // This style is for the root of the BottomSheetView content
    sheetContent: {
        flex: 1, // Takes all available height within the sheet
        flexDirection: 'column', // Stack children vertically
        padding: 20,
        backgroundColor: '#414442',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'space-between', // Push header to top, button to bottom
    },
    // This style is for the container of the image, text, and metrics
    headerContainer: {
        flexDirection: 'row', // Layout image, text, and metrics horizontally
        alignItems: 'center', // Vertically align items in this row
        gap: 20, // Space between major sections (image, text, metrics)
        flex: 1, // Allows this section to grow and push the button down
    },
    scooterImage: {
        width: 60,
        height: 60,
        marginRight: 10, // Add a small margin to the right of the image
    },
    // Style for the container of "Lime - S" and "id-..." text
    textContainer: {
        flex: 1, // Allows this text section to take up available space in the middle
    },
    scooterName: {
        color: "#ffff",
        fontSize: 20,
        fontWeight: "600"
    },
    scooterId: {
        color: "#ffff",
        fontSize: 18,
    },
    // Style for the container of distance and duration metrics
    metricsContainer: {
        flexDirection: 'row', // Arrange distance and duration items horizontally
        alignItems: 'center', // Vertically align items in this row
        gap: 20, // Space between distance and duration items
    },
    // Style for each individual metric (e.g., icon and text for distance)
    metricItem: {
        alignItems: 'center', // Center icon and text vertically within their own group
    },
    metricText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600"
    },
    // Style for the button's wrapper View
    buttonWrapper: {
        width: '100%', // Ensure the button container takes full width
        alignItems: 'center', // Center the button horizontally within its wrapper
        paddingTop: 15, // Add some space above the button
    },
});