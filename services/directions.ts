const BASE_URL = "https://api.mapbox.com";

export async function getDirections(from, to) {
 const response = await fetch (
    `${BASE_URL}/directions/v5/mapbox/walking/${from[0]},${from[1]};${to[0]},${to[1]}?alternatives=true&annotations=distance%2Cduration&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`
) 
    const json = await response.json();
   return json;
}

export async function fetchDirectionBasedOnCoords(coordinates) {
    const coordinatesString = coordinates.map((coord) => `${coord[0]}, ${coord[1]}`).join(';');

     const response = await fetch (
    `${BASE_URL}matching/v5/mapbox/cycling/${coordinatesString}?alternatives=true&annotations=distance%2Cduration&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`
) 
    const json = await response.json();
   return json;
}