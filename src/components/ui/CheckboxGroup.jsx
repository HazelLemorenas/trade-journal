export default function CheckboxGroup({ label, items, values, onChange }) {
  const toggle = (key) => {
    onChange({ ...values, [key]: !values[key] })
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {items.map(({ key, label: itemLabel }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              values[key]
                ? 'bg-[#22C55E] border-[#22C55E] text-white'
                : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {itemLabel}
          </button>
        ))}
      </div>
    </div>
  )
}