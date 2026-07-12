import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SurveyMobile from './pages/SurveyMobile'
import SurveyWeb from './pages/SurveyWeb'
import Dashboard from './pages/Dashboard'
import Alertas from './pages/Alertas'
import Estudiantes from './pages/Estudiantes'
import Cursos from './pages/Cursos'
import Respuestas from './pages/Respuestas'
import Bienestar from './pages/Bienestar'
import Planes from './pages/Planes'
import Emociones from './pages/Emociones'
import Factores from './pages/Factores'
import Comparaciones from './pages/Comparaciones'
import Login from './pages/Login'

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
        <Route path="/dashboard/bienestar" element={<Bienestar />} />
        <Route path="/dashboard/respuestas" element={<Respuestas />} />
        <Route path="/dashboard/planes" element={<Planes />} />
        <Route path="/dashboard/emociones" element={<Emociones />} />
        <Route path="/dashboard/factores" element={<Factores />} />
        <Route path="/dashboard/comparaciones" element={<Comparaciones />} />
      </Routes>
    </BrowserRouter>
  )
}
