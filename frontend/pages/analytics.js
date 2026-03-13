import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"
import { useRouter } from "next/router"

export default function AnalyticsDashboard() {
  const [cases, setCases] = useState([])
  const [hotspots, setHotspots] = useState([])
  const [deptStats, setDeptStats] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCases(res.data)
        calculateMetrics(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  const router = useRouter()

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    
    if (!storedUser) {
      router.push("/login")
      return
    } 
    
    // Analytics is only for Admins and Secretariats
    if (storedUser.role !== "admin" && storedUser.role !== "secretariat") {
      alert("Access Denied: You do not have permission to view Analytics.")
      router.push("/")
      return
    }
  }, [router])

  const calculateMetrics = (allCases) => {
    const openCases = allCases.filter(c => c.status !== "Resolved")
    const deptCounts = {}
    openCases.forEach(c => { deptCounts[c.department] = (deptCounts[c.department] || 0) + 1 })
    setDeptStats(deptCounts)

    const matrix = {}
    openCases.forEach(c => {
      const key = `${c.department}_${c.category}`
      matrix[key] = (matrix[key] || 0) + 1
    })

    const flagged = []
    for (const [key, count] of Object.entries(matrix)) {
      if (count >= 5) {
        const [department, category] = key.split("_")
        flagged.push({ department, category, count })
      }
    }
    setHotspots(flagged)
  }

  const maxCases = Math.max(...Object.values(deptStats), 1)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>

        {hotspots.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded shadow-sm">
            <h2 className="text-red-800 font-bold text-xl mb-3">⚠️ Critical Hotspots</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {hotspots.map((h, i) => (
                <div key={i} className="bg-white p-3 border border-red-200 rounded flex justify-between">
                  <span className="font-semibold">{h.department}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{h.count} {h.category} Cases</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Open Cases by Department</h2>
          <div className="space-y-4">
            {Object.entries(deptStats).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{dept}</div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(count/maxCases)*100}%` }} />
                </div>
                <div className="w-8 text-right font-bold">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}