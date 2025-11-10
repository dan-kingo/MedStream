// controllers/medicine.controller.ts
import { Request, Response } from 'express';
import Medicine from '../models/medicine.js';
import Pharmacy from '../models/pharmacy.js';
import { createNotification } from '../utils/notification.js';
import asyncHandler from 'express-async-handler';


export const searchMedicines = async (req: Request, res: Response) => {
  console.log('Search request received with query:', req.query);

  try {
    const { query, latitude, longitude, delivery, sort } = req.query as {
      query?: string;
      latitude?: string;
      longitude?: string;
      delivery?: string;
      sort?: string;
    };

    // Validate query parameters
    if (!query) {
      console.log('No search query provided');
       res.status(400).json({ message: 'Search query is required' });
       return
    }

    // Validate coordinates if provided
    if (latitude || longitude) {
      if (!latitude || !longitude) {
        console.log('Invalid coordinates - both latitude and longitude must be provided');
         res.status(400).json({ 
          message: 'Both latitude and longitude must be provided' 
        });
        return
      }

      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        console.log('Invalid coordinate values');
         res.status(400).json({ 
          message: 'Latitude and longitude must be valid numbers' 
        });
        return
      }

      if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        console.log('Coordinates out of valid range');
         res.status(400).json({ 
          message: 'Invalid coordinate values' 
        });
        return
      }
    }

    // Validate sort parameter
    const validSortOptions = ['price_asc', 'price_desc', 'distance'];
    if (sort && !validSortOptions.includes(sort)) {
      console.log('Invalid sort parameter:', sort);
       res.status(400).json({ 
        message: 'Invalid sort parameter' 
      });
      return
    }

    // Build the medicine filter
    const medicineFilter: any = {
      name: { $regex: new RegExp(query, 'i') },
      quantity: { $gt: 0 },
      outOfStock: false
    };

    // Build the pharmacy filter
    const pharmacyFilter: any = {
      status: 'approved',
      isActive: true
    };

    if (delivery === 'true') {
      pharmacyFilter.deliveryAvailable = true;
    }

    console.log('Executing search with filters:', {
      medicineFilter,
      pharmacyFilter
    });

    const medicines = await Medicine.find(medicineFilter)
      .select('_id name type strength price quantity unit description requiresPrescription')
      .populate({
        path: 'pharmacy',
        select: 'name city deliveryAvailable location rating _id',
        model: Pharmacy,
        match: pharmacyFilter
      });

    console.log(`Found ${medicines.length} potential matches before filtering`);

    let results = medicines
      .filter((medicine) => {
        if (!medicine.pharmacy) {
          console.log(`Medicine ${medicine._id} filtered out - no pharmacy`);
          return false;
        }
        return true;
      })
      .map((medicine) => {
        const pharmacy = medicine.pharmacy as any;
        let distance: number | null = null;

        if (latitude && longitude && pharmacy?.location?.coordinates) {
          const [lng1, lat1] = pharmacy.location.coordinates;
          const lat2 = parseFloat(latitude);
          const lng2 = parseFloat(longitude);

          // Haversine formula
          const R = 6371;
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLng = (lng2 - lng1) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = R * c;
        }

        return {
          medicine: {
            _id: medicine._id,
            name: medicine.name,
            price: medicine.price,
            strength: medicine.strength,
            type: medicine.type,
            unit: medicine.unit,
            description: medicine.description,
            requiresPrescription: medicine.requiresPrescription
          },
          price: medicine.price,
          pharmacy: {
            _id: pharmacy._id,
            name: pharmacy.name,
            city: pharmacy.city,
            deliveryAvailable: pharmacy.deliveryAvailable,
            rating: pharmacy.rating ?? null,
            distance: distance ?? null,
          },
          available: medicine.quantity > 0,
        };
      });

    console.log(`Found ${results.length} valid results after filtering`);

    // Sorting
    if (sort === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      results.sort((a, b) => {
        const distA = a.pharmacy.distance ?? Infinity;
        const distB = b.pharmacy.distance ?? Infinity;
        return distA - distB;
      });
    }

    console.log('Returning search results:', results);
     res.json(results);
     return
  } catch (err) {
    console.error('Search error:', err);
     res.status(500).json({ 
      message: 'Failed to search medicines',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return
  }
};
export const getPopularMedicines = async (_req: Request, res: Response) => {
  try {
    const popular = await Medicine.aggregate([
      {
        $match: { 
          quantity: { $gt: 0 },
          outOfStock: false
        }
      },
      {
        $lookup: {
          from: 'pharmacies',
          localField: 'pharmacy',
          foreignField: '_id',
          as: 'pharmacy'
        }
      },
      {
        $unwind: '$pharmacy'
      },
      {
        $match: {
          'pharmacy.status': 'approved',
          'pharmacy.isActive': true
        }
      },
      {
        $sort: { quantity: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          name: 1,
          strength: 1,
          type: 1,
          unit: 1,
          quantity: 1,
          price: 1,
          description: 1,
          requiresPrescription: 1,
          pharmacy: {
            _id: '$pharmacy._id',
            name: '$pharmacy.name',
            city: '$pharmacy.city',
            deliveryAvailable: '$pharmacy.deliveryAvailable',
            rating: '$pharmacy.rating',
            location: '$pharmacy.location'
          }
        }
      }
    ]);

     res.status(200).json(popular);
     return
  } catch (err) {
    console.error('Error fetching popular medicines:', err);
     res.status(500).json({ message: 'Failed to fetch popular medicines' });
     return
  }
};

export const getMedicinesByPharmacy = asyncHandler(async (req: Request, res: Response) => {
  const { pharmacyId } = req.params;

  const medicines = await Medicine.find({ pharmacy: pharmacyId })
    .populate('pharmacy', 'name city deliveryAvailable rating description location _id')
    .sort({ name: 1 });

  if (!medicines || medicines.length === 0) {
    res.status(404);
    throw new Error('No medicines found for this pharmacy');
  }

  res.status(200).json(medicines);
});

export const getMedicineDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const medicine = await Medicine.findById(id)
      .select('-__v -createdAt -updatedAt')
      .populate({
        path: 'pharmacy',
        select: 'name phone email address city deliveryAvailable rating location',
      });

    if (!medicine) {
       res.status(404).json({ message: 'Medicine not found' });
       return
    }

     res.status(200).json(medicine);
     return
  } catch (error) {
    console.error('Error fetching medicine details:', error);
     res.status(500).json({ error: 'Server error' });
     return
  }
};

