import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Employees } from './pages/Employees.tsx'
import { Placeholder } from './pages/Placeholder.tsx'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/departments" element={<Placeholder title="Departments" />} />
        <Route path="/roles" element={<Placeholder title="Roles" />} />
        <Route path="/shifts" element={<Placeholder title="Shifts" />} />
        <Route path="/attendance" element={<Placeholder title="Attendance" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </AppShell>
  )
}

export default App
