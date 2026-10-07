export type CampaignStatus = 'active' | 'paused' | 'completed';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export type DonationStatus = 'verified' | 'pending' | 'failed';

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  goal_amount: number;
  recipient_wallet: string;
  image_url: string | null;
  status: CampaignStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  target: string | null;
  status: MilestoneStatus;
  created_at: string;
}

export interface Donation {
  id: string;
  campaign_id: string;
  donor_wallet: string;
  amount: number;
  token_mint: string;
  signature: string;
  status: DonationStatus;
  verified_at: string | null;
  created_at: string;
}

export interface ImpactUpdate {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface CampaignWithRelations extends Campaign {
  milestones: Milestone[];
  impact_updates: ImpactUpdate[];
}

export interface CampaignWithStats extends Campaign {
  milestones: Milestone[];
  impact_updates: ImpactUpdate[];
  total_raised: number;
  donation_count: number;
  donor_count: number;
  donations: Donation[];
}

export interface TransparencyStats {
  total_campaigns: number;
  active_campaigns: number;
  total_donations: number;
  total_amount: number;
  verified_transactions: number;
}

export interface CampaignRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  goal_amount: number;
  total_raised: number;
  donation_count: number;
  donor_count: number;
  status: CampaignStatus;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  connecting: boolean;
}
