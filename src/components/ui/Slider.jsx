export default function Slider({ label, value, onChange, min = 1, max = 10 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-sm font-bold text-white bg-[#0F172A] px-2 py-0.5 rounded">
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#22C55E]"
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}