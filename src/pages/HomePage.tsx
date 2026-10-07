import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Link2,
  Eye,
  TrendingUp,
  HeartHandshake,
  Wallet,
  Coins,
  Search,
  BadgeCheck,
  BarChart3,
  Target,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { getTransparencyStats, getAllCampaigns, getCampaignRows } from '@/lib/campaigns';
import type { TransparencyStats, Campaign } from '@/types';

export function HomePage() {
  const [stats, setStats] = useState<TransparencyStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<Record<string, { totalRaised: number; donationCount: number; donorCount: number }>>({});

  useEffect(() => {
    Promise.all([getTransparencyStats(), getAllCampaigns(), getCampaignRows()])
      .then(([statsData, campaignsData, rowsData]) => {
        setStats(statsData);
        setCampaigns(campaignsData.slice(0, 3));
        const statsMap: Record<string, { totalRaised: number; donationCount: number; donorCount: number }> = {};
        for (const row of rowsData) {
          statsMap[row.id] = {
            totalRaised: row.total_raised,
            donationCount: row.donation_count,
            donorCount: row.donor_count,
          };
        }
        setCampaignStats(statsMap);
      })
      .catch(() => {
        // show empty state
      });
  }, []);

  return (
    <div className="bg-[#070f1e]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl h-96 w-96" />
        <div className="absolute right-20 top-40 rounded-full bg-blue-600/10 blur-3xl h-64 w-64" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" className="mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Built on Solana · Devnet
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Transparent Relief.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Verified On-Chain.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              ReliefChain makes humanitarian donations transparent by recording and
              verifying every contribution on Solana. No trust required — just verify the
              chain.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/campaigns">
                <Button size="lg">
                  Explore Campaigns <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/create">
                <Button size="lg" variant="outline">
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Flow visual */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-3">
            {[
              { icon: <HeartHandshake size={24} />, label: 'Donor', desc: 'Chooses a campaign' },
              { icon: <Wallet size={24} />, label: 'Wallet', desc: 'Connects Phantom' },
              { icon: <Coins size={24} />, label: 'Transfer', desc: 'SPL token on Solana' },
              { icon: <ShieldCheck size={24} />, label: 'Verify', desc: 'RPC confirmation' },
              { icon: <BarChart3 size={24} />, label: 'Dashboard', desc: 'Public proof' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <Card className="p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    {step.icon}
                  </div>
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                  <p className="mt-1 text-xs text-white/40">{step.desc}</p>
                </Card>
                {i < 4 && (
                  <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-white/20 md:block">
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trustless Transparency"
            title="Every donation is independently verifiable"
            description="Don't trust the dashboard. Verify the chain. Every donation record is backed by a real Solana transaction signature."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="On-Chain Donations"
              value={stats?.total_donations ?? '—'}
              icon={<Link2 size={20} />}
              sublabel="Real SPL token transfers"
            />
            <StatCard
              label="Verified Transactions"
              value={stats?.verified_transactions ?? '—'}
              icon={<ShieldCheck size={20} />}
              sublabel="Confirmed on Solana RPC"
            />
            <StatCard
              label="Transparent Campaigns"
              value={stats?.total_campaigns ?? '—'}
              icon={<Eye size={20} />}
              sublabel="Public donation history"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="From wallet to verified impact"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {[
              { num: '01', icon: <Search size={22} />, title: 'Choose a Campaign', desc: 'Browse verified humanitarian campaigns.' },
              { num: '02', icon: <Wallet size={22} />, title: 'Connect Wallet', desc: 'Connect your Phantom Solana wallet.' },
              { num: '03', icon: <Coins size={22} />, title: 'Donate USDC', desc: 'Sign a real SPL token transfer.' },
              { num: '04', icon: <ShieldCheck size={22} />, title: 'Verify Transaction', desc: 'Backend confirms it on Solana RPC.' },
              { num: '05', icon: <TrendingUp size={22} />, title: 'Track Impact', desc: 'Watch the public dashboard update.' },
            ].map((step) => (
              <Card key={step.num} className="p-6" hover>
                <div className="mb-3 text-xs font-bold text-cyan-400/60">{step.num}</div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs text-white/50">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="Built for trust, powered by Solana"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Link2 size={22} />, title: 'On-Chain Donations', desc: 'Every donation is a real SPL token transfer on Solana. No mock transactions.' },
              { icon: <ShieldCheck size={22} />, title: 'Blockchain Verification', desc: 'Our backend independently verifies each transaction against Solana RPC before recording it.' },
              { icon: <Eye size={22} />, title: 'Public Transparency', desc: 'All verified donations are publicly visible with transaction signatures and Explorer links.' },
              { icon: <Target size={22} />, title: 'Impact Tracking', desc: 'Campaign milestones and impact updates keep donors informed about real-world outcomes.' },
              { icon: <BadgeCheck size={22} />, title: 'Duplicate Prevention', desc: 'Each transaction signature can only be recorded once. No double-counting.' },
              { icon: <Target size={22} />, title: 'Milestone Tracking', desc: 'Campaign milestones keep donors informed about real-world outcomes and progress.' },
            ].map((feat) => (
              <Card key={feat.title} className="p-6" hover>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm text-white/50">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      {campaigns.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <SectionHeading
                eyebrow="Featured Campaigns"
                title="Active relief campaigns"
                center={false}
              />
              <Link to="/campaigns" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => {
                const s = campaignStats[c.id] || { totalRaised: 0, donationCount: 0, donorCount: 0 };
                return (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    totalRaised={s.totalRaised}
                    donationCount={s.donationCount}
                    donorCount={s.donorCount}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Transparency CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                <ShieldCheck className="h-8 w-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Don&apos;t trust the dashboard.
                <br />
                <span className="text-cyan-400">Verify the chain.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">
                Every donation record is backed by a Solana transaction signature. Click any
                donation to view it on Solana Explorer — independent proof that the
                contribution happened.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/transparency">
                  <Button size="lg">
                    View Transparency Dashboard <ArrowRight size={18} />
                  </Button>
                </Link>
                <a
                  href="https://explorer.solana.com/?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline">
                    Solana Explorer
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
