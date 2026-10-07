import { supabase } from '@/lib/supabase';
import type {
  Campaign,
  CampaignWithStats,
  CampaignWithRelations,
  Donation,
  TransparencyStats,
} from '@/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCampaign(
  data: {
    title: string;
    description: string;
    category: string;
    goalAmount: number;
    recipientWallet: string;
    imageUrl?: string;
    milestones?: { title: string; description?: string; target?: string }[];
  }
): Promise<Campaign> {
  const slug = slugify(data.title);
  let uniqueSlug = slug;
  let suffix = 1;
  while (true) {
    const { data: existing } = await supabase
      .from('campaigns')
      .select('id')
      .eq('slug', uniqueSlug)
      .maybeSingle();
    if (!existing) break;
    uniqueSlug = `${slug}-${suffix++}`;
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      title: data.title,
      slug: uniqueSlug,
      description: data.description,
      category: data.category,
      goal_amount: data.goalAmount,
      recipient_wallet: data.recipientWallet,
      image_url: data.imageUrl || null,
      status: 'active',
      is_demo: false,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create campaign: ${error.message}`);
  if (!campaign) throw new Error('Failed to create campaign');

  if (data.milestones && data.milestones.length > 0) {
    const { error: milestoneError } = await supabase.from('milestones').insert(
      data.milestones.map((m) => ({
        campaign_id: campaign.id,
        title: m.title,
        description: m.description || null,
        target: m.target || null,
        status: 'pending',
      }))
    );
    if (milestoneError) throw new Error(`Failed to create milestones: ${milestoneError.message}`);
  }

  return campaign;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`);
  return data || [];
}

export async function getCampaignBySlug(slug: string): Promise<CampaignWithRelations | null> {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch campaign: ${error.message}`);
  if (!campaign) return null;

  const [milestonesResult, impactResult] = await Promise.all([
    supabase
      .from('milestones')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('impact_updates')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('created_at', { ascending: false }),
  ]);

  if (milestonesResult.error) throw new Error(`Failed to fetch milestones: ${milestonesResult.error.message}`);
  if (impactResult.error) throw new Error(`Failed to fetch impact updates: ${impactResult.error.message}`);

  return {
    ...campaign,
    milestones: milestonesResult.data || [],
    impact_updates: impactResult.data || [],
  };
}

export async function getCampaignWithStats(slug: string): Promise<CampaignWithStats | null> {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return null;

  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('status', 'verified')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch donations: ${error.message}`);

  const verifiedDonations = donations || [];
  const totalRaised = verifiedDonations.reduce((sum, d) => sum + Number(d.amount), 0);
  const donorCount = new Set(verifiedDonations.map((d) => d.donor_wallet)).size;

  return {
    ...campaign,
    total_raised: totalRaised,
    donation_count: verifiedDonations.length,
    donor_count: donorCount,
    donations: verifiedDonations,
  };
}

export async function getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'verified')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch donations: ${error.message}`);
  return data || [];
}

export async function getTransparencyStats(): Promise<TransparencyStats> {
  const [campaignsResult, donationsResult, activeResult] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('donations').select('amount').eq('status', 'verified'),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  if (campaignsResult.error) throw new Error(`Failed to fetch campaign count: ${campaignsResult.error.message}`);
  if (donationsResult.error) throw new Error(`Failed to fetch donations: ${donationsResult.error.message}`);

  const donations = donationsResult.data || [];
  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  return {
    total_campaigns: campaignsResult.count || 0,
    active_campaigns: activeResult.count || 0,
    total_donations: donations.length,
    total_amount: totalAmount,
    verified_transactions: donations.length,
  };
}

export async function getCampaignRows(): Promise<
  Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    goal_amount: number;
    status: string;
    total_raised: number;
    donation_count: number;
    donor_count: number;
  }>
> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`);

  if (!campaigns || campaigns.length === 0) return [];

  const campaignIds = campaigns.map((c) => c.id);
  const { data: donations, error: donationError } = await supabase
    .from('donations')
    .select('campaign_id, amount, donor_wallet')
    .eq('status', 'verified')
    .in('campaign_id', campaignIds);

  if (donationError) throw new Error(`Failed to fetch donations: ${donationError.message}`);

  const allDonations = donations || [];

  return campaigns.map((c) => {
    const cDonations = allDonations.filter((d) => d.campaign_id === c.id);
    const totalRaised = cDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    const donorCount = new Set(cDonations.map((d) => d.donor_wallet)).size;
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      goal_amount: c.goal_amount,
      status: c.status,
      total_raised: totalRaised,
      donation_count: cDonations.length,
      donor_count: donorCount,
    };
  });
}
