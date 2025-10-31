'use client'

import { useState } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Play, Clock, BookOpen, CheckCircle, Star, BarChart3, Calendar, Download, Award } from 'lucide-react'
import Footer from '@/components/public/Footer'

// Type definitions
type BaseCourse = {
  id: number;
  title: string;
  image: string;
  duration: string;
  instructor: string;
  rating: number;
}

type OngoingCourse = BaseCourse & {
  type: 'ongoing';
  progress: number;
  modules: string;
  deadline: string;
  lastAccessed: string;
}

type CompletedCourse = BaseCourse & {
  type: 'completed';
  completedDate: string;
  certificate: boolean;
}

type BookmarkedCourse = BaseCourse & {
  type: 'bookmarked';
  modules: string;
}

type Course = OngoingCourse | CompletedCourse | BookmarkedCourse;

export default function MyCoursePage() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed' | 'bookmarked'>('ongoing')

  const tabs = [
    { id: 'ongoing' as const, name: 'Sedang Berjalan' },
    { id: 'completed' as const, name: 'Selesai' },
    { id: 'bookmarked' as const, name: 'Disimpan' }
  ]

  const stats = [
    { value: '8', label: 'Kursus Diikuti', icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '24', label: 'Jam Belajar', icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '6', label: 'Sertifikat', icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '85%', label: 'Progress Rata-rata', icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ]

  const ongoingCourses: OngoingCourse[] = [
    {
      id: 1,
      type: 'ongoing',
      title: 'Menulis Esai Akademik yang Menang',
      image: '/essay.png',
      progress: 75,
      duration: '6 Jam',
      modules: '12 Modul',
      instructor: 'Dr. Sarah Wijaya',
      deadline: '15 Hari Lagi',
      lastAccessed: '2 Hari Lalu',
      rating: 4.8
    },
    {
      id: 2,
      type: 'ongoing',
      title: 'Business Plan untuk Kompetisi Startup',
      image: '/business-plan.png',
      progress: 45,
      duration: '8 Jam',
      modules: '15 Modul',
      instructor: 'Prof. Ahmad Rahman',
      deadline: '30 Hari Lagi',
      lastAccessed: '1 Hari Lalu',
      rating: 4.9
    },
    {
      id: 3,
      type: 'ongoing',
      title: 'Karya Tulis Ilmiah & Publikasi',
      image: '/karya-tulis-ilmiah.png',
      progress: 60,
      duration: '5 Jam',
      modules: '10 Modul',
      instructor: 'Dr. Lisa Santoso',
      deadline: '20 Hari Lagi',
      lastAccessed: '5 Hari Lalu',
      rating: 4.7
    },
    {
      id: 4,
      type: 'ongoing',
      title: 'Desain Poster Akademik yang Impactful',
      image: '/poster.png',
      progress: 30,
      duration: '4 Jam',
      modules: '8 Modul',
      instructor: 'Maya Desain',
      deadline: '45 Hari Lagi',
      lastAccessed: '1 Minggu Lalu',
      rating: 4.6
    }
  ]

  const completedCourses: CompletedCourse[] = [
    {
      id: 5,
      type: 'completed',
      title: 'Public Speaking untuk Presentasi',
      image: '/e-learning.png',
      completedDate: '15 Jan 2024',
      duration: '5 Jam',
      instructor: 'Dr. Budi Prasetyo',
      rating: 4.8,
      certificate: true
    },
    {
      id: 6,
      type: 'completed',
      title: 'Basic Research Methodology',
      image: '/essay.png',
      completedDate: '5 Jan 2024',
      duration: '6 Jam',
      instructor: 'Prof. Dian Sastro',
      rating: 4.7,
      certificate: true
    }
  ]

  const bookmarkedCourses: BookmarkedCourse[] = [
    {
      id: 7,
      type: 'bookmarked',
      title: 'Advanced Essay Writing Techniques',
      image: '/essay.png',
      duration: '7 Jam',
      modules: '14 Modul',
      instructor: 'Dr. Budi Prasetyo',
      rating: 4.9
    },
    {
      id: 8,
      type: 'bookmarked',
      title: 'Financial Modeling untuk Business Plan',
      image: '/business-plan.png',
      duration: '6 Jam',
      modules: '12 Modul',
      instructor: 'Prof. Dian Sastro',
      rating: 4.8
    }
  ]

  const getCoursesByTab = (): Course[] => {
    switch (activeTab) {
      case 'ongoing':
        return ongoingCourses
      case 'completed':
        return completedCourses
      case 'bookmarked':
        return bookmarkedCourses
      default:
        return ongoingCourses
    }
  }

  const courses = getCoursesByTab()

  // Type guards untuk memeriksa tipe course
  const isOngoingCourse = (course: Course): course is OngoingCourse => course.type === 'ongoing'
  const isCompletedCourse = (course: Course): course is CompletedCourse => course.type === 'completed'
  const isBookmarkedCourse = (course: Course): course is BookmarkedCourse => course.type === 'bookmarked'

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-12 md:gap-20 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 bg-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white">
              <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1.5 md:px-4 md:py-2 w-fit">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Dashboard Belajar</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  Course Saya
                </h1>
                
                <p className="text-blue-100 text-base md:text-lg leading-relaxed">
                  Kelola dan lanjutkan perjalanan belajarmu. Pantau progress, 
                  selesaikan modul, dan raih sertifikat prestasimu.
                </p>

                <div className="space-y-2 md:space-y-3">
                  {[
                    "Akses semua kursus yang sudah kamu ikuti",
                    "Pantau progress belajar secara real-time",
                    "Dapatkan sertifikat setelah menyelesaikan kursus"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="text-green-300 flex-shrink-0 w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-blue-100 text-sm md:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2 mb-4 lg:mb-0">
                <div className="relative w-full max-w-sm md:max-w-md">
                  <Image
                    src="/business-plan.png"
                    alt="Dashboard Belajar"
                    width={500}
                    height={400}
                    className="rounded-2xl object-cover shadow-2xl w-full h-auto"
                  />
                  <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-green-100 p-1.5 md:p-2 rounded-lg">
                        <Award className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">6</p>
                        <p className="text-xs md:text-sm text-gray-600">Sertifikat</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistik Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600 text-xs md:text-sm">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tab Navigation */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Kelola Kursus Anda
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Lanjutkan belajar, lihat pencapaian, dan kelola kursus yang disimpan
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-200 text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {isCompletedCourse(course) && course.certificate && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Sertifikat Tersedia
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-bold">{course.rating}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white/90 text-blue-600 p-2 md:p-3 rounded-full hover:bg-white transition-colors">
                        <Play className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" />
                      </button>
                    </div>
                    
                    {/* Progress Bar untuk ongoing courses */}
                    {isOngoingCourse(course) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs md:text-sm text-blue-700 font-semibold bg-blue-100 px-2 py-1 md:px-3 md:py-1 rounded-full whitespace-nowrap">
                        {isOngoingCourse(course) 
                          ? `${course.progress}% Selesai` 
                          : 'Tersedia'
                        }
                      </span>
                      {isOngoingCourse(course) && (
                        <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {course.deadline}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium text-xs md:text-sm">{course.instructor}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{course.duration}</span>
                        </div>
                        {(isOngoingCourse(course) || isBookmarkedCourse(course)) && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{course.modules}</span>
                          </div>
                        )}
                      </div>
                      {isOngoingCourse(course) && (
                        <div className="text-xs text-gray-500 hidden sm:block">
                          Diakses: {course.lastAccessed}
                        </div>
                      )}
                    </div>

                    {isCompletedCourse(course) && (
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Selesai: {course.completedDate}</span>
                        </div>
                        {course.certificate && (
                          <button className="text-blue-600 hover:text-blue-800 transition-colors text-xs md:text-sm font-medium flex items-center gap-1">
                            <Download className="w-3 h-3 md:w-4 md:h-4" />
                            Unduh Sertifikat
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 md:gap-3">
                      <button className="flex-1 bg-blue-600 text-white py-2 md:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 group-hover:shadow-lg flex items-center justify-center gap-1 md:gap-2 text-sm">
                        <Play className="w-3 h-3 md:w-4 md:h-4" />
                        {isCompletedCourse(course) ? 'Ulangi Kursus' : 'Lanjutkan'}
                      </button>
                      {isOngoingCourse(course) && (
                        <button className="px-3 md:px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm">
                          ⋮
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-1 md:mb-2">
                  Belum ada kursus di bagian ini
                </h3>
                <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6 max-w-md mx-auto px-4">
                  {activeTab === 'ongoing' && 'Mulai ikuti kursus untuk melihatnya di sini'}
                  {activeTab === 'completed' && 'Selesaikan kursus untuk melihat pencapaianmu'}
                  {activeTab === 'bookmarked' && 'Simpan kursus untuk mengaksesnya nanti'}
                </p>
                <button className="bg-blue-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base">
                  Jelajahi Kursus
                </button>
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                Tingkatkan Skill Anda
              </h2>
              <p className="text-blue-100 mb-6 md:mb-8 text-sm md:text-base max-w-2xl mx-auto px-4">
                Temukan kursus baru yang sesuai dengan minat dan tujuan belajarmu
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button className="bg-white text-blue-700 px-5 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center text-sm md:text-base">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                  Jelajahi Kursus Lainnya
                </button>
                <button className="border-2 border-white text-white px-5 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 text-sm md:text-base">
                  Lihat Rekomendasi
                </button>
              </div>
            </div>
          </section>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}