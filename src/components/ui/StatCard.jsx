export default function StatCard({ title, value, subtitle, icon: Icon, color = 'green' }) {
  const colors = {
    green: 'text-[#22C55E]',
    red: 'text-[#EF4444]',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {Icon && (
          <div className={`${colors[color]} opacity-80`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
    </div>
  )
}