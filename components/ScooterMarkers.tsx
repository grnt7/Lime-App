// This will be your new file, e.g., 'scooterMarkers.tsx'

import React from 'react';
import { StyleSheet } from 'react-native';
import { CircleLayer, SymbolLayer, ShapeSource, Images } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/turf';
import scooters from '../app/data/scooters.json'; // Ensure this path is correct
import pin from '../assets/pin.png'; // Ensure this path is correct
import { useScooter } from '../providers/ScooterProvider'; // Import the scooter 


const scooterPoints = scooters.map(scooter => point([scooter.long, scooter.lat], { scooter }));
const scooterFeatureCollection = featureCollection(scooterPoints);

interface ScooterMarkersProps {
  onScooterPress: (event: any) => void;
}

//type MapboxTouchEvent = Mapbox.MapboxTouchEvent;


export default function ScooterMarkers({ onScooterPress }: ScooterMarkersProps) {
  return (
    <>
      <Images images={{ pin }} />
      <ShapeSource 
        id="scooters" 
        cluster
        shape={scooterFeatureCollection}
        onPress={onScooterPress}
      >
        {/* Cluster Circle Layer */}
        <CircleLayer
          id="clusters"
          filter={['has', 'point_count']}
          style={styles.clusterCircle}
        />
        {/* Cluster Count Symbol Layer */}
        <SymbolLayer
          id="clusters-count"
          filter={['has', 'point_count']}
          style={styles.clusterText}
        />
        {/* Individual Scooter Pin Layer */}
        <SymbolLayer 
          id="scooter-icons" 
          filter={['!', ['has', 'point_count']]}
          style={styles.scooterIcon}
        />
      </ShapeSource>
    </>
  );
}

const styles = StyleSheet.create({
  clusterCircle: {
    circlePitchAlignment: 'map',
    circleColor: '#42E100',
    circleRadius: 20,
    circleOpacity: 1,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },
  clusterText: {
    textField: ['get', 'point_count'],
    textSize: 16,
    textAllowOverlap: true,
    textColor: 'white',
  },
  scooterIcon: {
    iconImage: 'pin',
    iconSize: 0.5,
    iconAllowOverlap: true,
    iconAnchor: 'bottom',
  },
});