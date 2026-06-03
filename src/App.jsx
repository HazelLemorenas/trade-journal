import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/trades" element={<div>Trade History</div>} />
        <Route path="/trades/new" element={<div>New Trade</div>} />
        <Route path="/trades/:id" element={<div>Trade Detail</div>} />
        <Route path="/insights" element={<div>Insights</div>} />
        <Route path="/playbook" element={<div>Playbook</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App