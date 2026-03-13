import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import Navbar from "../components/Navbar"

export default function Polls() {
  const [polls, setPolls] = useState([])
  const [user, setUser] = useState(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newOptions, setNewOptions] = useState(["", ""])

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")))
    fetchPolls()
  }, [])

  const fetchPolls = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/polls`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setPolls(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const createPoll = async () => {
    const validOptions = newOptions.filter(opt => opt.trim() !== "").map(text => ({ text }))
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/polls`, 
        { question: newQuestion, options: validOptions },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setPolls([...polls, res.data])
      setNewQuestion("")
      setNewOptions(["", ""])
    } catch (error) {
      alert("Error creating poll")
    }
  }

  const vote = async (id, index) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/polls/vote/${id}`, { option: index }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setPolls(polls.map(p => p._id === id ? res.data : p))
    } catch (error) {
      alert("Failed to record vote")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        {(user?.role === "secretariat" || user?.role === "admin") && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Create Poll</h2>
            <Input placeholder="Question" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} className="mb-2" />
            {newOptions.map((opt, i) => (
              <Input key={i} placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                const updated = [...newOptions]; updated[i] = e.target.value; setNewOptions(updated)
              }} className="mb-2" />
            ))}
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setNewOptions([...newOptions, ""])} variant="outline">Add Option</Button>
              <Button onClick={createPoll} className="text-white">Publish Poll</Button>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-6">Active Polls</h1>
          {polls.map(p => {
            const hasVoted = p.voters?.includes(user?.id)
            const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0)
            return (
              <div key={p._id} className="bg-white border p-6 rounded-xl mb-4 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">{p.question}</h2>
                {hasVoted ? (
                  <div className="space-y-2">
                    {p.options.map((o, i) => (
                      <div key={i} className="relative w-full bg-slate-100 rounded h-10 border flex items-center px-4">
                        <div className="absolute top-0 left-0 h-full bg-blue-200" style={{ width: `${totalVotes ? (o.votes/totalVotes)*100 : 0}%` }} />
                        <span className="relative z-10 font-bold">{o.text} - {o.votes} votes</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {p.options.map((o, i) => (
                      <Button key={i} onClick={() => vote(p._id, i)} className="bg-slate-100 text-slate-900 hover:bg-slate-200 w-full justify-start">{o.text}</Button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}