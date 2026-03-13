import { useState } from "react"
import axios from "axios"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import Navbar from "../components/Navbar"

export default function Submit() {
  const [category, setCategory] = useState("Safety")
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")
  const [severity, setSeverity] = useState("Low")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [file, setFile] = useState(null)

  const submitCase = async () => {
    if (!department || !location || !description) return alert("Please fill all text fields.")

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("category", category)
      formData.append("department", department)
      formData.append("location", location)
      formData.append("severity", severity)
      formData.append("description", description)
      formData.append("anonymous", isAnonymous)
      if (file) formData.append("file", file)

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cases`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      alert("Case submitted successfully!")
      setDepartment("")
      setLocation("")
      setDescription("")
      setFile(null)
    } catch (error) {
      alert("Failed to submit case. Check login status.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="p-10 max-w-lg mx-auto flex flex-col gap-4 mt-10 bg-white border rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold">Submit a Case</h1>
        
        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="Safety">Safety</option>
          <option value="Policy">Policy</option>
          <option value="Facilities">Facilities</option>
          <option value="HR">HR</option>
          <option value="Other">Other</option>
        </select>

        <Input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        
        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={severity} onChange={e => setSeverity(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="h-4 w-4" />
          <label htmlFor="anonymous" className="text-sm font-medium">Submit Anonymously</label>
        </div>

        <Input type="file" accept=".pdf, image/*" onChange={e => setFile(e.target.files[0])} />
        <Button onClick={submitCase} className="mt-2 text-white bg-blue-600 hover:bg-blue-700">Submit</Button>
      </div>
    </div>
  )
}