import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '@/lib/wallet/WalletContext';
import { Navbar } from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import { HomePage } from '@/pages/HomePage';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { CampaignDetailPage } from '@/pages/CampaignDetailPage';
import { CampaignTransparencyPage } from '@/pages/CampaignTransparencyPage';
import { CreateCampaignPage } from '@/pages/CreateCampaignPage';
import { TransparencyDashboardPage } from '@/pages/TransparencyDashboardPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-[#070f1e]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaign/:slug" element={<CampaignDetailPage />} />
              <Route path="/campaign/:slug/transparency" element={<CampaignTransparencyPage />} />
              <Route path="/create" element={<CreateCampaignPage />} />
              <Route path="/transparency" element={<TransparencyDashboardPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
