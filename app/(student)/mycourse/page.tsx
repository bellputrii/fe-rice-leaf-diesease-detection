'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Play, Users, Clock, BookOpen, Star, Eye, Award, CheckCircle, BarChart3, Calendar, Target, Trophy, Bookmark, Zap, Crown, ChevronRight, ArrowRight, ChevronDown } from 'lucide-react'
import Footer from '@/components/public/Footer'
import { useRouter } from 'next/navigation'

interface Course {
  id: number
  category: string
  title: string
  image: string
  duration: string
  participants: string
  level: string
  rating: number
  instructor: string
  featured?: boolean
  progress?: number
  completed?: boolean
  timeSpent?: number
  totalTime?: number
  sections?: number
  materials?: number
  lastAccessed?: string
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  profileImage?: string;
  subscriptionExpiredAt?: string;
}

interface LearningStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalTimeSpent: number
  averageProgress: number
  lastActivity: string
  totalSections: number
  completedSections: number
}

interface ApiResponse {
  success: boolean
  data: {
    classes: Array<{
      id: number
      name: string
      description: string
      image_path: string
      categoryId: number
      image_path_relative: string
    }>
    meta: {
      totalItems: number
      itemsPerPage: number
      totalPages: number
      currentPage: number
    }
  }
  message?: string
}

