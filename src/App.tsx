import { ProfileMenu } from './components/tourist/ProfileMenu';
import { Prerequisites } from './components/tourist/Prerequisites';
import { CommunityLeaderboard } from './components/tourist/CommunityLeaderboard';
import { api, usePlatform, refreshPlatform, clearPlatform, journeyContext, notify } from './services/journey';
import { firebaseAuth } from './services/firebaseAuth';
import { JourneyHome, CommunityContributions, TravelPreferences, ConnectedMarketplace, HotelDirectory, Notifications } from './components/journey/JourneyHub';
import { ConnectedPlanner } from './components/ai/ConnectedPlanner';
import { ItineraryService } from './services/smartMap/travel';
import { SmartSafetyMap } from './components/maps/smart/SmartSafetyMap';
import React, { useState, useEffect, useMemo } from 'react';
import { INDIA_TRIPS, TRANSIT_TOOLKIT, REGIONAL_FESTIVALS, FAMOUS_CULTURAL_BUYS } from './data/indiaTrips';
import { Trip, ItineraryItem, ItineraryCategory, DayPlan } from './types/travel';
import { Header } from './components/Header';
import { TripHero } from './components/TripHero';
import { TransitQuickBar } from './components/TransitQuickBar';
import { DayNavigator } from './components/DayNavigator';
import { ItineraryTimeline } from './components/ItineraryTimeline';
import { InteractiveMapModal } from './components/InteractiveMapModal';
import { AddActivityModal } from './components/AddActivityModal';
import { TouristToolkitModal } from './components/TouristToolkitModal';
import { BudgetBreakdownModal } from './components/BudgetBreakdownModal';
import { BottomNavBar, MainNavTab } from './components/BottomNavBar';
import { TransitPage } from './components/pages/TransitPage';
import { CulinaryPage } from './components/pages/CulinaryPage';
import { FestivalsPage } from './components/pages/FestivalsPage';
import { CraftsPage } from './components/pages/CraftsPage';
import { TouristGuidePage } from './components/pages/TouristGuidePage';
import { FairPriceScamEngine } from './components/trust/FairPriceScamEngine';
import { SafetyPage } from './components/safety/SafetyPage';
import { GlobalSOSModal } from './components/safety/GlobalSOSModal';
import { AITripPlannerPage } from './components/ai/AITripPlannerPage';
import { GuideMarketplacePage } from './components/guides/GuideMarketplacePage';
import { IndustryAuthorityPortal } from './components/b2b/IndustryAuthorityPortal';
import { RequestAssistanceModal } from './components/accessibility/RequestAssistanceModal';

import { TravelerProfilePage } from './components/profile/TravelerProfilePage';
import { SurroundingScannerModal } from './components/SurroundingScannerModal';
import { DestinationActionModal } from './components/search/DestinationActionModal';
import { findDestinationCoordinates } from './utils/destinationCoordinates';
import { FloatingSOSButton } from './components/safety/FloatingSOSButton';
import { FloatingAssistantButton } from './components/chat/FloatingAssistantButton';
import { TravelAssistantModal } from './components/chat/TravelAssistantModal';
import { SOSIncident } from './types/trustEngine';
import { AppEntity } from './types/entity';
import { AuthUser, DEMO_ACCOUNTS, isDemoUser, promptDemoRestriction } from './types/auth';
import { LoginPage } from './components/auth/LoginPage';
import { DemoRestrictionModal } from './components/auth/DemoRestrictionModal';
import { SuperCard } from './components/tourist/SuperCard';
import { SuperCardPage } from './components/pages/SuperCardPage';
import { ExplorePage } from './components/pages/ExplorePage';
import { EntitySwitcherBar } from './components/navigation/EntitySwitcherBar';
import { EcosystemFlowModal } from './components/dashboards/EcosystemFlowModal';
import { BusinessDashboard, BusinessDashboardTab } from './components/dashboards/BusinessDashboard';
import { AuthorityDashboard, AuthorityDashboardTab } from './components/dashboards/AuthorityDashboard';
import { DashboardMapSection } from './components/maps/DashboardMapSection';
import { CulturalDiscoveryHub } from './components/discovery/CulturalDiscoveryHub';
import { TravelerEssentials } from './components/TravelerEssentials';
import { FestivalModeView, getClosestFestivalTheme } from './components/festivals/FestivalModeView';
import { IndianTimeWidget } from './components/common/IndianTimeWidget';
import {
  Sparkles,
  MapPin,
  Share2,
  Check,
  Train,
  Utensils,
  ShoppingBag,
  Landmark,
  Clock,
  IndianRupee,
  Info,
  Accessibility,
  AlertOctagon,
  LifeBuoy,
  Compass,
  ChevronDown,
  Search,
  ArrowLeft,
  PhoneCall,
  Calendar,
  X
} from 'lucide-react';

