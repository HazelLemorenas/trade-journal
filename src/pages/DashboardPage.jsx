import MainLayout from '../layouts/MainLayout'
import StatCard from '../components/ui/StatCard'
import ChartCard from '../components/ui/ChartCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Activity, Clock,
  Target, BarChart2, Percent, DollarSign
} from 'lucide-react'

// --- Placeholder Data ---
const monthlyData = [
  { month: 'Jan', pnl: 320 },
  { month: 'Feb', pnl: -150 },
  { month: 'Mar', pnl: 480 },
  { month: 'Apr', pnl: 210 },
  { month: 'May', pnl: -80 },
  { month: 'Jun', pnl: 540 },
]

const winLossData = [
  { name: 'Win', value: 60 },
  { name: 'Loss', value: 30 },
  { name: 'Break Even', value: 10 },
]

const setupData = [
  { setup: 'FVG', winRate: 72 },
  { setup: 'OB', winRate: 65 },
  { setup: 'Breaker', winRate: 58 },
  { setup: 'Liq Sweep', winRate: 70 },
  { setup: 'MSS', winRate: 55 },
  { setup: 'CHoCH', winRate: 68 },
  { setup: 'BOS', winRate: 61 },
]

const sessionData = [
  { session: 'Asia', avgRR: 2.1 },
  { session: 'London', avgRR: 3.4 },
  { session: 'New York', avgRR: 4.2 },
]

const pairData = [
  { pair: 'BTC/USDT', pnl: 820 },
  { pair: 'ETH/USDT', pnl: 430 },
  { pair: 'SOL/USDT', pnl: -120 },
  { pair: 'BNB/USDT', pnl: 210 },
]

const PIE_COLORS = ['#22C55E', '#EF4444', '#94A3B8']

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
}

export default function DashboardPage() {
  return (
    <MainLayout>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Your trading performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Trades" value="0" icon={Activity} color="blue" subtitle="All time" />
        <StatCard title="Win Rate" value="0%" icon={TrendingUp} color="green" subtitle="Wins / Total" />
        <StatCard title="Loss Rate" value="0%" icon={TrendingDown} color="red" subtitle="Losses / Total" />
        <StatCard title="Break Even" value="0%" icon={Target} color="yellow" subtitle="Break even / Total" />
        <StatCard title="Average RR" value="0.00" icon={BarChart2} color="purple" subtitle="Risk/Reward ratio" />
        <StatCard title="Avg Hold Time" value="0m" icon={Clock} color="blue" subtitle="Per trade" />
        <StatCard title="Profit Factor" value="0.00" icon={Percent} color="green" subtitle="Gross profit / loss" />
        <StatCard title="Account Growth" value="0%" icon={DollarSign} color="green" subtitle="All time" />
      </div>

      {/* Row 1 — Monthly + Win/Loss */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <ChartCard title="Monthly Performance" className="col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={index} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Win vs Loss">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {winLossData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={setupData} layout="vertical">
              <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[0, 100]} />
              <YAxis dataKey="setup" type="category" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="winRate" fill="#22C55E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Session Performance (Avg RR)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sessionData}>
              <XAxis dataKey="session" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgRR" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 — Pair Performance */}
      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Pair Performance (P&L)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pairData}>
              <XAxis dataKey="pair" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {pairData.map((entry, index) => (
                  <Cell key={index} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </MainLayout>
  )
}