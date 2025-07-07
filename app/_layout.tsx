import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import LocationTester from '~/providers/components/LocationTester';
import ScooterProvider from '~/providers/ScooterProvider';

export default function Layout() {
return (
  
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ScooterProvider > {/* <-- Add this temporary 'key' prop */}
  <Stack />
  {/* <LocationTester />  */}
  <StatusBar style="light" />
  </ScooterProvider>
 </GestureHandlerRootView>
  
);
}
