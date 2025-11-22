/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Video,
  Download,
  FileText,
  BarChart3
} from 'lucide-react'

interface MaterialDetail {
  id: number
  title: string
  content: string
  xp: number
  thumnail_path: string
  video_path?: string
  materialFilePath?: string
  ringkasanPath?: string
  templatePath?: string
  createdAt: string
  updatedAt: string
  sectionId: number
}

interface Quiz {
  id: number
  title: string
  description: string
  max_attempts: number
  time_limit: number
  passing_grade: number
  xp: number
  createdAt: string
  _count: {
    quiz_question: number
  }
  totalQuestions: number
  attemptsUsed: number
  attemptsRemaining: number
  bestScore: number | null
  lastAttempt: string | null
}

export default function MaterialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string

  const [materialDetail, setMaterialDetail] = useState<MaterialDetail | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'video' | 'resources' | 'quizzes'>('content')
  const [isCompleted, setIsCompleted] = useState(false)

  // Fetch material detail
  const fetchMaterialDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      console.log('Fetching material detail for materialId:', materialId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/materials/${materialId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Material API Response:', result)
      
      if (result.success && result.data) {
        setMaterialDetail(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail materi')
      }
    } catch (err) {
      console.error('Error fetching material detail:', err)
      setError('Gagal memuat detail materi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch quizzes for this material
  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/student`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setQuizzes(result.data)
        }
      } else {
        console.error('Failed to fetch quizzes')
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    }
  }

  // Navigate to quiz detail page
  const handleViewQuizDetail = (quizId: number) => {
    router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)
  }

  // Handle material completion
  const handleMaterialComplete = () => {
    setIsCompleted(true)
    // Di sini Anda bisa menambahkan API call untuk menandai materi sebagai selesai
  }

  useEffect(() => {
    if (materialId) {
      fetchMaterialDetail()
      fetchQuizzes()
    }
  }, [materialId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat detail materi...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-700 font-medium">{error}</p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={fetchMaterialDetail}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}`)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Kembali ke Section
          </button>
        </div>
      </div>
    )
  }

  if (!materialDetail) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <BookOpen className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Materi Tidak Ditemukan</h3>
        <p className="text-yellow-700 mb-4">Materi yang Anda cari tidak ditemukan.</p>
        <button
          onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}`)}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Kembali ke Section
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Section
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{materialDetail.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>15 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{materialDetail.xp} XP</span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Selesai</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Navigasi Materi</h3>
            </div>
            
            <div className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'content'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Konten Materi</span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'video'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Video Pembelajaran</span>
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'resources'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Resources</span>
              </button>

              {quizzes.length > 0 && (
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === 'quizzes'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Quiz & Tes</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-auto">
                    {quizzes.length}
                  </span>
                </button>
              )}
            </div>

            {/* Completion Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleMaterialComplete}
                disabled={isCompleted}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {isCompleted ? 'Materi Selesai' : 'Tandai Selesai'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Content */}
            {activeTab === 'content' && (
              <div className="p-6">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Konten Materi</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {materialDetail.content}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Video Pembelajaran</h2>
                {materialDetail.video_path ? (
                  <div className="aspect-video bg-black rounded-lg">
                    <video 
                      controls 
                      className="w-full h-full rounded-lg"
                      poster={materialDetail.thumnail_path}
                    >
                      <source src={materialDetail.video_path} type="video/mp4" />
                      Browser Anda tidak mendukung video player.
                    </video>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Video tidak tersedia untuk materi ini</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources Materi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materialDetail.materialFilePath && (
                    <ResourceCard 
                      title="Materi Lengkap PDF"
                      description="Download materi lengkap dalam format PDF"
                      fileUrl={materialDetail.materialFilePath}
                      icon={FileText}
                    />
                  )}
                  {materialDetail.ringkasanPath && (
                    <ResourceCard 
                      title="Ringkasan Materi"
                      description="Ringkasan materi untuk belajar cepat"
                      fileUrl={materialDetail.ringkasanPath}
                      icon={BookOpen}
                    />
                  )}
                  {materialDetail.templatePath && (
                    <ResourceCard 
                      title="Template & Contoh"
                      description="Template untuk praktik langsung"
                      fileUrl={materialDetail.templatePath}
                      icon={Download}
                    />
                  )}
                </div>
                
                {!materialDetail.materialFilePath && !materialDetail.ringkasanPath && !materialDetail.templatePath && (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Tidak ada resources tambahan untuk materi ini</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quiz & Tes</h2>
                
                {quizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Tidak ada quiz yang tersedia untuk materi ini</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizzes.map((quiz) => (
                      <QuizCard 
                        key={quiz.id}
                        quiz={quiz}
                        onViewDetail={() => handleViewQuizDetail(quiz.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Komponen Resource Card
function ResourceCard({ title, description, fileUrl, icon: Icon }: any) {
  const handleDownload = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-gray-600 text-xs mt-1">{description}</p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
    </div>
  )
}

// Komponen Quiz Card
interface QuizCardProps {
  quiz: Quiz
  onViewDetail: () => void
}

function QuizCard({ quiz, onViewDetail }: QuizCardProps) {
  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours} jam ${remainingMinutes > 0 ? `${remainingMinutes} menit` : ''}`
    }
  }

  const canAttempt = quiz.attemptsRemaining > 0

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{formatTimeLimit(quiz.time_limit)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span>{quiz.totalQuestions} soal</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>{quiz.passing_grade}% kelulusan</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <span>{quiz.attemptsUsed}/{quiz.max_attempts} percobaan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Score and Last Attempt */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {quiz.bestScore !== null && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-600" />
              <span>Skor terbaik: {quiz.bestScore}%</span>
            </div>
          )}
          {quiz.lastAttempt && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Terakhir: {new Date(quiz.lastAttempt).toLocaleDateString('id-ID')}</span>
            </div>
          )}
        </div>

        <div className="text-sm">
          <span className={`px-2 py-1 rounded-full ${
            canAttempt 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {canAttempt 
              ? `${quiz.attemptsRemaining} percobaan tersisa` 
              : 'Tidak ada percobaan tersisa'
            }
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onViewDetail}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
      >
        <BarChart3 className="w-4 h-4" />
        Lihat Detail Quiz
      </button>
    </div>
  )
}