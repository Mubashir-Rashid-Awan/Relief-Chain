import { Link } from 'react-router-dom';
import { Globe, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a1628]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Relief<span className="text-cyan-400">Chain</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Transparent relief. Verified on-chain. Every donation backed by a Solana
              transaction signature.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-xs font-medium text-white/60">Built on</span>
              <span className="text-xs font-bold text-cyan-400">Solana</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Platform
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/campaigns" className="text-sm text-white/60 hover:text-white">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-sm text-white/60 hover:text-white">
                  Transparency Dashboard
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-white/60 hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-sm text-white/60 hover:text-white">
                  Create Campaign
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://docs.solana.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
                >
                  <Github size={14} /> Solana Docs
                </a>
              </li>
              <li>
                <a
                  href="https://explorer.solana.com/?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white"
                >
                  Solana Explorer (Devnet)
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.solana.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white"
                >
                  Devnet Faucet
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} ReliefChain. Demo environment — Solana Devnet.
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-white/40">
            Built with <Heart size={14} className="text-red-400" /> for humanitarian aid
          </p>
        </div>
      </div>
    </footer>
  );
}
