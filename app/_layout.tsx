import 'core-js/web/structured-clone'; // Add this line at the very top
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import LocationTester from '~/providers/components/LocationTester';
import ScooterProvider from '~/providers/ScooterProvider';
import AuthProvider from '~/providers/AuthProvider';
import RideProvider from '~/providers/RideProvider';

export default function Layout() {
return (
  
  /*<GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
    <ScooterProvider > 
       <RideProvider>
  <Stack screenOptions={ {headerShown: false }}/>
    </RideProvider>
  
  <StatusBar style="light" />
  </ScooterProvider>
  </AuthProvider>
 </GestureHandlerRootView>
  */
   <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RideProvider>
          <ScooterProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ScooterProvider>
        </RideProvider>
      </AuthProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
);
}
