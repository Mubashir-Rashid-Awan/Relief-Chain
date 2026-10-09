import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createCampaignSchema } from '@/lib/validation';
import { createCampaign } from '@/lib/campaigns';
import { isPublicKey, USDC_DECIMALS } from '@/lib/solana/constants';
import { parseTokenAmount } from '@/lib/solana/token';

interface MilestoneInput {
  title: string;
  description: string;
  target: string;
}

const CATEGORIES = [
  'Flood Relief',
  'Earthquake Relief',
  'Medical Emergency',
  'Food Security',
  'Refugee Support',
  'Education',
  'Clean Water',
  'General',
];

export function CreateCampaignPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Flood Relief');
  const [goalAmount, setGoalAmount] = useState('');
  const [recipientWallet, setRecipientWallet] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: '', description: '', target: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const addMilestone = () => {
    if (milestones.length >= 10) return;
    setMilestones([...milestones, { title: '', description: '', target: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string) => {
    setMilestones(
      milestones.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const cleanMilestones = milestones.filter((m) => m.title.trim());

    const data = {
      title: title.trim(),
      description: description.trim(),
      category,
      goalAmount: parseFloat(goalAmount),
      recipientWallet: recipientWallet.trim(),
      imageUrl: imageUrl.trim(),
      milestones: cleanMilestones,
    };

    const result = createCampaignSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        if (err.path[0] && !fieldErrors[err.path[0] as string]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (!isPublicKey(recipientWallet.trim())) {
      setErrors({ recipientWallet: 'Invalid Solana wallet address' });
      return;
    }

    let goalAmountBaseUnits: bigint;
    try {
      goalAmountBaseUnits = parseTokenAmount(goalAmount, USDC_DECIMALS);
    } catch {
      setErrors({ goalAmount: 'Enter a valid goal amount' });
      return;
    }
    if (goalAmountBaseUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
      setErrors({ goalAmount: 'Goal amount is too large' });
      return;
    }

    setSubmitting(true);
    try {
      const campaign = await createCampaign({
        title: data.title,
        description: data.description,
        category: data.category,
        goalAmount: Number(goalAmountBaseUnits),
        recipientWallet: data.recipientWallet,
        imageUrl: data.imageUrl,
        milestones: data.milestones,
      });
      navigate(`/campaign/${campaign.slug}`);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to create campaign',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070f1e] pt-24">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
            <Target className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Campaign</h1>
            <p className="text-sm text-white/50">
              Launch a transparent donation campaign on Solana.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white">Campaign Details</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Punjab Flood Relief 2026"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the campaign, who it helps, and how funds will be used..."
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/70">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0a1628]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/70">
                    Goal Amount (USDC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                  {errors.goalAmount && (
                    <p className="mt-1 text-xs text-red-400">{errors.goalAmount}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Recipient Wallet Address
                </label>
                <input
                  type="text"
                  value={recipientWallet}
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  placeholder="Solana wallet address that will receive donations"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                {errors.recipientWallet && (
                  <p className="mt-1 text-xs text-red-400">{errors.recipientWallet}</p>
                )}
                <p className="mt-1 text-xs text-white/40">
                  This is the wallet that will receive all donations on Solana Devnet.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Cover Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.example.com/flood-relief.jpg"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Milestones</h3>
              <Button type="button" size="sm" variant="outline" onClick={addMilestone}>
                <Plus size={14} /> Add Milestone
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/40">
                      Milestone {i + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(i)}
                        className="text-white/30 hover:text-red-400"
                        aria-label="Remove milestone"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                    placeholder="e.g. 500 Food Packages"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={m.target}
                    onChange={(e) => updateMilestone(i, 'target', e.target.value)}
                    placeholder="Target metric (optional)"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </Card>

          {errors.submit && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => navigate('/campaigns')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
