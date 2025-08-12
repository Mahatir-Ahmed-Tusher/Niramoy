import { z } from 'zod';

export const FindSpecialistInputSchema = z.object({
  symptoms: z.string().min(1, { message: 'Please describe the symptoms.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  state: z.string().min(1, { message: 'State or Division is required.' }),
  country: z.string().min(1, { message: 'Country is required.' }),
});
