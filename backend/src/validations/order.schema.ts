import { z } from 'zod';

const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z
    .tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90),   // latitude
    ]),
});

export const placeOrderBodySchema = z
  .object({
    items: z
      .array(
        z.object({
          medicineId: z.string().length(24).regex(/^[0-9a-fA-F]{24}$/),
          pharmacyId: z.string().length(24).regex(/^[0-9a-fA-F]{24}$/),
          quantity: z.number().min(1),
        })
      )
      .min(1, 'At least one order item is required'),

    deliveryType: z.enum(['delivery', 'pickup']),

    address: z.string().optional(),

    location: geoPointSchema.optional(),

    paymentMethod: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === 'delivery' && (!data.address || data.address.trim() === '')) {
      ctx.addIssue({
        path: ['address'],
        message: 'Address is required when deliveryType is "delivery"',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const orderIdParamSchema = z.object({
  id: z.string().length(24).regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Placed', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled']),
  rejectionReason: z.string().optional(),
});