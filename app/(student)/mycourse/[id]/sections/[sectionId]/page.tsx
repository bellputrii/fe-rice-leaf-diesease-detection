'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  Clock,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react'

interface Material {
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

interface SectionDetail {
  id: number
  title: string
  description: string | null
  order: number
  Material: Material[]
}

export default function SectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string

  const [sectionDetail, setSectionDetail] = useState<SectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch section detail dengan materials
  const fetchSectionDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      console.log('Fetching sections for classId:', classId, 'looking for sectionId:', sectionId)

      // Endpoint ini mengembalikan semua sections untuk classId tertentu
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/classes/sections/${classId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success && result.data) {
        // Cari section yang sesuai dengan sectionId dari array yang dikembalikan
        const targetSection = result.data.find((section: SectionDetail) => 
          section.id === parseInt(sectionId)
        )
        
        if (targetSection) {
          setSectionDetail(targetSection)
          console.log('Found section:', targetSection)
          setError(null)
        } else {
          console.error('Section not found. Available sections:', result.data)
          throw new Error(`Section dengan ID ${sectionId} tidak ditemukan dalam kelas ini`)
        }
      } else {
        throw new Error(result.message || 'Gagal memuat detail section')
      }
    } catch (err) {
      console.error('Error fetching section detail:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat detail section. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Navigate to material detail
  const navigateToMaterial = (materialId: number) => {
    router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}`)
  }

  useEffect(() => {
    if (classId && sectionId) {
      console.log('Params - classId:', classId, 'sectionId:', sectionId)
      fetchSectionDetail()
    }
  }, [classId, sectionId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Memuat detail section...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-700 font-medium">{error}</p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={fetchSectionDetail}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => router.push(`/mycourse/${classId}`)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Kembali ke Kelas
          </button>
        </div>
      </div>
    )
  }

  if (!sectionDetail) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <BookOpen className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Section Tidak Ditemukan</h3>
        <p className="text-yellow-700 mb-4">Section dengan ID {sectionId} tidak ditemukan dalam kelas ini.</p>
        <button
          onClick={() => router.push(`/mycourse/${classId}`)}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Kembali ke Kelas
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/mycourse/${classId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Kelas
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{sectionDetail.title}</h1>
          <p className="text-gray-600 mt-1">{sectionDetail.description}</p>
        </div>
      </div>

      {/* Section Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Deskripsi Section</h2>
            <p className="text-gray-700 leading-relaxed">
              {sectionDetail.description || 'Tidak ada deskripsi untuk section ini.'}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{sectionDetail.Material?.length || 0} Materi</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Section {sectionDetail.order}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Daftar Materi</h2>
          <p className="text-gray-600 mt-1">
            Pilih materi untuk memulai pembelajaran
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {sectionDetail.Material && sectionDetail.Material.length > 0 ? (
            sectionDetail.Material.map((material, index) => (
              <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {material.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {material.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>15 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{material.xp || 10} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToMaterial(material.id)}
                    className="ml-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4" />
                    Pelajari
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Materi</h3>
              <p className="text-gray-500">
                Section ini belum memiliki materi yang tersedia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}