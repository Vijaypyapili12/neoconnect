import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "../../components/ui/button"
import Navbar from "../../components/Navbar"
import CaseCard from "../../components/CaseCard"
import { useRouter } from "next/router"

export default function Inbox() {
  const [cases, setCases] = useState([])
  const [managers, setManagers] = useState([])
  const [selectedManagers, setSelectedManagers] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const casesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases`, config)
        setCases(casesRes.data.filter(c => c.status === "New"))
        const managersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/managers`, config)
        setManagers(managersRes.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])
  const router = useRouter() // Make sure to import { useRouter } from "next/router"

  useEffect(() => {
    // Check scope immediately when the page loads
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (!storedUser) {
      router.push("/login")
    } else if (storedUser.role !== "secretariat" && storedUser.role !== "admin") {
      alert("Access Denied: You do not have Secretariat privileges.")
      router.push("/")
    }
  }, [router])

  const assignCase = async (caseId) => {
    const managerId = selectedManagers[caseId]
    if (!managerId) return alert("Select a Manager first.")
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases/assign/${caseId}`, { managerId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Assigned successfully!")
      setCases(cases.filter(c => c._id !== caseId))
    } catch (error) {
      alert("Failed to assign.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Secretariat Inbox</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map(c => (
            <div key={c._id} className="relative">
              <CaseCard c={c} />
              <div className="mt-2 bg-white p-3 border rounded shadow-sm">
                <select className="w-full border p-2 mb-2 rounded text-sm" onChange={(e) => setSelectedManagers({...selectedManagers, [c._id]: e.target.value})}>
                  <option value="">Select Manager...</option>
                  {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
                <Button onClick={() => assignCase(c._id)} className="w-full bg-blue-600 text-white">Assign Case</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}