import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import {  Text, StyleSheet, View, Image } from "react-native";
import { useRide } from "~/providers/RideProvider";
import { Button } from "./Button";
import scooterImage from '~/assets/scooter.png';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function ActiveRideSheet() {
  const { ride, finishRide } = useRide(); 
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (ride) { 
        bottomSheetRef.current?.expand(); 
    } else {
        bottomSheetRef.current?.close(); 
    }
  }, [ride]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={[200]}
      index={ride ? 0 : -1}
      enablePanDownToClose
      backgroundStyle={{backgroundColor:"#414442"}}>
      {ride && (
        <BottomSheetView style={styles.sheetContent}>
  {/* This header is now populated with ride-specific data */}
  <View style={styles.headerContainer}>
    <Image source={scooterImage} style={styles.scooterImage}/>
    <View style={{ flex: 1, gap: 5 }}>
      <Text style={styles.scooterName}>Lime - S</Text>
      <Text style={styles.scooterId}>id-{ride.scooter_id} · On the go</Text>
    </View>
    
    {/* This is the new container for your metrics */}
    <View style={styles.metricsContainer}>
      <View style={styles.metricItem}>
        <FontAwesome6 name="flag-checkered" size={18} color="#42E100" />
        {/* The distance will be displayed here */}
        <Text style={styles.metricText}>-- km</Text>
      </View>
      <View style={styles.metricItem}>
        <FontAwesome6 name="clock" size={18} color="#42E100" />
        {/* The duration will be displayed here */}
        <Text style={styles.metricText}>-- min</Text>
      </View>
    </View>
  </View>
  
  <View>
    <Button 
      title="Finish Journey" 
      onPress={() => finishRide()}
    />
  </View>
</BottomSheetView> 
      )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    gap: 20,
    backgroundColor: '#414442',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scooterImage: {
    width: 60,
    height: 60,
  },
  scooterName: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  scooterId: {
    color: "white",
    fontSize: 18,
  },
  // Creates a row layout for the metrics
  metricsContainer: {
    flexDirection: 'row',
    gap: 15, // Adjust this value to control the space between your metrics
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});