export default function App() {
  // Trips state with localStorage caching
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('india_travel_trips_2026');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize any legacy trips that may have had Jama Masjid as default activity
          let changed = false;
          parsed = parsed.map((trip: Trip) => ({
            ...trip,
            days: trip.days?.map(day => ({
              ...day,
              items: day.items?.map(item => {
                if (item.title?.toLowerCase().includes('jama masjid')) {
                  changed = true;
                  return {
                    ...item,
                    title: 'Red Fort (Lal Qila) Mughal Heritage Complex',
                    location: 'Netaji Subhash Marg, Lal Qila, Old Delhi',
                    imageUrl: 'https://images.unsplash.com/photo-1598598795009-f80c5072e665?auto=format&fit=crop&w=800&q=80',
                    description: 'Magnificent 17th-century UNESCO World Heritage fortress of red sandstone constructed by Emperor Shah Jahan.',
                    coordinates: { lat: 28.6562, lng: 77.2410 }
                  };
                }
                return item;
              })
            }))
          }));
          if (changed) {
            try {
              localStorage.setItem('india_travel_trips_2026', JSON.stringify(parsed));
            } catch { }
          }
          // Merge in any new default trips (like Indore) not yet in cache
          const existingIds = new Set(parsed.map((t: Trip) => t.id));
          const missingTrips = INDIA_TRIPS.filter(t => !existingIds.has(t.id));
          return [...parsed, ...missingTrips];
        }
      }
      return INDIA_TRIPS;
    } catch {
      return INDIA_TRIPS;
    }
  });

  const [activeTripId, setActiveTripId] = useState<string>(() => {
    // Prefer Kerala trip as default itinerary
    const keralaTrip = trips.find(t => t.id === 'kerala-backwaters');
    return keralaTrip?.id || trips[0]?.id || 'kerala-backwaters';
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<ItineraryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('itinerary');
  const [businessActiveTab, setBusinessActiveTab] = useState<BusinessDashboardTab>('overview');
  const [authorityActiveTab, setAuthorityActiveTab] = useState<AuthorityDashboardTab>('overview');
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  // Navigate between tabs with browser history support (Back returns to previous screen)
  const navigateToTab = (tab: MainNavTab, pushToHistory = true) => {
    if (pushToHistory && tab !== activeNavTab) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
    setActiveNavTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const validTabs: MainNavTab[] = [
      'itinerary', 'map', 'explore', 'ai_planner', 'trust', 'safety', 
      'transit', 'culinary', 'festivals', 'crafts', 'guide', 'guides', 
      'supercard', 'profile', 'fairprice', 'b2b'
    ];
    const initialHash = window.location.hash.replace('#', '') as MainNavTab;
    if (initialHash && validTabs.includes(initialHash)) {
      setActiveNavTab(initialHash);
    } else {
      window.history.replaceState({ tab: 'itinerary' }, '', '#itinerary');
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab && validTabs.includes(e.state.tab)) {
        setActiveNavTab(e.state.tab);
      } else {
        const hash = window.location.hash.replace('#', '') as MainNavTab;
        if (hash && validTabs.includes(hash)) {
          setActiveNavTab(hash);
        } else {
          setActiveNavTab('itinerary');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Default traveler demo account for seamless first-load access
  const DEFAULT_TOURIST_USER: AuthUser = {
    id: 'demo-tourist',
    name: 'Priya Sharma',
    email: 'priya.sharma@demo.travel',
    role: 'tourist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  };

  // Session Inactivity Timeout: 25 minutes of inactivity triggers security logout
  const SESSION_TIMEOUT_MS = 25 * 60 * 1000;

  const isSessionExpired = (): boolean => {
    try {
      if (localStorage.getItem('bharat_yatra_explicit_logout') === 'true') {
        return true;
      }
      const lastActiveStr = localStorage.getItem('bharat_yatra_last_active_time');
      if (!lastActiveStr) return true;
      const lastActive = parseInt(lastActiveStr, 10);
      if (isNaN(lastActive) || Date.now() - lastActive > SESSION_TIMEOUT_MS) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // User Authentication State (Role-gated dashboards: Tourist, Business, Authority)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      if (isSessionExpired()) {
        localStorage.removeItem('bharat_yatra_auth_user');
        localStorage.removeItem('bharat_yatra_last_active_time');
        localStorage.setItem('bharat_yatra_explicit_logout', 'true');
        return null;
      }
      const cached = localStorage.getItem('bharat_yatra_auth_user');
      if (cached) {
        // Refresh active timestamp
        localStorage.setItem('bharat_yatra_last_active_time', Date.now().toString());
        return JSON.parse(cached);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isSuperCardModalOpen, setIsSuperCardModalOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(true);
  const [demoRestrictionModal, setDemoRestrictionModal] = useState<{
    isOpen: boolean;
    feature?: string;
    description?: string;
  }>({ isOpen: false });

  useEffect(() => {
    const handleDemoRestrict = (e: Event) => {
      const custom = e as CustomEvent<{ feature: string; description?: string }>;
      setDemoRestrictionModal({
        isOpen: true,
        feature: custom.detail?.feature || 'This Feature',
        description: custom.detail?.description,
      });
    };
    window.addEventListener('yatra-demo-restrict', handleDemoRestrict);
    return () => window.removeEventListener('yatra-demo-restrict', handleDemoRestrict);
  }, []);

  const platformState = usePlatform();
  const [tripSyncReady, setTripSyncReady] = useState(false);

  useEffect(() => {
    let alive = true;
    if (isSessionExpired()) {
      setSessionReady(true);
      return;
    }
    api('/me').then(user => {
      if (alive && user) {
        if (isSessionExpired()) {
          void api('/logout', {});
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
        }
      }
    }).catch(() => {
      // Don't auto-seed session if explicitly logged out or expired
    }).finally(() => {
      if (alive) setSessionReady(true);
    });
    return () => { alive = false; };
  }, []);

  // Track user activity and auto logout when inactive for > 25 minutes or returning after long time
  useEffect(() => {
    if (!currentUser) return;

    let lastTouch = Date.now();

    const recordUserActivity = () => {
      const now = Date.now();
      // Throttle localStorage writes to once every 15 seconds
      if (now - lastTouch > 15000) {
        lastTouch = now;
        try {
          localStorage.setItem('bharat_yatra_last_active_time', now.toString());
        } catch {}
      }
    };

    const verifySessionFreshness = () => {
      try {
        const lastActiveStr = localStorage.getItem('bharat_yatra_last_active_time');
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
        if (!lastActive || Date.now() - lastActive > SESSION_TIMEOUT_MS) {
          handleLogout('Session expired due to inactivity. Signed out for security.');
        }
      } catch {}
    };

    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, recordUserActivity, { passive: true }));

    // Check when user returns to tab after a long time
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifySessionFreshness();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', verifySessionFreshness);

    // Periodic safety check every 30 seconds
    const safetyTimer = setInterval(verifySessionFreshness, 30000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, recordUserActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', verifySessionFreshness);
      clearInterval(safetyTimer);
    };
  }, [currentUser]);

  useEffect(() => { setTripSyncReady(false); if (!currentUser) { clearPlatform(); return; } let alive = true; refreshPlatform().then(data => { if (!alive) return; const saved = data.trips[0]?.trips; if (saved?.length) { setTrips(saved); const preferKerala = saved.find((t: Trip) => t.id === 'kerala-backwaters'); setActiveTripId(preferKerala?.id || saved[0].id); setSelectedDayIndex(0); } else { setTrips(INDIA_TRIPS); const preferKerala = INDIA_TRIPS.find(t => t.id === 'kerala-backwaters'); setActiveTripId(preferKerala?.id || INDIA_TRIPS[0].id); setSelectedDayIndex(0); } setTripSyncReady(true); }).catch(() => { }); return () => { alive = false; }; }, [currentUser?.id]);
  useEffect(() => { if (!tripSyncReady || !currentUser) return; const timer = setTimeout(() => { api('/trips', { trips }, 'PUT').catch(() => { }); }, 800); return () => clearTimeout(timer); }, [trips, tripSyncReady, currentUser?.id]);
  useEffect(() => { if (platformState.profile.wheelchair !== undefined) setAccessibilityMode(platformState.profile.wheelchair); document.documentElement.lang = platformState.profile.language || 'en'; }, [platformState.profile]);

  useEffect(() => { if (!currentUser) return; const refresh = () => { if (document.visibilityState === 'visible') refreshPlatform().catch(() => { }); }; window.addEventListener('focus', refresh); const timer = setInterval(refresh, 30000); return () => { window.removeEventListener('focus', refresh); clearInterval(timer); }; }, [currentUser?.id]);
  // Active dashboard entity is strictly locked to the authenticated user's role
  const currentEntity: AppEntity = currentUser ? currentUser.role : 'tourist';
  const [isEcosystemModalOpen, setIsEcosystemModalOpen] = useState(false);

  // PRD Features State
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sih_accessibility_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);
  const [festivalMode, setFestivalMode] = useState(false);


  // Modals
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number; title?: string } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [toolkitTab, setToolkitTab] = useState<'transit' | 'festivals' | 'culinary' | 'shopping'>('transit');
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string | null>(null);
  const [plannerDestination, setPlannerDestination] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Chandni Chowk, Old Delhi');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Destination Action Hub State (Productive Search Modal)
  const [isDestinationHubOpen, setIsDestinationHubOpen] = useState(false);
  const [destinationHubQuery, setDestinationHubQuery] = useState('');
  const [destinationHubData, setDestinationHubData] = useState<any>(null);
  const [trustSearchQuery, setTrustSearchQuery] = useState('');

  const handleOpenDestinationHub = (destination: string, searchData?: any) => {
    if (!destination.trim()) return;
    setDestinationHubQuery(destination.trim());
    setDestinationHubData(searchData || null);
    setIsDestinationHubOpen(true);
  };

  const handleOpenMapWithLocation = (loc: { lat: number; lng: number; title: string }) => {
    setFocusLocation(loc);
    setIsDestinationHubOpen(false);
    setIsMapOpen(false);
    setActiveNavTab('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFairPrice = (query: string) => {
    setTrustSearchQuery(query);
    setActiveNavTab('trust');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddStopDirectly = (title: string) => {
    const geo = findDestinationCoordinates(title);
    const newItem: Omit<ItineraryItem, 'id'> = {
      title,
      category: 'cultural_sight',
      time: '11:00 AM',
      duration: '2h',
      location: `${title}, ${currentDay.city || geo.city}`,
      city: currentDay.city || geo.city,
      cost: 100,
      description: `Visited ${title} during trip to ${currentDay.city || geo.city}.`,
      touristTip: `${geo.timings || 'Check opening hours'} • ${geo.dressCode || 'Comfortable attire'}.`,
      imageUrl: geo.photoUrl,
      rating: 4.8,
      reviewsCount: 150,
      coordinates: { lat: geo.lat, lng: geo.lng }
    };
    handleAddItem(newItem);
    showToast(`Added "${title}" to Day ${currentDay.dayNumber} (${currentDay.city})!`);
  };

  // Sync trips to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('india_travel_trips_2026', JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [trips]);

  // Sync accessibility mode
  useEffect(() => {
    try {
      localStorage.setItem('sih_accessibility_mode', accessibilityMode ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [accessibilityMode]);

  // Sync current entity
  useEffect(() => {
    try {
      localStorage.setItem('bharat_yatra_entity', currentEntity);
    } catch (e) {
      console.error(e);
    }
  }, [currentEntity]);

  // Find active trip
  const currentTrip = useMemo(() => {
    return trips.find(t => t.id === activeTripId) || trips[0];
  }, [trips, activeTripId]);

  // Active day
  const currentDay = useMemo(() => {
    return currentTrip.days[selectedDayIndex] || currentTrip.days[0];
  }, [currentTrip, selectedDayIndex]);

  // Compute stats across trip
  const allItems = useMemo(() => {
    return currentTrip.days.flatMap(d => d.items);
  }, [currentTrip]);

  useEffect(() => { journeyContext.current = { ...journeyContext.current, trip: currentTrip.title, city: currentDay.city, activities: currentDay.items.map(({ title, time, cost, completed }) => ({ title, time, cost, completed })), nextActivity: currentDay.items.find(i => !i.completed)?.title, remainingBudget: currentTrip.baseBudget - allItems.filter(i => i.completed).reduce((sum, i) => sum + i.cost, 0), preferences: platformState.profile }; }, [currentTrip, currentDay, platformState.profile]);
  const totalActivities = allItems.length;
  const completedActivities = allItems.filter(i => i.completed).length;
  const totalCost = allItems.reduce((acc, i) => acc + (i.cost || 0), 0);

  // Category counts for current day
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: currentDay.items.length,
      transit: 0,
      cultural_sight: 0,
      culinary: 0,
      cultural_buy: 0,
      festival: 0,
    };

    currentDay.items.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });

    return counts;
  }, [currentDay]);

  // Filtered items for current day based on search and category
  const filteredDayItems = useMemo(() => {
    return currentDay.items.filter(item => {
      if (!item) return false;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.touristTip && item.touristTip.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        (item.transitDetails && (
          (item.transitDetails.from && item.transitDetails.from.toLowerCase().includes(q)) ||
          (item.transitDetails.to && item.transitDetails.to.toLowerCase().includes(q)) ||
          (item.transitDetails.mode && item.transitDetails.mode.toLowerCase().includes(q))
        )) ||
        (item.culinaryDetails && Array.isArray(item.culinaryDetails.specialties) && item.culinaryDetails.specialties.some(s => s && s.toLowerCase().includes(q))) ||
        (item.culturalBuyDetails && item.culturalBuyDetails.itemToBuy && item.culturalBuyDetails.itemToBuy.toLowerCase().includes(q));

      return matchesCategory && Boolean(matchesSearch);
    });
  }, [currentDay, selectedCategory, searchQuery]);

  // Toggle completed status
  const handleToggleComplete = (itemId: string) => {
    setTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id !== activeTripId) return trip;
        return {
          ...trip,
          days: trip.days.map(day => ({
            ...day,
            items: day.items.map(it => {
              if (it.id === itemId) {
                return { ...it, completed: !it.completed };
              }
              return it;
            })
          }))
        };
      });
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id !== activeTripId) return trip;
        return {
          ...trip,
          days: trip.days.map(day => ({
            ...day,
            items: day.items.filter(it => it.id !== itemId)
          }))
        };
      });
    });
    showToast('Stop removed from itinerary');
  };

  // Add item
  const handleAddItem = (newItemData: Omit<ItineraryItem, 'id'>) => {
    const newItem: ItineraryItem = {
      ...newItemData,
      id: `custom-${Date.now()}`
    };

    setTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id !== activeTripId) return trip;
        return {
          ...trip,
          days: trip.days.map((day, idx) => {
            if (idx === selectedDayIndex) {
              return {
                ...day,
                items: [...day.items, newItem]
              };
            }
            return day;
          })
        };
      });
    });

    showToast(`Added "${newItem.title}" to Day ${currentDay.dayNumber}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    // Restore the tab the user was on before being asked to log in (demo restriction redirect)
    let redirectTab: MainNavTab = 'itinerary';
    try {
      const savedTab = sessionStorage.getItem('yatra_login_redirect_tab') as MainNavTab | null;
      if (savedTab) {
        redirectTab = savedTab;
        sessionStorage.removeItem('yatra_login_redirect_tab');
      }
    } catch {}
    setActiveNavTab(redirectTab);
    window.history.replaceState({ tab: redirectTab }, '', `#${redirectTab}`);
    setCurrentUser(user);
    try {
      localStorage.removeItem('bharat_yatra_explicit_logout');
      localStorage.setItem('bharat_yatra_auth_user', JSON.stringify(user));
      localStorage.setItem('bharat_yatra_entity', user.role);
      localStorage.setItem('bharat_yatra_last_active_time', Date.now().toString());
    } catch (e) {
      console.error(e);
    }
    showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = (reason?: string) => {
    void api("/logout", {}); 
    clearPlatform();
    if (firebaseAuth) {
      try { firebaseAuth.signOut().catch(() => {}); } catch {}
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('bharat_yatra_auth_user');
      localStorage.removeItem('bharat_yatra_last_active_time');
      localStorage.setItem('bharat_yatra_explicit_logout', 'true');
    } catch (e) {
      console.error(e);
    }
    showToast(reason || 'Signed out successfully.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchAccount = () => {
    void api("/logout", {}); 
    clearPlatform();
    if (firebaseAuth) {
      try { firebaseAuth.signOut().catch(() => {}); } catch {}
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('bharat_yatra_auth_user');
      localStorage.removeItem('bharat_yatra_last_active_time');
      localStorage.setItem('bharat_yatra_explicit_logout', 'true');
    } catch (e) {
      console.error(e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Trip itinerary link copied to clipboard!');
    } else {
      showToast('Itinerary ready to share!');
    }
  };

  const handleOpenTransitInfo = (_mode: string) => {
    setActiveNavTab('transit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!sessionReady) return <div className="p-12 text-center">Opening your journey…</div>;

  // If not authenticated, render Login/Authentication Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#EDF2F7]">
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          initialRole={currentEntity}
        />
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1F1C18] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${currentEntity === 'tourist' ? 'tourist-shell' : ''} min-h-screen bg-[#F7F5F0] text-[#191715] flex flex-col font-sans selection:bg-[#C84B31]/20 selection:text-[#C84B31]`}>

      {/* Top Navigation Header for All Dashboards */}
      {!['safety', 'map'].includes(activeNavTab) && (
        <Header
          activeNavTab={activeNavTab}
          currentTrip={currentTrip}
          allTrips={trips}
          onSelectTrip={(id) => {
            setActiveTripId(id);
            setSelectedDayIndex(0);
            setSelectedCategory('all');
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenToolkit={() => setIsToolkitOpen(true)}
          onShare={handleShare}
          onOpenSOS={() => setIsSOSOpen(true)}
          accessibilityMode={accessibilityMode}
          onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
          onOpenProfile={() => {
            if (currentEntity === 'business') {
              setBusinessActiveTab('profile');
              window.location.hash = '#profile';
              window.dispatchEvent(new CustomEvent('open-dashboard-profile'));
            } else if (currentEntity === 'authority') {
              setAuthorityActiveTab('profile');
              window.location.hash = '#profile';
              window.dispatchEvent(new CustomEvent('open-dashboard-profile'));
            } else {
              setActiveNavTab('profile');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenAssistant={(initialQuery, context) => {
            if (initialQuery) setAssistantInitialQuery(initialQuery);
            if (context?.destination) setPlannerDestination(context.destination);
            setIsAssistantOpen(true);
          }}
          onOpenAIPlanner={(dest) => {
            if (dest) setPlannerDestination(dest);
            setActiveNavTab('ai_planner');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentLocationName={currentLocationName}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSuperCard={() => { setActiveNavTab('supercard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenMapWithLocation={handleOpenMapWithLocation}
          onAddStop={handleAddItem}
          onOpenDestinationHub={handleOpenDestinationHub}
          onOpenFairPrice={handleOpenFairPrice}
          currentDay={currentDay}
        />
      )}

      {/* Persistent Accessibility Banner (PRD Section 4.5) */}
      {accessibilityMode && (
        <div className="bg-[#0284C7] text-white px-4 py-2.5 shadow-sm border-b border-[#0369A1] animate-in fade-in duration-200">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/20">
                <Accessibility className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span>
                <strong>Accessibility Mode Active:</strong> Surfacing step-free monument routes, tactile audio guides, and accessible restrooms.
              </span>
            </div>

            <button
              onClick={() => setIsAssistanceOpen(true)}
              className="px-3 py-1 bg-white hover:bg-[#F0F9FF] text-[#0369A1] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Request On-Ground Sahayak</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-36 sm:pb-24">

        {/* ENTITY 2: BUSINESS DASHBOARD (Merchants & Hoteliers) */}
        {currentEntity === 'business' && (
          <><BusinessDashboard
            key={currentUser?.id}
            currentUser={currentUser}
            activeTab={businessActiveTab}
            onTabChange={setBusinessActiveTab}
            onUpdateUser={async updated => {
              const saved = await api('/account', updated, 'PUT');
              setCurrentUser(saved);
              try { localStorage.setItem('bharat_yatra_auth_user', JSON.stringify(saved)); } catch { }
              void refreshPlatform().catch(() => { });
            }}
            onOpenEcosystemModal={() => setIsEcosystemModalOpen(true)}
            onLogout={handleLogout}
          /></>
        )}

        {/* ENTITY 3: AUTHORITY DASHBOARD (Ministry, ASI & Police) */}
        {currentEntity === 'authority' && (
          <><AuthorityDashboard
            key={currentUser?.id}
            currentUser={currentUser}
            activeTab={authorityActiveTab}
            onTabChange={setAuthorityActiveTab}
            onOpenEcosystemModal={() => setIsEcosystemModalOpen(true)}
            onLogout={handleLogout}
          /></>
        )}

        {/* ENTITY 1: TOURIST APP (Travelers & Visitors) */}
        {currentEntity === 'tourist' && (
          <>

            {activeNavTab === 'home' && <JourneyHome trip={currentTrip} day={currentDay} onNavigate={setActiveNavTab} onUpdate={updated => setTrips(prev => prev.map(t => t.id === updated.id ? updated : t))} />}
            {/* TAB 1: ITINERARY VIEW (Core requested view) */}
            {activeNavTab === 'itinerary' && (
              <div className="animate-in fade-in duration-200 space-y-6">

                {/* Mode Toggle: Daily Itinerary ↔ Festivals & Celebrations */}
                <div className="bg-white p-1.5 rounded-2xl border border-[#EAE5DC] shadow-2xs flex items-center gap-1.5">
                  <button
                    id="mode-toggle-itinerary-btn"
                    onClick={() => setFestivalMode(false)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      !festivalMode
                        ? 'bg-[#1F1C18] text-white shadow-xs'
                        : 'text-[#665E55] hover:text-[#1F1C18] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-[#FF6F59]" />
                    <span>Daily Itinerary</span>
                  </button>

                  <button
                    id="mode-toggle-festival-btn"
                    onClick={() => setFestivalMode(true)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      festivalMode
                        ? 'bg-gradient-to-r from-[#FF6F59] to-[#C84B31] text-white shadow-xs'
                        : 'text-[#665E55] hover:text-[#1F1C18] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Navratri & Durga Puja</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      festivalMode ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                    }`}>
                      Live
                    </span>
                  </button>
                </div>

                {/* FESTIVAL MODE: Upcoming Indian Festivals & Celebration Places */}
                {festivalMode ? (
                  <FestivalModeView onViewFullFestivals={() => {
                    setFestivalMode(false);
                    setActiveNavTab('festivals');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} />
                ) : (
                  /* Normal Itinerary Content */
                  <>
                    {/* Trip Hero Header Card with Companions and Stats */}
                    <TripHero
                      trip={currentTrip}
                      allTrips={trips}
                      onSelectTrip={(id) => {
                        setActiveTripId(id);
                        setSelectedDayIndex(0);
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      onSelectDay={(idx) => {
                        setSelectedDayIndex(idx);
                        setSelectedCategory('all');
                      }}
                      totalActivities={totalActivities}
                      completedActivities={completedActivities}
                      totalCost={totalCost}
                      onOpenMap={() => setIsMapOpen(true)}
                      onOpenBudget={() => setIsBudgetOpen(true)}
                      onAddActivity={() => setIsAddOpen(true)}
                      onOpenScanner={() => setIsScannerOpen(true)}
                      selectedDayIndex={selectedDayIndex}
                    />

                    {/* Day Selector Ribbon & Category Filter Tabs */}
                    <DayNavigator
                      prerequisites={<Prerequisites key={`${currentUser.id}:${currentTrip.id}`} trip={currentTrip} day={currentDay} userId={currentUser.id} nationality={currentUser.nationality} />}
                      days={currentTrip.days}
                      selectedDayIndex={selectedDayIndex}
                      onSelectDay={(idx) => {
                        setSelectedDayIndex(idx);
                        setSelectedCategory('all');
                      }}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                      categoryCounts={categoryCounts}
                      onSelectGuides={() => {
                        setActiveNavTab('guides');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />

                    {/* Day Timeline Cards */}
                    <ItineraryTimeline
                      currentDay={currentDay}
                      items={filteredDayItems}
                      onToggleComplete={handleToggleComplete}
                      onDeleteItem={handleDeleteItem}
                      onAddActivity={() => setIsAddOpen(true)}
                      onSelectMapLocation={(lat, lng, title) => {
                        handleOpenMapWithLocation({ lat, lng, title });
                      }}
                      searchQuery={searchQuery}
                      onOpenDestinationHub={handleOpenDestinationHub}
                      onAddStopDirectly={handleAddStopDirectly}
                    />
                  </>
                )}
              </div>
            )}

            {/* PRD TAB: FAIR PRICE & HOTEL TRUST ENGINE (Section 4.1) */}
            {/* PRD TAB: COMMUNITY & FAIR PRICE TRUST HUB (Section 4.1) */}
            {activeNavTab === 'trust' && (
              <div className="space-y-6 animate-in fade-in duration-200 pb-20">
                <FairPriceScamEngine
                  externalSearch={trustSearchQuery}
                  accessibilityMode={accessibilityMode}
                  onOpenSOS={() => setIsSOSOpen(true)}
                  currentTrip={currentTrip}
                  currentDay={currentDay}
                  currentLocationName={currentLocationName}
                  onSelectTab={(tab) => navigateToTab(tab)}
                />
                <HotelDirectory />
                <CommunityLeaderboard />
                <CommunityContributions searchQuery="" />
              </div>
            )}

            {/* TAB: FAIR PRICE & SCAM ENGINE (Dedicated view opened directly from Explore) */}
            {activeNavTab === 'fairprice' && (
              <FairPriceScamEngine
                externalSearch={trustSearchQuery}
                accessibilityMode={accessibilityMode}
                onOpenSOS={() => setIsSOSOpen(true)}
                currentTrip={currentTrip}
                currentDay={currentDay}
                currentLocationName={currentLocationName}
                onSelectTab={(tab) => navigateToTab(tab)}
                onBack={() => navigateToTab('explore')}
              />
            )}

            {/* PRD TAB: SAFETY & LIVE MAP (Merged - Toggle inside DashboardMapSection) */}
            {(activeNavTab === 'safety' || activeNavTab === 'map') && (
              <div className="animate-in fade-in duration-200">
                <SmartSafetyMap
                  day={currentDay}
                  currentUser={currentUser}
                  accessibilityMode={accessibilityMode}
                  onAdd={handleAddItem}
                  focusLocation={focusLocation}
                  onArrive={(place) => {
                    void api("/visit", { place: place.name }).catch(() => { });
                    void notify(`arrival-${place.id}-${new Date().toDateString()}`, "Arrival confirmed", `You have arrived at ${place.name}. Your trip has been updated.`);
                    const existing = currentDay.items.find(item => item.id === place.id);
                    const destinationId = existing?.id || `map-${place.id}`;
                    setTrips(previous => previous.map(trip => trip.id !== activeTripId ? trip : {
                      ...trip, days: trip.days.map((day, index) => index !== selectedDayIndex ? day : {
                        ...day, currentActivityId: destinationId,
                        items: [
                          ...day.items.map((item, itemIndex) => {
                            const destinationIndex = day.items.findIndex(activity => activity.id === destinationId);
                            return item.id === destinationId || (item.category === 'transit' && itemIndex < destinationIndex)
                              ? { ...item, completed: true } : item;
                          }),
                          ...(!day.items.some(item => item.id === destinationId) ? [{
                            ...ItineraryService.toItem(place, day.city), id: destinationId, completed: true,
                          }] : []),
                        ],
                      })
                    }));
                    return destinationId;
                  }}
                  onOpenSOS={() => setIsSOSOpen(true)}
                  onBack={() => navigateToTab('itinerary')}
                />
              </div>
            )}

            {/* PRD TAB: AI TRIP PLANNER & BUDGET VALIDATOR (Section 4.3) */}
            {activeNavTab === 'ai_planner' && (
              <ConnectedPlanner
                currentTrip={currentTrip}
                currentUser={currentUser}
                accessibilityMode={accessibilityMode}
                initialDestination={plannerDestination}
                onApplyGeneratedTrip={(newTrip) => {
                  if (isDemoUser(currentUser)) {
                    promptDemoRestriction(
                      "Saving AI Itineraries to Trip",
                      "Saving and applying AI-generated multi-day itineraries to your live schedule requires a registered account. Sign in or register to sync your trips."
                    );
                    return;
                  }
                  setTrips(prev => [newTrip, ...prev.filter(t => t.id !== newTrip.id)]);
                  setActiveTripId(newTrip.id);
                  setSelectedDayIndex(0);
                  navigateToTab('itinerary');
                  showToast(`Applied AI generated plan "${newTrip.title}"!`);
                }}
              />
            )}

            {/* PRD TAB: VERIFIED LOCAL GUIDE MARKETPLACE (Section 4.4) */}
            {activeNavTab === 'guides' && (
              <GuideMarketplacePage
                accessibilityMode={accessibilityMode}
                currentTrip={currentTrip}
                currentCity={currentDay?.city}
                onBack={() => navigateToTab('explore')}
              />
            )}

            {/* PRD TAB: INDUSTRY & AUTHORITY B2B PORTAL (Section 5) */}
            {activeNavTab === 'b2b' && (
              <IndustryAuthorityPortal />
            )}

            {/* TAB: TRANSIT HUB (Dedicated Full Page) */}
            {activeNavTab === 'transit' && (
              <TransitPage onBack={() => navigateToTab('explore')} />
            )}

            {/* TAB: FOOD SAFETY & CULINARY (Dedicated Full Page) */}
            {activeNavTab === 'culinary' && (
              <CulinaryPage onBack={() => navigateToTab('explore')} />
            )}

            {/* TAB: FESTIVALS & CELEBRATIONS (Dedicated Full Page) */}
            {activeNavTab === 'festivals' && (
              <FestivalsPage onBack={() => navigateToTab('explore')} />
            )}

            {/* TAB: CULTURAL BUYS & GI CRAFTS (Dedicated Full Page) */}
            {activeNavTab === 'crafts' && (
              <CraftsPage onBack={() => navigateToTab('explore')} />
            )}

            {/* TAB: TOURIST GUIDE & UPLOAD INFORMATION CENTER (Dedicated Full Page) */}
            {activeNavTab === 'guide' && (
              <TouristGuidePage onBack={() => navigateToTab('explore')} />
            )}

            {/* TAB: EXPLORE HUB — Beautiful feature discovery page */}
            {activeNavTab === 'explore' && (
              <ExplorePage
                onSelectTab={(tab) => navigateToTab(tab)}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenAssistant={() => setIsAssistantOpen(true)}
                onOpenDestinationHub={handleOpenDestinationHub}
                onOpenMapWithLocation={handleOpenMapWithLocation}
                currentCity={currentDay?.city}
              />
            )}

            {/* TAB: SUPER CARD — Dedicated Full Page */}
            {activeNavTab === 'supercard' && (
              <SuperCardPage
                onBack={() => navigateToTab('explore')}
                onSelectTab={(tab) => navigateToTab(tab)}
              />
            )}

            {/* TAB: TRAVELER PROFILE & CREDENTIALS PAGE */}
            {activeNavTab === 'profile' && (
              <><TravelerProfilePage
                searchQuery=""
                accessibilityMode={accessibilityMode}
                onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
                onOpenSOS={() => setIsSOSOpen(true)}
                onNavigateToItinerary={() => navigateToTab('itinerary')}
                onSelectTab={(tab) => navigateToTab(tab)}
                currentUser={currentUser}
                onLogout={handleLogout}
              /><details className="mt-6"><summary className="journey-action">Travel preferences & account data</summary><TravelPreferences /></details></>
            )}
          </>
        )}

      </main>

      {/* Floating / Docked Bottom Navigation Bar (Tourist Dashboard Only) */}
      {currentEntity === 'tourist' && !isScannerOpen && (
        <BottomNavBar
          activeTab={activeNavTab}
          onSelectTab={(tab) => navigateToTab(tab)}
          onOpenSOS={() => setIsSOSOpen(true)}
          accessibilityMode={accessibilityMode}
        />
      )}

      {/* Global Emergency SOS Modal (PRD Section 4.2) */}
      <GlobalSOSModal
        isOpen={isSOSOpen}
        currentUser={currentUser}
        onClose={() => setIsSOSOpen(false)}
        onBroadcastSOS={(incident) => {
          showToast(`Demo SOS ${incident.id} recorded on the Authority Dashboard.`);
        }}
      />

      {/* Demo Mode Feature Restriction Gate Modal */}
      <DemoRestrictionModal
        isOpen={demoRestrictionModal.isOpen}
        onClose={() => setDemoRestrictionModal({ isOpen: false })}
        onLogin={() => {
          // Save the current tab so we can restore it after login
          try {
            sessionStorage.setItem('yatra_login_redirect_tab', activeNavTab);
          } catch {}
          setDemoRestrictionModal({ isOpen: false });
          handleLogout("Please sign in or create a free account to unlock all features.");
        }}
        feature={demoRestrictionModal.feature}
        description={demoRestrictionModal.description}
      />

      {/* On-Ground Assistance Modal (PRD Section 4.5) */}
      <RequestAssistanceModal
        isOpen={isAssistanceOpen}
        onClose={() => setIsAssistanceOpen(false)}
        city={currentDay.city}
      />



      {/* 3-Entity Unified Ecosystem Overview Modal */}
      <EcosystemFlowModal
        isOpen={isEcosystemModalOpen}
        onClose={() => setIsEcosystemModalOpen(false)}
        currentEntity={currentEntity}
        onSelectEntity={(ent) => {
          const targetAccount = DEMO_ACCOUNTS[ent];
          if (targetAccount) {
            api("/demo", { role: ent }).then(handleLoginSuccess).catch(error => showToast(error.message));
          }
          setIsEcosystemModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Productive Destination Action Hub Modal (Opened from Search Bar) */}
      <DestinationActionModal
        isOpen={isDestinationHubOpen}
        onClose={() => setIsDestinationHubOpen(false)}
        query={destinationHubQuery}
        searchData={destinationHubData}
        currentTrip={currentTrip}
        currentDay={currentDay}
        onAddStop={handleAddItem}
        onOpenMap={handleOpenMapWithLocation}
        onOpenAIPlanner={(dest) => {
          if (dest) setPlannerDestination(dest);
          setActiveNavTab('ai_planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFairPrice={handleOpenFairPrice}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAssistant={(initialQuery, context) => {
          if (initialQuery) setAssistantInitialQuery(initialQuery);
          if (context?.destination) setPlannerDestination(context.destination);
          setIsAssistantOpen(true);
        }}
        onSelectTrip={(id) => {
          setActiveTripId(id);
          setSelectedDayIndex(0);
          setSelectedCategory('all');
          setSearchQuery('');
        }}
        allTrips={trips}
      />

      {/* Interactive Map Modal with Live Location, Direction & Navigation */}
      <InteractiveMapModal
        isOpen={isMapOpen}
        onClose={() => {
          setIsMapOpen(false);
          setFocusLocation(null);
        }}
        day={currentDay}
        items={currentDay.items}
        city={currentDay.city}
        focusLocation={focusLocation}
        initialUserCoords={userCoords}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        dayNumber={currentDay.dayNumber}
        city={currentDay.city}
        onAdd={handleAddItem}
      />

      {/* Comprehensive Tourist Toolkit Modal */}
      <TouristToolkitModal
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        initialTab={toolkitTab}
      />

      {/* SUPER Card is now a dedicated page tab — modal removed */}

      {/* Budget Breakdown Modal */}
      <BudgetBreakdownModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        trip={currentTrip}
        allItems={allItems}
      />

      {/* Surrounding Area Live Scanner & Radar Modal */}
      <SurroundingScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        currentTrip={currentTrip}
        onAddStopToDay={(item) => {
          handleAddItem(item);
          showToast(`Added "${item.title}" to Day ${currentDay.dayNumber} itinerary`);
        }}
        userCoords={userCoords}
        onUpdateUserCoords={(coords) => {
          setUserCoords({ lat: coords.lat, lng: coords.lng });
          setCurrentLocationName(coords.locationName);
          showToast(`Radar locked to: ${coords.locationName}`);
        }}
        currentLocationName={currentLocationName}
      />

      {/* Permanent SOS Button in the Bottom Right Corner of the UI (Tourist Dashboard Only) */}
      {currentEntity === 'tourist' && !['safety', 'map'].includes(activeNavTab) && (
        <FloatingSOSButton onOpenSOS={() => setIsSOSOpen(true)} />
      )}

      {/* Floating Sahayak AI Travel Assistant Button (Tourist Dashboard Only) */}
      {currentEntity === 'tourist' && !['safety', 'map'].includes(activeNavTab) && (
        <FloatingAssistantButton onOpenAssistant={() => {
          setAssistantInitialQuery(null);
          setIsAssistantOpen(true);
        }} />
      )}

      {/* Dedicated Travel & App Feature Assistant Modal */}
      <TravelAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantInitialQuery(null);
        }}
        initialQuery={assistantInitialQuery}
        onClearInitialQuery={() => setAssistantInitialQuery(null)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenTrust={() => {
          setActiveNavTab('trust');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTransit={() => {
          setActiveNavTab('transit');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAccessibility={() => setIsAssistanceOpen(true)}
        onOpenProfile={() => {
          setActiveNavTab('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGuides={() => {
          setActiveNavTab('guides');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAIPlanner={(dest) => {
          if (dest) setPlannerDestination(dest);
          setActiveNavTab('ai_planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1C18] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
