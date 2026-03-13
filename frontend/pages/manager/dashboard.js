import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "../../components/ui/button"
import Navbar from "../../components/Navbar"
import CaseCard from "../../components/CaseCard"
import { useRouter } from "next/router"

export default function ManagerDashboard() {
  const [cases, setCases] = useState([])
  const [updates, setUpdates] = useState({})

  const fetchMyCases = async () => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCases(res.data.filter(c => c.assignedTo?._id === user.id))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => { fetchMyCases() }, [])

  const router = useRouter() // Make sure you imported this at the top!

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    
    // 1. Check if logged in
    if (!storedUser) {
      router.push("/login")
      return
    } 
    
    // 2. Check if they have Manager or Admin privileges
    if (storedUser.role !== "manager" && storedUser.role !== "admin") {
      alert("Access Denied: You do not have Manager privileges.")
      router.push("/")
      return
    }

    // 3. If they pass the checks, fetch their cases!
    fetchMyCases()
  }, [router])

  const updateCaseStatus = async (caseId) => {
    const caseUpdate = updates[caseId]
    if (!caseUpdate?.status) return alert("Select status.")
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases/status/${caseId}`, caseUpdate, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Updated successfully!")
      fetchMyCases()
    } catch (error) {
      alert("Failed to update.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Assigned Cases</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {cases.map(c => (
            <div key={c._id}>
              <CaseCard c={c} />
              {c.status !== "Resolved" && (
                <div className="mt-2 bg-white p-3 border rounded shadow-sm">
                  <select className="w-full border p-2 mb-2 rounded text-sm" onChange={e => setUpdates({...updates, [c._id]: {...updates[c._id], status: e.target.value}})}>
                    <option value="">Update Status...</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  {updates[c._id]?.status === "Resolved" && (
                    <div className="mb-2 space-y-2">
                      <input placeholder="Action taken?" className="w-full border p-2 text-sm rounded" onChange={e => setUpdates({...updates, [c._id]: {...updates[c._id], actionTaken: e.target.value}})} />
                      <input placeholder="What changed?" className="w-full border p-2 text-sm rounded" onChange={e => setUpdates({...updates, [c._id]: {...updates[c._id], resultChanged: e.target.value}})} />
                    </div>
                  )}
                  <Button onClick={() => updateCaseStatus(c._id)} className="w-full bg-indigo-600 text-white">Save Update</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}