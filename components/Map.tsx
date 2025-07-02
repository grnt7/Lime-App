import Mapbox, { Camera, Images, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { StyleURL } from '@rnmapbox/maps/lib/typescript/src/RNMBXModule';
import { featureCollection, point } from '@turf/turf';
import pin from '../assets/pin.png';
import scooters from '../app/data/scooters.json';



Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');
export default function Map() {
  const points = scooters.map(scooter => point ([scooter.long, scooter.lat]));
    
  


  return (
    <MapView style={{flex:1}} styleURL="mapbox://styles/mapbox/dark-v11">
      <Camera followZoomLevel={10} followUserLocation/>
      <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true}}/>
        <Images images={{ pin }}/>
      <ShapeSource 
      id="scooters" 
      shape={featureCollection(points)}>
        <SymbolLayer id="scooter-icons" 
        style={{
          iconImage: 'pin',
          iconSize:0.5,
          iconAllowOverlap: true,
        }}
        
        />
    
      </ShapeSource>
      </MapView>
    
  );
}
