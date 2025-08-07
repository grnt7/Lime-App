import { Stack, Link, Redirect } from 'expo-router';
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native'; // Added Button and TouchableOpacity for styling

import Map from "~/components/Map";

import { StatusBar } from 'expo-status-bar';
import SelectedScooterSheet from '~/components/SelectedScooterSheet';
// REMOVED: import { Button } from '@rneui/themed'; // This line is removed
import { supabase } from '~/lib/supabase';
import ActiveRideSheet from '~/components/ActiveRideSheet';

export default function Home() {
  // The Redirect to /auth is handled by app/(home)/_layout.tsx
  // This component will only render if the user is authenticated.

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      // You might want to show a user-friendly message here
    }
    // AuthProvider will detect SIGNED_OUT event and redirect automatically
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />
      <View style={{ flex: 1 }}> {/* Give the parent explicit flex:1 */}
        <Map />
        {/* Replaced @rneui/themed Button with React Native Button, with basic styling */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </TouchableOpacity>
        <SelectedScooterSheet />
        <ActiveRideSheet />
      </View>
      <StatusBar style="dark" /> {/* Assuming dark content on a light background for status bar */}
    </>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    position: 'absolute', // Position it absolutely
    top: 50, // Adjust top spacing as needed
    right: 20, // Adjust right spacing as needed
    backgroundColor: '#42E100', // A distinct color for sign out
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10, // Ensure it's above other elements like the map
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signOutButtonText: {
    color: 'black', // Changed to black for better contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
});
