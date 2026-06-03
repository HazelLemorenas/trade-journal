export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition placeholder-slate-600 ${className}`}
      {...props}
    />
  )
}