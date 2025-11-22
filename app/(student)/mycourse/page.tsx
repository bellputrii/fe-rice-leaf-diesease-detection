/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { Play, Users, Clock, BookOpen, Star, Eye, Award, CheckCircle, BarChart3, Calendar, Target, Trophy, Bookmark, Zap, Crown, ChevronRight, ArrowRight, ChevronDown } from 'lucide-react'
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

      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        const userData = JSON.parse(savedUserData)
        setUserProfile(userData)
        
        if (userData.subscriptionExpiredAt && new Date(userData.subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true)
          return
        }
      }

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
    
    const activityHistory = JSON.parse(localStorage.getItem('learningActivity') || '[]')
    activityHistory.unshift({
      courseId,
      courseTitle: courses.find(c => c.id === courseId)?.title,
      action: progress >= 100 ? 'completed' : 'progress',
      progress,
      timestamp: new Date().toISOString()
    })
    
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

    const totalSections = courses.reduce((total, course) => total + (course.sections || 0), 0)
    const completedSections = courses.reduce((total, course) => {
      const courseProgress = course.progress || 0
      const courseSections = course.sections || 0
      return total + Math.round((courseProgress / 100) * courseSections)
    }, 0)

    const activityHistory = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('learningActivity') || '[]')
      : []
    
    const lastActivity = activityHistory.length > 0 
      ? new Date(activityHistory[0].timestamp).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
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
          const progressData = getCourseProgressFromStorage(classItem.id)
          const sections = Math.floor(Math.random() * 8) + 4
          const materials = Math.floor(Math.random() * 15) + 10
          
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
            totalTime: (Math.floor(Math.random() * 6) + 3) * 60,
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
    const currentProgress = getCourseProgressFromStorage(courseId)?.progress || 0
    const newProgress = Math.min(currentProgress + 20, 100)
    const currentTimeSpent = getCourseProgressFromStorage(courseId)?.timeSpent || 0
    const newTimeSpent = currentTimeSpent + 30
    
    saveCourseProgressToStorage(courseId, newProgress, newTimeSpent)
    
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
    
    router.push(`/mycourse/${courseId}`)
  }

  // Stats untuk quick overview
  const stats = [
    { 
      value: `${learningStats.completedCourses}/${learningStats.totalCourses}`, 
      label: 'Kelas Selesai', 
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      value: `${learningStats.averageProgress}%`, 
      label: 'Progress Rata-rata', 
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      value: `${Math.floor(learningStats.totalTimeSpent / 60)} Jam`, 
      label: 'Waktu Belajar', 
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      value: `${learningStats.completedSections}/${learningStats.totalSections}`, 
      label: 'Section Selesai', 
      icon: <BookOpen className="w-5 h-5" />,
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
        <div className="min-h-screen bg-white pt-20">
          <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">
                Akses Premium Diperlukan
              </h1>
              <p className="text-gray-600 mb-6">
                Untuk mengakses kursus Anda, Anda perlu berlangganan paket premium terlebih dahulu.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/elearning#packages-section')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Lihat Paket Berlangganan
                </button>
                <button
                  onClick={() => router.push('/elearning')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
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
        <div className="min-h-screen bg-white pt-20">
          {/* Header Section */}
          <div className="bg-blue-600 px-4 py-8 rounded-2xl">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    <div className="bg-blue-500 rounded-full px-3 py-1 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Member Premium</span>
                    </div>
                    <div className="bg-green-500 rounded-full px-3 py-1 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Akses Penuh</span>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Dashboard Pembelajaran
                  </h1>
                  
                  <p className="text-blue-100 text-base md:text-lg mb-6 max-w-2xl">
                    Kelola perjalanan belajar Anda. Pantau progress, selesaikan kursus, dan raih sertifikat prestasi.
                  </p>

                  <button 
                    onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 justify-center mx-auto md:mx-0 w-full md:w-auto"
                  >
                    <Play className="w-5 h-5" />
                    Mulai Belajar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Stats - Mobile First */}
          <div className="px-4 py-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded-lg p-4 text-center"
                  >
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className={stat.color}>
                      <div className="text-lg font-bold">{stat.value}</div>
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 pb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar - Mobile: hidden, Desktop: visible */}
              <div className="lg:w-1/4 space-y-6">
                {/* Recent Activity */}
                <div className="bg-white border border-gray-300 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
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
                            <p className="text-gray-800 font-medium line-clamp-1 text-xs">
                              {activity.courseTitle}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {activity.action === 'completed' ? 'Selesai' : `Progress ${activity.progress}%`}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-2">
                        Belum ada aktivitas
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-300 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Kategori Kursus</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                          activeCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div className="lg:w-3/4">
                {/* Courses Section */}
                <section id="courses-section" className="bg-white border border-gray-300 rounded-xl p-4 md:p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Kursus Saya</h2>
                      <p className="text-gray-600 text-sm">
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

                  {/* Category Filter - Mobile Scrollable */}
                  <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                          activeCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Memuat kursus...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <div className="text-center py-8">
                      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-yellow-700 font-medium">{error}</p>
                        <button 
                          onClick={fetchEnrolledCourses}
                          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Courses Grid */}
                  {!loading && !error && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {displayedCourses.map((course) => (
                          <div
                            key={course.id}
                            className="bg-white border border-gray-300 rounded-xl overflow-hidden hover:border-blue-500 transition-colors"
                          >
                            <div className="relative h-40 overflow-hidden">
                              <Image
                                src={course.image}
                                alt={course.title}
                                width={400}
                                height={160}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute top-2 left-2">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                  {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                                </span>
                              </div>
                              {course.completed && (
                                <div className="absolute top-2 right-2">
                                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    Selesai
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 space-y-3">
                              <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-2">
                                {course.title}
                              </h3>

                              {/* Progress Bar */}
                              {course.progress !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-blue-600">{course.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        course.completed ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="font-semibold">{course.rating}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                {course.completed ? (
                                  <>
                                    <button 
                                      onClick={() => handleViewCourse(course.id)}
                                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                      <Trophy className="w-4 h-4" />
                                      Sertifikat
                                    </button>
                                    <button 
                                      onClick={() => handleViewCourse(course.id)}
                                      className="px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                    >
                                      Review
                                    </button>
                                  </>
                                ) : course.progress && course.progress > 0 ? (
                                  <>
                                    <button 
                                      onClick={() => handleContinueLearning(course.id)}
                                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                      <Play className="w-4 h-4" />
                                      Lanjutkan
                                    </button>
                                    <button 
                                      onClick={() => handleViewCourse(course.id)}
                                      className="px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                    >
                                      Detail
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => handleContinueLearning(course.id)}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
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
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center mx-auto text-sm"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${showAllCourses ? 'rotate-180' : ''}`} />
                            {showAllCourses ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua (${filteredCourses.length})`}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Empty State */}
                  {!loading && !error && filteredCourses.length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
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
        </div>

        <style jsx>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </LayoutNavbar>
      <Footer />
    </>
  )
}