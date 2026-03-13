import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/">
        <h1 className="font-extrabold text-xl tracking-tight cursor-pointer flex items-center gap-2">
          <span className="text-blue-400">Neo</span>Connect
        </h1>
      </Link>

      <div className="flex gap-6 items-center font-medium text-sm">
        {!user ? (
          <Link href="/login" className="hover:text-blue-400 transition">Login / Register</Link>
        ) : (
          <>
            {/* SHARED LINKS (Everyone can see the Hub and Polls) */}
            <Link href="/hub" className="hover:text-blue-400 transition">Public Hub</Link>
            <Link href="/polls" className="hover:text-blue-400 transition">Polls</Link>

            {/* STAFF SPECIFIC */}
            {(user.role === "staff" || user.role === "admin") && (
              <Link href="/submit" className="hover:text-blue-400 transition">Submit Case</Link>
            )}

            {/* SECRETARIAT SPECIFIC */}
            {(user.role === "secretariat" || user.role === "admin") && (
              <>
                <Link href="/secretariat/inbox" className="hover:text-blue-400 transition">Case Inbox</Link>
                <Link href="/analytics" className="hover:text-blue-400 transition">Analytics</Link>
              </>
            )}

            {/* MANAGER SPECIFIC */}
            {(user.role === "manager" || user.role === "admin") && (
              <Link href="/manager/dashboard" className="hover:text-blue-400 transition">My Cases</Link>
            )}

            {/* ADMIN SPECIFIC */}
            {user.role === "admin" && (
              <Link href="/dashboard" className="hover:text-blue-400 transition">All Cases</Link>
            )}

            {/* USER PROFILE & LOGOUT */}
            <div className="border-l border-slate-700 pl-6 ml-2 flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-xs text-slate-400 leading-none">{user.name}</span>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{user.role}</span>
              </div>
              <button 
                onClick={logout} 
                className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-md hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}