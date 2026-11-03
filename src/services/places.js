import axios from "axios";

// Thrown when the Google Places settings are missing, so callers can answer
// 503 instead of crashing on an undefined URL or key.
export class PlacesNotConfiguredError extends Error {
  constructor() {
    super("Place search is not configured on this server");
    this.status = 503;
  }
}

const placesConfig = () => {
  const { API_KEY, PLACES_API_ENDPOINT } = process.env;
  if (!API_KEY || !PLACES_API_ENDPOINT) {
    throw new PlacesNotConfiguredError();
  }
  return { apiKey: API_KEY, endpoint: PLACES_API_ENDPOINT };
};

// Latitude and longitude of the best match for a free-text place name, or
// null when Google finds nothing.
export const getPlaceCoordinates = async (place) => {
  const { apiKey, endpoint } = placesConfig();
  const response = await axios.get(endpoint, {
    params: { input: place, inputtype: "textquery", fields: "geometry", key: apiKey },
  });
  const location = response.data?.candidates?.[0]?.geometry?.location;
  if (!location) {
    return null;
  }
  return { latitude: location.lat, longitude: location.lng };
};

// Roughly 1 km around a point, in degrees.
export const SEARCH_RADIUS_DEGREES = 0.01;
