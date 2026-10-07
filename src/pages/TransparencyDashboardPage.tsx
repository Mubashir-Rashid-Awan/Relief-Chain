import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  FolderOpen as CampaignIcon,
  BadgeCheck,
  Coins,
  Users,
  TrendingUp,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FullPageSpinner, EmptyState } from '@/components/ui/Feedback';
import { getTransparencyStats, getCampaignRows } from '@/lib/campaigns';
import { formatTokenAmount } from '@/lib/solana/token';
import { USDC_DECIMALS } from '@/lib/solana/constants';
import type { TransparencyStats } from '@/types';

interface CampaignRowData {
  id: string;
  title: string;
  slug: string;
  category: string;
  goal_amount: number;
  status: string;
  total_raised: number;
  donation_count: number;
  donor_count: number;
}

export function TransparencyDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransparencyStats | null>(null);
  const [rows, setRows] = useState<CampaignRowData[]>([]);

  useEffect(() => {
    Promise.all([getTransparencyStats(), getCampaignRows()])
      .then(([statsData, rowsData]) => {
        setStats(statsData);
        setRows(rowsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner label="Loading transparency data..." />;

  return (
    <div className="min-h-screen bg-[#070f1e] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
            <BarChart3 className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Transparency Dashboard</h1>
            <p className="text-sm text-white/50">
              Every number comes from verified on-chain donations.
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Campaigns"
            value={stats?.total_campaigns ?? 0}
            icon={<CampaignIcon size={20} />}
          />
          <StatCard
            label="Active Campaigns"
            value={stats?.active_campaigns ?? 0}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            label="Verified Donations"
            value={stats?.total_donations ?? 0}
            icon={<BadgeCheck size={20} />}
            sublabel="Confirmed on Solana RPC"
          />
          <StatCard
            label="Total Donated"
            value={`$${formatTokenAmount(stats?.total_amount ?? 0, USDC_DECIMALS)}`}
            icon={<Coins size={20} />}
            sublabel="Test USDC on Devnet"
          />
        </div>

        {/* Campaign Table */}
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Campaign Breakdown</h2>
            <Badge variant="success">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All data verified on-chain
            </Badge>
          </div>

          {rows.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<CampaignIcon size={48} />}
                title="No campaigns yet"
                description="No verified donations have been recorded yet. Create a campaign and make a test donation to see data here."
                action={
                  <Link to="/create">
                    <Button>Create Campaign</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-white/40">
                    <th className="pb-3 pr-4 font-medium">Campaign</th>
                    <th className="pb-3 pr-4 font-medium">Goal</th>
                    <th className="pb-3 pr-4 font-medium">Raised</th>
                    <th className="pb-3 pr-4 font-medium">Donors</th>
                    <th className="pb-3 pr-4 font-medium">Verified</th>
                    <th className="pb-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const pct =
                      row.goal_amount > 0
                        ? Math.min((row.total_raised / row.goal_amount) * 100, 100)
                        : 0;
                    return (
                      <tr key={row.id} className="border-b border-white/5 last:border-0">
                        <td className="py-4 pr-4">
                          <Link
                            to={`/campaign/${row.slug}`}
                            className="font-medium text-white hover:text-cyan-300"
                          >
                            {row.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-white/40">{row.category}</p>
                        </td>
                        <td className="py-4 pr-4 text-white/60">
                          ${formatTokenAmount(row.goal_amount, USDC_DECIMALS)}
                        </td>
                        <td className="py-4 pr-4 font-semibold text-white">
                          ${formatTokenAmount(row.total_raised, USDC_DECIMALS)}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1 text-white/60">
                            <Users size={12} /> {row.donor_count}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1 text-white/60">
                            <BadgeCheck size={12} className="text-emerald-400" />{' '}
                            {row.donation_count}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={row.total_raised}
                              max={row.goal_amount}
                              className="w-24"
                            />
                            <span className="text-xs text-cyan-400">{pct.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* CTA */}
        <Card className="mt-8 p-8 text-center">
          <SectionHeading
            eyebrow="Verify Everything"
            title="Don't trust the dashboard. Verify the chain."
            description="Every donation record is backed by a real Solana transaction signature. Click any donation to view it on Solana Explorer."
          />
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/campaigns">
              <Button size="lg">
                Browse Campaigns <ArrowRight size={18} />
              </Button>
            </Link>
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">
                Solana Explorer <ExternalLink size={16} />
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
