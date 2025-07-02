import { Stack, Link } from 'expo-router';
import { View } from 'react-native'; // Add View and StyleSheet import
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import Map from "~/components/Map";
import { ScreenContent } from '~/components/ScreenContent';


export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
       <View style={{ flex: 1 }}> {/* Give the parent explicit flex:1 */}
          <Map/>
      </View>
    </>
  );
}
