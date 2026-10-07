import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Target,
  Users,
  TrendingUp,
  ExternalLink,
  BadgeCheck,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner, EmptyState } from '@/components/ui/Feedback';
import { DonationForm } from '@/components/donation/DonationForm';
import { getCampaignWithStats } from '@/lib/campaigns';
import { formatTokenAmount } from '@/lib/solana/token';
import {
  USDC_DECIMALS,
  shortenAddress,
  getExplorerUrl,
  getExplorerAddressUrl,
  SOLANA_NETWORK,
} from '@/lib/solana/constants';
import type { CampaignWithStats } from '@/types';

export function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<CampaignWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadCampaign = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await getCampaignWithStats(slug);
      if (!data) {
        setNotFound(true);
        return;
      }
      setCampaign(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  if (loading) return <FullPageSpinner label="Loading campaign..." />;

  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-[#070f1e] pt-24">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <EmptyState
            icon={<Target size={48} />}
            title="Campaign not found"
            description="This campaign may have been removed or the URL is incorrect."
            action={
              <Link to="/campaigns">
                <Button>Browse Campaigns</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const pct =
    campaign.goal_amount > 0
      ? Math.min((campaign.total_raised / campaign.goal_amount) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#070f1e] pt-20">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        {campaign.image_url ? (
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
            <Target className="h-16 w-16 text-cyan-400/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070f1e] via-[#070f1e]/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Left: Campaign info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{campaign.category}</Badge>
                {campaign.is_demo && <Badge variant="warning">Demo Campaign</Badge>}
                <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                  {campaign.status}
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                {campaign.title}
              </h1>
            </div>

            {/* Stats */}
            <Card className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-white/40">Raised</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    ${formatTokenAmount(campaign.total_raised, USDC_DECIMALS)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Goal</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    ${formatTokenAmount(campaign.goal_amount, USDC_DECIMALS)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Progress</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-400">{pct.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={campaign.total_raised} max={campaign.goal_amount} className="mt-4" />
              <div className="mt-4 flex items-center gap-6 text-sm text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={16} /> {campaign.donor_count} donors
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck size={16} /> {campaign.donation_count} verified donations
                </span>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-white">About this campaign</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                {campaign.description}
              </p>
            </Card>

            {/* Milestones */}
            {campaign.milestones.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-white">Milestones</h2>
                <div className="mt-4 space-y-3">
                  {campaign.milestones.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-400">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{m.title}</h3>
                          <Badge
                            variant={
                              m.status === 'completed'
                                ? 'success'
                                : m.status === 'in_progress'
                                  ? 'warning'
                                  : 'default'
                            }
                          >
                            {m.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {m.description && (
                          <p className="mt-1 text-sm text-white/50">{m.description}</p>
                        )}
                        {m.target && (
                          <p className="mt-1 text-xs text-cyan-400">Target: {m.target}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Impact Updates */}
            {campaign.impact_updates.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-white">Impact Updates</h2>
                <div className="mt-4 space-y-4">
                  {campaign.impact_updates.map((update) => (
                    <div
                      key={update.id}
                      className="rounded-xl border border-white/5 bg-white/5 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-white/40" />
                        <span className="text-xs text-white/40">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-white">{update.title}</h3>
                      {update.description && (
                        <p className="mt-1 text-sm text-white/50">{update.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Donation History */}
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Verified Donations</h2>
              </div>
              {campaign.donations.length === 0 ? (
                <div className="mt-6 text-center text-sm text-white/40">
                  No verified donations yet. Be the first to donate!
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {campaign.donations.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                          <BadgeCheck size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-white/60">
                            {shortenAddress(d.donor_wallet, 5)}
                          </p>
                          <p className="text-xs text-white/40">
                            {new Date(d.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          ${formatTokenAmount(d.amount, USDC_DECIMALS)}
                        </p>
                        <a
                          href={getExplorerUrl(d.signature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                        >
                          Explorer <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right: Donation sidebar */}
          <div className="space-y-4">
            <DonationForm campaign={campaign} onDonationVerified={loadCampaign} />

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-white/80">Recipient Wallet</h3>
              <a
                href={getExplorerAddressUrl(campaign.recipient_wallet)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-mono text-xs text-cyan-400 hover:underline break-all"
              >
                {campaign.recipient_wallet}
              </a>
              <p className="mt-2 text-xs text-white/40">
                Donations are sent directly to this wallet on Solana {SOLANA_NETWORK}.
              </p>
            </Card>

            <Link to={`/campaign/${campaign.slug}/transparency`}>
              <Button variant="secondary" className="w-full">
                View Transparency Page <ExternalLink size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
