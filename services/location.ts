
import { WARANGAL_CENTER } from '../constants';

/**
 * Calculates straight-line distance (Haversine)
 */
export const getStraightDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Professional Logistics Estimation
 * In Indian tier-2 cities, actual road distance is typically 20-30% longer than straight lines.
 */
export const calculateLogistics = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const straightDist = getStraightDistance(lat1, lon1, lat2, lon2);
  
  // Apply a "Road Factor" for city navigation (1.25x average)
  const roadDistanceKm = Number((straightDist * 1.25).toFixed(1));
  
  // Calculate ETA (Assume 25km/h average speed in Warangal traffic including prep/pickup buffer)
  // Time = (Distance / Speed) * 60 minutes + 10 mins buffer
  const travelTime = (roadDistanceKm / 25) * 60;
  const estimatedTimeMin = Math.ceil(travelTime + 10); 

  return {
    roadDistanceKm,
    estimatedTimeMin,
    straightDist: Number(straightDist.toFixed(1))
  };
};

export const isWithinWarangal = (lat: number, lng: number): boolean => {
  const distance = getStraightDistance(lat, lng, WARANGAL_CENTER.lat, WARANGAL_CENTER.lng);
  return distance <= 15;
};
