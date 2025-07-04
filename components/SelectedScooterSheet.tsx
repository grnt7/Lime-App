import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet"
import { useEffect, useRef } from "react";
import { StyleSheet, Text, Image, View,} from "react-native"
import { Button } from "./Button";
import { useScooter } from "~/providers/ScooterProvider";
import scooterImage from '~/assets/scooter.png'; // Adjust the path to your scooter image
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function SelectedScooterSheet() {

    const { selectedScooter, duration, distance } = useScooter(); // Get the selected scooter from the context
    const bottomSheetRef = useRef<BottomSheet>(null); // Create a ref for the BottomSheet


    useEffect(() => {
        if (selectedScooter) {
            bottomSheetRef.current?.expand(); // Expand the bottom sheet when a scooter is selected
        }
    }, [selectedScooter]); // Log when selected scooter changes


    // CONDITIONAL RENDERING: Only render the BottomSheet if a scooter is selected
    if (!selectedScooter) {
        return null; // Or return a loading indicator, or a "No scooter selected" message
    }

     return (
        <BottomSheet
            ref={bottomSheetRef}
            index={selectedScooter ? 0 : -1} // Ensure it starts at snapPoint 0 when selected
            snapPoints={[200, '50%']}
            enablePanDownToClose
            backgroundStyle={{backgroundColor:"#414442"}}
        >
            {/* The main content container for the BottomSheet */}
            <BottomSheetView style={styles.sheetContent}>

                {/* This View holds the top section (image, text, metrics) */}
                <View style={styles.headerContainer}>
                    <Image source={scooterImage} style={styles.scooterImage}/>

                    {/* Text Details (Lime-S, ID) */}
                    <View style={styles.textContainer}>
                        <Text style={styles.scooterName}>Lime - S</Text>
                        <Text style={styles.scooterId}>id-{selectedScooter.id} . Madison Avenue</Text>
                    </View>

                    {/* Metrics (Distance, Duration) */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricItem}>
                            <FontAwesome6 name="person-walking" size={24} color="#42E100" />
                            <Text style={styles.metricText}>{(distance/1000).toFixed(1)} km</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <FontAwesome6 name="clock-four" size={24} color="#42E100" />
                            <Text style={styles.metricText}>{(duration/60).toFixed(0)}min</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section: Button */}
                <View style={styles.buttonWrapper}>
                    <Button title="Start Journey"/>
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
        color: "white",
        fontSize: 20,
        fontWeight: "600"
    },
    scooterId: {
        color: "white",
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