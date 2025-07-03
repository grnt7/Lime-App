import Mapbox, { Camera, CircleLayer, Images, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { getDirections } from '../services/directions';
import { featureCollection, point } from '@turf/turf';
import pin from '../assets/pin.png';
import locationicon from '../assets/location-icon.png';
import scooters from '../app/data/scooters.json';
import routeResponse from '../app/data/route.json';
import { useState } from 'react';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');
export default function Map() {
  
  const [direction, setDirection] = useState();
  const points = scooters.map(scooter => point ([scooter.long, scooter.lat]));
   
  
 const startLocationCoordinates = [2.1734, 41.3851]; // Example coordinates for Barcelona
const startPointFeature = point(startLocationCoordinates, { title: 'Start Location' });

  //const directionCoordinate = direction?.routes?.[0].geometry.coordinates;
const directionCoordinate = direction?.routes[0]?.geometry.coordinates;


  const onPointPress = async (event: OnPressEvent) => {
    
   const newDirection = await getDirections([2.1734, 41.3851],[event.coordinates.longitude, event.coordinates.latitude]);
    
   
   setDirection(newDirection);
  }


  return (
    <MapView style={{flex:1}} styleURL="mapbox://styles/mapbox/dark-v11">
      <Camera followZoomLevel={16} followUserLocation
      centerCoordinate={startLocationCoordinates}/> 
      <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true}}/>
        <Images images={{ pin, locationicon }}/>
        <ShapeSource
          id="startLocationMarkerSource"
          shape={featureCollection([startPointFeature])}
      >
          <SymbolLayer
              id="location-icon"
              style={{
                  iconImage: 'locationicon',
                  iconSize: 0.5,
                  iconAllowOverlap: true,
                  iconAnchor: 'bottom',
                  textField: ['get', 'title'],
                  textSize: 14,
                  textColor: '#0000FF',
                  textHaloColor: 'white',
                  textHaloWidth: 1,
                  textOffset: [0, -2],
              }}
          />
      </ShapeSource>
      <ShapeSource 
      id="scooters" 
      cluster
      shape={featureCollection(points)}
     onPress={onPointPress} //this will trigger when a scooter is pressed
      >
        <CircleLayer
        id="clusters"
       
        filter={['has', 'point_count']}
        style={{
            circlePitchAlignment: 'map',
    circleColor: '#42E100',
    circleRadius: 20,
    circleOpacity: 1,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
        }}
        />
      <SymbolLayer
        id="clusters-count"
        filter={['has', 'point_count']}
         style={{
          textField: ['get', 'point_count'],
           textSize: 16,  
            textAllowOverlap: true,     
          textColor: 'white',
         }}
        />
        
        
        <SymbolLayer 
        id="scooter-icons" 
        filter={['!',['has', 'point_count']]}
        style={{
          iconImage: 'pin',
          iconSize:0.5,
          iconAllowOverlap: true,
          iconAnchor: 'bottom',
        }}
        
        />
    
      </ShapeSource>
      {directionCoordinate && (
  <ShapeSource
    id="routeSource"
    lineMetrics
    shape={{
      properties: {},
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: directionCoordinate,
      },
    }}>
    <LineLayer
      id="exampleLineLayer"
      style={{
        lineColor: '#42E100',
        lineCap: 'round',
        lineJoin: 'round',
        lineWidth: 7,
      }}
    />
  </ShapeSource>
)}
      </MapView>
    
  );
}

