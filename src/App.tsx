import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SurveyMobile from './pages/SurveyMobile'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveyMobile />} />
        <Route path="/survey" element={<SurveyMobile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
