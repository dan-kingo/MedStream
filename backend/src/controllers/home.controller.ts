import { Request, Response } from 'express';
import Pharmacy from '../models/pharmacy.js';

export const getNearbyPharmacies = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
       res.status(400).json({ 
        success: false,
        message: 'Latitude and longitude are required parameters.' 
      });
      return
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    if (isNaN(lat) || isNaN(lng)) {
       res.status(400).json({ 
        success: false,
        message: 'Invalid coordinates provided.' 
      });
      return
    }

    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 5000, // 5 km radius
        },
      },
    }).select('name address city state postalCode phone location deliveryAvailable rating');

    // Calculate distance for each pharmacy
    const pharmaciesWithDistance = pharmacies.map(pharmacy => {
      const coordinates = pharmacy.location?.coordinates;
      const distance = Array.isArray(coordinates) && coordinates.length === 2
        ? calculateDistance(lat, lng, coordinates[1], coordinates[0])
        : null;
      return {
        ...pharmacy.toObject(),
        distance
      };
    });

    res.status(200).json({ 
      success: true,
      pharmacies: pharmaciesWithDistance 
    });
  } catch (err) {
    console.error('Error fetching pharmacies:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch pharmacies',
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
};

// Helper function to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}