import { Link } from 'react-router-dom';
import {
  Search,
  Wallet,
  Coins,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  HeartHandshake,
  Globe,
  Server,
  Database,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function HowItWorksPage() {
  const steps = [
    {
      icon: <Search size={24} />,
      title: '1. Choose a Campaign',
      desc: 'Browse humanitarian relief campaigns on ReliefChain. Each campaign has a clear goal, recipient wallet, and milestones.',
    },
    {
      icon: <Wallet size={24} />,
      title: '2. Connect Your Wallet',
      desc: 'Connect a Phantom-compatible Solana wallet. We never ask for your seed phrase or private keys — only standard wallet connection and transaction signing.',
    },
    {
      icon: <Coins size={24} />,
      title: '3. Donate with USDC',
      desc: 'Enter your donation amount and click "Donate with Solana." The app creates a real SPL token transfer transaction. Your wallet asks you to sign it.',
    },
    {
      icon: <ShieldCheck size={24} />,
      title: '4. Verify the Transaction',
      desc: 'After you sign, the transaction is submitted to Solana Devnet. Our backend independently fetches the transaction from Solana RPC and verifies: the transaction exists, it succeeded, the correct token mint was used, the correct recipient received the funds, and the amount matches.',
    },
    {
      icon: <TrendingUp size={24} />,
      title: '5. Track Real Impact',
      desc: 'Only after successful verification is the donation recorded. The campaign total, transparency dashboard, and donation history all update with verified data.',
    },
  ];

  const flow = [
    { icon: <HeartHandshake size={20} />, label: 'Donor' },
    { icon: <Wallet size={20} />, label: 'Solana Wallet' },
    { icon: <Coins size={20} />, label: 'SPL Token Transfer' },
    { icon: <Globe size={20} />, label: 'Solana Devnet' },
    { icon: <ShieldCheck size={20} />, label: 'RPC Verification' },
    { icon: <Database size={20} />, label: 'PostgreSQL' },
    { icon: <Eye size={20} />, label: 'Transparency Dashboard' },
  ];

  return (
    <div className="min-h-screen bg-[#070f1e] pt-24">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <SectionHeading
            eyebrow="How It Works"
            title="Transparent donations, powered by Solana"
            description="ReliefChain uses Solana blockchain to make humanitarian donations independently verifiable. No trust required."
          />
        </div>

        {/* Problem / Solution */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Card className="border-red-500/20 bg-red-500/5 p-8">
            <h3 className="text-lg font-bold text-red-300">The Problem</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Traditional donation platforms require donors to trust centralized reports.
              You send money and hope it reaches the people who need it. There is no way to
              independently verify that your donation was received or how the total was
              calculated.
            </p>
          </Card>
          <Card className="border-cyan-500/20 bg-cyan-500/5 p-8">
            <h3 className="text-lg font-bold text-cyan-300">The Solution</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              ReliefChain records every donation as a real SPL token transfer on Solana. Each
              donation is independently verifiable on the Solana blockchain. Instead of
              trusting a dashboard number, you can click any donation and see the actual
              transaction on Solana Explorer.
            </p>
          </Card>
        </div>

        {/* The Difference */}
        <Card className="mt-6 p-8">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">The Difference</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Instead of simply displaying a donation number, ReliefChain provides the
            blockchain transaction signature as proof. Every donation record links to Solana
            Explorer where anyone can independently verify the transaction — the sender, the
            recipient, the token, the amount, and the confirmation status.
          </p>
        </Card>

        {/* Steps */}
        <div className="mt-16">
          <SectionHeading eyebrow="Step by Step" title="The donation flow" />
          <div className="mt-10 space-y-4">
            {steps.map((step) => (
              <Card key={step.title} className="flex items-start gap-4 p-6" hover>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Architecture Flow */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Architecture"
            title="Technical flow"
            description="From wallet to verified impact — here is how data moves through ReliefChain."
          />
          <Card className="mt-8 p-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {flow.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-400">
                      {item.icon}
                    </div>
                    <span className="text-xs text-white/50">{item.label}</span>
                  </div>
                  {i < flow.length - 1 && (
                    <ArrowRight className="hidden text-white/20 sm:block" size={18} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Verification Detail */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Verification"
            title="How transaction verification works"
            description="Our backend independently verifies each donation against Solana RPC. We never trust the frontend."
          />
          <Card className="mt-8 p-8">
            <div className="space-y-4">
              {[
                { icon: <ShieldCheck size={16} />, text: 'Transaction exists on Solana blockchain' },
                { icon: <ShieldCheck size={16} />, text: 'Transaction succeeded (no error flag)' },
                { icon: <Coins size={16} />, text: 'Correct SPL token mint was transferred' },
                { icon: <HeartHandshake size={16} />, text: 'Correct recipient wallet received the tokens' },
                { icon: <Server size={16} />, text: 'Transfer amount matches the expected donation' },
                { icon: <Wallet size={16} />, text: 'Donor wallet matches the expected sender' },
                { icon: <Database size={16} />, text: 'Duplicate signatures are rejected (unique constraint)' },
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    {check.icon}
                  </div>
                  <span className="text-sm text-white/70">{check.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/campaigns">
              <Button size="lg">
                Explore Campaigns <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/transparency">
              <Button size="lg" variant="outline">
                View Transparency Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
