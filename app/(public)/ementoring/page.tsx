'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Star, Video, Calendar, BookOpen, Users, Award, Clock, CheckCircle, Mail, Zap } from 'lucide-react'
import Footer from '@/components/public/Footer'
import { useRouter } from 'next/navigation'

interface Mentor {
  id: string
  name: string
  field: string
  specialization: string
  image: string
  rating: number
  sessions: number
  experience: string
  category: string
  featured?: boolean
  bio?: string
  email?: string
  telp?: string | null
}

interface ApiResponse {
  success: boolean
  data: Array<{
    id: string
    name: string
    email: string
    username: string
    profileImage: string
    roleId: number
    telp: string | null
    status: string
    specialization: string | null
    bio: string | null
  }>
  message?: string
  meta: {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export default function EMentoringPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  const categories = [
    { id: 'all', name: 'Semua Mentor' },
    { id: 'essay', name: 'Essay' },
    { id: 'business', name: 'Business Plan' },
    { id: 'research', name: 'Penelitian' },
    { id: 'design', name: 'Desain' }
  ]

  // Fetch data mentors dari API dengan struktur yang rapi
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        
        // Ambil token dari localStorage
        const token = localStorage.getItem("token")
        
        if (!token) {
          setError('Token tidak ditemukan. Silakan login kembali.')
          setLoading(false)
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/teachers`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          redirect: "follow" as RequestRedirect
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired atau invalid
            localStorage.removeItem("token")
            setError('Sesi telah berakhir. Silakan login kembali.')
            setTimeout(() => router.push('/auth/login'), 2000)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ApiResponse = await response.json()
        
        if (result.success && result.data) {
          // Transform data dari API ke format yang diharapkan komponen
          const transformedMentors = result.data.map((teacher, index) => ({
            id: teacher.id,
            name: teacher.name,
            field: mapField(teacher.specialization),
            specialization: teacher.specialization || 'Pendidikan Umum',
            image: teacher.profileImage || '/person1.png',
            rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)), // Default rating
            sessions: Math.floor(Math.random() * 200) + 50, // Default sessions
            experience: `${Math.floor(Math.random() * 10) + 5}+ tahun`, // Default experience
            category: mapCategory(teacher.specialization),
            featured: index < 2, // Featured untuk 2 mentor pertama
            bio: teacher.bio || 'Mentor berpengalaman di bidang pendidikan dengan komitmen untuk membantu siswa mencapai potensi terbaik mereka.',
            email: teacher.email,
            telp: teacher.telp
          }))

          setMentors(transformedMentors)
          setError(null)
        } else {
          throw new Error(result.message || 'Gagal memuat data mentor')
        }
      } catch (err) {
        console.error('Error fetching mentors:', err)
        setError('Gagal memuat data mentor. Silakan coba lagi.')
        // Fallback ke data statis jika API error
        setMentors(getFallbackMentors())
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [router])

  // Helper functions untuk transform data
  const mapField = (specialization: string | null): string => {
    if (!specialization) return 'Pendidikan Umum'
    
    const fieldMap: { [key: string]: string } = {
      'mathematics': 'Matematika & Essay',
      'science': 'Sains & Penelitian',
      'language': 'Bahasa & Essay',
      'technology': 'Teknologi & Business Plan',
      'business': 'Bisnis & Business Plan',
      'research': 'Penelitian & Analisis',
      'design': 'Desain Kreatif'
    }
    return fieldMap[specialization.toLowerCase()] || 'Pendidikan Umum'
  }

  const mapCategory = (specialization: string | null): string => {
    if (!specialization) return 'essay'
    
    const categoryMap: { [key: string]: string } = {
      'mathematics': 'essay',
      'science': 'research',
      'language': 'essay',
      'technology': 'business',
      'business': 'business',
      'research': 'research',
      'design': 'design'
    }
    return categoryMap[specialization.toLowerCase()] || 'essay'
  }

  // Fallback data jika API error
  const getFallbackMentors = (): Mentor[] => [
    {
      id: '1',
      name: "Dr. Arief Wiyono",
      field: "Bisnis & Business Plan",
      specialization: "Business Strategy & Career Development",
      image: "/person2.png",
      rating: 4.9,
      sessions: 250,
      experience: "15+ tahun",
      category: 'business',
      featured: true,
      bio: "Pakar bisnis dengan pengalaman 15+ tahun dalam konsultasi business plan dan pengembangan karier.",
      email: "arief.wiyono@example.com",
      telp: "08123456789"
    },
    {
      id: '2',
      name: "Prof. Sarah Kusuma",
      field: "Penelitian & Analisis",
      specialization: "Research Methodology & Scientific Writing",
      image: "/person1.png",
      rating: 4.8,
      sessions: 180,
      experience: "12+ tahun",
      category: 'research',
      bio: "Ahli metodologi penelitian dengan spesialisasi dalam penulisan karya ilmiah dan publikasi.",
      email: "sarah.kusuma@example.com",
      telp: "08123456788"
    },
    {
      id: '3',
      name: "Dr. Bambang Prasetyo",
      field: "Essay & Akademik",
      specialization: "Academic Writing & Critical Thinking",
      image: "/person3.png",
      rating: 4.9,
      sessions: 220,
      experience: "10+ tahun",
      category: 'essay',
      bio: "Spesialis penulisan essay akademik dengan fokus pada pengembangan critical thinking skills.",
      email: "bambang.prasetyo@example.com",
      telp: "08123456787"
    },
    {
      id: '4',
      name: "Dra. Mega Inti",
      field: "Desain Kreatif",
      specialization: "Design Thinking & Visual Communication",
      image: "/person1.png",
      rating: 4.7,
      sessions: 150,
      experience: "8+ tahun",
      category: 'design',
      bio: "Desainer kreatif dengan keahlian dalam design thinking dan komunikasi visual.",
      email: "mega.inti@example.com",
      telp: "08123456786"
    },
    {
      id: '5',
      name: "Dr. Rina Santoso",
      field: "Penelitian Kuantitatif",
      specialization: "Quantitative Research & Data Analysis",
      image: "/person4.png",
      rating: 4.8,
      sessions: 190,
      experience: "11+ tahun",
      category: 'research',
      bio: "Ahli penelitian kuantitatif dengan pengalaman dalam analisis data statistik.",
      email: "rina.santoso@example.com",
      telp: "08123456785"
    },
    {
      id: '6',
      name: "Prof. Andi Wijaya",
      field: "Business Plan & Startup",
      specialization: "Tech Entrepreneurship & Business Modeling",
      image: "/person2.png",
      rating: 4.9,
      sessions: 210,
      experience: "14+ tahun",
      category: 'business',
      bio: "Entrepreneur dan konsultan business plan dengan fokus pada startup teknologi.",
      email: "andi.wijaya@example.com",
      telp: "08123456784"
    }
  ]

  const stats = [
    { value: `${mentors.length}+`, label: 'Mentor Berpengalaman', icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: `${mentors.reduce((acc, mentor) => acc + mentor.sessions, 0)}+`, label: 'Sesi Mentoring', icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '95%', label: 'Kepuasan Peserta', icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '500+', label: 'Materi Pembelajaran', icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ]

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Akses Semua Materi",
      description: "Dapatkan akses ke seluruh modul pembelajaran selama periode berlangganan",
      color: "text-blue-600"
    },
    {
      icon: <Video className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Mentoring Langsung",
      description: "Sesi konsultasi langsung dengan mentor ahli di bidangnya",
      color: "text-green-600"
    },
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Update Berkala",
      description: "Materi selalu diperbarui dengan konten terbaru dan terbaik",
      color: "text-purple-600"
    },
    {
      icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Fleksibel",
      description: "Belajar kapan saja dan di mana saja selama periode berlangganan",
      color: "text-orange-600"
    }
  ]

  const plans = [
    {
      name: "Paket 1 Bulan",
      originalPrice: "Rp 100.000",
      price: "Rp 30.000",
      discount: "70%",
      duration: "1 Bulan",
      features: [
        "Akses ke SEMUA materi pembelajaran",
        "Konsultasi dengan mentor 2x per minggu",
        "Download materi PDF eksklusif",
        "Grup diskusi komunitas",
        "Sertifikat partisipasi",
        "Update materi berkala"
      ],
      buttonText: "Pilih Paket 1 Bulan",
      popular: false,
      link: "https://link.id/ambilprestasi-1bulan"
    },
    {
      name: "Paket 2 Bulan",
      originalPrice: "Rp 200.000",
      price: "Rp 60.000",
      discount: "70%",
      duration: "2 Bulan",
      features: [
        "Akses ke SEMUA materi pembelajaran",
        "Konsultasi dengan mentor 3x per minggu",
        "Download materi PDF eksklusif",
        "Grup diskusi komunitas",
        "Sertifikat partisipasi",
        "Update materi berkala",
        "Priority support",
        "Video rekaman sesi"
      ],
      buttonText: "Pilih Paket 2 Bulan",
      popular: true,
      link: "https://link.id/ambilprestasi-2bulan"
    },
    {
      name: "Paket 3 Bulan",
      originalPrice: "Rp 300.000",
      price: "Rp 90.000",
      discount: "70%",
      duration: "3 Bulan",
      features: [
        "Akses ke SEMUA materi pembelajaran",
        "Konsultasi dengan mentor 5x per minggu",
        "Download materi PDF eksklusif",
        "Grup diskusi komunitas",
        "Sertifikat partisipasi",
        "Update materi berkala",
        "Priority support",
        "Video rekaman sesi",
        "Personal learning plan",
        "Assessment perkembangan"
      ],
      buttonText: "Pilih Paket 3 Bulan",
      popular: false,
      link: "https://link.id/ambilprestasi-3bulan"
    }
  ]

  const testimonials = [
    {
      text: "Dengan paket berlangganan, saya bisa akses semua materi dan konsultasi kapan saja. Sangat worth it!",
      name: "Nina, Mahasiswa Psikologi",
      role: "Peserta Program 2 Bulan",
      rating: 5
    },
    {
      text: "Materinya lengkap dan selalu update. Mentor juga sangat responsif dalam memberikan bimbingan.",
      name: "Dimas, Fresh Graduate",
      role: "Peserta Program 3 Bulan",
      rating: 5
    },
    {
      text: "Harga sangat terjangkau untuk akses seluas ini. Saya bisa belajar semua topik yang saya butuhkan.",
      name: "Rani, Pegawai Swasta",
      role: "Peserta Program 1 Bulan",
      rating: 5
    }
  ]

  const filteredMentors = activeCategory === 'all' 
    ? mentors 
    : mentors.filter(mentor => mentor.category === activeCategory)

  const handlePackageSelect = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-12 md:gap-20 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white">
              <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1.5 md:px-4 md:py-2 w-fit">
                  <Users className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Mentoring Professional</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  E-Mentoring Excellence
                </h1>
                
                <p className="text-blue-100 text-base md:text-lg leading-relaxed">
                  Akses semua materi pembelajaran premium dengan paket berlangganan bulanan. 
                  Belajar dari mentor ahli dan raih prestasi terbaikmu!
                </p>

                <div className="space-y-2 md:space-y-3">
                  {[
                    "Akses ke SEMUA materi pembelajaran selama berlangganan",
                    "Konsultasi langsung dengan mentor berpengalaman",
                    "Update materi berkala dan konten terbaru"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="text-green-300 flex-shrink-0 w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-blue-100 text-sm md:text-base">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
                  <button 
                    onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-700 px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                  >
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Lihat Paket Langganan</span>
                  </button>
                  <button 
                    onClick={() => document.getElementById('mentors-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200"
                  >
                    Kenali Mentor Kami
                  </button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2 mb-4 lg:mb-0">
                <div className="relative w-full max-w-sm md:max-w-md">
                  <Image
                    src="/e-learning.png"
                    alt="E-Mentoring Session"
                    className="rounded-2xl object-cover shadow-2xl w-full h-auto"
                  />
                  <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-green-100 p-1.5 md:p-2 rounded-lg">
                        <Award className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">500+</p>
                        <p className="text-xs md:text-sm text-gray-600">Materi Tersedia</p>
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
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105 cursor-pointer"
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

          {/* Features Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Keunggulan Program Langganan
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Dapatkan pengalaman belajar terbaik dengan akses penuh ke semua materi dan bimbingan mentor
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105 text-center cursor-pointer"
                >
                  <div className={`bg-blue-100 p-3 md:p-4 rounded-xl w-fit mx-auto mb-3 md:mb-4 group-hover:bg-blue-600 transition-colors ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section id="packages-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Paket Berlangganan
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Pilih paket berlangganan yang sesuai dengan kebutuhan belajar Anda. Akses semua materi selama periode berlangganan!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl md:rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                    plan.popular 
                      ? 'border-blue-600 relative transform scale-105' 
                      : 'border-gray-200 hover:scale-105'
                  } group`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Paling Populer
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl line-through text-gray-400">{plan.originalPrice}</span>
                        <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                      </div>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                        Hemat {plan.discount}
                      </span>
                    </div>
                    <p className="text-gray-600 font-semibold">{plan.duration} Akses Penuh</p>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700 font-semibold text-sm">
                      ✅ Akses ke SEMUA Materi Pembelajaran
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handlePackageSelect(plan.link)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="text-green-700 font-semibold">
                  💫 Spesial Diskon 70%! Harga normal Rp 100.000/bulan menjadi Rp 30.000/bulan
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Akses semua materi, konsultasi mentor, dan fitur premium lainnya
                </p>
              </div>
            </div>
          </section>

          {/* Mentor Section */}
          <section id="mentors-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Tim Mentor Kami
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Kenali mentor ahli kami yang siap membimbing Anda menuju kesuksesan akademis dan profesional
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-200 text-sm md:text-base ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:scale-105'
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
                <span className="ml-3 text-gray-600">Memuat mentor...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-yellow-700 font-medium">{error}</p>
                  {error.includes('login kembali') && (
                    <button 
                      onClick={() => router.push('/auth/login')}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login Kembali
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mentors Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group hover:scale-105 cursor-pointer"
                    onClick={() => setSelectedMentor(mentor)}
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
                      <div className="w-full h-full flex items-center justify-center p-6">
                        <div className="relative">
                          <Image
                            src={mentor.image}
                            alt={mentor.name}
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500"
                          />
                          {mentor.featured && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                              Featured
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-gray-800">{mentor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="p-5 md:p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs md:text-sm text-blue-700 font-semibold bg-blue-100 px-3 py-1.5 rounded-full">
                          {mentor.field}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">
                          {mentor.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                          {mentor.specialization}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {mentor.bio}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs md:text-sm">{mentor.experience}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span className="text-xs md:text-sm">{mentor.sessions}+ sesi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak ada mentor ditemukan</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Tidak ada mentor yang tersedia untuk kategori {categories.find(c => c.id === activeCategory)?.name.toLowerCase()}.
                  </p>
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lihat Semua Mentor
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Mentor Detail Modal */}
          {selectedMentor && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-2xl text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <Image
                          src={selectedMentor.image}
                          alt={selectedMentor.name}
                          className="w-20 h-20 rounded-full border-4 border-white/50 object-cover"
                        />
                        <div>
                          <h2 className="text-xl font-bold">{selectedMentor.name}</h2>
                          <p className="text-blue-100">{selectedMentor.specialization}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{selectedMentor.rating} • {selectedMentor.sessions}+ sesi</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedMentor(null)}
                        className="text-white/80 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tentang Mentor</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedMentor.bio}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">Pengalaman</span>
                        </div>
                        <p className="text-gray-700">{selectedMentor.experience}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="font-semibold">Total Sesi</span>
                        </div>
                        <p className="text-gray-700">{selectedMentor.sessions}+ sesi</p>
                      </div>
                    </div>

                    {selectedMentor.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-800">{selectedMentor.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                  Testimoni Peserta
                </h2>
                <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto px-4">
                  Dengarkan pengalaman langsung dari peserta yang telah merasakan manfaat program berlangganan kami
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-blue-600/50 rounded-xl md:rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>
                    <p className="text-blue-100 italic mb-4 leading-relaxed text-sm md:text-base">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-blue-200 text-xs md:text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                Siap Bergabung dengan Program Kami?
              </h2>
              <p className="text-blue-100 mb-6 md:mb-8 text-sm md:text-base max-w-2xl mx-auto px-4">
                Dapatkan akses ke semua materi premium dan bimbingan mentor ahli dengan paket berlangganan spesial
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button 
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-700 px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center text-sm md:text-base"
                >
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  Lihat Paket Berlangganan
                </button>
                <button 
                  onClick={() => handlePackageSelect("https://link.id/ambilprestasi-konsultasi")}
                  className="border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 text-sm md:text-base"
                >
                  Konsultasi Gratis
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