import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import MainLayout from '../layouts/MainLayout'
import SectionCard from '../components/ui/SectionCard'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { User, Wallet, Lock, CheckCircle } from 'lucide-react'

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-[#1E293B] p-2.5 rounded-xl">
        <Icon size={18} className="text-[#22C55E]" />
      </div>
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, profile, fetchProfile } = useAuthStore()

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    username: '',
    currency: 'USD',
  })

  const [balanceForm, setBalanceForm] = useState({
    starting_balance: '',
    current_balance: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: '',
  })

  const [profileSaving, setProfileSaving] = useState(false)
  const [balanceSaving, setBalanceSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [profileMsg, setProfileMsg] = useState(null)
  const [balanceMsg, setBalanceMsg] = useState(null)
  const [passwordMsg, setPasswordMsg] = useState(null)

  const [profileError, setProfileError] = useState(null)
  const [balanceError, setBalanceError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        currency: profile.currency || 'USD',
      })
      setBalanceForm({
        starting_balance: profile.starting_balance || '',
        current_balance: profile.current_balance || '',
      })
    }
  }, [profile])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileError(null)
    setProfileMsg(null)
    setProfileSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.full_name,
        username: profileForm.username,
        currency: profileForm.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) setProfileError(error.message)
    else {
      setProfileMsg('Profile updated successfully.')
      fetchProfile(user.id)
    }

    setProfileSaving(false)
  }

  const handleBalanceSave = async (e) => {
    e.preventDefault()
    setBalanceError(null)
    setBalanceMsg(null)
    setBalanceSaving(true)

    const starting = parseFloat(balanceForm.starting_balance)
    const current = parseFloat(balanceForm.current_balance)

    if (isNaN(starting) || isNaN(current)) {
      setBalanceError('Please enter valid numbers for both balance fields.')
      setBalanceSaving(false)
      return
    }

    if (starting <= 0 || current <= 0) {
      setBalanceError('Balances must be greater than zero.')
      setBalanceSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        starting_balance: starting,
        current_balance: current,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) setBalanceError(error.message)
    else {
      setBalanceMsg('Account balance updated successfully.')
      fetchProfile(user.id)
    }

    setBalanceSaving(false)
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMsg(null)

    if (passwordForm.new_password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordSaving(true)

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.new_password,
    })

    if (error) setPasswordError(error.message)
    else {
      setPasswordMsg('Password updated successfully.')
      setPasswordForm({ new_password: '', confirm_password: '' })
    }

    setPasswordSaving(false)
  }

  const growthPercent = (() => {
    const s = parseFloat(balanceForm.starting_balance)
    const c = parseFloat(balanceForm.current_balance)
    if (!isNaN(s) && !isNaN(c) && s > 0) {
      return (((c - s) / s) * 100).toFixed(2)
    }
    return null
  })()

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your profile and account preferences</p>
        </div>

        <div className="space-y-6">

          {/* Profile Info */}
          <SectionCard title="">
            <SectionHeader
              icon={User}
              title="Profile Information"
              subtitle="Update your name and display preferences"
            />
            <form onSubmit={handleProfileSave} className="space-y-4">

              <FormField label="Email">
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
              </FormField>

              <FormField label="Full Name">
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                />
              </FormField>

              <FormField label="Username">
                <Input
                  type="text"
                  placeholder="@username"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm(p => ({ ...p, username: e.target.value }))}
                />
              </FormField>

              <FormField label="Currency">
                <Select
                  value={profileForm.currency}
                  onChange={(e) => setProfileForm(p => ({ ...p, currency: e.target.value }))}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="PHP">PHP — Philippine Peso</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                  <option value="AUD">AUD — Australian Dollar</option>
                </Select>
              </FormField>

              {profileError && (
                <p className="text-[#EF4444] text-sm">{profileError}</p>
              )}

              {profileMsg && (
                <div className="flex items-center gap-2 text-[#22C55E] text-sm">
                  <CheckCircle size={16} />
                  {profileMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>

            </form>
          </SectionCard>

          {/* Account Balance */}
          <SectionCard title="">
            <SectionHeader
              icon={Wallet}
              title="Account Balance"
              subtitle="Used to calculate Risk % and P&L % on every trade"
            />
            <form onSubmit={handleBalanceSave} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Starting Balance">
                  <Input
                    type="number"
                    step="any"
                    placeholder="1000.00"
                    value={balanceForm.starting_balance}
                    onChange={(e) => setBalanceForm(p => ({ ...p, starting_balance: e.target.value }))}
                  />
                </FormField>
                <FormField label="Current Balance">
                  <Input
                    type="number"
                    step="any"
                    placeholder="1000.00"
                    value={balanceForm.current_balance}
                    onChange={(e) => setBalanceForm(p => ({ ...p, current_balance: e.target.value }))}
                  />
                </FormField>
              </div>

              {/* Growth Preview */}
              {growthPercent !== null && (
                <div className="bg-[#0F172A] rounded-xl px-4 py-3 border border-slate-700 flex items-center justify-between">
                  <p className="text-slate-400 text-sm">Account Growth</p>
                  <p className={`text-sm font-bold ${
                    parseFloat(growthPercent) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                  }`}>
                    {growthPercent}%
                  </p>
                </div>
              )}

              {balanceError && (
                <p className="text-[#EF4444] text-sm">{balanceError}</p>
              )}

              {balanceMsg && (
                <div className="flex items-center gap-2 text-[#22C55E] text-sm">
                  <CheckCircle size={16} />
                  {balanceMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={balanceSaving}
                className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {balanceSaving ? 'Saving...' : 'Save Balance'}
              </button>

            </form>
          </SectionCard>

          {/* Change Password */}
          <SectionCard title="">
            <SectionHeader
              icon={Lock}
              title="Change Password"
              subtitle="Update your login password"
            />
            <form onSubmit={handlePasswordSave} className="space-y-4">

              <FormField label="New Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
                />
              </FormField>

              <FormField label="Confirm New Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))}
                />
              </FormField>

              {passwordError && (
                <p className="text-[#EF4444] text-sm">{passwordError}</p>
              )}

              {passwordMsg && (
                <div className="flex items-center gap-2 text-[#22C55E] text-sm">
                  <CheckCircle size={16} />
                  {passwordMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {passwordSaving ? 'Saving...' : 'Update Password'}
              </button>

            </form>
          </SectionCard>

        </div>
      </div>
    </MainLayout>
  )
}