export default function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-[#1E293B] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}