export default function CaseCard({ c }) {
  const statusColors = {
    New: "bg-blue-100 text-blue-800",
    Assigned: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-purple-100 text-purple-800",
    Pending: "bg-orange-100 text-orange-800",
    Resolved: "bg-green-100 text-green-800",
    Escalated: "bg-red-100 text-red-800",
  }

  return (
    <div className="border border-slate-200 p-5 rounded-xl shadow-sm bg-white flex flex-col gap-2">
      <div className="flex justify-between items-start mb-2">
        <p className="font-bold text-lg text-slate-900">{c.trackingId}</p>
        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${statusColors[c.status] || "bg-slate-100 text-slate-800"}`}>
          {c.status}
        </span>
      </div>
      
      <p className="text-slate-600 text-sm"><b className="text-slate-900">Category:</b> {c.category}</p>
      <p className="text-slate-600 text-sm"><b className="text-slate-900">Department:</b> {c.department}</p>
      <p className="text-slate-600 text-sm"><b className="text-slate-900">Severity:</b> {c.severity}</p>
      
      {c.description && (
        <div className="mt-2 pt-2 border-t text-sm text-slate-700 bg-slate-50 p-2 rounded">
          {c.description}
        </div>
      )}
    </div>
  )
}