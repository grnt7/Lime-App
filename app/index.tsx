
import { Stack, Link } from 'expo-router';
import {  Text, View, StyleSheet } from 'react-native'; // Add View and StyleSheet import
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import Map from "~/components/Map";

import {StatusBar} from 'expo-status-bar';
import SelectedScooterSheet from '~/components/SelectedScooterSheet';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false}} />
       <View style={{ flex: 1 }}> {/* Give the parent explicit flex:1 */}
          <Map/>
         
        <SelectedScooterSheet/>
      </View>
    </>
  );
}

