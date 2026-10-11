import type { Milestone } from '@/types';
import { TEST_TOKEN_DECIMALS } from '@/lib/solana/constants';
import { formatTokenAmount, parseTokenAmount } from '@/lib/solana/token';

function getTargetAmount(target: string | null): bigint | null {
  if (!target || !/^\d+(?:\.\d+)?$/.test(target)) return null;
  if ((target.split('.')[1]?.length ?? 0) > TEST_TOKEN_DECIMALS) return null;

  const amount = parseTokenAmount(target, TEST_TOKEN_DECIMALS);
  return amount > 0n ? amount : null;
}

export function getMilestonesWithProgress(
  milestones: Milestone[],
  totalRaised: number
): Milestone[] {
  const raisedAmount = BigInt(Math.max(0, Math.trunc(totalRaised)));
  let previousMilestonesComplete = true;

  return milestones.map((milestone) => {
    if (!previousMilestonesComplete) {
      return { ...milestone, status: 'pending' };
    }

    const targetAmount = getTargetAmount(milestone.target);
    if (targetAmount === null) {
      previousMilestonesComplete = false;
      return milestone;
    }

    if (raisedAmount >= targetAmount) {
      return { ...milestone, status: 'completed' };
    }

    previousMilestonesComplete = false;
    return { ...milestone, status: raisedAmount > 0n ? 'in_progress' : 'pending' };
  });
}

export function formatMilestoneTarget(target: string | null): string | null {
  const targetAmount = getTargetAmount(target);
  if (targetAmount === null) return target;

  return `${formatTokenAmount(targetAmount, TEST_TOKEN_DECIMALS)} Test Token`;
}
