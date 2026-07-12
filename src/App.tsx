import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SurveyMobile from './pages/SurveyMobile'
import SurveyWeb from './pages/SurveyWeb'
import Dashboard from './pages/Dashboard'
import Alertas from './pages/Alertas'
import Estudiantes from './pages/Estudiantes'
import Cursos from './pages/Cursos'
import Login from './pages/Login'
import { ComingSoon } from './components/dashboard/Shell'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveyMobile />} />
        <Route path="/survey" element={<SurveyMobile />} />
        <Route path="/survey-web" element={<SurveyWeb />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/alertas" element={<Alertas />} />
        <Route path="/dashboard/estudiantes" element={<Estudiantes />} />
        <Route path="/dashboard/cursos" element={<Cursos />} />
        <Route path="/dashboard/bienestar" element={<ComingSoon title="Bienestar general" />} />
        <Route path="/dashboard/emociones" element={<ComingSoon title="Emociones y hábitos" />} />
        <Route path="/dashboard/factores" element={<ComingSoon title="Factores de riesgo" />} />
        <Route path="/dashboard/comparaciones" element={<ComingSoon title="Comparaciones" />} />
        <Route path="/dashboard/respuestas" element={<ComingSoon title="Respuestas abiertas" />} />
        <Route path="/dashboard/planes" element={<ComingSoon title="Planes de acción" />} />
      </Routes>
    </BrowserRouter>
  )
}
