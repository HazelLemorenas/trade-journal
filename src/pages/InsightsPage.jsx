import MainLayout from '../layouts/MainLayout'
import ChartCard from '../components/ui/ChartCard'
import { useInsights } from '../features/insights/useInsights'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import {
  TrendingUp, TrendingDown, AlertTriangle,
  Calendar, Coins, Brain, Target, Lightbulb
} from 'lucide-react'

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
}

function InsightCard({ icon: Icon, iconColor, label, value, sub, borderColor }) {
  return (
    <div className={`bg-[#1E293B] rounded-2xl p-6 border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
          <p className="text-white font-bold text-lg leading-tight">{value}</p>
          {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-[#1E293B] p-2.5 rounded-xl">
        <Icon size={18} className="text-[#22C55E]" />
      </div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-[#1E293B] rounded-full p-6 mb-4">
        <Lightbulb size={32} className="text-slate-600" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">No insights yet</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Record at least a few trades and insights will be generated automatically from your data.
      </p>
    </div>
  )
}

export default function InsightsPage() {
  const { insights, loading } = useInsights()

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Analyzing your trades...</p>
      </div>
    </MainLayout>
  )

  if (!insights) return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Insights</h2>
        <p className="text-slate-400 text-sm mt-1">Automatically generated from your trade data</p>
      </div>
      <EmptyState />
    </MainLayout>
  )

  return (
    <MainLayout>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Insights</h2>
        <p className="text-slate-400 text-sm mt-1">
          Based on {insights.totalTrades} trades — patterns, strengths, and areas to improve
        </p>
      </div>

      {/* --- SETUP PERFORMANCE --- */}
      <div className="mb-10">
        <SectionHeader icon={TrendingUp} title="Setup Performance" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          {insights.bestSetup && (
            <InsightCard
              icon={TrendingUp}
              iconColor="text-[#22C55E]"
              borderColor="border-[#22C55E]"
              label="Best Performing Setup"
              value={insights.bestSetup.label}
              sub={`${insights.bestSetup.winRate}% win rate across ${insights.bestSetup.total} trades`}
            />
          )}
          {insights.worstSetup && (
            <InsightCard
              icon={TrendingDown}
              iconColor="text-[#EF4444]"
              borderColor="border-[#EF4444]"
              label="Lowest Win Rate Setup"
              value={insights.worstSetup.label}
              sub={`${insights.worstSetup.winRate}% win rate across ${insights.worstSetup.total} trades`}
            />
          )}
        </div>
      </div>

      {/* --- MISTAKES --- */}
      <div className="mb-10">
        <SectionHeader icon={AlertTriangle} title="Mistakes & Violations" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          {insights.worstMistake && (
            <InsightCard
              icon={TrendingDown}
              iconColor="text-[#EF4444]"
              borderColor="border-[#EF4444]"
              label="Most Costly Mistake"
              value={insights.worstMistake.label}
              sub={`${insights.worstMistake.lossRate}% loss rate when this occurs (${insights.worstMistake.total} trades)`}
            />
          )}
          {insights.mostFrequentMistake && (
            <InsightCard
              icon={AlertTriangle}
              iconColor="text-yellow-400"
              borderColor="border-yellow-400"
              label="Most Frequent Mistake"
              value={insights.mostFrequentMistake.label}
              sub={`Occurred in ${insights.mostFrequentMistake.total} trades`}
            />
          )}
        </div>

        {insights.mistakeStats.length > 0 && (
          <ChartCard title="Mistake Loss Rate (%)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={insights.mistakeStats} layout="vertical">
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[0, 100]} />
                <YAxis dataKey="label" type="category" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} width={130} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="lossRate" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* --- SESSION & DAY --- */}
      <div className="mb-10">
        <SectionHeader icon={Calendar} title="Session & Day Performance" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          {insights.bestSession && (
            <InsightCard
              icon={TrendingUp}
              iconColor="text-[#22C55E]"
              borderColor="border-[#22C55E]"
              label="Best Trading Session"
              value={`${insights.bestSession.session} Session`}
              sub={`Avg RR: ${insights.bestSession.avgRR}R · Win rate: ${insights.bestSession.winRate}% · ${insights.bestSession.total} trades`}
            />
          )}
          {insights.bestDay && (
            <InsightCard
              icon={Calendar}
              iconColor="text-blue-400"
              borderColor="border-blue-400"
              label="Best Trading Day"
              value={insights.bestDay.day}
              sub={`${insights.bestDay.winRate}% win rate across ${insights.bestDay.total} trades`}
            />
          )}
        </div>

        <ChartCard title="Win Rate by Day of Week (%)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insights.dayChartData}>
              <XAxis dataKey="day" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {insights.dayChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.winRate >= 50 ? '#22C55E' : entry.winRate > 0 ? '#6366F1' : '#1E293B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* --- PAIR PERFORMANCE --- */}
      <div className="mb-10">
        <SectionHeader icon={Coins} title="Pair Performance" />
        <div className="grid grid-cols-2 gap-4">
          {insights.mostProfitablePair && (
            <InsightCard
              icon={TrendingUp}
              iconColor="text-[#22C55E]"
              borderColor="border-[#22C55E]"
              label="Most Profitable Pair"
              value={insights.mostProfitablePair.pair}
              sub={`$${insights.mostProfitablePair.pnl} P&L · ${insights.mostProfitablePair.winRate}% win rate · ${insights.mostProfitablePair.total} trades`}
            />
          )}
          {insights.leastProfitablePair && insights.pairStats.length > 1 && (
            <InsightCard
              icon={TrendingDown}
              iconColor="text-[#EF4444]"
              borderColor="border-[#EF4444]"
              label="Least Profitable Pair"
              value={insights.leastProfitablePair.pair}
              sub={`$${insights.leastProfitablePair.pnl} P&L · ${insights.leastProfitablePair.winRate}% win rate · ${insights.leastProfitablePair.total} trades`}
            />
          )}
        </div>
      </div>

      {/* --- PSYCHOLOGY --- */}
      <div className="mb-10">
        <SectionHeader icon={Brain} title="Psychology Patterns" />
        <div className="grid grid-cols-2 gap-4">
          <InsightCard
            icon={Brain}
            iconColor="text-[#22C55E]"
            borderColor="border-[#22C55E]"
            label="Win Rate When Calm"
            value={`${insights.calmWinRate}%`}
            sub={`Across ${insights.calmTrades} trades entered with calm emotion`}
          />
          <InsightCard
            icon={AlertTriangle}
            iconColor="text-[#EF4444]"
            borderColor="border-[#EF4444]"
            label="Overconfident Losses"
            value={`${insights.overconfidentLosses} trades`}
            sub="Losses where pre-trade emotion was overconfident"
          />
          <InsightCard
            icon={TrendingDown}
            iconColor="text-yellow-400"
            borderColor="border-yellow-400"
            label="High Fear Losses"
            value={`${insights.highFearLosses} trades`}
            sub="Losses where fear level was 7 or higher before entry"
          />
          <InsightCard
            icon={TrendingUp}
            iconColor="text-blue-400"
            borderColor="border-blue-400"
            label="High Confidence Wins"
            value={`${insights.highConfidenceWins} trades`}
            sub="Wins where confidence level was 7 or higher before entry"
          />
        </div>
      </div>

      {/* --- BIAS ACCURACY --- */}
      <div className="mb-10">
        <SectionHeader icon={Target} title="Bias Accuracy" />
        <div className="grid grid-cols-1 gap-4">
          <InsightCard
            icon={Target}
            iconColor="text-purple-400"
            borderColor="border-purple-400"
            label="Daily Bias Accuracy"
            value={`${insights.biasAccuracy}%`}
            sub={`Correct bias + matching direction + win across ${insights.biasedTrades} biased trades`}
          />
        </div>
      </div>

    </MainLayout>
  )
}