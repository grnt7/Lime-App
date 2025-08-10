import { LineLayer, ShapeSource } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import React from "react";

export default function LineRoute({ coordinates }: { coordinates: Position[] | null }) {
console.log(coordinates)
    // Add this check to prevent rendering when coordinates are null or empty
    if (!coordinates || coordinates.length === 0) {
        return null;
    }

    return (
        <ShapeSource
            id="routeSource"
            lineMetrics
            shape={{
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates,
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
    );
}