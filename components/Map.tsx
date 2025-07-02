import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import { StyleURL } from '@rnmapbox/maps/lib/typescript/src/RNMBXModule';




Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');
export default function Map() {
  return (
    <MapView style={{flex:1}} styleURL="mapbox://styles/mapbox/dark-v11">
      <Camera followZoomLevel={16} followUserLocation/>
      <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true}}/>
      </MapView>
    
  );
}
