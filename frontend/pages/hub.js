import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "../components/ui/input"
import Navbar from "../components/Navbar"

export default function PublicHub() {
  const [resolvedCases, setResolvedCases] = useState([])
  const [minutes, setMinutes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: `Bearer ${token}` } }
        
        const casesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases`, config)
        setResolvedCases(casesRes.data.filter(c => c.status === "Resolved"))

        const minutesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/minutes`, config)
        setMinutes(minutesRes.data)
      } catch (error) {
        console.error("Error fetching hub data", error)
      }
    }
    fetchHubData()
  }, [])

  const filteredMinutes = minutes.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-12 p-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-4">Quarterly Digest & Impact</h2>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 uppercase text-slate-700">
                <th className="p-4 border-b">What was raised</th>
                <th className="p-4 border-b">What action was taken</th>
                <th className="p-4 border-b">What changed</th>
              </tr>
            </thead>
            <tbody>
              {resolvedCases.map(c => (
                <tr key={c._id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium">{c.category} Issue in {c.department}</td>
                  <td className="p-4 text-slate-700">{c.actionTaken || "Reviewed"}</td>
                  <td className="p-4 text-green-700 font-bold">{c.resultChanged || "Resolved"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Minutes Archive</h2>
            <Input className="w-64" placeholder="Search minutes..." onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredMinutes.map(m => (
              <div key={m._id} className="p-4 border rounded-lg flex justify-between">
                <span className="font-bold">{m.title}</span>
                <a href={`http://localhost:5000/${m.fileUrl}`} target="_blank" className="text-blue-600 font-bold" rel="noreferrer">PDF</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}