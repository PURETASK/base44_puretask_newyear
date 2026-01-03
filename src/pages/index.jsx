import Layout from "./Layout.jsx";

import AIActivityDashboard from "./AIActivityDashboard";

import AIAssistant from "./AIAssistant";

import AIAssistantSettings from "./AIAssistantSettings";

import AIAssistantTestGuide from "./AIAssistantTestGuide";

import AICommunicationSettings from "./AICommunicationSettings";

import AboutUs from "./AboutUs";

import AdditionalServices from "./AdditionalServices";

import AddressVerification from "./AddressVerification";

import AdminAIMonitoring from "./AdminAIMonitoring";

import AdminAnalytics from "./AdminAnalytics";

import AdminAnalyticsDashboard from "./AdminAnalyticsDashboard";

import AdminAnalyticsViewer from "./AdminAnalyticsViewer";

import AdminAuditLog from "./AdminAuditLog";

import AdminBookingsConsole from "./AdminBookingsConsole";

import AdminBookingsConsoleV2 from "./AdminBookingsConsoleV2";

import AdminBundleOffers from "./AdminBundleOffers";

import AdminCleanerManagement from "./AdminCleanerManagement";

import AdminClientJobs from "./AdminClientJobs";

import AdminClientManagement from "./AdminClientManagement";

import AdminCreditManagement from "./AdminCreditManagement";

import AdminDashboard from "./AdminDashboard";

import AdminDisputeManagement from "./AdminDisputeManagement";

import AdminEmailTemplates from "./AdminEmailTemplates";

import AdminFinanceCenter from "./AdminFinanceCenter";

import AdminMessageLog from "./AdminMessageLog";

import AdminMessages from "./AdminMessages";

import AdminNotifications from "./AdminNotifications";

import AdminPricingManagement from "./AdminPricingManagement";

import AdminPricingRules from "./AdminPricingRules";

import AdminRiskFlags from "./AdminRiskFlags";

import AdminRiskManagement from "./AdminRiskManagement";

import AdminSafetyIncidents from "./AdminSafetyIncidents";

import AdminSetup from "./AdminSetup";

import AdminSimpleDashboard from "./AdminSimpleDashboard";

import AdminSupportTickets from "./AdminSupportTickets";

import AdminSystemConfig from "./AdminSystemConfig";

import AdminTemplateManager from "./AdminTemplateManager";

import AdminTestBooking from "./AdminTestBooking";

import AdminTestCleaner from "./AdminTestCleaner";

import AdminTestNotifications from "./AdminTestNotifications";

import AnalyticsDashboard from "./AnalyticsDashboard";

import BookingAddOns from "./BookingAddOns";

import BookingApprovalPage from "./BookingApprovalPage";

import BookingConfirmation from "./BookingConfirmation";

import BookingDataInspector from "./BookingDataInspector";

import BookingFlow from "./BookingFlow";

import BookingHistory from "./BookingHistory";

import BookingRequest from "./BookingRequest";

import BookingRequestSent from "./BookingRequestSent";

import BrowseCleaners from "./BrowseCleaners";

import BuyCredits from "./BuyCredits";

import CEODashboard from "./CEODashboard";

import CancellationPolicy from "./CancellationPolicy";

import ChatThread from "./ChatThread";

import CleanerAnalytics from "./CleanerAnalytics";

import CleanerDashboard from "./CleanerDashboard";

import CleanerInsights from "./CleanerInsights";

import CleanerJobWorkspace from "./CleanerJobWorkspace";

import CleanerOnboarding from "./CleanerOnboarding";

import CleanerPayouts from "./CleanerPayouts";

import CleanerProfile from "./CleanerProfile";

import CleanerReliability from "./CleanerReliability";

import CleanerResources from "./CleanerResources";

import CleanerSchedule from "./CleanerSchedule";

import CleanerSignup from "./CleanerSignup";

import ClientBookings from "./ClientBookings";

import ClientDashboard from "./ClientDashboard";

import ClientOnboarding from "./ClientOnboarding";

import ClientReview from "./ClientReview";

import ClientSignup from "./ClientSignup";

import ClientSignupComplete from "./ClientSignupComplete";

import DamageClaimsPolicy from "./DamageClaimsPolicy";

import FavoriteCleaners from "./FavoriteCleaners";

