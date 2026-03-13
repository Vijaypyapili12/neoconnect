import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"
import CaseCard from "../components/CaseCard"

export default function Dashboard() {
  const [cases, setCases] = useState([])

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCases(res.data)
      } catch (error) {
        console.error("Failed", error)
      }
    }
    fetchCases()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="p-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Global Case Overview (Admin)</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map(c => <CaseCard key={c._id} c={c} />)}
        </div>
      </div>
    </div>
  )
}