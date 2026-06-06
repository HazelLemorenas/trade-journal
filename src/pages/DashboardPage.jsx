import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/ui/StatCard'
import ChartCard from '../components/ui/ChartCard'
import { useDashboardStats } from '../features/dashboard/useDashboardStats'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import {
  TrendingUp, TrendingDown, Activity, Clock,
  Target, BarChart2, Percent, DollarSign
} from 'lucide-react'

const PIE_COLORS = ['#22C55E', '#EF4444', '#94A3B8']

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-[#1E293B] rounded-full p-6 mb-4">
        <BarChart2 size={32} className="text-slate-600" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">No trades yet</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Start recording your trades and your dashboard will come alive with real data.
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats()

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    </MainLayout>
  )

  if (!stats) return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Your trading performance at a glance</p>
      </div>
      <EmptyState />
    </MainLayout>
  )

  return (
    <MainLayout>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Your trading performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Trades" value={stats.total} icon={Activity} color="blue" subtitle="All time" />
        <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={TrendingUp} color="green" subtitle={`${stats.wins} wins`} />
        <StatCard title="Loss Rate" value={`${stats.lossRate}%`} icon={TrendingDown} color="red" subtitle={`${stats.losses} losses`} />
        <StatCard title="Break Even" value={`${stats.breakevenRate}%`} icon={Target} color="yellow" subtitle={`${stats.breakevens} trades`} />
        <StatCard title="Average RR" value={`${stats.avgRR}R`} icon={BarChart2} color="purple" subtitle="Risk/Reward ratio" />
        <StatCard title="Avg Hold Time" value={stats.avgHold} icon={Clock} color="blue" subtitle="Per trade" />
        <StatCard title="Profit Factor" value={stats.profitFactor} icon={Percent} color="green" subtitle="Gross profit / loss" />
        <StatCard title="Account Growth" value={`${stats.accountGrowth}%`} icon={DollarSign} color="green" subtitle="All time" />
      </div>

      {/* Row 1 — Monthly + Win/Loss */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <ChartCard title="Monthly Performance (P&L)" className="col-span-2">
          {stats.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyData}>
                <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {stats.monthlyData.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-16">No P&L data yet</p>
          )}
        </ChartCard>

        <ChartCard title="Win vs Loss">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.winLossData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.winLossData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>{value}</span>
                )}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 — Setup + Session */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartCard title="Setup Performance (Win Rate %)">
          {stats.setupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.setupData} layout="vertical">
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[0, 100]} />
                <YAxis dataKey="setup" type="category" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} width={70} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="winRate" fill="#22C55E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-16">No setup data yet</p>
          )}
        </ChartCard>

        <ChartCard title="Session Performance (Avg RR)">
          {stats.sessionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.sessionData}>
                <XAxis dataKey="session" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="avgRR" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-16">No session data yet</p>
          )}
        </ChartCard>
      </div>

      {/* Row 3 — Pair + Equity Curve */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Pair Performance (P&L)">
          {stats.pairData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.pairData}>
                <XAxis dataKey="pair" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {stats.pairData.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-16">No pair data yet</p>
          )}
        </ChartCard>

        <ChartCard title="Equity Curve">
          {stats.equityCurve.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="trade" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} label={{ value: 'Trade #', position: 'insideBottom', offset: -2, fill: '#64748B', fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22C55E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-16">No equity data yet</p>
          )}
        </ChartCard>
      </div>

    </MainLayout>
  )
}