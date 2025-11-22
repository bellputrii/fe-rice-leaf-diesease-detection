'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  Play, 
  Clock, 
  Target, 
  Award, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ArrowRight,
  BarChart3
} from 'lucide-react'

interface QuizDetail {
  id: number
  title: string
  description: string
  max_attempts: number
  time_limit: number
  passing_grade: number
  xp: number
  materialId: number
  createdAt: string
  _count: {
    quiz_question: number
  }
  totalQuestions: number
  attemptsUsed: number
  attemptsRemaining: number
  bestScore: number | null
  attempts: any[]
  ongoingAttempt: any
}

interface QuizAttempt {
  id: number
  score: number | null
  started_at: string
  submitted_at: string | null
  is_graded: boolean
  userId: string
  quizId: number
}

export default function QuizDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string
  const quizId = params.quizId as string

  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingAttempt, setStartingAttempt] = useState(false)

  // Fetch quiz detail
  const fetchQuizDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      console.log('Fetching quiz detail for quizId:', quizId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/detail/${quizId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Quiz Detail API Response:', result)
      
      if (result.success && result.data) {
        setQuizDetail(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz detail:', err)
      setError('Gagal memuat detail quiz. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Start new quiz attempt
  const startNewAttempt = async () => {
    if (!quizDetail) return

    try {
      setStartingAttempt(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      // Create new attempt using the start endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/start`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quizId: parseInt(quizId)
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('New attempt API Response:', result)
      
      if (result.success && result.data) {
        const attemptId = result.data.id
        // Navigate langsung ke attempt page
        router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}/attempt/${attemptId}`)
      } else {
        throw new Error(result.message || 'Gagal membuat attempt baru')
      }
    } catch (err) {
      console.error('Error starting new attempt:', err)
      setError('Gagal memulai quiz. Silakan coba lagi.')
    } finally {
      setStartingAttempt(false)
    }
  }

  // Continue ongoing attempt
  const continueAttempt = (attempt: any) => {
    router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}/attempt/${attempt.id}`)
  }

  // View results
  const viewResults = (attempt: any) => {
    router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}/results/${attempt.id}`)
  }

  useEffect(() => {
    if (materialId && quizId) {
      fetchQuizDetail()
    }
  }, [materialId, quizId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat detail quiz...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Materi
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={fetchQuizDetail}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}`)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali ke Materi
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quizDetail) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Materi
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-yellow-700">Quiz tidak ditemukan</p>
        </div>
      </div>
    )
  }

  const hasPassedQuiz = quizDetail.attempts.some((attempt: QuizAttempt) => 
    attempt.score && attempt.score >= quizDetail.passing_grade
  )

  const canAttempt = quizDetail.attemptsRemaining > 0 && !hasPassedQuiz
  const hasOngoingAttempt = quizDetail.ongoingAttempt && !quizDetail.ongoingAttempt.submitted_at

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Materi
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detail Quiz</h1>
          <p className="text-gray-600 mt-1">Informasi lengkap tentang quiz</p>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              {quizDetail.title}
            </h2>
            <p className="text-gray-600">
              {quizDetail.description || 'Uji pemahaman Anda dengan mengerjakan quiz ini.'}
            </p>
          </div>
          
          {hasPassedQuiz ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Quiz Telah Lulus</span>
              </div>
            </div>
          ) : hasOngoingAttempt ? (
            <button
              onClick={() => continueAttempt(quizDetail.ongoingAttempt)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="w-5 h-5" />
              Lanjutkan Quiz
            </button>
          ) : (
            <button
              onClick={startNewAttempt}
              disabled={!canAttempt || startingAttempt}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startingAttempt ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Memulai...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Mulai Quiz
                </>
              )}
            </button>
          )}
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 font-semibold text-sm">Maks Attempt</div>
            <div className="text-2xl font-bold text-blue-700">{quizDetail.max_attempts}</div>
            <div className="text-sm text-blue-600 mt-1">
              Sisa: <span className={quizDetail.attemptsRemaining > 0 ? 'font-semibold' : 'text-red-600 font-semibold'}>
                {quizDetail.attemptsRemaining > 0 ? quizDetail.attemptsRemaining : 0}
              </span>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-orange-600 font-semibold text-sm">Time Limit</div>
            <div className="text-2xl font-bold text-orange-700">{quizDetail.time_limit} menit</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 font-semibold text-sm">Passing Grade</div>
            <div className="text-2xl font-bold text-purple-700">{quizDetail.passing_grade}%</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-semibold text-sm">XP Reward</div>
            <div className="text-2xl font-bold text-green-700">{quizDetail.xp}</div>
          </div>
        </div>

        {/* Questions Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Informasi Soal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>Total Soal: <span className="font-semibold">{quizDetail.totalQuestions}</span></div>
            <div>Jenis Soal: <span className="font-semibold">Pilihan Ganda & Essay</span></div>
            <div>Status: <span className="font-semibold">
              {hasPassedQuiz ? 'Telah Lulus' : hasOngoingAttempt ? 'Sedang Dikerjakan' : 'Belum Dikerjakan'}
            </span></div>
          </div>
        </div>

        {/* Quick Actions */}
        {hasOngoingAttempt && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">Anda memiliki quiz yang belum diselesaikan</p>
                  <p className="text-yellow-700 text-sm">Dimulai pada {new Date(quizDetail.ongoingAttempt.started_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <button
                onClick={() => continueAttempt(quizDetail.ongoingAttempt)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Attempt History */}
        {quizDetail.attempts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Attempt</h3>
            <div className="space-y-3">
              {quizDetail.attempts.map((attempt: QuizAttempt, index: number) => (
                <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Attempt {index + 1}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {new Date(attempt.started_at).toLocaleDateString('id-ID')}
                      </span>
                      {attempt.submitted_at && (
                        <span className="text-gray-500 text-sm ml-2">
                          • Selesai: {new Date(attempt.submitted_at).toLocaleTimeString('id-ID')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.score !== null ? (
                        <>
                          <div className={`px-3 py-1 rounded-full font-semibold ${
                            attempt.score >= quizDetail.passing_grade
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Score: {attempt.score}%
                          </div>
                          <button
                            onClick={() => viewResults(attempt)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            Lihat Hasil
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => continueAttempt(attempt)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          Lanjutkan
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!canAttempt && !hasPassedQuiz && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">Anda telah mencapai batas attempt quiz</p>
                <p className="text-yellow-700 text-sm">Silakan hubungi administrator untuk bantuan lebih lanjut.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}