'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  Clock,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  Award,
  BarChart3
} from 'lucide-react'

interface QuizAnswer {
  id: number
  answer: string
}

interface QuizQuestion {
  id: number
  question: string
  type: 'MultipleChoice' | 'Essay'
  points: number
  explanation: string | null
  createdAt: string
  updatedAt: string
  quizId: number
  quiz_answer: QuizAnswer[]
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
  quiz_question: QuizQuestion[]
}

interface AttemptAnswer {
  id: number
  path: string | null
  answer: string
  createdAt: string
  updatedAt: string
  attemptId: number
  questionId: number
  attemp_multiple_answer: {
    id: number
    createdAt: string
    updatedAt: string
    attempt_answerId: number
    answerId: number
    quiz_answer: QuizAnswer
  }[]
}

interface QuizAttempt {
  id: number
  score: number | null
  started_at: string
  submitted_at: string | null
  is_graded: boolean
  userId: string
  quizId: number
  quiz: Quiz
  attemp_answer: AttemptAnswer[]
}

interface UserAnswer {
  questionId: number
  answerIds: number[]
  textAnswer?: string
}

export default function QuizAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string
  const quizId = params.quizId as string
  const attemptId = params.attemptId as string

  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)

  // Fetch quiz attempt details
  const fetchQuizAttempt = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setIsLoading(false)
        return
      }

      console.log('Fetching quiz attempt:', attemptId)

      // Get attempt details using the GET endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/attempts/${attemptId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        // Jika endpoint attempt tidak tersedia, coba fetch questions langsung
        await fetchQuizQuestions()
        return
      }

      const result = await response.json()
      console.log('Attempt API Response:', result)
      
      if (result.success && result.data) {
        const attemptData = result.data
        setQuizAttempt(attemptData)
        
        // Check if quiz is already submitted
        if (attemptData.submitted_at) {
          setIsSubmitted(true)
          setSubmitResult({
            score: attemptData.score,
            is_graded: attemptData.is_graded,
            passing_grade: attemptData.quiz.passing_grade
          })
        }
        
        // Calculate remaining time
        const startedAt = new Date(attemptData.started_at)
        const timeLimitMinutes = attemptData.quiz.time_limit
        const endTime = new Date(startedAt.getTime() + timeLimitMinutes * 60000)
        const now = new Date()
        const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
        
        setTimeLeft(remainingSeconds)
        
        // Transform attempt answers to userAnswers format
        const transformedAnswers: UserAnswer[] = attemptData.attemp_answer?.map((answer: AttemptAnswer) => ({
          questionId: answer.questionId,
          answerIds: answer.attemp_multiple_answer?.map(multipleAnswer => multipleAnswer.answerId) || [],
          textAnswer: answer.answer || ''
        })) || []
        
        setUserAnswers(transformedAnswers)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail attempt quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz attempt:', err)
      // Fallback: fetch questions directly
      await fetchQuizQuestions()
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback: Fetch quiz questions directly
  const fetchQuizQuestions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      console.log('Fetching quiz questions directly for quiz:', quizId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}/questions`,
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
      console.log('Questions API Response:', result)
      
      if (result.success && result.data) {
        // Create a mock quiz attempt with the questions data
        const mockAttempt: QuizAttempt = {
          id: parseInt(attemptId),
          score: null,
          started_at: new Date().toISOString(),
          submitted_at: null,
          is_graded: false,
          userId: '',
          quizId: parseInt(quizId),
          quiz: {
            id: parseInt(quizId),
            title: 'Quiz',
            description: null,
            max_attempts: 1,
            time_limit: 100, // default dari response start quiz
            passing_grade: 20, // default dari response start quiz
            xp: 0,
            materialId: parseInt(materialId),
            quiz_question: result.data
          },
          attemp_answer: []
        }
        
        setQuizAttempt(mockAttempt)
        
        // Set default time (100 minutes sesuai response start quiz)
        setTimeLeft(mockAttempt.quiz.time_limit * 60)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat soal quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz questions:', err)
      setError('Gagal memuat soal quiz. Silakan coba lagi.')
    }
  }

  // Save answer to backend
  const saveAnswer = async (questionId: number, answerIds: number[], textAnswer: string = '') => {
    if (!quizAttempt || isSubmitted) return

    try {
      setSaveStatus('saving')
      const token = localStorage.getItem("token")
      if (!token) return

      const requestBody: any = {
        attemptId: parseInt(attemptId),
        questionId: questionId
      }

      // Sesuaikan dengan API yang menerima selectedAnswerIds untuk multiple choice dan answer untuk essay
      if (answerIds.length > 0) {
        requestBody.selectedAnswerIds = answerIds
        requestBody.answer = "" // String kosong untuk multiple choice
      } else {
        requestBody.selectedAnswerIds = []
        requestBody.answer = textAnswer
      }

      console.log('Saving answer:', requestBody)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/save-answer`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (response.ok) {
        const result = await response.json()
        console.log('Save answer response:', result)
        
        if (result.success) {
          setSaveStatus('saved')
          console.log('Answer saved successfully for question:', questionId)
        } else {
          setSaveStatus('error')
          console.error('Failed to save answer for question:', questionId)
        }
      } else {
        setSaveStatus('error')
        console.error('Failed to save answer for question:', questionId)
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('Error saving answer:', error)
    }
  }

  // Handle multiple choice answer selection
  const handleMultipleChoiceSelect = (questionId: number, answerId: number) => {
    if (isSubmitted) return
    
    setUserAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === questionId)
      let newAnswers: UserAnswer[]

      if (existingAnswerIndex !== -1) {
        // Update existing answer
        newAnswers = [...prev]
        newAnswers[existingAnswerIndex] = {
          questionId,
          answerIds: [answerId], // Single selection for multiple choice
          textAnswer: ''
        }
      } else {
        // Add new answer
        newAnswers = [
          ...prev,
          {
            questionId,
            answerIds: [answerId],
            textAnswer: ''
          }
        ]
      }

      // Save to backend
      const answerToSave = newAnswers.find(a => a.questionId === questionId)
      if (answerToSave) {
        saveAnswer(questionId, answerToSave.answerIds, answerToSave.textAnswer)
      }

      return newAnswers
    })
  }

  // Handle essay answer input
  const handleEssayInput = (questionId: number, text: string) => {
    if (isSubmitted) return
    
    setUserAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === questionId)
      let newAnswers: UserAnswer[]

      if (existingAnswerIndex !== -1) {
        // Update existing answer
        newAnswers = [...prev]
        newAnswers[existingAnswerIndex] = {
          questionId,
          answerIds: [],
          textAnswer: text
        }
      } else {
        // Add new answer
        newAnswers = [
          ...prev,
          {
            questionId,
            answerIds: [],
            textAnswer: text
          }
        ]
      }

      // Save to backend
      const answerToSave = newAnswers.find(a => a.questionId === questionId)
      if (answerToSave) {
        saveAnswer(questionId, answerToSave.answerIds, answerToSave.textAnswer)
      }

      return newAnswers
    })
  }

  // Submit quiz
  const submitQuiz = async () => {
    if (!quizAttempt) {
      setError('Tidak ada quiz yang aktif')
      return
    }

    if (!window.confirm('Apakah Anda yakin ingin mengumpulkan quiz? Pastikan Anda telah menjawab semua soal.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError('Silakan login terlebih dahulu')
        return
      }

      console.log('Submitting quiz attempt:', attemptId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/submit`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attemptId: parseInt(attemptId)
          })
        }
      )

      const result = await response.json()
      console.log('Submit quiz response:', result)

      if (result.success) {
        // Update state dengan hasil submit
        setIsSubmitted(true)
        setSubmitResult({
          score: result.data?.score || null,
          is_graded: result.data?.is_graded || false,
          passing_grade: quizAttempt.quiz.passing_grade
        })
        
        // Update quiz attempt dengan data terbaru
        if (result.data) {
          setQuizAttempt(prev => prev ? { ...prev, ...result.data } : null)
        }
      } else {
        throw new Error(result.message || 'Gagal mengirim quiz')
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Gagal mengirim quiz. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitting && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            // Auto submit when time runs out
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [timeLeft, isSubmitting, isSubmitted])

  useEffect(() => {
    if (attemptId && quizId && materialId) {
      fetchQuizAttempt()
    }
  }, [attemptId, quizId, materialId])

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get current question and answer
  const currentQuestion = quizAttempt?.quiz.quiz_question?.[currentQuestionIndex]
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion?.id)
  const totalQuestions = quizAttempt?.quiz.quiz_question?.length || 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  // Calculate progress
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

  // Count answered questions
  const answeredCount = userAnswers.filter(answer => 
    answer.answerIds.length > 0 || (answer.textAnswer && answer.textAnswer.trim() !== '')
  ).length

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat quiz...</span>
      </div>
    )
  }

  if (error && !isSubmitted) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Detail Quiz
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={fetchQuizAttempt}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali ke Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quizAttempt && !isSubmitted) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Quiz
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-yellow-700">Quiz attempt tidak ditemukan</p>
        </div>
      </div>
    )
  }

  // Tampilan setelah submit
  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Detail Quiz
          </button>
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Telah Dikumpulkan!</h1>
            <p className="text-gray-600 text-lg">
              Terima kasih telah menyelesaikan {quizAttempt?.quiz.title}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {submitResult?.score !== null ? `${submitResult.score}%` : 'Menunggu'}
                </div>
                <div className="text-sm text-gray-600">Skor Anda</div>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {quizAttempt?.quiz.passing_grade}%
                </div>
                <div className="text-sm text-gray-600">Nilai Kelulusan</div>
              </div>
              
              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <Award className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {submitResult?.score !== null && submitResult?.score >= submitResult?.passing_grade 
                    ? 'Lulus' 
                    : submitResult?.score !== null 
                    ? 'Tidak Lulus' 
                    : 'Menunggu'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>

            {submitResult?.score === null && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <p className="text-yellow-800 font-medium">
                  Hasil quiz sedang diproses. Silakan refresh halaman ini nanti atau periksa di halaman hasil.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}/results/${attemptId}`)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Lihat Hasil Detail
              </button>
              
              <button
                onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Kembali ke Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Quiz</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Total Soal</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Soal Terjawab</span>
              <span className="font-medium">{answeredCount} dari {totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Batas Waktu</span>
              <span className="font-medium">{quizAttempt?.quiz.time_limit} menit</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Waktu Pengumpulan</span>
              <span className="font-medium">
                {new Date().toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan normal (saat mengerjakan quiz)
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Detail Quiz
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{quizAttempt?.quiz.title}</h1>
          <p className="text-gray-600 mt-1">{quizAttempt?.quiz.description}</p>
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

      {/* Quiz Info Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <Clock className={`w-8 h-8 ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`} />
            <div>
              <div className="text-sm text-gray-600">Waktu Tersisa</div>
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-2xl font-bold text-gray-900">
                {currentQuestionIndex + 1}/{totalQuestions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-sm text-gray-600">Terkumpul</div>
              <div className="text-2xl font-bold text-gray-900">
                {answeredCount}/{totalQuestions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved' ? 'bg-green-500' : 
                  saveStatus === 'saving' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-900">
                  {saveStatus === 'saved' ? 'Tersimpan' : 
                   saveStatus === 'saving' ? 'Menyimpan...' : 'Error'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {quizAttempt?.quiz.quiz_question?.map((question, index) => {
            const questionAnswer = userAnswers.find(a => a.questionId === question.id)
            const isAnswered = questionAnswer && 
              (questionAnswer.answerIds.length > 0 || 
               (questionAnswer.textAnswer && questionAnswer.textAnswer.trim() !== ''))
            
            return (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : isAnswered
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question Content */}
      {currentQuestion && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Question Header */}
          <div className="border-b border-gray-200 p-6 bg-blue-50">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Soal {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentQuestion.points} poin
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentQuestion.type === 'MultipleChoice' ? 'Pilihan Ganda' : 'Essay'}
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{currentQuestion.question}</p>
          </div>

          {/* Answers */}
          <div className="p-6">
            {currentQuestion.type === 'Essay' ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Jawaban Essay:
                </label>
                <textarea
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleEssayInput(currentQuestion.id, e.target.value)}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  Jawaban akan tersimpan otomatis saat Anda mengetik.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Pilih jawaban yang benar:
                </label>
                {currentQuestion.quiz_answer?.map((answer) => (
                  <label
                    key={answer.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAnswer?.answerIds.includes(answer.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={currentAnswer?.answerIds.includes(answer.id) || false}
                      onChange={() => handleMultipleChoiceSelect(currentQuestion.id, answer.id)}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-gray-700">{answer.answer}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Soal {currentQuestionIndex + 1} dari {totalQuestions}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                
                {isLastQuestion ? (
                  <button
                    onClick={submitQuiz}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kumpulkan Quiz
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Selanjutnya
                    <ChevronLeft className="w-4 h-4 transform rotate-180" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for time running out */}
      {timeLeft < 300 && timeLeft > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Waktu hampir habis!</p>
              <p className="text-red-700 text-sm">
                Sisa waktu {formatTime(timeLeft)}. Quiz akan dikumpulkan otomatis ketika waktu habis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Submit Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Selesaikan Quiz</h3>
            <p className="text-sm text-gray-600">
              {answeredCount} dari {totalQuestions} soal terjawab
            </p>
          </div>
          <button
            onClick={submitQuiz}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Kumpulkan Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}