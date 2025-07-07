import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function LocationTester() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.LocationPermissionStatus | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const setupLocationWatch = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        console.log('TESTER: Location permission status:', status);

        if (status !== 'granted') {
          console.error('TESTER: Location permission denied.');
          return;
        }

        console.log('TESTER: Permissions granted. Starting watchPositionAsync...');

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 }, // Even smaller interval for aggressive testing
          (location) => {
            console.log('TESTER LOCATION UPDATE:', location.coords.longitude, location.coords.latitude);
            setCurrentLocation(location.coords);
          }
        );
        console.log('TESTER: watchPositionAsync started.');

      } catch (error) {
        console.error('TESTER: Error setting up location watch:', error);
      }
    };

    setupLocationWatch();

    // Cleanup function
    return () => {
      if (locationSubscription) {
        console.log('TESTER: Cleaning up location subscription.');
        locationSubscription.remove();
      }
    };
  }, []); // Empty dependency array, runs once on mount

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tester</Text>
      <Text>Permission: {permissionStatus || 'N/A'}</Text>
      {currentLocation ? (
        <View>
          <Text>Latitude: {currentLocation.latitude.toFixed(6)}</Text>
          <Text>Longitude: {currentLocation.longitude.toFixed(6)}</Text>
          <Text>Altitude: {currentLocation.altitude?.toFixed(2) || 'N/A'}</Text>
          <Text>Accuracy: {currentLocation.accuracy?.toFixed(2) || 'N/A'}</Text>
        </View>
      ) : (
        <Text>Waiting for location updates...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});