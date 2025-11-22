'use client'

import { useState, useEffect } from 'react'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Play, BookOpen, Crown, Zap, ArrowRight } from 'lucide-react'
import Footer from '@/components/public/Footer'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string;
  subscriptionExpiredAt?: string;
}

export default function HomeStudentPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setHasSubscription(false)
        setLoading(false)
        return
      }

      // First try to get from user profile in localStorage
      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        const userData = JSON.parse(savedUserData)
        setUserProfile(userData)
        
        if (userData.subscriptionExpiredAt && new Date(userData.subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true)
          setLoading(false)
          return
        }
      }

      // Fallback: fetch from profile endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        setHasSubscription(false)
        setLoading(false)
        return
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        const userData = result.data
        setUserProfile(userData)
        localStorage.setItem('userData', JSON.stringify(userData))
        
        const subscriptionExpiredAt = userData.subscriptionExpiredAt
        if (subscriptionExpiredAt && new Date(subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true)
        } else {
          setHasSubscription(false)
        }
      } else {
        setHasSubscription(false)
      }
    } catch (err) {
      console.error('Error checking subscription:', err)
      setHasSubscription(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation to my courses
  const handleGoToMyCourses = () => {
    router.push('/mycourse')
  }

  // Handle explore courses
  const handleExploreCourses = () => {
    router.push('/elearning')
  }

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  // Redirect if no subscription
  if (!hasSubscription && !loading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Akses Premium Diperlukan
              </h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Untuk mengakses fitur student premium, Anda perlu berlangganan paket premium terlebih dahulu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/elearning#packages-section')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Lihat Paket Berlangganan
                </button>
                <button
                  onClick={() => router.push('/elearning')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Jelajahi Kursus
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </LayoutNavbar>
    )
  }

  if (loading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </LayoutNavbar>
    )
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20">
          {/* Main Hero Section */}
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="text-center">
              {/* Welcome Badges */}
              <div className="flex justify-center items-center gap-3 mb-8">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Student Premium</span>
                </div>
                <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Akses Penuh</span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Selamat Datang,
                <br />
                <span className="text-blue-600">{userProfile?.name || 'Student Premium'}!</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Anda telah berlangganan paket premium dan memiliki akses penuh 
                ke semua kursus berkualitas kami. Mari mulai belajar dan raih prestasi terbaik!
              </p>

              {/* Stats Mini */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-2xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600">Kursus Premium</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-2xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-gray-600">Akses Penuh</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-2xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-gray-600">Belajar Fleksibel</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={handleGoToMyCourses}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
                >
                  <Play className="w-6 h-6" />
                  Akses Kelas Saya
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleExploreCourses}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-3 text-lg"
                >
                  <BookOpen className="w-6 h-6" />
                  Jelajahi Semua Kursus
                </button>
              </div>

              {/* Quick Features */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Keuntungan Membership Premium Anda
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
                      title: "Akses Semua Kursus",
                      description: "Belajar dari semua materi premium tanpa batas"
                    },
                    {
                      icon: <Zap className="w-6 h-6 text-green-600" />,
                      title: "Update Berkala",
                      description: "Konten selalu diperbarui dengan materi terbaru"
                    },
                    {
                      icon: <Crown className="w-6 h-6 text-yellow-600" />,
                      title: "Sertifikat Penyelesaian",
                      description: "Dapatkan sertifikat untuk setiap kursus yang diselesaikan"
                    },
                    {
                      icon: <Play className="w-6 h-6 text-purple-600" />,
                      title: "Belajar Fleksibel",
                      description: "Akses kapan saja, di mana saja sesuai jadwal Anda"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Simple CTA Section */}
          <section className="bg-blue-600 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Siap Memulai Perjalanan Belajar?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Akses semua kursus premium dan mulai kembangkan skill Anda sekarang juga. 
                Raih prestasi terbaik dengan materi berkualitas dari mentor berpengalaman.
              </p>
              <button
                onClick={handleGoToMyCourses}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto text-lg"
              >
                <Play className="w-6 h-6" />
                Mulai Belajar Sekarang
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}