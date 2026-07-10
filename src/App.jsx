import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ColdMailerLayout from './components/layout/ColdMailerLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/legal/ContactPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import RefundPage from './pages/legal/RefundPage';
import MembershipPage from './pages/billing/MembershipPage';
import JobFinderLayout from './components/layout/JobFinderLayout';
import ResumeMakerHomePage from './pages/resume-maker/ResumeMakerHomePage';
import ResumeBuilderPage from './pages/resume-maker/ResumeBuilderPage';
import ResumeTailorPage from './pages/resume-maker/ResumeTailorPage';
import { CartProvider } from './pages/job-finder/CartContext';
import MarketplacePage from './pages/job-finder/MarketplacePage';
import CheckoutPage from './pages/job-finder/CheckoutPage';
import WalletPage from './pages/job-finder/WalletPage';
import SubscriptionsPage from './pages/job-finder/SubscriptionsPage';
import SubscriptionDetailPage from './pages/job-finder/SubscriptionDetailPage';
import SettingsPage from './pages/job-finder/SettingsPage';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminCompanyJobsPage from './pages/admin/AdminCompanyJobsPage';
import CompanyScrapeLogsPage from './pages/admin/CompanyScrapeLogsPage';
import AdminBundlesPage from './pages/admin/AdminBundlesPage';
import AdminCreditPacksPage from './pages/admin/AdminCreditPacksPage';
import AdminMembershipPlansPage from './pages/admin/AdminMembershipPlansPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminWaitlistPage from './pages/admin/AdminWaitlistPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import QuickDraftPage from './pages/cold-mailer/QuickDraftPage';
import CampaignsListPage from './pages/cold-mailer/CampaignsListPage';
import NewCampaignPage from './pages/cold-mailer/NewCampaignPage';
import CampaignDetailPage from './pages/cold-mailer/CampaignDetailPage';
import MailerSettingsPage from './pages/cold-mailer/MailerSettingsPage';
import HrMarketplacePage from './pages/cold-mailer/HrMarketplacePage';
import BundleCheckoutPage from './pages/cold-mailer/BundleCheckoutPage';
import MyBundlesPage from './pages/cold-mailer/MyBundlesPage';
import { WalletProvider } from './context/WalletContext';
import { PaywallProvider } from './context/PaywallContext';
import { WelcomeCreditsProvider } from './context/WelcomeCreditsContext';
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
          <WelcomeCreditsProvider>
            <PaywallProvider>
            <Routes>
            {/* Public Marketing Route */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="refund" element={<RefundPage />} />
          </Route>
          
          {/* Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Standalone admin route (opened in its own tab via "See Terminal") - auth
              guarded like the rest of /admin, but rendered without the AdminLayout sidebar */}
          <Route
            path="/admin/companies/:id/scrape-logs"
            element={<AdminRoute><CompanyScrapeLogsPage /></AdminRoute>}
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="companies/:id/jobs" element={<AdminCompanyJobsPage />} />
            <Route path="bundles" element={<AdminBundlesPage />} />
            <Route path="credit-packs" element={<AdminCreditPacksPage />} />
            <Route path="membership-plans" element={<AdminMembershipPlansPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="waitlist" element={<AdminWaitlistPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

        {/* Internal Dashboard Routes */}
        <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="billing" element={<MembershipPage />} />
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
          <Route path="resume-maker">
            <Route index element={<ResumeMakerHomePage />} />
            <Route path="build" element={<ResumeBuilderPage />} />
            <Route path="tailor" element={<ResumeTailorPage />} />
          </Route>

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
            </PaywallProvider>
          </WelcomeCreditsProvider>
        </WalletProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
