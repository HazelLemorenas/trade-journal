import Sidebar from '../components/Sidebar'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}