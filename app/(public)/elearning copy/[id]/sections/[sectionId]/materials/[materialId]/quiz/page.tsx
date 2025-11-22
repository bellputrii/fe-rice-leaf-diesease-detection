'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Play, 
  Clock, 
  Target, 
  Award, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ChevronLeft,
  ArrowRight
} from 'lucide-react'

interface QuizQuestion {
  id: number
  question: string
  type: string
  points: number
  explanation: string | null
  createdAt: string
  updatedAt: string
  quizId: number
  quiz_answer: {
    id: number
    answer: string
    is_correct: boolean
    questionId: number
    createdAt: string
    updatedAt: string
  }[]
}

interface Quiz {
  id: number
  title: string
  description: string | null
  max_attempts: number
  time_limit: number
  passing_grade: number
  xp: number
  materialId: number
  totalQuestions: number
  attemptsUsed: number
  attemptsRemaining: number
  bestScore: number | null
  lastAttempt: string | null
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

export default function QuizListPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingAttempt, setStartingAttempt] = useState(false)

  // Fetch quizzes untuk material
  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      console.log('Fetching quizzes for material:', materialId)

      // Gunakan endpoint student untuk mendapatkan quiz
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student/classes/sections/materials/${materialId}/quizzes/student`,
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
      console.log('Quizzes API Response:', result)
      
      if (result.success && result.data && result.data.length > 0) {
        const quizzesData = result.data
        setQuizzes(quizzesData)
        setCurrentQuiz(quizzesData[0]) // Ambil quiz pertama
        await fetchQuestions(quizzesData[0].id)
        await fetchUserAttempts(quizzesData[0].id)
        setError(null)
      } else {
        setQuizzes([])
        setCurrentQuiz(null)
        setQuestions([])
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setError('Gagal memuat quiz. Silakan coba lagi.')
      setQuizzes([])
      setCurrentQuiz(null)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch questions untuk quiz
  const fetchQuestions = async (quizId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}/questions`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setQuestions(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    }
  }

  // Fetch user attempts
  const fetchUserAttempts = async (quizId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch attempts history untuk quiz tertentu
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}/attempts`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUserAttempts(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching user attempts:', error)
      setUserAttempts([])
    }
  }

  // Start new quiz attempt
  const startNewAttempt = async (quiz: Quiz) => {
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
            quizId: quiz.id
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
        router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quiz.id}/attempt/${attemptId}`)
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

  // Continue attempt
  const continueAttempt = (attempt: QuizAttempt) => {
    router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${attempt.quizId}/attempt/${attempt.id}`)
  }

  // View results
  const viewResults = (attempt: QuizAttempt) => {
    router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${attempt.quizId}/results/${attempt.id}`)
  }

  useEffect(() => {
    if (materialId) {
      fetchQuizzes()
    }
  }, [materialId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat quiz...</span>
      </div>
    )
  }

  if (error && !quizzes.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <p className="text-yellow-700 font-medium mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={fetchQuizzes}
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
    )
  }

  if (quizzes.length === 0 || !currentQuiz) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak Ada Quiz Tersedia
        </h3>
        <p className="text-gray-600 mb-4">
          Belum ada quiz yang tersedia untuk materi ini.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push(`/elearning/${classId}/sections/${sectionId}/materials/${materialId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Kembali ke Materi
          </button>
          <button
            onClick={fetchQuizzes}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const hasPassedQuiz = userAttempts.some(attempt => 
    attempt.score && currentQuiz && attempt.score >= currentQuiz.passing_grade
  )

  const remainingAttempts = currentQuiz.max_attempts - userAttempts.length
  const canAttempt = remainingAttempts > 0 && !hasPassedQuiz
  const latestAttempt = userAttempts.length > 0 ? userAttempts[userAttempts.length - 1] : null
  const hasOngoingAttempt = latestAttempt && !latestAttempt.submitted_at

  // Hitung total poin dari semua pertanyaan
  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0)

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
          <p className="text-gray-600 mt-1">Uji pemahaman Anda tentang materi</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Quiz Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              {currentQuiz.title}
            </h2>
            <p className="text-gray-600">
              {currentQuiz.description || 'Uji pemahaman Anda dengan mengerjakan quiz ini.'}
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
              onClick={() => continueAttempt(latestAttempt!)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="w-5 h-5" />
              Lanjutkan Quiz
            </button>
          ) : (
            <button
              onClick={() => startNewAttempt(currentQuiz)}
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
            <div className="text-2xl font-bold text-blue-700">{currentQuiz.max_attempts}</div>
            <div className="text-sm text-blue-600 mt-1">
              Sisa: <span className={remainingAttempts > 0 ? 'font-semibold' : 'text-red-600 font-semibold'}>
                {remainingAttempts > 0 ? remainingAttempts : 0}
              </span>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-orange-600 font-semibold text-sm">Time Limit</div>
            <div className="text-2xl font-bold text-orange-700">{currentQuiz.time_limit} menit</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 font-semibold text-sm">Passing Grade</div>
            <div className="text-2xl font-bold text-purple-700">{currentQuiz.passing_grade}%</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-semibold text-sm">XP Reward</div>
            <div className="text-2xl font-bold text-green-700">{currentQuiz.xp}</div>
          </div>
        </div>

        {/* Questions Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Informasi Soal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>Total Soal: <span className="font-semibold">{questions.length}</span></div>
            <div>Total Poin: <span className="font-semibold">{totalPoints}</span></div>
            <div>Tipe Soal: <span className="font-semibold">
              {questions.length > 0 
                ? questions.every(q => q.type === 'MultipleChoice') 
                  ? 'Pilihan Ganda' 
                  : questions.every(q => q.type === 'Essay')
                    ? 'Essay'
                    : 'Campuran (Pilihan Ganda & Essay)'
                : 'Belum tersedia'
              }
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
                  <p className="text-yellow-700 text-sm">Dimulai pada {new Date(latestAttempt!.started_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <button
                onClick={() => continueAttempt(latestAttempt!)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Attempt History */}
        {userAttempts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Attempt</h3>
            <div className="space-y-3">
              {userAttempts.map((attempt, index) => (
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
                            attempt.score >= currentQuiz.passing_grade
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