import FinanceDashboard from "./FinanceDashboard";

import ForAirbnbHosts from "./ForAirbnbHosts";

import ForFamilies from "./ForFamilies";

import ForProfessionals from "./ForProfessionals";

import ForRetirees from "./ForRetirees";

import GrowthDashboard from "./GrowthDashboard";

import Home from "./Home";

import HowItWorks from "./HowItWorks";

import HowItWorksCleaners from "./HowItWorksCleaners";

import HowItWorksClients from "./HowItWorksClients";

import Inbox from "./Inbox";

import Legal from "./Legal";

import LoyaltyDashboard from "./LoyaltyDashboard";

import ManageRecurringBookings from "./ManageRecurringBookings";

import ManageSubscription from "./ManageSubscription";

import MatchedCleaners from "./MatchedCleaners";

import MultiBooking from "./MultiBooking";

import MultiBookingCheckout from "./MultiBookingCheckout";

import MultiBookingConfirmation from "./MultiBookingConfirmation";

import OpsDashboard from "./OpsDashboard";

import PaymentCheckout from "./PaymentCheckout";

import PaymentSuccess from "./PaymentSuccess";

import PhotoConsent from "./PhotoConsent";

import PreLaunch from "./PreLaunch";

import Pricing from "./Pricing";

import PrivacyPolicy from "./PrivacyPolicy";

import Products from "./Products";

import Profile from "./Profile";

import RecommendedDuties from "./RecommendedDuties";

import RecurringBookings from "./RecurringBookings";

import ReferralProgram from "./ReferralProgram";

import ReliabilityScoreExplained from "./ReliabilityScoreExplained";

import ResendConfirmation from "./ResendConfirmation";

import RoleSelection from "./RoleSelection";

import SetupGuide from "./SetupGuide";

import SignIn from "./SignIn";

import SmartBooking from "./SmartBooking";

import Support from "./Support";

import SystemAlerts from "./SystemAlerts";

import TemplateReference from "./TemplateReference";

import TermsOfService from "./TermsOfService";

import TrustSafetyDashboard from "./TrustSafetyDashboard";

