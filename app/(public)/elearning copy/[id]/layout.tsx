// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import LayoutNavbar from '@/components/public/LayoutNavbar'
// import Footer from '@/components/public/Footer'
// import { 
//   ChevronLeft, 
//   BookOpen, 
//   FileText, 
//   Users,
//   Star,
//   Award,
//   Target,
//   BarChart3
// } from 'lucide-react'

// interface ClassDetail {
//   id: number
//   name: string
//   description: string
//   image_path: string
//   categoryId: number
//   averageRating: number
//   totalReviews: number
//   studentCount?: number
//   materialCount?: number
// }

// export default function ClassLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const params = useParams()
//   const router = useRouter()
//   const classId = params.id as string

//   const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   // Fetch basic class info untuk header
//   const fetchClassDetail = async () => {
//     try {
//       setLoading(true)
//       const token = localStorage.getItem("token")
      
//       if (!token) {
//         setError('Token tidak ditemukan. Silakan login kembali.')
//         setLoading(false)
//         return
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/classes/${classId}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//         },
//       })

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem("token")
//           setError('Sesi telah berakhir. Silakan login kembali.')
//           setTimeout(() => router.push('/auth/login'), 2000)
//           return
//         }
//         if (response.status === 404) {
//           setError('Kelas tidak ditemukan')
//           setLoading(false)
//           return
//         }
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const result = await response.json()
      
//       if (result.success && result.data) {
//         setClassDetail(result.data)
//         setError(null)
//       } else {
//         throw new Error(result.message || 'Gagal memuat detail kelas')
//       }
//     } catch (err) {
//       console.error('Error fetching class detail:', err)
//       setError('Gagal memuat detail kelas. Silakan coba lagi.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (classId) {
//       fetchClassDetail()
//     }
//   }, [classId])

//   if (loading) {
//     return (
//       <LayoutNavbar>
//         <div className="flex justify-center items-center min-h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
//           <span className="ml-3 text-gray-600">Memuat detail kelas...</span>
//         </div>
//       </LayoutNavbar>
//     )
//   }

//   if (error) {
//     return (
//       <LayoutNavbar>
//         <div className="flex flex-col justify-center items-center min-h-screen">
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
//             <p className="text-yellow-700 font-medium">{error}</p>
//             <div className="flex gap-3 mt-4">
//               <button 
//                 onClick={() => router.push('/auth/login')}
//                 className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
//               >
//                 Login Kembali
//               </button>
//               <button 
//                 onClick={() => router.push('/elearning')}
//                 className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Kembali ke E-Learning
//               </button>
//             </div>
//           </div>
//         </div>
//       </LayoutNavbar>
//     )
//   }

//   if (!classDetail) {
//     return (
//       <LayoutNavbar>
//         <div className="flex justify-center items-center min-h-screen">
//           <div className="text-center">
//             <h2 className="text-xl font-semibold text-gray-700">Kelas tidak ditemukan</h2>
//             <button 
//               onClick={() => router.push('/elearning')}
//               className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
//             >
//               Kembali ke E-Learning
//             </button>
//           </div>
//         </div>
//       </LayoutNavbar>
//     )
//   }

//   return (
//     <>
//       <LayoutNavbar>
//         <div className="min-h-screen bg-gray-50 pt-16">
//           {/* Header */}
//           <div className="bg-white border-b border-gray-200">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="py-6">
//                 <button 
//                   onClick={() => router.push('/elearning')}
//                   className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                   Kembali ke Kelas
//                 </button>
                
//                 <div className="flex flex-col lg:flex-row gap-6 items-start">
//                   <div className="flex-1">
//                     <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                       {classDetail.name}
//                     </h1>
//                     <p className="text-gray-600 mb-4">
//                       {classDetail.description}
//                     </p>
                    
//                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                       <div className="flex items-center gap-1">
//                         <BookOpen className="w-4 h-4" />
//                         <span>{classDetail.materialCount || 0} Materi</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                         <span>{classDetail.averageRating || 'Belum ada rating'}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Users className="w-4 h-4" />
//                         <span>{classDetail.totalReviews} Review</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Navigation Tabs */}
//                   {/* <div className="flex gap-2">
//                     <button
//                       onClick={() => router.push(`/elearning/${classId}`)}
//                       className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
//                     >
//                       <FileText className="w-4 h-4" />
//                       Materi
//                     </button>
//                     <button
//                       onClick={() => router.push(`/elearning/${classId}/quiz`)}
//                       className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
//                     >
//                       <Award className="w-4 h-4" />
//                       Quiz
//                     </button>
//                   </div> */}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             {children}
//           </div>
//         </div>
//       </LayoutNavbar>
//       <Footer />
//     </>
//   )
// }