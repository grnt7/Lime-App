import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import LocationTester from '~/providers/components/LocationTester';
import ScooterProvider from '~/providers/ScooterProvider';
import AuthProvider from '~/providers/AuthProvider';

export default function Layout() {
return (
  
  <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
    <ScooterProvider > {/* <-- Add this temporary 'key' prop */}
  <Stack screenOptions={ {headerShown: false }}/>
  {/* <LocationTester />  */}
 
  <StatusBar style="light" />
  </ScooterProvider>
  </AuthProvider>
 </GestureHandlerRootView>
  
);
}
