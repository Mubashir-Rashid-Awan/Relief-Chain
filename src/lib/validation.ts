import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';

const solanaAddress = z
  .string()
  .min(32, 'Invalid address length')
  .refine((val) => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid Solana address');

const solanaSignature = z
  .string()
  .min(64, 'Invalid transaction signature')
  .max(128, 'Invalid transaction signature')
  .refine((val) => /^[a-zA-Z0-9]+$/.test(val), 'Invalid transaction signature format');

export const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description too long'),
  category: z.string().min(1, 'Category is required').max(60, 'Category too long'),
  goalAmount: z
    .number()
    .positive('Goal amount must be positive')
    .min(1, 'Goal must be at least 1'),
  recipientWallet: solanaAddress,
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  milestones: z
    .array(
      z.object({
        title: z.string().min(2, 'Milestone title must be at least 2 characters'),
        description: z.string().optional().or(z.literal('')),
        target: z.string().optional().or(z.literal('')),
      })
    )
    .max(10, 'Maximum 10 milestones')
    .optional()
    .default([]),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const verifyDonationSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  signature: solanaSignature,
  donorWallet: solanaAddress,
});

export type VerifyDonationInput = z.infer<typeof verifyDonationSchema>;
