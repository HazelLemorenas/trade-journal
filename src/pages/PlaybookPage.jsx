import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import MainLayout from '../layouts/MainLayout'
import SectionCard from '../components/ui/SectionCard'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, BookOpen } from 'lucide-react'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-[#1E293B] rounded-full p-6 mb-4">
        <BookOpen size={32} className="text-slate-600" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">No strategies yet</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Create your first strategy to start building your personal trading playbook.
      </p>
    </div>
  )
}

function StatPill({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-[#0F172A] rounded-xl px-4 py-3 flex flex-col gap-1">
      <p className="text-slate-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  )
}

function StrategyCard({ strategy, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [strategy.id])

  const fetchStats = async () => {
    const { data: trades } = await supabase
      .from('trades')
      .select('result, rr_achieved, pnl_amount')
      .eq('strategy_id', strategy.id)
      .eq('status', 'closed')

    if (!trades || trades.length === 0) {
      setStats(null)
      return
    }

    const total = trades.length
    const wins = trades.filter(t => t.result === 'win').length
    const winRate = Number(((wins / total) * 100).toFixed(1))
    const rrs = trades.filter(t => t.rr_achieved != null).map(t => Number(t.rr_achieved))
    const avgRR = rrs.length > 0
      ? Number((rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2))
      : null
    const totalPnl = trades
      .filter(t => t.pnl_amount != null)
      .reduce((a, t) => a + Number(t.pnl_amount), 0)

    setStats({ total, winRate, avgRR, totalPnl: Number(totalPnl.toFixed(2)) })
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-[#22C55E]/10 p-2.5 rounded-xl">
            <BookOpen size={18} className="text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{strategy.name}</h3>
            {strategy.description && (
              <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{strategy.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(strategy)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(strategy.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats ? (
        <div className="grid grid-cols-4 gap-3 px-6 pb-5">
          <StatPill label="Total Trades" value={stats.total} />
          <StatPill
            label="Win Rate"
            value={`${stats.winRate}%`}
            color={stats.winRate >= 50 ? 'text-[#22C55E]' : 'text-[#EF4444]'}
          />
          <StatPill
            label="Avg RR"
            value={stats.avgRR != null ? `${stats.avgRR}R` : '—'}
            color="text-purple-400"
          />
          <StatPill
            label="Total P&L"
            value={`$${stats.totalPnl}`}
            color={stats.totalPnl >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}
          />
        </div>
      ) : (
        <div className="px-6 pb-5">
          <p className="text-slate-600 text-sm">No trades tagged to this strategy yet.</p>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-700 px-6 py-5 space-y-4">
          {strategy.entry_rules && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Entry Rules</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{strategy.entry_rules}</p>
            </div>
          )}
          {strategy.risk_rules && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Risk Rules</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{strategy.risk_rules}</p>
            </div>
          )}
          {strategy.exit_rules && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Exit Rules</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{strategy.exit_rules}</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

const emptyForm = {
  name: '',
  description: '',
  entry_rules: '',
  risk_rules: '',
  exit_rules: '',
}

export default function PlaybookPage() {
  const { user } = useAuthStore()
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setStrategies(data || [])
    setLoading(false)
  }

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('strategies')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editingId)

      if (error) setError(error.message)
      else {
        await fetchStrategies()
        setShowForm(false)
        setEditingId(null)
        setForm(emptyForm)
      }
    } else {
      const { error } = await supabase
        .from('strategies')
        .insert({ ...form, user_id: user.id })

      if (error) setError(error.message)
      else {
        await fetchStrategies()
        setShowForm(false)
        setForm(emptyForm)
      }
    }

    setSaving(false)
  }

  const handleEdit = (strategy) => {
    setForm({
      name: strategy.name,
      description: strategy.description || '',
      entry_rules: strategy.entry_rules || '',
      risk_rules: strategy.risk_rules || '',
      exit_rules: strategy.exit_rules || '',
    })
    setEditingId(strategy.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this strategy? Trades tagged to it will be unlinked.')
    if (!confirmed) return
    await supabase.from('strategies').delete().eq('id', id)
    await fetchStrategies()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Playbook</h2>
            <p className="text-slate-400 text-sm mt-1">Your personal library of repeatable trading strategies</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <Plus size={16} />
              New Strategy
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <SectionCard
              title={editingId ? 'Edit Strategy' : 'New Strategy'}
              subtitle="Define the rules for this trading setup"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Strategy Name" required>
                  <Input
                    placeholder="e.g. FVG + CHoCH Reversal"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    rows={2}
                    placeholder="Brief overview of this strategy..."
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                  />
                </FormField>

                <FormField label="Entry Rules">
                  <Textarea
                    rows={3}
                    placeholder="1. Wait for liquidity sweep&#10;2. Look for CHoCH on 15m&#10;3. Enter on FVG retest..."
                    value={form.entry_rules}
                    onChange={(e) => setField('entry_rules', e.target.value)}
                  />
                </FormField>

                <FormField label="Risk Rules">
                  <Textarea
                    rows={3}
                    placeholder="1. Max 1% risk per trade&#10;2. Stop loss below FVG&#10;3. Never move stop to loss..."
                    value={form.risk_rules}
                    onChange={(e) => setField('risk_rules', e.target.value)}
                  />
                </FormField>

                <FormField label="Exit Rules">
                  <Textarea
                    rows={3}
                    placeholder="1. Take 50% at 2R&#10;2. Move stop to BE&#10;3. Let rest run to target..."
                    value={form.exit_rules}
                    onChange={(e) => setField('exit_rules', e.target.value)}
                  />
                </FormField>

                {error && (
                  <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-xl p-4">
                    <p className="text-[#EF4444] text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Strategy' : 'Save Strategy'}
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>
        )}

        {/* Strategy List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-slate-400">Loading strategies...</p>
          </div>
        ) : strategies.length === 0 && !showForm ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {strategies.map(strategy => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  )
}