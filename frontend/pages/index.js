import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "../components/Navbar"
import { Button } from "../components/ui/button"

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">Welcome to NeoConnect</h1>
        <p className="text-slate-600 max-w-2xl text-lg mb-10 leading-relaxed">
          A transparent, accountable platform to raise issues, track resolutions, and shape the future of our workplace.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {!user ? (
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8 rounded-full shadow-md text-white">
                Get Started / Login
              </Button>
            </Link>
          ) : (
            <>
              {(user.role === "staff" || user.role === "admin") && (
                <>
                  <Link href="/submit"><Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6 text-white">Submit a Complaint</Button></Link>
                  <Link href="/hub"><Button className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 h-12 px-6">Public Hub</Button></Link>
                </>
              )}
              {user.role === "secretariat" && (
                <Link href="/secretariat/inbox"><Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6 text-white">Secretariat Inbox</Button></Link>
              )}
              {user.role === "manager" && (
                <Link href="/manager/dashboard"><Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 text-white">My Assigned Cases</Button></Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}