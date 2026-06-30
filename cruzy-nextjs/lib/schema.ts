import { z } from 'zod'

const authorizedUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
})

export const formSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Phone number is required'),
  email: z.string().email('Valid email is required'),

  // Address
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),

  // Spouse
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),

  // Authorized users
  authorizedUsers: z.array(authorizedUserSchema).max(3).optional(),

  // Payment
  nameOnCard: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().min(12, 'Valid card number is required'),
  cardExpMonth: z.string().min(1, 'Expiry month is required'),
  cardExpYear: z.string().min(4, 'Expiry year is required'),
  cardCvv: z.string().min(3, 'CVV is required'),

  // Terms
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms and Conditions',
  }),
})

export type FormValues = z.infer<typeof formSchema>