export const addMedicine = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });

    if (!pharmacy) {
       res.status(404).json({ error: "Pharmacy not found for this user." });
       return
    }

    const {
      name,
      strength,
      unit = '',
      type,
      description,
      requiresPrescription = false,
      price,
      quantity,
    } = req.body;

    const outOfStock = quantity <= 0;

    const newMedicine = await Medicine.create({
      name,
      strength,
      unit,
      type,
      description,
      requiresPrescription,
      price,
      quantity,
      outOfStock,
      pharmacy: pharmacy._id,
    });

    if (quantity < 5) {
      await createNotification({
        userId: userId!,
        message: `Low stock alert for ${newMedicine.name}. Only ${quantity} left.`,
        type: 'in-app',
      });
    }

     res.status(201).json({ 
      message: 'Medicine added successfully',
      medicine: {
        _id: newMedicine._id,
        name: newMedicine.name,
        strength: newMedicine.strength,
        unit: newMedicine.unit,
        type: newMedicine.type,
        description: newMedicine.description,
        requiresPrescription: newMedicine.requiresPrescription,
        price: newMedicine.price,
        quantity: newMedicine.quantity,
        outOfStock: newMedicine.outOfStock,
        pharmacy: newMedicine.pharmacy
      }
    });
    return
  } catch (error) {
    console.error('Add medicine error:', error);
     res.status(500).json({ error: 'Failed to add medicine' });
     return
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    const medicineId = req.params.id;
    const updates = req.body;

    if (updates.quantity !== undefined) {
      updates.outOfStock = updates.quantity <= 0;
    }

    const updatedMedicine = await Medicine.findOneAndUpdate(
      { _id: medicineId, pharmacy: pharmacy?._id },
      updates,
      { new: true, runValidators: true }
    ).select('-__v -createdAt -updatedAt');

    if (!updatedMedicine) {
       res.status(404).json({ error: 'Medicine not found or not owned by your pharmacy' });
       return
    }

    // Check if we need to send low stock notification
    if (updates.quantity !== undefined && updates.quantity < 5) {
      await createNotification({
        userId: userId!,
        message: `Low stock alert for ${updatedMedicine.name}. Only ${updatedMedicine.quantity} left.`,
        type: 'in-app',
      });
    }

     res.json({ 
      message: 'Medicine updated successfully',
      medicine: updatedMedicine
    });
    return
  } catch (error) {
    console.error('Update medicine error:', error);
     res.status(500).json({ error: 'Failed to update medicine' });
     return
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    const medicineId = req.params.id;

    const deletedMedicine = await Medicine.findOneAndDelete({
      _id: medicineId,
      pharmacy: pharmacy?._id,
    });

    if (!deletedMedicine) {
       res.status(404).json({ error: 'Medicine not found or not owned by your pharmacy' });
       return
    }

     res.json({ 
      message: 'Medicine deleted successfully',
      medicineId: deletedMedicine._id
    });
    return
  } catch (error) {
    console.error('Delete medicine error:', error);
     res.status(500).json({ error: 'Failed to delete medicine' });
     return
  }
};

export const markOutOfStock = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    const medicineId = req.params.id;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: medicineId, pharmacy: pharmacy?._id },
      { outOfStock: true, quantity: 0 },
      { new: true }
    ).select('-__v -createdAt -updatedAt');

    if (!medicine) {
       res.status(404).json({ error: 'Medicine not found or not owned by your pharmacy' });
       return
    }

     res.json({ 
      message: 'Medicine marked as out of stock',
      medicine
    });
    return
  } catch (error) {
    console.error('Mark out of stock error:', error);
     res.status(500).json({ error: 'Failed to update medicine status' });
     return
  }
};

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });

    const medicines = await Medicine.find({ pharmacy: pharmacy?._id })
      .select('-__v -createdAt -updatedAt')
      .sort({ createdAt: -1 });

     res.json({ 
      count: medicines.length,
      medicines 
    });
    return
  } catch (error) {
    console.error('Get medicines error:', error);
     res.status(500).json({ error: 'Failed to get medicines' });
     return
  }
};