export default function MyCoursesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [showAllCourses, setShowAllCourses] = useState(false)
  const [learningStats, setLearningStats] = useState<LearningStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
    lastActivity: 'Tidak ada aktivitas',
    totalSections: 0,
    completedSections: 0
  })

  const categories = [
    { id: 'all', name: 'Semua Kursus' },
    { id: 'essay', name: 'Essay' },
    { id: 'business', name: 'Business Plan' },
    { id: 'research', name: 'Penelitian' },
    { id: 'design', name: 'Desain' }
  ]

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setHasSubscription(false)
        return
      }

      // First try to get from user profile in localStorage
      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        const userData = JSON.parse(savedUserData)
        setUserProfile(userData)
        
        if (userData.subscriptionExpiredAt && new Date(userData.subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true)
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
    }
  }

  // Fungsi untuk mendapatkan progress dari localStorage
  const getCourseProgressFromStorage = (courseId: number) => {
    if (typeof window === 'undefined') return null
    
    const progressData = localStorage.getItem(`courseProgress_${courseId}`)
    if (progressData) {
      return JSON.parse(progressData)
    }
    return null
  }

  // Fungsi untuk menyimpan progress ke localStorage
  const saveCourseProgressToStorage = (courseId: number, progress: number, timeSpent: number = 0) => {
    if (typeof window === 'undefined') return
    
    const progressData = {
      progress,
      timeSpent,
      lastAccessed: new Date().toISOString(),
      completed: progress >= 100
    }
    
    localStorage.setItem(`courseProgress_${courseId}`, JSON.stringify(progressData))
    
    // Update activity history
    const activityHistory = JSON.parse(localStorage.getItem('learningActivity') || '[]')
    activityHistory.unshift({
      courseId,
      courseTitle: courses.find(c => c.id === courseId)?.title,
      action: progress >= 100 ? 'completed' : 'progress',
      progress,
      timestamp: new Date().toISOString()
    })
    
    // Simpan maksimal 50 aktivitas terakhir
    localStorage.setItem('learningActivity', JSON.stringify(activityHistory.slice(0, 50)))
  }

  // Fungsi untuk menghitung statistik pembelajaran
  const calculateLearningStats = (courses: Course[]) => {
    const totalCourses = courses.length
    const completedCourses = courses.filter(course => course.completed).length
    const inProgressCourses = courses.filter(course => course.progress && course.progress > 0 && course.progress < 100).length
    const totalTimeSpent = courses.reduce((total, course) => total + (course.timeSpent || 0), 0)
    const averageProgress = courses.length > 0 
      ? Math.round(courses.reduce((sum, course) => sum + (course.progress || 0), 0) / courses.length)
      : 0

    // Calculate sections progress
    const totalSections = courses.reduce((total, course) => total + (course.sections || 0), 0)
    const completedSections = courses.reduce((total, course) => {
      const courseProgress = course.progress || 0
      const courseSections = course.sections || 0
      return total + Math.round((courseProgress / 100) * courseSections)
    }, 0)

    // Get last activity from localStorage
    const activityHistory = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('learningActivity') || '[]')
      : []
    
    const lastActivity = activityHistory.length > 0 
      ? new Date(activityHistory[0].timestamp).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Tidak ada aktivitas'

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent,
      averageProgress,
      lastActivity,
      totalSections,
      completedSections
    }
  }

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Silakan login untuk melihat kursus Anda')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/classes`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data.classes) {
        const transformedCourses = result.data.classes.map((classItem: any, index: number) => {
          // Get progress from localStorage
          const progressData = getCourseProgressFromStorage(classItem.id)
          const sections = Math.floor(Math.random() * 8) + 4 // 4-11 sections
          const materials = Math.floor(Math.random() * 15) + 10 // 10-24 materials
          
          return {
            id: classItem.id,
            category: mapCategory(classItem.categoryId),
            title: classItem.name,
            image: classItem.image_path_relative || '/placeholder.png',
            duration: `${Math.floor(Math.random() * 6) + 3} Jam`,
            participants: (Math.floor(Math.random() * 400) + 100).toString(),
            level: ['Pemula', 'Menengah', 'Lanjutan'][index % 3],
            rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
            instructor: getDefaultInstructor(index),
            featured: index < 2,
            progress: progressData?.progress || 0,
            timeSpent: progressData?.timeSpent || 0,
            completed: progressData?.completed || false,
            lastAccessed: progressData?.lastAccessed,
            totalTime: (Math.floor(Math.random() * 6) + 3) * 60, // Convert hours to minutes
            sections,
            materials
          }
        })

        setCourses(transformedCourses)
        setLearningStats(calculateLearningStats(transformedCourses))
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data kursus')
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Gagal memuat kursus Anda. Silakan coba lagi.')
      setCourses(getSampleCourses())
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const mapCategory = (categoryId: number): string => {
    const categoryMap: { [key: number]: string } = {
      1: 'essay',
      2: 'business',
      3: 'research',
      4: 'design'
    }
    return categoryMap[categoryId] || 'essay'
  }

  const getDefaultInstructor = (index: number): string => {
    const instructors = [
      'Dr. Sarah Wijaya',
      'Prof. Ahmad Rahman',
      'Dr. Lisa Santoso',
      'Maya Desain',
      'Dr. Budi Prasetyo',
      'Prof. Dian Sastro'
    ]
    return instructors[index % instructors.length]
  }

  // Sample data fallback
  const getSampleCourses = (): Course[] => [
    {
      id: 1,
      category: 'essay',
      title: 'Menulis Esai Akademik yang Menang',
      image: '/essay.png',
      duration: '6 Jam',
      participants: '420',
      level: 'Pemula',
      rating: 4.8,
      instructor: 'Dr. Sarah Wijaya',
      featured: true,
      progress: 45,
      timeSpent: 162,
      completed: false,
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 360,
      sections: 8,
      materials: 15
    },
    {
      id: 2,
      category: 'business',
      title: 'Business Plan untuk Kompetisi Startup',
      image: '/business-plan.png',
      duration: '8 Jam',
      participants: '310',
      level: 'Menengah',
      rating: 4.9,
      instructor: 'Prof. Ahmad Rahman',
      featured: true,
      progress: 100,
      timeSpent: 480,
      completed: true,
      lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 480,
      sections: 10,
      materials: 22
    },
    {
      id: 3,
      category: 'research',
      title: 'Karya Tulis Ilmiah & Publikasi',
      image: '/karya-tulis-ilmiah.png',
      duration: '5 Jam',
      participants: '280',
      level: 'Pemula',
      rating: 4.7,
      instructor: 'Dr. Lisa Santoso',
      progress: 20,
      timeSpent: 60,
      completed: false,
      lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 300,
      sections: 6,
      materials: 12
    },
    {
      id: 4,
      category: 'design',
      title: 'Desain Poster Akademik yang Impactful',
      image: '/poster.png',
      duration: '4 Jam',
      participants: '355',
      level: 'Pemula',
      rating: 4.6,
      instructor: 'Maya Desain',
      progress: 0,
      timeSpent: 0,
      completed: false,
      totalTime: 240,
      sections: 5,
      materials: 10
    },
    {
      id: 5,
      category: 'essay',
      title: 'Teknik Menulis Essay Beasiswa',
      image: '/essay.png',
      duration: '7 Jam',
      participants: '290',
      level: 'Menengah',
      rating: 4.8,
      instructor: 'Dr. Sarah Wijaya',
      progress: 75,
      timeSpent: 315,
      completed: false,
      lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 420,
      sections: 9,
      materials: 18
    },
    {
      id: 6,
      category: 'business',
      title: 'Analisis Pasar untuk Business Plan',
      image: '/business-plan.png',
      duration: '5 Jam',
      participants: '320',
      level: 'Lanjutan',
      rating: 4.7,
      instructor: 'Prof. Ahmad Rahman',
      progress: 100,
      timeSpent: 300,
      completed: true,
      lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 300,
      sections: 7,
      materials: 14
    },
    {
      id: 7,
      category: 'research',
      title: 'Metodologi Penelitian Kuantitatif',
      image: '/research.png',
      duration: '6 Jam',
      participants: '275',
      level: 'Menengah',
      rating: 4.8,
      instructor: 'Dr. Lisa Santoso',
      progress: 30,
      timeSpent: 108,
      completed: false,
      lastAccessed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 360,
      sections: 8,
      materials: 16
    },
    {
      id: 8,
      category: 'design',
      title: 'UI/UX Design untuk Aplikasi Mobile',
      image: '/design.png',
      duration: '7 Jam',
      participants: '340',
      level: 'Lanjutan',
      rating: 4.9,
      instructor: 'Maya Desain',
      progress: 10,
      timeSpent: 42,
      completed: false,
      lastAccessed: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      totalTime: 420,
      sections: 9,
      materials: 20
    }
  ]

  // Filter courses berdasarkan kategori
  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeCategory)

  // Tampilkan hanya 6 kursus pertama jika belum klik show more
  const displayedCourses = showAllCourses ? filteredCourses : filteredCourses.slice(0, 6)

  // Handle course click
  const handleViewCourse = (courseId: number) => {
    router.push(`/mycourse/${courseId}`)
  }

  // Handle continue learning
  const handleContinueLearning = (courseId: number) => {
    // Simulasi progress update
    const currentProgress = getCourseProgressFromStorage(courseId)?.progress || 0
    const newProgress = Math.min(currentProgress + 20, 100)
    const currentTimeSpent = getCourseProgressFromStorage(courseId)?.timeSpent || 0
    const newTimeSpent = currentTimeSpent + 30 // 30 menit per sesi
    
    saveCourseProgressToStorage(courseId, newProgress, newTimeSpent)
    
    // Update UI
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { 
            ...course, 
            progress: newProgress,
            timeSpent: newTimeSpent,
            completed: newProgress >= 100,
            lastAccessed: new Date().toISOString()
          }
        : course
    ))
    
    // Navigate to course detail
    router.push(`/mycourse/${courseId}`)
  }

  // Stats untuk quick overview
  const stats = [
    { 
      value: `${learningStats.completedCourses}/${learningStats.totalCourses}`, 
      label: 'Kelas Selesai', 
      icon: <Trophy className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      value: `${learningStats.averageProgress}%`, 
      label: 'Rata-rata Progress', 
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      value: `${Math.floor(learningStats.totalTimeSpent / 60)} Jam`, 
      label: 'Total Waktu Belajar', 
      icon: <Clock className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      value: `${learningStats.completedSections}/${learningStats.totalSections}`, 
      label: 'Section Selesai', 
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ]

  // Recent activity from localStorage
  const recentActivity = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('learningActivity') || '[]').slice(0, 5)
    : []

  useEffect(() => {
    checkSubscriptionStatus()
    fetchEnrolledCourses()
  }, [])

  // Update stats when courses change
  useEffect(() => {
    if (courses.length > 0) {
      setLearningStats(calculateLearningStats(courses))
    }
  }, [courses])

  // Redirect if no subscription
  if (!hasSubscription && !loading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Akses Premium Diperlukan
              </h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Untuk mengakses kursus Anda, Anda perlu berlangganan paket premium terlebih dahulu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/mycourse#packages-section')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Lihat Paket Berlangganan
                </button>
                <button
                  onClick={() => router.push('/mycourse')}
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

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-8 md:gap-12 px-4 sm:px-6 pt-16 md:pt-20">
          {/* Header Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <div className="bg-white/20 rounded-full px-3 py-1 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Member Premium</span>
                    </div>
                    <div className="bg-green-500 rounded-full px-3 py-1 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Akses Penuh</span>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
                    Dashboard Pembelajaran<br />Kursus Saya
                  </h1>
                  
                  <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mb-6">
                    Kelola perjalanan belajar Anda. Pantau progress, 
                    selesaikan kursus, dan raih sertifikat prestasi.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50 shadow-md flex items-center gap-2 justify-center"
                    >
                      <Play className="w-5 h-5" />
                      Mulai Belajar
                    </button>
                  </div>
                </div>

                {/* <div className="flex-shrink-0">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{learningStats.averageProgress}%</div>
                      <div className="text-blue-100">Progress Belajar Keseluruhan</div>
                      <div className="w-32 h-2 bg-white/20 rounded-full mt-3 mx-auto">
                        <div 
                          className="h-2 bg-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${learningStats.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Aktivitas Terbaru
                </h3>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.action === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium line-clamp-1">
                            {activity.courseTitle}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {activity.action === 'completed' ? 'Menyelesaikan kursus' : `Progress ${activity.progress}%`}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(activity.timestamp).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Belum ada aktivitas
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Kategori Kursus</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                        activeCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Courses Section */}
              <section id="courses-section" className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Kursus Saya</h2>
                    <p className="text-gray-600">
                      Kelola dan lanjutkan pembelajaran Anda di semua kursus premium
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Menampilkan:</span>
                    <span className="font-semibold text-blue-600">
                      {displayedCourses.length} dari {filteredCourses.length} kursus
                    </span>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        activeCategory === category.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Memuat kursus...</span>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="text-center py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                      <p className="text-yellow-700 font-medium">{error}</p>
                      <button 
                        onClick={fetchEnrolledCourses}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                )}

                {/* Courses Grid */}
                {!loading && !error && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {displayedCourses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all group"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={course.image}
                              alt={course.title}
                              width={400}
                              height={192}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                                {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                              </span>
                            </div>

                            <h3 className="font-bold text-gray-800 leading-tight line-clamp-2">
                              {course.title}
                            </h3>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-semibold">{course.rating}</span>
                              </div>
                            </div>

                            {course.lastAccessed && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Terakhir diakses: {new Date(course.lastAccessed).toLocaleDateString('id-ID')}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              {course.completed ? (
                                <>
                                  <button 
                                    onClick={() => handleViewCourse(course.id)}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                                  >
                                    <Trophy className="w-4 h-4" />
                                    Lihat Sertifikat
                                  </button>
                                  <button 
                                    onClick={() => handleViewCourse(course.id)}
                                    className="px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                  >
                                    Review
                                  </button>
                                </>
                              ) : course.progress && course.progress > 0 ? (
                                <>
                                  <button 
                                    onClick={() => handleContinueLearning(course.id)}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                                  >
                                    <Play className="w-4 h-4" />
                                    Lanjutkan
                                  </button>
                                  <button 
                                    onClick={() => handleViewCourse(course.id)}
                                    className="px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                  >
                                    Detail
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleContinueLearning(course.id)}
                                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                                >
                                  <Play className="w-4 h-4" />
                                  Mulai Belajar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show More/Less Button */}
                    {filteredCourses.length > 6 && (
                      <div className="text-center">
                        <button 
                          onClick={() => setShowAllCourses(!showAllCourses)}
                          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors hover:bg-blue-700 shadow-md flex items-center gap-2 justify-center mx-auto"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${showAllCourses ? 'rotate-180' : ''}`} />
                          {showAllCourses ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua Kursus (${filteredCourses.length})`}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Empty State */}
                {!loading && !error && filteredCourses.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Tidak ada kursus ditemukan
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Tidak ada kursus yang tersedia untuk kategori ini.
                      </p>
                      <button 
                        onClick={() => setActiveCategory('all')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Lihat Semua Kursus
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}