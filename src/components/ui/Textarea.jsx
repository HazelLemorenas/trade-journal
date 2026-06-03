export default function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full bg-[#0F172A] text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-[#22C55E] transition placeholder-slate-600 resize-none ${className}`}
      rows={4}
      {...props}
    />
  )
}