import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ColdMailerLayout from './components/layout/ColdMailerLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JobFinderLayout from './components/layout/JobFinderLayout';
import ResumeMakerPage from './pages/ResumeMakerPage';
import { CartProvider } from './pages/job-finder/CartContext';
import MarketplacePage from './pages/job-finder/MarketplacePage';
import CheckoutPage from './pages/job-finder/CheckoutPage';
import WalletPage from './pages/job-finder/WalletPage';
import SubscriptionsPage from './pages/job-finder/SubscriptionsPage';
import SubscriptionDetailPage from './pages/job-finder/SubscriptionDetailPage';
import SettingsPage from './pages/job-finder/SettingsPage';
import QuickDraftPage from './pages/cold-mailer/QuickDraftPage';
import CampaignsListPage from './pages/cold-mailer/CampaignsListPage';
import NewCampaignPage from './pages/cold-mailer/NewCampaignPage';
import CampaignDetailPage from './pages/cold-mailer/CampaignDetailPage';
import MailerSettingsPage from './pages/cold-mailer/MailerSettingsPage';
import HrMarketplacePage from './pages/cold-mailer/HrMarketplacePage';
import BundleCheckoutPage from './pages/cold-mailer/BundleCheckoutPage';
import MyBundlesPage from './pages/cold-mailer/MyBundlesPage';
import { WalletProvider } from './context/WalletContext';
import WorkflowsListPage from './pages/automations/WorkflowsListPage';
import WorkflowBuilderPage from './pages/automations/WorkflowBuilderPage';
import ComingSoonPage from './pages/automations/ComingSoonPage';
import { features } from './config/features';

// Using a placeholder client ID so the app doesn't crash before the user configures it
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <WalletProvider>
          <Routes>
          {/* Public Marketing Route */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
          </Route>
          
          {/* Auth Route */}
          <Route path="/login" element={<LoginPage />} />

        {/* Internal Dashboard Routes */}
        <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Job Finder section */}
          {/* Job Finder Pivot */}
          <Route path="job-finder" element={
            <CartProvider>
              <JobFinderLayout />
            </CartProvider>
          }>
            <Route index element={<MarketplacePage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="resume-maker" element={<ResumeMakerPage />} />

          {/* Cold Mailer section */}
          <Route path="emailer" element={<ColdMailerLayout />}>
            <Route index element={<QuickDraftPage />} />
            <Route path="campaigns" element={<CampaignsListPage />} />
            <Route path="campaigns/new" element={<NewCampaignPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="settings" element={<MailerSettingsPage />} />
            <Route path="marketplace" element={<HrMarketplacePage />} />
            <Route path="marketplace/checkout" element={<BundleCheckoutPage />} />
            <Route path="bundles" element={<MyBundlesPage />} />
          </Route>

          {/* Automations section */}
          {features.automationsReleased ? (
            <>
              <Route path="automations" element={<WorkflowsListPage />} />
              <Route path="automations/:id" element={<WorkflowBuilderPage />} />
            </>
          ) : (
            <>
              <Route path="automations" element={<ComingSoonPage />} />
              <Route path="automations/:id" element={<Navigate to="/dashboard/automations" replace />} />
            </>
          )}
        </Route>
        </Routes>
      </WalletProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
