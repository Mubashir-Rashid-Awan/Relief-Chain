import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Target,
  ExternalLink,
  BadgeCheck,
  ArrowLeft,
  ShieldCheck,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { FullPageSpinner, EmptyState } from '@/components/ui/Feedback';
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

export function CampaignTransparencyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<CampaignWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedSig, setCopiedSig] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getCampaignWithStats(slug)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setCampaign(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const copySignature = async (sig: string) => {
    await navigator.clipboard.writeText(sig);
    setCopiedSig(sig);
    setTimeout(() => setCopiedSig(null), 2000);
  };

  if (loading) return <FullPageSpinner label="Loading transparency data..." />;

  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-[#070f1e] pt-24">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <EmptyState
            icon={<Target size={48} />}
            title="Campaign not found"
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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to={`/campaign/${campaign.slug}`}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Campaign
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Transparency Report</h1>
            <p className="text-sm text-white/50">{campaign.title}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Goal"
            value={`$${formatTokenAmount(campaign.goal_amount, USDC_DECIMALS)}`}
          />
          <StatCard
            label="Total Raised"
            value={`$${formatTokenAmount(campaign.total_raised, USDC_DECIMALS)}`}
            icon={<BadgeCheck size={18} />}
          />
          <StatCard label="Donations" value={campaign.donation_count} />
          <StatCard label="Unique Donors" value={campaign.donor_count} />
        </div>

        {/* Progress */}
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white">
              ${formatTokenAmount(campaign.total_raised, USDC_DECIMALS)} raised
            </span>
            <span className="text-white/40">
              {pct.toFixed(1)}% of ${formatTokenAmount(campaign.goal_amount, USDC_DECIMALS)}
            </span>
          </div>
          <Progress value={campaign.total_raised} max={campaign.goal_amount} className="mt-3" />
        </Card>

        {/* Milestones */}
        {campaign.milestones.length > 0 && (
          <Card className="mt-6 p-6">
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
                    {m.description && <p className="mt-1 text-sm text-white/50">{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Blockchain Proof */}
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Blockchain Proof</h2>
          </div>
          <p className="mt-2 text-sm text-white/50">
            Every donation below has been independently verified against Solana {SOLANA_NETWORK} RPC.
            Click any transaction to view it on Solana Explorer.
          </p>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/40">Recipient Wallet</p>
            <a
              href={getExplorerAddressUrl(campaign.recipient_wallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-mono text-xs text-cyan-400 hover:underline break-all"
            >
              {campaign.recipient_wallet}
            </a>
          </div>
        </Card>

        {/* Donation History */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-bold text-white">Verified Donation History</h2>
          {campaign.donations.length === 0 ? (
            <div className="mt-6 text-center text-sm text-white/40">
              No verified donations yet. All donation records come from real verified Solana
              transactions.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-white/40">
                    <th className="pb-3 pr-4 font-medium">Donor</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Signature</th>
                    <th className="pb-3 font-medium">Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.donations.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-white/60">
                          {shortenAddress(d.donor_wallet, 5)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">
                        ${formatTokenAmount(d.amount, USDC_DECIMALS)}
                      </td>
                      <td className="py-3 pr-4 text-xs text-white/50">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white/40">
                            {shortenAddress(d.signature, 8)}
                          </span>
                          <button
                            onClick={() => copySignature(d.signature)}
                            className="text-white/30 hover:text-white"
                            aria-label="Copy signature"
                          >
                            {copiedSig === d.signature ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <a
                          href={getExplorerUrl(d.signature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20"
                        >
                          Verify <Search size={10} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <a
            href={`https://explorer.solana.com/address/${campaign.recipient_wallet}?cluster=${SOLANA_NETWORK}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              View Recipient on Solana Explorer <ExternalLink size={16} />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
