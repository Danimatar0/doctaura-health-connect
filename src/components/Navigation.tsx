import { Button } from "@/components/ui/button";
import { Search, MapPin, Menu, Settings, Bell, Calendar, FileText, LogOut, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { keycloakService } from "@/services/keycloakService";
import { useState, useEffect } from "react";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import doctauraLogo from "@/assets/doctaura_icon.png";

/**
 * Get user initials from name
 */
const getInitials = (name: string, firstName?: string, lastName?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Generate a consistent color based on user name
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userProfilePicture, setUserProfilePicture] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { featureFlags } = useFeatureFlags();

  // Only hide pharmacy for authenticated patients when flag is disabled
  const showPharmacyFinder =
    !isAuthenticated || userRole !== "patient" || featureFlags.pharmacyFinder;

  useEffect(() => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setUserName(user.name);
      setUserFirstName(user.firstName || "");
      setUserLastName(user.lastName || "");
      setUserRole(user.role);
      setUserProfilePicture(user.profilePicture || "");
      // TODO: Fetch actual notification count from API
      setNotificationCount(3); // Placeholder for demo
    }
  }, []);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await keycloakService.logout();
  };

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleDashboard = () => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setIsMobileMenuOpen(false);
      navigate(keycloakService.getDashboardUrl(user.role));
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={doctauraLogo} alt="Doctaura" className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={isActivePath('/doctors') ? 'secondary' : 'ghost'}
              onClick={() => handleNavigate('/doctors')}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Find Doctors
            </Button>
            {showPharmacyFinder && (
              <Button
                variant={isActivePath('/pharmacies') ? 'secondary' : 'ghost'}
                onClick={() => handleNavigate('/pharmacies')}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Pharmacy Locator
              </Button>
            )}
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell - Desktop */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
                            {notificationCount > 9 ? "9+" : notificationCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifications</span>
                        {notificationCount > 0 && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {notificationCount} new
                          </span>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notificationCount > 0 ? (
                        <>
                          <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                            <div className="flex items-center gap-2 w-full">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Upcoming Appointment</span>
                            </div>
                            <span className="text-xs text-muted-foreground pl-6">
                              Dr. Smith tomorrow at 10:00 AM
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                            <div className="flex items-center gap-2 w-full">
                              <FileText className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-sm">Prescription Ready</span>
                            </div>
                            <span className="text-xs text-muted-foreground pl-6">
                              Your prescription is ready for pickup
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                            <div className="flex items-center gap-2 w-full">
                              <Bell className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">Reminder</span>
                            </div>
                            <span className="text-xs text-muted-foreground pl-6">
                              Complete your profile for better experience
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-center text-primary text-sm justify-center cursor-pointer"
                            onClick={() => handleNavigate(`/${userRole}/notifications`)}
                          >
                            View all notifications
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          No new notifications
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 pl-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userProfilePicture} alt={userName} />
                          <AvatarFallback className={cn("text-white text-sm font-medium", getAvatarColor(userName))}>
                            {getInitials(userName, userFirstName, userLastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:inline">{userName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userProfilePicture} alt={userName} />
                            <AvatarFallback className={cn("text-white font-medium", getAvatarColor(userName))}>
                              {getInitials(userName, userFirstName, userLastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{userName}</span>
                            <span className="text-xs font-normal text-muted-foreground capitalize">
                              {userRole} Account
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDashboard}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigate(`/${userRole}/profile`)}>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      {userRole === 'doctor' && (
                        <DropdownMenuItem onClick={() => handleNavigate('/doctor/schedule')}>
                          <Settings className="h-4 w-4 mr-2" />
                          Schedule Settings
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleNavigate(`/${userRole}/settings`)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Notifications Bell */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden relative"
                  onClick={() => handleNavigate(`/${userRole}/notifications`)}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Button>

                {/* Mobile Menu Button */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <img src={doctauraLogo} alt="Doctaura" className="h-6 w-auto" />
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {/* User Profile Section */}
                      <div className="flex items-center gap-3 px-2 py-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userProfilePicture} alt={userName} />
                          <AvatarFallback className={cn("text-white font-medium", getAvatarColor(userName))}>
                            {getInitials(userName, userFirstName, userLastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{userName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{userRole} Account</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={handleDashboard}
                        >
                          <Calendar className="h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigate('/doctors')}
                        >
                          <Search className="h-4 w-4" />
                          Find Doctors
                        </Button>
                        {showPharmacyFinder && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => handleNavigate('/pharmacies')}
                          >
                            <MapPin className="h-4 w-4" />
                            Pharmacy Locator
                          </Button>
                        )}

                        <Separator className="my-2" />

                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigate(`/${userRole}/profile`)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 relative"
                          onClick={() => handleNavigate(`/${userRole}/notifications`)}
                        >
                          <Bell className="h-4 w-4" />
                          Notifications
                          {notificationCount > 0 && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                              {notificationCount}
                            </span>
                          )}
                        </Button>
                        {userRole === 'doctor' && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => handleNavigate('/doctor/schedule')}
                          >
                            <Settings className="h-4 w-4" />
                            Schedule Settings
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigate(`/${userRole}/settings`)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Button>

                        <Separator className="my-2" />

                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                {/* Guest CTA - Desktop */}
                <Button
                  onClick={() => handleNavigate('/register')}
                  className="hidden md:flex gap-2"
                >
                  Get Started
                </Button>

                {/* Mobile Menu for Guests */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <img src={doctauraLogo} alt="Doctaura" className="h-6 w-auto" />
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleNavigate('/doctors')}
                      >
                        <Search className="h-4 w-4" />
                        Find Doctors
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleNavigate('/pharmacies')}
                      >
                        <MapPin className="h-4 w-4" />
                        Pharmacy Locator
                      </Button>
                      <Separator className="my-4" />
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleNavigate('/register')}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full gap-2 text-sm text-muted-foreground"
                        onClick={() => handleNavigate('/login')}
                      >
                        Already have an account? Login
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
