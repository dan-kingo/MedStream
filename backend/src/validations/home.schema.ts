import { z } from 'zod';

export const nearbyPharmaciesQuerySchema = z.object({
  latitude: z
    .string({
      required_error: 'Latitude is required',
      invalid_type_error: 'Latitude must be a string',
    })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    }, { message: 'Latitude must be a number between -90 and 90' }),
  
  longitude: z
    .string({
      required_error: 'Longitude is required',
      invalid_type_error: 'Longitude must be a string',
    })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    }, { message: 'Longitude must be a number between -180 and 180' }),
});
