'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Save,
  MessageCircle,
  Star,
  Users,
  X,
  ArrowRight
} from 'lucide-react'

interface Review {
  id: number
  userId: string
  classId: number
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    username: string
    profileImage: string
  }
  Class: {
    id: number
    name: string
  }
}

interface Section {
  id: number
  title: string
  description: string | null
  order: number
  materialCount?: number
}

interface ClassDetail {
  id: number
  name: string
  description: string
  sections: Section[]
  averageRating: number
  totalReviews: number
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })

  // Message states
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setHasSubscription(false)
        return
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
        const subscriptionExpiredAt = result.data.subscriptionExpiredAt
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
      setSubscriptionLoading(false)
    }
  }

  // Fetch class detail dengan sections
  const fetchClassDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/classes/${classId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setClassDetail(result.data)
        
        // Expand semua section pertama kali load
        const sectionIds: number[] = result.data.sections?.map((section: Section) => section.id) ?? []
        const initialExpanded = new Set<number>(sectionIds)
        setExpandedSections(initialExpanded)
        
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail kelas')
      }
    } catch (err) {
      console.error('Error fetching class detail:', err)
      setError('Gagal memuat detail kelas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch reviews untuk kelas ini
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/class/${classId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setReviews(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  // Fetch user's review untuk kelas ini
  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/my-review/class/${classId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setUserReview(result.data)
          setReviewForm({
            rating: result.data.rating,
            comment: result.data.comment
          })
        } else {
          setUserReview(null)
          setReviewForm({ rating: 5, comment: '' })
        }
      } else {
        setUserReview(null)
        setReviewForm({ rating: 5, comment: '' })
      }
    } catch (error) {
      console.error('Error fetching user review:', error)
      setUserReview(null)
      setReviewForm({ rating: 5, comment: '' })
    }
  }

  // Handle create/update review
  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      setMessageFailed('Komentar tidak boleh kosong')
      return
    }

    setReviewLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setMessageFailed('Silakan login terlebih dahulu')
        return
      }

      const url = userReview 
        ? `${process.env.NEXT_PUBLIC_API_URL}/reviews/${userReview.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/reviews/class/${classId}`
      
      const method = userReview ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowReviewModal(false)
        setMessageSuccess(userReview ? 'Review berhasil diperbarui' : 'Review berhasil dikirim')
        await fetchUserReview()
        await fetchReviews()
        await fetchClassDetail()
      } else {
        setMessageFailed(result.message || 'Gagal menyimpan review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setMessageFailed('Terjadi kesalahan saat menyimpan review')
    } finally {
      setReviewLoading(false)
    }
  }

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!userReview) return

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setMessageFailed('Silakan login terlebih dahulu')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${userReview.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setUserReview(null)
        setReviewForm({ rating: 5, comment: '' })
        setShowDeleteConfirm(false)
        setMessageSuccess('Review berhasil dihapus')
        await fetchReviews()
        await fetchClassDetail()
      } else {
        setMessageFailed(result.message || 'Gagal menghapus review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      setMessageFailed('Terjadi kesalahan saat menghapus review')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Reset review form ketika modal ditutup
  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment
      })
    } else {
      setReviewForm({ rating: 5, comment: '' })
    }
  }

  // Toggle section
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Navigate to section detail
  const navigateToSection = (sectionId: number) => {
    router.push(`/mycourse/${classId}/sections/${sectionId}`)
  }

  // Auto hide messages after 5 seconds
  useEffect(() => {
    if (messageSuccess || messageFailed) {
      const timer = setTimeout(() => {
        setMessageSuccess(null)
        setMessageFailed(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [messageSuccess, messageFailed])

  useEffect(() => {
    if (classId) {
      fetchClassDetail()
      checkSubscriptionStatus()
      fetchReviews()
      fetchUserReview()
    }
  }, [classId])

  // Render stars untuk rating
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const safeRating = rating || 0
    const sizeClass = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size]

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= safeRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{safeRating.toFixed(1)}</span>
      </div>
    )
  }

  if (subscriptionLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memeriksa status langganan...</span>
      </div>
    )
  }

  if (!hasSubscription && !subscriptionLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Premium Diperlukan</h1>
        <p className="text-gray-600 mb-6">
          Untuk mengakses materi ini, Anda perlu berlangganan paket premium terlebih dahulu.
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          Redeem Kode Sekarang
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat materi...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700 font-medium">{error}</p>
        <button 
          onClick={fetchClassDetail}
          className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Success Message */}
      {messageSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium text-sm">{messageSuccess}</p>
              </div>
              <button 
                onClick={() => setMessageSuccess(null)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {messageFailed && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium text-sm">{messageFailed}</p>
              </div>
              <button 
                onClick={() => setMessageFailed(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Curriculum */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Kurikulum Kelas</h3>
              <div className="text-sm text-gray-600 mt-1">
                {classDetail?.sections?.length || 0} section
              </div>
            </div>
            
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {classDetail?.sections?.map((section, sectionIndex) => (
                <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Section {sectionIndex + 1}: {section.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {section.materialCount || 0} materi
                      </p>
                    </div>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.has(section.id) && (
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm mb-2">Deskripsi Section</h5>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {section.description || 'Tidak ada deskripsi untuk section ini.'}
                          </p>
                        </div>
                        <button
                          onClick={() => navigateToSection(section.id)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <BookOpen className="w-4 h-4" />
                          Akses Materi Section
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Class Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {classDetail?.name}
                </h1>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {classDetail?.description}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>{classDetail?.sections?.length || 0} Section</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span>{reviews.length} Ulasan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span>Kelas Premium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Section</p>
                    <p className="text-2xl font-bold text-blue-700">{classDetail?.sections?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Rating Kelas</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-green-700">{(classDetail?.averageRating || 0).toFixed(1)}</p>
                      {renderStars(classDetail?.averageRating || 0, 'sm')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Ulasan</p>
                    <p className="text-2xl font-bold text-purple-700">{reviews.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Start Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Cara Memulai Belajar
                </h3>
                <p className="text-blue-700 text-sm">
                  Pilih section dari sidebar kiri untuk melihat deskripsi section, kemudian klik "Akses Materi Section" untuk memulai belajar materi dalam section tersebut.
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ulasan & Rating</h2>
                <div className="flex items-center gap-4">
                  {renderStars(classDetail?.averageRating || 0, 'lg')}
                  <span className="text-gray-600">({reviews.length} ulasan)</span>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                {userReview ? 'Edit Review' : 'Tulis Review'}
              </button>
            </div>

            {/* User's Review */}
            {userReview && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-blue-900 text-lg">Review Anda</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                      title="Edit Review"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-800 transition-colors p-2"
                      title="Hapus Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userReview.User?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{userReview.User?.name || 'User'}</h4>
                      {renderStars(userReview.rating, 'sm')}
                      <span className="text-sm text-gray-500">
                        {new Date(userReview.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-gray-700">{userReview.comment}</p>
                    {!userReview.isApproved && (
                      <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium mt-2">
                        <Clock className="w-3 h-3" />
                        Menunggu persetujuan admin
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Reviews */}
            <div className="space-y-6">
              {reviews.filter(review => review.id !== userReview?.id).map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.User?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{review.User?.name || 'User'}</h4>
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada ulasan</h3>
                  <p className="text-gray-500 mb-4">Jadilah yang pertama memberikan ulasan untuk kelas ini</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Tulis Review Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {userReview ? 'Edit Review' : 'Tulis Review'}
              </h3>
              <button
                onClick={handleCloseReviewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Bagikan pengalaman belajar Anda..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseReviewModal}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reviewLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Hapus Review</h3>
                <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                Apakah Anda yakin ingin menghapus review ini? Review yang telah dihapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}