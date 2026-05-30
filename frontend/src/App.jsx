import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import PrincipalDashboard from './pages/PrincipalDashboard'
import StudentView from './pages/StudentView'
import PublicDashboard from './pages/PublicDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/principal" element={<PrincipalDashboard />} />
        <Route path="/live/:teacherId" element={<StudentView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App