import WhyPureTask from "./WhyPureTask";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AIActivityDashboard: AIActivityDashboard,
    
    AIAssistant: AIAssistant,
    
    AIAssistantSettings: AIAssistantSettings,
    
    AIAssistantTestGuide: AIAssistantTestGuide,
    
    AICommunicationSettings: AICommunicationSettings,
    
    AboutUs: AboutUs,
    
    AdditionalServices: AdditionalServices,
    
    AddressVerification: AddressVerification,
    
    AdminAIMonitoring: AdminAIMonitoring,
    
    AdminAnalytics: AdminAnalytics,
    
    AdminAnalyticsDashboard: AdminAnalyticsDashboard,
    
    AdminAnalyticsViewer: AdminAnalyticsViewer,
    
    AdminAuditLog: AdminAuditLog,
    
    AdminBookingsConsole: AdminBookingsConsole,
    
    AdminBookingsConsoleV2: AdminBookingsConsoleV2,
    
    AdminBundleOffers: AdminBundleOffers,
    
    AdminCleanerManagement: AdminCleanerManagement,
    
    AdminClientJobs: AdminClientJobs,
    
    AdminClientManagement: AdminClientManagement,
    
    AdminCreditManagement: AdminCreditManagement,
    
    AdminDashboard: AdminDashboard,
    
    AdminDisputeManagement: AdminDisputeManagement,
    
    AdminEmailTemplates: AdminEmailTemplates,
    
    AdminFinanceCenter: AdminFinanceCenter,
    
    AdminMessageLog: AdminMessageLog,
    
    AdminMessages: AdminMessages,
    
    AdminNotifications: AdminNotifications,
    
    AdminPricingManagement: AdminPricingManagement,
    
    AdminPricingRules: AdminPricingRules,
    
    AdminRiskFlags: AdminRiskFlags,
    
    AdminRiskManagement: AdminRiskManagement,
    
    AdminSafetyIncidents: AdminSafetyIncidents,
    
    AdminSetup: AdminSetup,
    
    AdminSimpleDashboard: AdminSimpleDashboard,
    
    AdminSupportTickets: AdminSupportTickets,
    
    AdminSystemConfig: AdminSystemConfig,
    
    AdminTemplateManager: AdminTemplateManager,
    
    AdminTestBooking: AdminTestBooking,
    
    AdminTestCleaner: AdminTestCleaner,
    
    AdminTestNotifications: AdminTestNotifications,
    
    AnalyticsDashboard: AnalyticsDashboard,
    
    BookingAddOns: BookingAddOns,
    
    BookingApprovalPage: BookingApprovalPage,
    
    BookingConfirmation: BookingConfirmation,
    
    BookingDataInspector: BookingDataInspector,
    
    BookingFlow: BookingFlow,
    
    BookingHistory: BookingHistory,
    
    BookingRequest: BookingRequest,
    
    BookingRequestSent: BookingRequestSent,
    
    BrowseCleaners: BrowseCleaners,
    
    BuyCredits: BuyCredits,
    
    CEODashboard: CEODashboard,
    
    CancellationPolicy: CancellationPolicy,
    
    ChatThread: ChatThread,
    
    CleanerAnalytics: CleanerAnalytics,
    
    CleanerDashboard: CleanerDashboard,
    
    CleanerInsights: CleanerInsights,
    
    CleanerJobWorkspace: CleanerJobWorkspace,
    
    CleanerOnboarding: CleanerOnboarding,
    
    CleanerPayouts: CleanerPayouts,
    
    CleanerProfile: CleanerProfile,
    
    CleanerReliability: CleanerReliability,
    
    CleanerResources: CleanerResources,
    
    CleanerSchedule: CleanerSchedule,
    
    CleanerSignup: CleanerSignup,
    
    ClientBookings: ClientBookings,
    
    ClientDashboard: ClientDashboard,
    
    ClientOnboarding: ClientOnboarding,
    
    ClientReview: ClientReview,
    
    ClientSignup: ClientSignup,
    
    ClientSignupComplete: ClientSignupComplete,
    
    DamageClaimsPolicy: DamageClaimsPolicy,
    
    FavoriteCleaners: FavoriteCleaners,
    
    FinanceDashboard: FinanceDashboard,
    
    ForAirbnbHosts: ForAirbnbHosts,
    
    ForFamilies: ForFamilies,
    
    ForProfessionals: ForProfessionals,
    
    ForRetirees: ForRetirees,
    
    GrowthDashboard: GrowthDashboard,
    
    Home: Home,
    
    HowItWorks: HowItWorks,
    
    HowItWorksCleaners: HowItWorksCleaners,
    
    HowItWorksClients: HowItWorksClients,
    
    Inbox: Inbox,
    
    Legal: Legal,
    
    LoyaltyDashboard: LoyaltyDashboard,
    
    ManageRecurringBookings: ManageRecurringBookings,
    
    ManageSubscription: ManageSubscription,
    
    MatchedCleaners: MatchedCleaners,
    
    MultiBooking: MultiBooking,
    
    MultiBookingCheckout: MultiBookingCheckout,
    
    MultiBookingConfirmation: MultiBookingConfirmation,
    
    OpsDashboard: OpsDashboard,
    
    PaymentCheckout: PaymentCheckout,
    
    PaymentSuccess: PaymentSuccess,
    
    PhotoConsent: PhotoConsent,
    
    PreLaunch: PreLaunch,
    
    Pricing: Pricing,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Products: Products,
    
    Profile: Profile,
    
    RecommendedDuties: RecommendedDuties,
    
    RecurringBookings: RecurringBookings,
    
    ReferralProgram: ReferralProgram,
    
    ReliabilityScoreExplained: ReliabilityScoreExplained,
    
    ResendConfirmation: ResendConfirmation,
    
    RoleSelection: RoleSelection,
    
    SetupGuide: SetupGuide,
    
    SignIn: SignIn,
    
    SmartBooking: SmartBooking,
    
    Support: Support,
    
    SystemAlerts: SystemAlerts,
    
    TemplateReference: TemplateReference,
    
    TermsOfService: TermsOfService,
    
    TrustSafetyDashboard: TrustSafetyDashboard,
    
    WhyPureTask: WhyPureTask,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AIActivityDashboard />} />
                
                
                <Route path="/AIActivityDashboard" element={<AIActivityDashboard />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/AIAssistantSettings" element={<AIAssistantSettings />} />
                
                <Route path="/AIAssistantTestGuide" element={<AIAssistantTestGuide />} />
                
                <Route path="/AICommunicationSettings" element={<AICommunicationSettings />} />
                
                <Route path="/AboutUs" element={<AboutUs />} />
                
                <Route path="/AdditionalServices" element={<AdditionalServices />} />
                
                <Route path="/AddressVerification" element={<AddressVerification />} />
                
                <Route path="/AdminAIMonitoring" element={<AdminAIMonitoring />} />
                
                <Route path="/AdminAnalytics" element={<AdminAnalytics />} />
                
                <Route path="/AdminAnalyticsDashboard" element={<AdminAnalyticsDashboard />} />
                
                <Route path="/AdminAnalyticsViewer" element={<AdminAnalyticsViewer />} />
                
                <Route path="/AdminAuditLog" element={<AdminAuditLog />} />
                
                <Route path="/AdminBookingsConsole" element={<AdminBookingsConsole />} />
                
                <Route path="/AdminBookingsConsoleV2" element={<AdminBookingsConsoleV2 />} />
                
                <Route path="/AdminBundleOffers" element={<AdminBundleOffers />} />
                
                <Route path="/AdminCleanerManagement" element={<AdminCleanerManagement />} />
                
                <Route path="/AdminClientJobs" element={<AdminClientJobs />} />
                
                <Route path="/AdminClientManagement" element={<AdminClientManagement />} />
                
                <Route path="/AdminCreditManagement" element={<AdminCreditManagement />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminDisputeManagement" element={<AdminDisputeManagement />} />
                
                <Route path="/AdminEmailTemplates" element={<AdminEmailTemplates />} />
                
                <Route path="/AdminFinanceCenter" element={<AdminFinanceCenter />} />
                
                <Route path="/AdminMessageLog" element={<AdminMessageLog />} />
                
                <Route path="/AdminMessages" element={<AdminMessages />} />
                
                <Route path="/AdminNotifications" element={<AdminNotifications />} />
                
                <Route path="/AdminPricingManagement" element={<AdminPricingManagement />} />
                
                <Route path="/AdminPricingRules" element={<AdminPricingRules />} />
                
                <Route path="/AdminRiskFlags" element={<AdminRiskFlags />} />
                
                <Route path="/AdminRiskManagement" element={<AdminRiskManagement />} />
                
                <Route path="/AdminSafetyIncidents" element={<AdminSafetyIncidents />} />
                
                <Route path="/AdminSetup" element={<AdminSetup />} />
                
                <Route path="/AdminSimpleDashboard" element={<AdminSimpleDashboard />} />
                
                <Route path="/AdminSupportTickets" element={<AdminSupportTickets />} />
                
                <Route path="/AdminSystemConfig" element={<AdminSystemConfig />} />
                
                <Route path="/AdminTemplateManager" element={<AdminTemplateManager />} />
                
                <Route path="/AdminTestBooking" element={<AdminTestBooking />} />
                
                <Route path="/AdminTestCleaner" element={<AdminTestCleaner />} />
                
                <Route path="/AdminTestNotifications" element={<AdminTestNotifications />} />
                
                <Route path="/AnalyticsDashboard" element={<AnalyticsDashboard />} />
                
                <Route path="/BookingAddOns" element={<BookingAddOns />} />
                
                <Route path="/BookingApprovalPage" element={<BookingApprovalPage />} />
                
                <Route path="/BookingConfirmation" element={<BookingConfirmation />} />
                
                <Route path="/BookingDataInspector" element={<BookingDataInspector />} />
                
                <Route path="/BookingFlow" element={<BookingFlow />} />
                
                <Route path="/BookingHistory" element={<BookingHistory />} />
                
                <Route path="/BookingRequest" element={<BookingRequest />} />
                
                <Route path="/BookingRequestSent" element={<BookingRequestSent />} />
                
                <Route path="/BrowseCleaners" element={<BrowseCleaners />} />
                
                <Route path="/BuyCredits" element={<BuyCredits />} />
                
                <Route path="/CEODashboard" element={<CEODashboard />} />
                
                <Route path="/CancellationPolicy" element={<CancellationPolicy />} />
                
                <Route path="/ChatThread" element={<ChatThread />} />
                
                <Route path="/CleanerAnalytics" element={<CleanerAnalytics />} />
                
                <Route path="/CleanerDashboard" element={<CleanerDashboard />} />
                
                <Route path="/CleanerInsights" element={<CleanerInsights />} />
                
                <Route path="/CleanerJobWorkspace" element={<CleanerJobWorkspace />} />
                
                <Route path="/CleanerOnboarding" element={<CleanerOnboarding />} />
                
                <Route path="/CleanerPayouts" element={<CleanerPayouts />} />
                
                <Route path="/CleanerProfile" element={<CleanerProfile />} />
                
                <Route path="/CleanerReliability" element={<CleanerReliability />} />
                
                <Route path="/CleanerResources" element={<CleanerResources />} />
                
                <Route path="/CleanerSchedule" element={<CleanerSchedule />} />
                
                <Route path="/CleanerSignup" element={<CleanerSignup />} />
                
                <Route path="/ClientBookings" element={<ClientBookings />} />
                
                <Route path="/ClientDashboard" element={<ClientDashboard />} />
                
                <Route path="/ClientOnboarding" element={<ClientOnboarding />} />
                
                <Route path="/ClientReview" element={<ClientReview />} />
                
                <Route path="/ClientSignup" element={<ClientSignup />} />
                
                <Route path="/ClientSignupComplete" element={<ClientSignupComplete />} />
                
                <Route path="/DamageClaimsPolicy" element={<DamageClaimsPolicy />} />
                
                <Route path="/FavoriteCleaners" element={<FavoriteCleaners />} />
                
                <Route path="/FinanceDashboard" element={<FinanceDashboard />} />
                
                <Route path="/ForAirbnbHosts" element={<ForAirbnbHosts />} />
                
                <Route path="/ForFamilies" element={<ForFamilies />} />
                
                <Route path="/ForProfessionals" element={<ForProfessionals />} />
                
                <Route path="/ForRetirees" element={<ForRetirees />} />
                
                <Route path="/GrowthDashboard" element={<GrowthDashboard />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/HowItWorks" element={<HowItWorks />} />
                
                <Route path="/HowItWorksCleaners" element={<HowItWorksCleaners />} />
                
                <Route path="/HowItWorksClients" element={<HowItWorksClients />} />
                
                <Route path="/Inbox" element={<Inbox />} />
                
                <Route path="/Legal" element={<Legal />} />
                
                <Route path="/LoyaltyDashboard" element={<LoyaltyDashboard />} />
                
                <Route path="/ManageRecurringBookings" element={<ManageRecurringBookings />} />
                
                <Route path="/ManageSubscription" element={<ManageSubscription />} />
                
                <Route path="/MatchedCleaners" element={<MatchedCleaners />} />
                
                <Route path="/MultiBooking" element={<MultiBooking />} />
                
                <Route path="/MultiBookingCheckout" element={<MultiBookingCheckout />} />
                
                <Route path="/MultiBookingConfirmation" element={<MultiBookingConfirmation />} />
                
                <Route path="/OpsDashboard" element={<OpsDashboard />} />
                
                <Route path="/PaymentCheckout" element={<PaymentCheckout />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/PhotoConsent" element={<PhotoConsent />} />
                
                <Route path="/PreLaunch" element={<PreLaunch />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/RecommendedDuties" element={<RecommendedDuties />} />
                
                <Route path="/RecurringBookings" element={<RecurringBookings />} />
                
                <Route path="/ReferralProgram" element={<ReferralProgram />} />
                
                <Route path="/ReliabilityScoreExplained" element={<ReliabilityScoreExplained />} />
                
                <Route path="/ResendConfirmation" element={<ResendConfirmation />} />
                
                <Route path="/RoleSelection" element={<RoleSelection />} />
                
                <Route path="/SetupGuide" element={<SetupGuide />} />
                
                <Route path="/SignIn" element={<SignIn />} />
                
                <Route path="/SmartBooking" element={<SmartBooking />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/SystemAlerts" element={<SystemAlerts />} />
                
                <Route path="/TemplateReference" element={<TemplateReference />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/TrustSafetyDashboard" element={<TrustSafetyDashboard />} />
                
                <Route path="/WhyPureTask" element={<WhyPureTask />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}