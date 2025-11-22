'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  Award,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Target,
  FileText,
  RotateCcw,
  AlertCircle
} from 'lucide-react'

interface QuizAnswer {
  id: number
  answer: string
  is_correct: boolean
  createdAt: string
  updatedAt: string
  questionId: number
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

interface AttemptMultipleAnswer {
  id: number
  createdAt: string
  updatedAt: string
  attempt_answerId: number
  answerId: number
  quiz_answer: QuizAnswer
}

interface AttemptAnswer {
  id: number
  path: string | null
  answer: string
  createdAt: string
  updatedAt: string
  attemptId: number
  questionId: number
  quiz_question: QuizQuestion
  attemp_multiple_answer: AttemptMultipleAnswer[]
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

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string
  const quizId = params.quizId as string
  const attemptId = params.attemptId as string

  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizResults = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setIsLoading(false)
        return
      }

      console.log('Fetching quiz results for attempt:', attemptId)

      // Menggunakan endpoint result dengan method GET
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/attempts/${attemptId}/result`,
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
      console.log('Results API Response:', result)
      
      if (result.success && result.data) {
        setQuizAttempt(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat hasil quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz results:', err)
      setError('Gagal memuat hasil quiz. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate if the answer is correct for a question
  const isAnswerCorrect = (attemptAnswer: AttemptAnswer): boolean => {
    if (attemptAnswer.quiz_question.type === 'MultipleChoice') {
      // For multiple choice, check if the selected answer is correct
      const selectedAnswer = attemptAnswer.attemp_multiple_answer[0]
      return selectedAnswer ? selectedAnswer.quiz_answer.is_correct : false
    }
    // For essay questions, we don't have automatic grading in the current API
    // So we'll assume they need manual grading
    return false
  }

  // Calculate points earned for a question
  const getPointsEarned = (attemptAnswer: AttemptAnswer): number => {
    if (isAnswerCorrect(attemptAnswer)) {
      return attemptAnswer.quiz_question.points
    }
    return 0
  }

  // Get user's selected answer text for multiple choice
  const getUserSelectedAnswer = (attemptAnswer: AttemptAnswer): string => {
    if (attemptAnswer.quiz_question.type === 'MultipleChoice') {
      const selectedAnswer = attemptAnswer.attemp_multiple_answer[0]
      return selectedAnswer ? selectedAnswer.quiz_answer.answer : 'Tidak ada jawaban'
    }
    return attemptAnswer.answer || 'Tidak ada jawaban'
  }

  // Get correct answer for multiple choice
  const getCorrectAnswer = (question: QuizQuestion): string => {
    if (question.type === 'MultipleChoice') {
      const correctAnswer = question.quiz_answer.find(answer => answer.is_correct)
      return correctAnswer ? correctAnswer.answer : 'Tidak ada jawaban benar'
    }
    return 'Jawaban essay membutuhkan penilaian manual'
  }

  useEffect(() => {
    if (attemptId) {
      fetchQuizResults()
    }
  }, [attemptId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat hasil quiz...</span>
      </div>
    )
  }

  if (error) {
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
          <button 
            onClick={fetchQuizResults}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!quizAttempt) {
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-yellow-700">Hasil quiz tidak ditemukan</p>
        </div>
      </div>
    )
  }

  const isPassed = quizAttempt.score !== null && quizAttempt.score >= quizAttempt.quiz.passing_grade
  const totalQuestions = quizAttempt.quiz.quiz_question?.length || 0
  const correctAnswers = quizAttempt.attemp_answer?.filter(answer => isAnswerCorrect(answer)).length || 0
  const timeSpent = quizAttempt.submitted_at ? 
    Math.round((new Date(quizAttempt.submitted_at).getTime() - new Date(quizAttempt.started_at).getTime()) / 60000) : 0

  // Calculate total points and earned points
  const totalPoints = quizAttempt.quiz.quiz_question?.reduce((sum, question) => sum + question.points, 0) || 0
  const earnedPoints = quizAttempt.attemp_answer?.reduce((sum, answer) => sum + getPointsEarned(answer), 0) || 0

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
          <h1 className="text-2xl font-bold text-gray-900">Hasil Quiz</h1>
          <p className="text-gray-600 mt-1">{quizAttempt.quiz.title}</p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isPassed ? 'Selamat! Anda Lulus' : 'Anda Belum Lulus'}
          </h2>
          
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {quizAttempt.score !== null ? `${quizAttempt.score}%` : 'Belum Dinilai'}
          </div>
          
          <p className={`text-lg font-semibold mb-4 ${
            isPassed ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPassed ? 'LULUS' : 'TIDAK LULUS'}
          </p>

          <p className="text-gray-600 mb-6">
            Nilai kelulusan: {quizAttempt.quiz.passing_grade}%
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{correctAnswers}/{totalQuestions}</div>
            <div className="text-sm text-blue-600">Jawaban Benar</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {earnedPoints}/{totalPoints}
            </div>
            <div className="text-sm text-green-600">Poin Didapat</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">{timeSpent}</div>
            <div className="text-sm text-orange-600">Menit Dihabiskan</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{quizAttempt.quiz.passing_grade}%</div>
            <div className="text-sm text-purple-600">Nilai Kelulusan</div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Review Jawaban</h3>
          {quizAttempt.attemp_answer?.map((attemptAnswer, index) => {
            const isCorrect = isAnswerCorrect(attemptAnswer)
            const pointsEarned = getPointsEarned(attemptAnswer)
            const userAnswer = getUserSelectedAnswer(attemptAnswer)
            const correctAnswer = getCorrectAnswer(attemptAnswer.quiz_question)

            return (
              <div key={attemptAnswer.id} className={`border rounded-lg p-6 ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Soal {index + 1}: {attemptAnswer.quiz_question.question}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? 'Benar' : 'Salah'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {pointsEarned}/{attemptAnswer.quiz_question.points} poin
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {attemptAnswer.quiz_question.type === 'MultipleChoice' ? 'Pilihan Ganda' : 'Essay'}
                    </span>
                  </div>
                </div>

                {/* User's Answer */}
                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-2">Jawaban Anda:</p>
                  {attemptAnswer.quiz_question.type === 'Essay' ? (
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <p className="text-gray-700">{userAnswer}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`p-3 rounded-lg border ${
                        isCorrect
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span>{userAnswer}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Correct Answer (for multiple choice) */}
                {attemptAnswer.quiz_question.type === 'MultipleChoice' && !isCorrect && (
                  <div className="mb-4">
                    <p className="font-medium text-green-900 mb-2">Jawaban yang Benar:</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span>{correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Options (for multiple choice) */}
                {attemptAnswer.quiz_question.type === 'MultipleChoice' && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900 mb-2">Semua Pilihan:</p>
                    <div className="space-y-2">
                      {attemptAnswer.quiz_question.quiz_answer.map((answer) => (
                        <div
                          key={answer.id}
                          className={`p-2 rounded-lg border ${
                            answer.is_correct
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : attemptAnswer.attemp_multiple_answer.some(a => a.answerId === answer.id)
                              ? 'bg-red-50 border-red-200 text-red-800'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {answer.is_correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {attemptAnswer.attemp_multiple_answer.some(a => a.answerId === answer.id) && !answer.is_correct && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>{answer.answer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {attemptAnswer.quiz_question.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium text-blue-900 mb-1">Penjelasan:</p>
                    <p className="text-blue-800 text-sm">{attemptAnswer.quiz_question.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Detail Quiz
          </button>
          
          {!isPassed && (
            <button
              onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}