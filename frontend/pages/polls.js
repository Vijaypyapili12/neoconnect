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
        
        {/* CREATE POLL SECTION */}
        {(user?.role === "secretariat" || user?.role === "admin") && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Create Poll</h2>
            <Input 
              placeholder="Question" 
              value={newQuestion} 
              onChange={e => setNewQuestion(e.target.value)} 
              className="mb-3 font-medium" 
            />
            {newOptions.map((opt, i) => (
              <Input 
                key={i} 
                placeholder={`Option ${i+1}`} 
                value={opt} 
                onChange={e => {
                  const updated = [...newOptions]; updated[i] = e.target.value; setNewOptions(updated)
                }} 
                className="mb-2" 
              />
            ))}
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={() => setNewOptions([...newOptions, ""])} 
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                + Add Option
              </Button>
              <Button onClick={createPoll} className="bg-blue-600 hover:bg-blue-700 text-white">
                Publish Poll
              </Button>
            </div>
          </div>
        )}

        {/* ACTIVE POLLS SECTION */}
        <div>
          <h1 className="text-3xl font-bold mb-6 text-slate-900">Active Polls</h1>
          {polls.length === 0 ? (
            <p className="text-slate-500">No active polls at the moment.</p>
          ) : (
            polls.map(p => {
              const hasVoted = p.voters?.includes(user?.id)
              const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0)
              
              return (
                <div key={p._id} className="bg-white border border-slate-200 p-6 rounded-xl mb-5 shadow-sm">
                  <h2 className="text-xl font-bold mb-5 text-slate-800">{p.question}</h2>
                  
                  {hasVoted ? (
                    // RESULT BARS
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-green-600 mb-2">✓ You voted in this poll</p>
                      {p.options.map((o, i) => {
                        const percent = totalVotes ? Math.round((o.votes/totalVotes)*100) : 0;
                        return (
                          <div key={i} className="relative w-full bg-slate-100 rounded-md h-12 border border-slate-200 flex items-center px-4 overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-500" 
                              style={{ width: `${percent}%` }} 
                            />
                            <div className="relative z-10 w-full flex justify-between text-sm font-semibold text-slate-800">
                              <span>{o.text}</span>
                              <span>{percent}% ({o.votes})</span>
                            </div>
                          </div>
                        )
                      })}
                      <p className="text-xs text-slate-500 text-right mt-2">Total Votes: {totalVotes}</p>
                    </div>
                  ) : (
                    // VOTING BUTTONS
                    <div className="flex flex-col gap-3">
                      {p.options.map((o, i) => (
                        <button 
                          key={i} 
                          onClick={() => vote(p._id, i)} 
                          className="w-full text-left px-4 py-3 border border-slate-300 rounded-md bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors font-medium text-slate-700 shadow-sm"
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}