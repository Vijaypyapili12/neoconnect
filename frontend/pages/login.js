import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import Navbar from "../components/Navbar"

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true) 
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("staff") 
  const router = useRouter()

  const login = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      
      const userRole = res.data.user.role
      if (userRole === "secretariat") router.push("/secretariat/inbox")
      else if (userRole === "manager") router.push("/manager/dashboard")
      else if (userRole === "admin") router.push("/analytics")
      else router.push("/hub") 
    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials")
    }
  }

  const register = async () => {
    if (!name || !email || !password) return alert("Please fill in all fields.")
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`, { name, email, password, role })
      alert("Registration Successful! You can now log in.")
      setIsLoginView(true) 
      setPassword("")
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="p-10 flex flex-col max-w-sm mx-auto gap-4 mt-20 bg-white text-slate-900 shadow-md rounded-xl border">
        <div className="text-center mb-2">
          <h3 className="font-bold text-2xl">{isLoginView ? "Login" : "Register"}</h3>
        </div>
        
        {!isLoginView && (
          <>
            <Input placeholder="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} />
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-slate-950" 
              value={role} onChange={e => setRole(e.target.value)}
            >
              <option value="staff">Staff</option>
              <option value="secretariat">Secretariat</option>
              <option value="manager">Case Manager</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}

        <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        
        <Button onClick={isLoginView ? login : register} className="w-full mt-2 text-white">
          {isLoginView ? "Login" : "Create Account"}
        </Button>

        <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-blue-600 hover:underline mt-2">
          {isLoginView ? "Don't have an account? Register" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  )
}