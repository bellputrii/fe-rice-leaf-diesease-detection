"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, BookOpen, Users, GraduationCap, ClipboardList, LogIn, UserPlus, User, LogOut, LayoutDashboard, Settings, Shield, Star, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string;
  subscriptionExpiredAt?: string;
}

interface VerifyRoleResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
  };
}

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Effect untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect untuk mengecek status login dan role
  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  // Fungsi untuk mengecek status subscription
  const checkSubscriptionStatus = async (token: string, userData: UserProfile) => {
    try {
      setSubscriptionLoading(true);
      if (!token) {
        setHasSubscription(false);
        return;
      }

      // Jika user memiliki subscriptionExpiredAt di userData, gunakan itu
      if (userData?.subscriptionExpiredAt) {
        const subscriptionExpiredAt = userData.subscriptionExpiredAt;
        if (subscriptionExpiredAt && new Date(subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true);
        } else {
          setHasSubscription(false);
        }
        return;
      }

      // Fallback: fetch dari endpoint profile
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        setHasSubscription(false);
        return;
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        const subscriptionExpiredAt = result.data.subscriptionExpiredAt;
        if (subscriptionExpiredAt && new Date(subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true);
        } else {
          setHasSubscription(false);
        }
      } else {
        setHasSubscription(false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setHasSubscription(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Fungsi untuk verify role dari API
  const verifyUserRole = async (token: string): Promise<string | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-role`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: VerifyRoleResponse = await response.json();
      
      if (result.success && result.data) {
        return result.data.role.toLowerCase();
      } else {
        throw new Error(result.message || 'Failed to verify role');
      }
    } catch (error) {
      console.error("Error verifying user role:", error);
      
      // Fallback: coba ambil role dari endpoint /me
      try {
        const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (meResponse.ok) {
          const meResult = await meResponse.json();
          if (meResult.success && meResult.data) {
            return meResult.data.role.toLowerCase();
          }
        }
      } catch (meError) {
        console.error("Error fetching user profile:", meError);
      }
      
      return null;
    }
  };

  // Fungsi untuk mengecek status autentikasi dan role
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const savedUserRole = localStorage.getItem("userRole");
      const savedUserData = localStorage.getItem("userData");
      
      if (token) {
        // Verify role dari API
        const verifiedRole = await verifyUserRole(token);
        
        if (verifiedRole) {
          setIsLoggedIn(true);
          setUserRole(verifiedRole);
          
          // Simpan ke localStorage untuk cache
          localStorage.setItem("userRole", verifiedRole);
          
          // Jika ada data user yang disimpan, gunakan itu
          if (savedUserData) {
            const parsedData = JSON.parse(savedUserData);
            setUserData(parsedData);
            // Cek status subscription setelah mendapatkan user data
            await checkSubscriptionStatus(token, parsedData);
          } else {
            // Jika tidak ada data user yang disimpan, fetch dari API profile
            await fetchUserProfile(token);
          }
        } else {
          // Fallback ke data yang disimpan di localStorage
          if (savedUserRole) {
            setIsLoggedIn(true);
            setUserRole(savedUserRole);
            if (savedUserData) {
              const parsedData = JSON.parse(savedUserData);
              setUserData(parsedData);
              await checkSubscriptionStatus(token, parsedData);
            } else {
              await fetchUserProfile(token);
            }
          } else {
            // Token tidak valid, logout
            handleCleanLogout();
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserData(null);
        setHasSubscription(false);
        setSubscriptionLoading(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
      setUserRole(null);
      setUserData(null);
      setHasSubscription(false);
      setSubscriptionLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk fetch data user profile
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserData(result.data);
          localStorage.setItem("userData", JSON.stringify(result.data));
          // Cek status subscription setelah mendapatkan user data
          await checkSubscriptionStatus(token, result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setSubscriptionLoading(false);
    }
  };

  // Fungsi untuk logout bersih
  const handleCleanLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);
    setHasSubscription(false);
    setSubscriptionLoading(false);
  };

  // Fungsi logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      handleCleanLogout();
      setShowLogoutConfirm(false);
      
      // Redirect ke home page setelah logout
      router.push("/home");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi logout
  const showLogoutConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  // Fungsi untuk menutup modal konfirmasi
  const closeLogoutConfirmation = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items berdasarkan status login dan role - DIUBAH dengan pengecekan subscription
  const getMenuItems = () => {
    // Jika belum login
    if (!isLoggedIn) {
      return [
        { name: "Dashboard", icon: <Home size={18} />, href: "/home" },
        { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
        { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
      ];
    }

    // Jika sudah login berdasarkan role - DIUBAH dengan pengecekan subscription untuk student
    switch (userRole) {
      case 'student':
        // Student dengan subscription aktif
        if (hasSubscription && !subscriptionLoading) {
          return [
            { name: "Home", icon: <Home size={18} />, href: "/home-student" },
            { name: "My Courses", icon: <ClipboardList size={18} />, href: "/mycourse" },
          ];
        } 
        // Student tanpa subscription atau masih loading
        else {
          return [
            { name: "Dashboard", icon: <Home size={18} />, href: "/home" },
            { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
            { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
          ];
        }
      
      case 'teacher':
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/beranda" },
          { name: "Kelola Kelas", icon: <LayoutDashboard size={18} />, href: "/classes" },
        ];
      
      case 'admin':
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/dashboard" },
          { name: "Teacher", icon: <Users size={18} />, href: "/teacher" },
          { name: "Categories", icon: <Settings size={18} />, href: "/categories" },
          { name: "Review", icon: <Star size={18} />, href: "/admin-review" },
          { name: "Redeem", icon: <Ticket size={18} />, href: "/redeem" },
        ];
      
      default:
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/home" },
          { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
          { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
        ];
    }
  };

  const menuItems = getMenuItems();

  // Fungsi untuk mengecek apakah link aktif
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href);
  };

  // Tentukan URL logo berdasarkan role dan subscription status
  const getLogoHref = () => {
    if (userRole === 'teacher') {
      return "/beranda";
    } else if (userRole === 'admin') {
      return "/dashboard";
    } else if (userRole === 'student' && hasSubscription && !subscriptionLoading) {
      return "/home-student";
    }
    return "/home";
  };

  // Tentukan warna navbar berdasarkan role
  const getNavbarStyle = () => {
    if (userRole === 'teacher') {
      return 'bg-blue-50 border-blue-200';
    } else if (userRole === 'admin') {
      return 'bg-blue-50 border-blue-200';
    } else if (userRole === 'student' && hasSubscription && !subscriptionLoading) {
      return 'bg-blue-50 border-blue-200';
    }
    return '';
  };

  // Tentukan warna teks dan background berdasarkan role dan subscription
  const getRoleColors = () => {
    if (userRole === 'teacher') {
      return {
        primary: 'blue',
        text: 'text-blue-800',
        bg: 'bg-blue-100',
        hoverBg: 'bg-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else if (userRole === 'admin') {
      return {
        primary: 'blue',
        text: 'text-blue-800',
        bg: 'bg-blue-100',
        hoverBg: 'bg-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else if (userRole === 'student' && hasSubscription && !subscriptionLoading) {
      return {
        primary: 'blue',
        text: 'text-blue-800',
        bg: 'bg-blue-100',
        hoverBg: 'bg-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    return {
      primary: 'blue',
      text: 'text-blue-800',
      bg: 'bg-gray-100',
      hoverBg: 'bg-gray-200',
      button: 'bg-blue-600 hover:bg-blue-700'
    };
  };

  // Fungsi untuk mendapatkan inisial nama
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fungsi untuk handle klik profile (routing ke /profile)
  const handleProfileClick = () => {
    router.push('/profile');
  };

  const roleColors = getRoleColors();

  // Tampilkan loading sederhana
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 py-3">
        <div className="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white shadow-lg border-b border-gray-200 py-2" 
            : "bg-white shadow-sm border-b border-gray-200 py-3"
        } ${getNavbarStyle()}`}
      >
        <div className="mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href={getLogoHref()}
              className="flex items-center gap-2 sm:gap-3 no-underline"
            >
              <div className={`relative flex items-center justify-center ${
                isScrolled ? "w-8 h-8" : "w-10 h-10"
              }`}>
                <Image
                  src="/logo-ambil-prestasi.png"
                  alt="Ambil Prestasi"
                  width={isScrolled ? 32 : 40}
                  height={isScrolled ? 32 : 40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className={`font-bold transition-all duration-300 ${
                  isScrolled ? "text-lg" : "text-xl"
                } ${roleColors.text}`}>
                  Ambil Prestasi
                </span>
                {userRole && (
                  <span className="text-xs text-gray-500 leading-none mt-1">
                    {userRole === 'teacher' && '(Teacher)'}
                    {userRole === 'admin' && '(Admin)'}
                    {userRole === 'student' && hasSubscription && !subscriptionLoading && '(Student Premium)'}
                    {userRole === 'student' && (!hasSubscription || subscriptionLoading) && '(Student)'}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink(item.href)
                    ? `${roleColors.button} text-white shadow-md`
                    : `${roleColors.text} hover:${roleColors.bg}`
                } ${isScrolled ? "py-2" : "py-2.5"}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Profile Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              // Tampilan ketika user sudah login
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Badge Status Subscription untuk Student */}
                {userRole === 'student' && !subscriptionLoading && (
                  <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-medium ${
                    hasSubscription 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {hasSubscription ? 'Premium' : 'Free'}
                  </div>
                )}

                {/* Profile Picture & Dropdown */}
                <div className="relative group">
                  <button 
                    onClick={handleProfileClick}
                    className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${roleColors.bg} hover:${roleColors.hoverBg} ${roleColors.text}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      userRole === 'teacher' ? "bg-blue-700" : 
                      userRole === 'admin' ? "bg-blue-700" : 
                      hasSubscription ? "bg-green-600" : "bg-blue-600"
                    }`}>
                      {userData?.name ? (
                        getInitials(userData.name)
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">
                      @{userData?.username || (
                        userRole === 'teacher' ? 'teacher' :
                        userRole === 'admin' ? 'admin' :
                        'student'
                      )}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userData?.name || (
                          userRole === 'teacher' ? 'Teacher Profile' : 
                          userRole === 'admin' ? 'Admin Profile' : 
                          'Student Profile'
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        @{userData?.username || userRole}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        Role: {userRole}
                        {userRole === 'student' && !subscriptionLoading && (
                          <span className={`ml-1 ${
                            hasSubscription ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            ({hasSubscription ? 'Premium' : 'Free'})
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          handleProfileClick();
                          // Tutup dropdown setelah klik
                          const dropdown = document.querySelector('.group');
                          if (dropdown) {
                            dropdown.classList.remove('group-hover:opacity-100', 'group-hover:visible');
                          }
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                      >
                        <User size={16} />
                        <span>Profile Saya</span>
                      </button>
                      <button
                        onClick={showLogoutConfirmation}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Tampilan ketika user belum login
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/auth/login?tab=register"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-white ${roleColors.button} shadow-md`}
                >
                  <UserPlus size={16} />
                  <span>Daftar</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${roleColors.bg} hover:${roleColors.hoverBg} ${roleColors.text}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-3 py-2 space-y-1">
              {/* Status Subscription untuk Student di Mobile */}
              {isLoggedIn && userRole === 'student' && !subscriptionLoading && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium mb-2 ${
                  hasSubscription 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  Status: {hasSubscription ? 'Premium' : 'Free'}
                </div>
              )}

              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all ${
                    isActiveLink(item.href)
                      ? `${roleColors.button} text-white`
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              ))}
              
              {/* Auth Buttons di Mobile */}
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                {isLoggedIn ? (
                  // Mobile menu ketika login
                  <>
                    <div 
                      onClick={() => {
                        handleProfileClick();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg bg-gray-100 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        userRole === 'teacher' ? "bg-blue-700" : 
                        userRole === 'admin' ? "bg-blue-700" : 
                        hasSubscription ? "bg-green-600" : "bg-blue-600"
                      }`}>
                        {userData?.name ? (
                          getInitials(userData.name)
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userData?.name || (
                            userRole === 'teacher' ? 'Teacher Profile' : 
                            userRole === 'admin' ? 'Admin Profile' : 
                            'Student Profile'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{userData?.username || userRole}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        showLogoutConfirmation();
                      }}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full text-left"
                    >
                      <LogOut size={18} />
                      <span className="font-medium text-sm">Logout</span>
                    </button>
                  </>
                ) : (
                  // Mobile menu ketika belum login
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <LogIn size={18} />
                      <span className="font-medium text-sm">Login</span>
                    </Link>
                    <Link
                      href="/auth/login?tab=register"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 py-3 px-3 rounded-lg text-white transition-all ${roleColors.button}`}
                    >
                      <UserPlus size={18} />
                      <span className="font-medium text-sm">Daftar</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Logout
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin logout dari akun Anda?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeLogoutConfirmation}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  disabled={isLoggingOut}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}