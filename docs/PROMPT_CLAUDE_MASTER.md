# ENCUESTAS-EDU — Prompt maestro para Claude

Repositorio objetivo: https://github.com/Juangranados89/ENCUESTAS-EDU.git

## Stack recomendado

Usar **TypeScript + React + Vite**.

Librerías recomendadas:
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts
- React Hook Form
- Zod
- Supabase/PostgreSQL o Node.js + Prisma + PostgreSQL

## Enfoque de lenguaje

Si se capturan nombre y apellido, NO usar la palabra anónimo. Usar **confidencial**.

Evitar: “formulario de suicidio”, “riesgo suicida” visible para alumnos, “diagnóstico”, “paciente”.

Usar:
- Bienestar Escolar
- Queremos saber cómo te sientes
- No hay respuestas buenas ni malas
- Tu información es confidencial
- Puedes pedir ayuda
- No estás solo(a)
- Tu bienestar importa

## Módulos

1. Formulario móvil amigable para alumnos.
2. Formulario web front institucional.
3. Panel de instrumentos para orientador/coordinador.

## Rutas

- `/`
- `/survey`
- `/survey-web`
- `/dashboard`

## Estructura sugerida

```txt
ENCUESTAS-EDU/
  src/
    assets/
      mobile/
      web/
      dashboard/
    components/
      ui/
      survey/
      dashboard/
      layout/
    features/
      survey/
      analytics/
      risk/
    lib/
      scoring/
      validation/
      constants/
    pages/
      Home.tsx
      SurveyMobile.tsx
      SurveyWeb.tsx
      Dashboard.tsx
  docs/
    PROMPT_CLAUDE.md
    DESIGN_SYSTEM.md
    DATA_MODEL.md
  public/assets/
```

## Pantallas obligatorias

### Formulario móvil
- Bienvenida
- Datos estudiante: nombre, apellido, grado, curso, jornada, rango de edad
- Preguntas emocionales
- Comentario opcional
- Gracias
- Ayuda

### Web front
- Sidebar de pasos
- Card central de formulario
- Columna derecha con ilustración y mensajes
- Barra inferior de privacidad

### Dashboard
- KPIs
- Filtros por fecha, grado, curso, jornada
- Tendencia de bienestar
- Distribución de riesgo
- Factores frecuentes
- Nube de palabras
- Resultados por curso
- Alertas priorizadas
- Exportar Excel/PDF

## Modelo inicial

```ts
type StudentProfile = {
  firstName?: string;
  lastName?: string;
  grade: string;
  course: string;
  shift: "mañana" | "tarde";
  ageRange: "10-11" | "12-13" | "14-15" | "16-18";
  gender?: "femenino" | "masculino" | "otro" | "prefiero_no_decirlo";
};

type RiskLevel = "bajo" | "moderado" | "alto";
```

## Scoring base

Cada pregunta cerrada: 0 a 4 puntos.

- 0–8: bajo
- 9–17: moderado
- 18+: alto

Este scoring debe validarse con orientación escolar o psicología antes de producción.

## Tokens visuales

```css
--bg: #F6FAFF;
--surface: #FFFFFF;
--ink: #0B1B46;
--muted: #64748B;
--primary: #6754E8;
--primary-2: #5B8DEF;
--green: #45B36B;
--yellow: #FFD166;
--orange: #FF9F43;
--coral: #FF6B7A;
--line: #E2E8F0;
--radius-xl: 24px;
--shadow-soft: 0 12px 32px rgba(15, 23, 42, .08);
```

## Instrucción de ejecución para Claude

1. Clonar el repo.
2. Crear Vite React TypeScript.
3. Instalar Tailwind, shadcn/ui, lucide-react, recharts, react-hook-form, zod.
4. Copiar PNGs a `/public/assets`.
5. Crear componentes reutilizables.
6. Implementar `/survey`, `/survey-web`, `/dashboard`.
7. Mantener tono amable, escolar y no clínico.
8. Usar “confidencial” porque se capturan nombre y apellido.
9. Crear data mock para dashboard.
10. Dejar listo para backend PostgreSQL.
