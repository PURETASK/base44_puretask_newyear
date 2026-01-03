
import React, { useState, useEffect } from 'react';
import { handleError } from '@/lib/errorHandler';
import { cacheManager } from '@/lib/cacheManager';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Menu, X, User as UserIcon, LogOut, Home, Search,
  HelpCircle, ChevronDown, MessageSquare, Heart, Wallet, Gift, Shield, ArrowRight, Scale, Calendar, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatAssistant from './components/chat/AIChatAssistant';
import NotificationDisplay from './components/notifications/NotificationDisplay';
import AdminPageInfo from './components/admin/AdminPageInfo';
import { analytics, setAnalyticsUser } from '@/components/analytics/AnalyticsService';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(true);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const hideTimeout = React.useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Initial user and unread count load
  useEffect(() => {
    try {
      loadUserAndUnreadCount();
    } catch (error) {
      handleError(error, { userMessage: 'Error in initial load:', showToast: false });
      setLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Poll for unread messages and notifications every 30 seconds if user is logged in
  useEffect(() => {
    // Only set up interval if user is loaded and not null
    if (user) {
      // Load unread count immediately on user change (e.g., after login)
      loadUnreadCount(user);
      loadUnreadNotificationCount(user);

      const interval = setInterval(() => {
        // Use the current user from the state or re-fetch from cache within loadUnreadCount
        loadUnreadCount(user);
        loadUnreadNotificationCount(user);
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    } else {
      // Clear unread count if user logs out or is not present
      setUnreadCount(0);
      setUnreadNotificationCount(0);
    }
  }, [user]); // Re-run when `user` state changes

  const loadUserAndUnreadCount = async () => {
    try {
      setLoading(true);
      
      // Check user cache first - use longer cache (30 min) to avoid re-auth
      const cachedUser = cacheManager.get('currentUser');
      const cacheAge = cacheManager.getAge('currentUser');

      if (cachedUser && cacheAge < 5 * 60 * 1000) { // 5 minutes
        const currentUser = cachedUser;
        setUser(currentUser);

        // After user is loaded, set analytics user
        if (currentUser) {
          setAnalyticsUser(currentUser);
        }

        let detectedType = null;
        if (currentUser.user_type) {
          detectedType = currentUser.user_type;
        } else if (currentUser.role === 'admin') {
          detectedType = 'admin';
        } else {
          // Try to get userType from profile cache
          const cachedProfileType = cacheManager.get(`userProfile_${currentUser.email}`);
          if (cachedProfileType) {
            detectedType = cachedProfileType;
          }
        }
        if (detectedType) {
          setUserType(detectedType);
        }

        // Load unread count from cache
        const cachedUnread = cacheManager.get(`unreadCount_${currentUser.email}`);
        if (cachedUnread !== null) {
          setUnreadCount(cachedUnread);
        }

          setLoading(false);
          // Still attempt to refresh data in background if cache was used, for freshness
          // but don't wait for it.
          base44.auth.me().then(freshUser => {
            if (freshUser && freshUser.email === currentUser.email) { // Ensure it's the same user
              setUser(freshUser);
              cacheManager.set('currentUser', freshUser, 30 * 60 * 1000);
              loadUnreadCount(freshUser); // Refresh unread count
              setAnalyticsUser(freshUser); // Update analytics user with fresh data
            }
          }).catch(e => {
            console.warn('Background refresh of user data failed, using cached data.', e);
          });

          return; // Exit as we've used cached data
        }
      }

      // If no valid cache, try to fetch fresh user data
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      cacheManager.set('currentUser', currentUser, 30 * 60 * 1000);

      // After user is loaded, set analytics user
      if (currentUser) {
        setAnalyticsUser(currentUser);
      }

      let detectedType = null;
      if (currentUser.user_type) {
        detectedType = currentUser.user_type;
      } else if (currentUser.role === 'admin') {
        detectedType = 'admin';
      } else {
        // Cache profile checks too
        const cachedProfile = cacheManager.get(`userProfile_${currentUser.email}`);

        if (cachedProfile) {
          detectedType = cachedProfile;
        } else {
          // No cached profile type, fetch from API
          const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: currentUser.email });
          const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: currentUser.email });

          if (cleanerProfiles.length > 0) {
            detectedType = 'cleaner';
          } else if (clientProfiles.length > 0) {
            detectedType = 'client';
          }

          if (detectedType) {
            localStorage.setItem(profileCacheKey, detectedType); // Cache the detected type
          }
        }
      }
      if (detectedType) {
        setUserType(detectedType);
      }

      // Load unread count and notification count silently (don't fail if this errors)
      try {
        await loadUnreadCount(currentUser);
        await loadUnreadNotificationCount(currentUser);
      } catch (e) {
        console.log('Could not load unread count:', e);
      }
    } catch (error) {
      console.log('Error fetching user from API:', error);
      // DON'T automatically log out on error, unless it's a 401 and no cached data

      const cachedUserString = localStorage.getItem('currentUser');
      const userCacheTimeString = localStorage.getItem('currentUserTime');

      if (cachedUserString && userCacheTimeString) {
        // If an error occurred but we have cached user data, use it.
        // This handles cases like network issues or API rate limits.
        const cachedUser = JSON.parse(cachedUserString);
        setUser(cachedUser);

        // After user is loaded, set analytics user
        if (cachedUser) {
          setAnalyticsUser(cachedUser);
        }

        let detectedType = null;
        if (cachedUser.user_type) {
          detectedType = cachedUser.user_type;
        } else if (cachedUser.role === 'admin') {
          detectedType = 'admin';
        } else {
          const profileCacheKey = `userProfile_${cachedUser.email}`;
          const cachedProfileType = localStorage.getItem(profileCacheKey);
          if (cachedProfileType) {
            detectedType = cachedProfileType;
          }
        }
        if (detectedType) {
          setUserType(detectedType);
        }

        const cachedUnread = localStorage.getItem(`unreadCount_${cachedUser.email}`);
        if (cachedUnread) {
          setUnreadCount(parseInt(cachedUnread));
        }
        console.log('Using cached user data due to API error.');
      } else {
        // Only clear user state if there's no cached data AND it's an authentication error (401)
        if (error.response?.status === 401) {
          console.log('User not authenticated, clearing user state.');
          setUser(null);
          setUserType(null);
          setUnreadCount(0);
          localStorage.clear(); // Clear any stale cache
          sessionStorage.clear(); // Clear session storage too
          setAnalyticsUser(null); // Clear analytics user
        } else {
          // For other errors without cached user, just log and clear user
          console.log('Non-authentication API error and no cached user, clearing user state.');
          setUser(null);
          setUserType(null);
          setUnreadCount(0);
          setAnalyticsUser(null); // Clear analytics user
        }
      }
    }
    setLoading(false);
  };

  const loadUnreadCount = async (currentUser) => {
    // If no currentUser is provided, try to get from state, or exit
    if (!currentUser && !user) {
      setUnreadCount(0);
      return;
    }
    const userToUse = currentUser || user;
    if (!userToUse) { // Should not happen if previous checks are good, but for safety
      setUnreadCount(0);
      return;
    }

    try {
      const now = Date.now();
      // Check cache first - 30 minute cache
      const cacheKey = `unreadCount_${userToUse.email}`;
      const cacheTimeKey = `unreadCountTime_${userToUse.email}`;
      const cachedCount = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);

      if (cachedCount && cacheTime) {
        const parsedCacheTime = parseInt(cacheTime);
        if ((now - parsedCacheTime) < 1800000) { // 30 min = 1800000 ms
          setUnreadCount(parseInt(cachedCount));
          return; // Use cached value if valid
        }
      }

      // If cache is stale or non-existent, fetch fresh data
      const threads = await base44.entities.ConversationThread.filter({
        participants: { $in: [userToUse.email] }
      });

      let total = 0;
      threads.forEach(thread => {
        // Use userType from state if available, otherwise fallback to currentUser's potential type or derived type
        const currentRole = userToUse.user_type || userType || (userToUse.role === 'admin' ? 'admin' : null);
        if (currentRole === 'client') {
          total += thread.unread_count_client || 0;
        } else if (currentRole === 'cleaner') {
          total += thread.unread_count_cleaner || 0;
        }
      });

      setUnreadCount(total);
      localStorage.setItem(cacheKey, total.toString());
      localStorage.setItem(cacheTimeKey, now.toString());
    } catch (error) {
      console.log('Could not load unread count:', error);
      // Silently fail, don't clear the current unread count state,
      // a stale count is better than no count or 0 if user is logged in.
    }
  };

  const loadUnreadNotificationCount = async (currentUser) => {
    if (!currentUser && !user) {
      setUnreadNotificationCount(0);
      return;
    }
    const userToUse = currentUser || user;
    if (!userToUse) {
      setUnreadNotificationCount(0);
      return;
    }

    try {
      const notifications = await base44.entities.Notification.filter({
        recipient_email: userToUse.email,
        is_read: false
      });
      setUnreadNotificationCount(notifications.length);
    } catch (error) {
      console.log('Could not load unread notification count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all local state and caches FIRST
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setUserType(null);
      setUnreadCount(0);
      setAnalyticsUser(null);
      
      // Then call logout API
      await base44.auth.logout();
      
      // Force page reload to home with cache-busting parameter
      window.location.href = createPageUrl('Home') + '?logout=' + Date.now();
    } catch (e) {
      console.log('Logout error:', e);
      // Even if API fails, still clear local state and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = createPageUrl('Home') + '?logout=' + Date.now();
    }
  };

  // Track page views
  useEffect(() => {
    if (currentPageName) {
      analytics.pageView(currentPageName);
    }
  }, [currentPageName]);

  // Auto-hide navbar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY < 100) {
        setNavVisible(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setNavVisible(false), 3000);
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (touch.clientY < 50) {
        setNavVisible(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setNavVisible(false), 3000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);

    // Initial auto-hide after 3 seconds
    hideTimeout.current = setTimeout(() => setNavVisible(false), 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-soft-cloud">
      {/* NAVIGATION */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm"
        onMouseEnter={() => {
          setNavVisible(true);
          if (hideTimeout.current) clearTimeout(hideTimeout.current);
        }}
        onMouseLeave={() => {
          hideTimeout.current = setTimeout(() => setNavVisible(false), 2000);
        }}
      >
        <div className="container mx-auto px-3 sm:px-6 max-w-full">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: "Infinity", duration: 5, ease: "easeInOut" }}
                className="w-8 h-8 sm:w-10 sm:h-10 brand-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <span className="text-xl sm:text-2xl font-fredoka font-bold text-graphite">PureTask</span>
            </Link>

            {/* Desktop Menu Toggle */}
            <Button 
              variant="ghost" 
              className="hidden md:flex p-2 text-graphite rounded-full mr-2" 
              onClick={() => setShowDesktopMenu(!showDesktopMenu)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Menu */}
            <AnimatePresence>
              {showDesktopMenu && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:flex items-center gap-2"
                >
              {/* GUEST MENU */}
              {!user && (
                <>
                  <Link to={createPageUrl('Home')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'Home' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                        <Home className="w-4 h-4 inline mr-2" />Home
                      </Link>
                        <Link to={createPageUrl('BrowseCleaners')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'BrowseCleaners' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                          <Search className="w-4 h-4 inline mr-2" />Browse Cleaners
                        </Link>
                        <Link to={createPageUrl('Pricing')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'Pricing' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                          Pricing
                        </Link>
                        <Link to={createPageUrl('Support')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'Support' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                          <HelpCircle className="w-4 h-4 inline mr-2" />Support
                        </Link>
                </>
              )}

              {/* CLIENT MENU */}
              {user && userType === 'client' && (
                <>
                  <Link to={createPageUrl('ClientDashboard')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'ClientDashboard' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                    <Home className="w-4 h-4 inline mr-2" />Dashboard
                  </Link>
                  <Link to={createPageUrl('BrowseCleaners')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'BrowseCleaners' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                    <Search className="w-4 h-4 inline mr-2" />Book
                  </Link>
                </>
              )}

              {/* CLEANER MENU */}
              {user && userType === 'cleaner' && (
                <>
                  <Link to={createPageUrl('CleanerDashboard')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'CleanerDashboard' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                    <Home className="w-4 h-4 inline mr-2" />Dashboard
                  </Link>
                  <Link to={createPageUrl('CleanerSchedule')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'CleanerSchedule' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                    <Calendar className="w-4 h-4 inline mr-2" />Schedule
                  </Link>
                </>
              )}

              {/* ADMIN MENU */}
              {user && (userType === 'admin' || user.role === 'admin') && (
                <>
                  <Link to={createPageUrl('AdminDashboard')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all ${currentPageName === 'AdminDashboard' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                    <Shield className="w-4 h-4 inline mr-2" />Admin
                  </Link>
                </>
              )}

              {/* Notifications (all logged-in users) */}
              {user && (
                <DropdownMenu open={notificationMenuOpen} onOpenChange={setNotificationMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all relative ${notificationMenuOpen ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`}>
                      <Bell className="w-4 h-4 inline mr-2" />Notifications
                      <AnimatePresence>
                        {unreadNotificationCount > 0 && (
                          <motion.div key={unreadNotificationCount} initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: [1, 1.2, 1], opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full font-fredoka">
                            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-0 w-auto">
                    <NotificationDisplay onClose={() => setNotificationMenuOpen(false)} />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Messages (all logged-in users) */}
              {user && (
                <Link to={createPageUrl('Inbox')} className={`px-4 py-2 rounded-full font-fredoka font-medium transition-all relative ${currentPageName === 'Inbox' ? 'bg-blue-50 text-puretask-blue' : 'text-graphite hover:bg-gray-50'}`} onClick={() => setUnreadCount(0)}>
                  <MessageSquare className="w-4 h-4 inline mr-2" />Messages
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.div key={unreadCount} initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: [1, 1.2, 1], opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full font-fredoka">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

            {/* User Profile / Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                      <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center text-white font-fredoka font-bold">
                        {user.full_name && user.full_name[0] ? user.full_name[0] : 'U'}
                      </div>
                      <span className="font-fredoka font-medium text-graphite">{user.full_name}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                      <p className="text-sm font-fredoka font-medium">{user.full_name}</p>
                      <p className="text-xs text-gray-500 font-verdana">{user.email}</p>
                      {userType && <p className="text-xs text-puretask-blue mt-1 capitalize font-verdana">{userType}</p>}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Profile'))}>
                      <UserIcon className="w-4 h-4 mr-2" />My Profile
                    </DropdownMenuItem>
                    
                    {userType === 'client' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('ClientBookings'))}>
                          <Calendar className="w-4 h-4 mr-2" />My Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('MultiBooking'))}>
                          <Calendar className="w-4 h-4 mr-2" />Multi-Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('FavoriteCleaners'))}>
                          <Heart className="w-4 h-4 mr-2" />Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('BuyCredits'))}>
                          <Wallet className="w-4 h-4 mr-2" />Buy Credits
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {userType === 'cleaner' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('CleanerPayouts'))}>
                          <Wallet className="w-4 h-4 mr-2" />Earnings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl('AIActivityDashboard'))}>
                          <MessageSquare className="w-4 h-4 mr-2" />AI Assistant
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Support'))}>
                      <HelpCircle className="w-4 h-4 mr-2" />Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to={createPageUrl('SignIn')}>
                    <Button variant="outline" className="border-puretask-blue text-puretask-blue hover:bg-blue-50 rounded-full font-fredoka font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link to={createPageUrl('RoleSelection')}>
                    <Button className="brand-gradient text-white rounded-full font-fredoka font-semibold hover:opacity-90">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" className="md:hidden p-2 text-graphite relative rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {unreadCount > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                {!user && (
                  <>
                    <Link to={createPageUrl('Home')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Home className="w-4 h-4" />Home
                    </Link>
                    <Link to={createPageUrl('BrowseCleaners')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Search className="w-4 h-4" />Browse Cleaners
                    </Link>
                    <Link to={createPageUrl('Pricing')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      Pricing
                    </Link>
                    <Link to={createPageUrl('Support')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <HelpCircle className="w-4 h-4" />Support
                    </Link>
                  </>
                )}

                {user && userType === 'client' && (
                  <>
                    <Link to={createPageUrl('ClientDashboard')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Calendar className="w-4 h-4" />Dashboard
                    </Link>
                    <Link to={createPageUrl('ClientBookings')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Calendar className="w-4 h-4" />My Bookings
                    </Link>
                    <Link to={createPageUrl('MultiBooking')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Calendar className="w-4 h-4" />Multi-Booking
                    </Link>
                    <Link to={createPageUrl('BrowseCleaners')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Search className="w-4 h-4" />Browse Cleaners
                    </Link>
                    <Link to={createPageUrl('FavoriteCleaners')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Heart className="w-4 h-4" />Favorites
                    </Link>
                    <Link to={createPageUrl('BuyCredits')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Wallet className="w-4 h-4" />Buy Credits
                    </Link>
                  </>
                )}

                {user && userType === 'cleaner' && (
                  <>
                    <Link to={createPageUrl('CleanerDashboard')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Home className="w-4 h-4" />Dashboard
                    </Link>
                    <Link to={createPageUrl('CleanerSchedule')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Calendar className="w-4 h-4" />Schedule
                    </Link>
                    <Link to={createPageUrl('AIActivityDashboard')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <MessageSquare className="w-4 h-4" />AI Assistant
                    </Link>
                    <Link to={createPageUrl('CleanerPayouts')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <Wallet className="w-4 h-4" />Earnings
                    </Link>
                  </>
                )}

                {user && (userType === 'admin' || user.role === 'admin') && (
                  <Link to={createPageUrl('AdminDashboard')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                    <Shield className="w-4 h-4" />Admin Dashboard
                  </Link>
                )}

                {user && (
                  <>
                    <Link to={createPageUrl('Inbox')} onClick={() => { setMobileMenuOpen(false); setUnreadCount(0); }} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50 relative">
                      <MessageSquare className="w-4 h-4" />Messages
                      {unreadCount > 0 && <Badge className="ml-auto bg-red-500 text-white font-fredoka">{unreadCount}</Badge>}
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link to={createPageUrl('Profile')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <UserIcon className="w-4 h-4" />My Profile
                    </Link>
                    <Link to={createPageUrl('Support')} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-full font-fredoka font-medium text-graphite hover:bg-gray-50">
                      <HelpCircle className="w-4 h-4" />Support
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-full font-fredoka font-medium transition-all text-left w-full justify-start">
                      <LogOut className="w-4 h-4" />Logout
                    </Button>
                  </>
                )}

                {!user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link to={createPageUrl('SignIn')} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-puretask-blue text-puretask-blue rounded-full font-fredoka font-semibold">
                        Sign In
                      </Button>
                    </Link>
                    <Link to={createPageUrl('RoleSelection')} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full brand-gradient text-white rounded-full font-fredoka font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.nav>

      <main className="pt-16">{children}</main>

      {user && <AIChatAssistant />}
      
      {/* Admin Page Info Panel - Only visible to admins */}
      {user && (userType === 'admin' || user.role === 'admin') && (
        <AdminPageInfo currentPageName={currentPageName} />
      )}

      {/* ENHANCED FOOTER */}
      <footer className="bg-white border-t-4 mt-12 sm:mt-20" style={{ borderColor: '#66B3FF' }}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-full overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-3 sm:mb-4 hover:opacity-80 transition">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #66B3FF 0%, #00D4FF 100%)' }}>
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-fredoka font-bold text-graphite">PureTask</span>
              </Link>
              <p className="text-sm sm:text-base text-gray-600 font-verdana mb-3 sm:mb-4 leading-relaxed">
                Professional cleaning services with GPS tracking, photo proof, and verified cleaners.
              </p>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                <Badge className="text-white font-fredoka text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 border-0" style={{ background: '#66B3FF' }}>✓ Verified</Badge>
                <Badge className="text-white font-fredoka text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 border-0" style={{ background: '#28C76F' }}>✓ Trusted</Badge>
              </div>
            </div>

            {/* For Clients */}
            <div>
              <h3 className="font-fredoka font-bold mb-3 sm:mb-4 text-lg sm:text-xl text-puretask-blue">For Clients</h3>
              <div className="flex flex-col gap-2 sm:gap-3">
                <Link to={createPageUrl('BrowseCleaners')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Browse Cleaners
                </Link>
                <Link to={createPageUrl('Pricing')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Pricing
                </Link>
                <Link to={createPageUrl('HowItWorks')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />How It Works
                </Link>
                <Link to={createPageUrl('ReferralProgram')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <Gift className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Refer & Earn
                </Link>
              </div>
            </div>

            {/* For Cleaners */}
            <div>
              <h3 className="font-fredoka font-bold mb-4 text-xl text-puretask-blue">For Cleaners</h3>
              <div className="flex flex-col gap-3">
                <Link to={createPageUrl('HowItWorksCleaners')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />How It Works
                </Link>
                <Link to={createPageUrl('CleanerResources')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Resources
                </Link>
                <Link to={createPageUrl('RoleSelection')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Join & Earn
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-fredoka font-bold mb-4 text-xl text-puretask-blue">Company</h3>
              <div className="flex flex-col gap-3">
                <Link to={createPageUrl('Support')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Support
                </Link>
                <Link to={createPageUrl('Legal')} className="text-base text-gray-700 hover:text-puretask-blue font-verdana transition-colors flex items-center gap-2 hover:gap-3 group">
                  <Scale className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Legal Center
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base text-gray-600 font-verdana font-semibold">
              © 2024 PureTask. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
