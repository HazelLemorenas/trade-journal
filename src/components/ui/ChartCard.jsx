export default function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-[#1E293B] rounded-2xl p-6 ${className}`}>
      <h3 className="text-white font-semibold text-base mb-6">{title}</h3>
      {children}
    </div>
  )
}