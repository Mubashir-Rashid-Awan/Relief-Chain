import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Plus, Search } from 'lucide-react';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner, EmptyState } from '@/components/ui/Feedback';
import { getAllCampaigns, getCampaignRows } from '@/lib/campaigns';
import type { Campaign } from '@/types';

export function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<
    Record<string, { totalRaised: number; donationCount: number; donorCount: number }>
  >({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getAllCampaigns(), getCampaignRows()])
      .then(([campaignsData, rowsData]) => {
        setCampaigns(campaignsData);
        const statsMap: Record<string, { totalRaised: number; donationCount: number; donorCount: number }> = {};
        for (const row of rowsData) {
          statsMap[row.id] = {
            totalRaised: row.total_raised,
            donationCount: row.donation_count,
            donorCount: row.donor_count,
          };
        }
        setStats(statsMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullPageSpinner label="Loading campaigns..." />;

  return (
    <div className="min-h-screen bg-[#070f1e] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Relief Campaigns</h1>
            <p className="mt-2 text-white/50">
              Browse humanitarian campaigns and donate with verifiable on-chain
              transactions.
            </p>
          </div>
          <Link to="/create">
            <Button>
              <Plus size={18} /> Create Campaign
            </Button>
          </Link>
        </div>

        <div className="mt-8 mb-6 relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Target size={48} />}
            title="No campaigns found"
            description={
              search
                ? 'Try a different search term.'
                : 'No campaigns have been created yet. Be the first to create one.'
            }
            action={
              <Link to="/create">
                <Button>
                  <Plus size={18} /> Create Campaign
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const s = stats[c.id] || { totalRaised: 0, donationCount: 0, donorCount: 0 };
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
        )}
      </div>
    </div>
  );
}
