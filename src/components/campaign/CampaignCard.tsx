import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { formatTokenAmount } from '@/lib/solana/token';
import { USDC_DECIMALS } from '@/lib/solana/constants';
import type { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
  totalRaised?: number;
  donationCount?: number;
  donorCount?: number;
}

export function CampaignCard({
  campaign,
  totalRaised = 0,
  donationCount = 0,
  donorCount = 0,
}: CampaignCardProps) {
  const goalAmount = campaign.goal_amount;
  const pct = goalAmount > 0 ? Math.min((totalRaised / goalAmount) * 100, 100) : 0;

  return (
    <Link to={`/campaign/${campaign.slug}`} className="block">
      <Card hover className="group h-full overflow-hidden">
        <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
          {campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Target className="h-12 w-12 text-cyan-400/40" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="info">{campaign.category}</Badge>
            {campaign.is_demo && <Badge variant="warning">Demo</Badge>}
          </div>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-1 text-lg font-bold text-white group-hover:text-cyan-300">
            {campaign.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/50">
            {campaign.description}
          </p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">
                ${formatTokenAmount(totalRaised, USDC_DECIMALS)}
              </span>
              <span className="text-white/40">
                of ${formatTokenAmount(goalAmount, USDC_DECIMALS)}
              </span>
            </div>
            <Progress value={totalRaised} max={goalAmount} className="mt-2" />
            <div className="mt-1.5 text-xs text-cyan-400">{pct.toFixed(1)}% funded</div>
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} /> {donorCount} donors
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp size={14} /> {donationCount} verified
            </span>
          </div>

          <div className="mt-4 flex items-center justify-end text-sm text-cyan-400 group-hover:gap-3">
            <span>View Campaign</span>
            <ArrowRight size={16} className="transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
