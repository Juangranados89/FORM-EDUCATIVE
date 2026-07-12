import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import PptxGenJS from 'pptxgenjs'

const COLORS = {
  navy: '0B1B46',
  primary: '6754E8',
  blue: '5B8DEF',
  green: '45B36B',
  yellow: 'FFD166',
  coral: 'FF6B7A',
  muted: '64748B',
  line: 'E2E8F0',
  bg: 'F6FAFF',
  white: 'FFFFFF',
}

const safe = (value, fallback = '') => String(value ?? fallback).trim()
const trim = (value, max = 180) => {
  const text = safe(value)
  return text.length <= max ? text : `${text.slice(0, max - 1).trim()}…`
}

export function isActionPlan(plan) {
  return Boolean(
    plan &&
      typeof plan.titulo === 'string' &&
      typeof plan.resumen === 'string' &&
      Array.isArray(plan.objetivos) &&
      Array.isArray(plan.actividades) &&
      Array.isArray(plan.indicadores) &&
      Array.isArray(plan.recursos) &&
      typeof plan.nota_seguridad === 'string',
  )
}

function bullet(text, color = COLORS.navy) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 90, line: 290 },
    children: [new TextRun({ text: safe(text), color, size: 21 })],
  })
}

function heading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, bold: true, color: COLORS.primary, size: 30 })],
  })
}

function activityTable(activities) {
  const widths = [2800, 950, 1450, 1300, 2860]
  const cell = (text, width, header = false) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      shading: header ? { type: ShadingType.CLEAR, fill: COLORS.primary } : undefined,
      children: [
        new Paragraph({
          spacing: { after: 0, line: 250 },
          children: [
            new TextRun({
              text: safe(text, '—'),
              bold: header,
              color: header ? COLORS.white : COLORS.navy,
              size: header ? 18 : 17,
            }),
          ],
        }),
      ],
    })
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
      bottom: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
      left: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
      right: { style: BorderStyle.SINGLE, color: COLORS.line, size: 4 },
      insideHorizontal: { style: BorderStyle.SINGLE, color: COLORS.line, size: 3 },
      insideVertical: { style: BorderStyle.SINGLE, color: COLORS.line, size: 3 },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Actividad', 'Plazo', 'Responsable', 'Dirigido a', 'Descripción'].map((x, i) =>
          cell(x, widths[i], true),
        ),
      }),
      ...activities.map(
        (a) =>
          new TableRow({
            children: [a.nombre, a.plazo, a.responsable, a.dirigido_a, a.descripcion].map((x, i) =>
              cell(x, widths[i]),
            ),
          }),
      ),
    ],
  })
}

export async function buildActionPlanDocx(plan, context) {
  const generated = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date())
  const children = [
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'BIENESTAR ESCOLAR', bold: true, color: COLORS.primary, size: 22 })],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: safe(plan.titulo), bold: true, color: COLORS.navy, size: 42 })],
    }),
    new Paragraph({
      spacing: { after: 220 },
      children: [
        new TextRun({
          text: `${safe(context?.alcance, 'Plan institucional')} · ${generated}`,
          color: COLORS.muted,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: 'F0EEFF' },
      indent: { left: 180, right: 180 },
      spacing: { before: 80, after: 180, line: 300 },
      children: [new TextRun({ text: safe(plan.resumen), color: COLORS.navy, size: 22 })],
    }),
  ]

  if (context?.total) {
    children.push(
      heading('Panorama que orienta el plan'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              ['Respuestas', context.total, 'EDF3FF'],
              ['Riesgo alto', context.risk?.alto ?? 0, 'FFF0F2'],
              ['Casos críticos', context.criticos ?? 0, 'FFF7DC'],
              ['Solicitan apoyo', context.quierenApoyo ?? 0, 'ECF9F0'],
            ].map(
              ([label, value, fill]) =>
                new TableCell({
                  width: { size: 2340, type: WidthType.DXA },
                  margins: { top: 120, bottom: 120, left: 140, right: 140 },
                  shading: { type: ShadingType.CLEAR, fill },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: String(value), bold: true, size: 28, color: COLORS.navy })] }),
                    new Paragraph({ children: [new TextRun({ text: String(label), size: 17, color: COLORS.muted })] }),
                  ],
                }),
            ),
          }),
        ],
      }),
    )
  }

  children.push(
    heading('Objetivos'),
    ...plan.objetivos.map((x) => bullet(x)),
    heading('Plan de actividades'),
    activityTable(plan.actividades),
    heading('Indicadores de seguimiento'),
    ...plan.indicadores.map((x) => bullet(x, COLORS.primary)),
    heading('Recursos necesarios'),
    ...plan.recursos.map((x) => bullet(x, COLORS.navy)),
    heading('Validación y seguridad'),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: 'FFF5D6' },
      indent: { left: 180, right: 180 },
      spacing: { before: 80, after: 100, line: 290 },
      children: [new TextRun({ text: safe(plan.nota_seguridad), color: COLORS.navy, size: 20 })],
    }),
  )

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Aptos', size: 21, color: COLORS.navy } } },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Aptos Display', size: 30, bold: true, color: COLORS.primary },
          paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 0 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Bienestar Escolar · ', color: COLORS.muted, size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], color: COLORS.muted, size: 16 }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })
  return Packer.toBuffer(doc)
}

function addTitle(slide, title, kicker) {
  slide.addText(kicker, { x: 0.7, y: 0.42, w: 11.9, h: 0.25, fontFace: 'Aptos', fontSize: 11, bold: true, color: COLORS.primary, charSpacing: 1.3 })
  slide.addText(trim(title, 95), { x: 0.7, y: 0.82, w: 11.9, h: 0.65, fontFace: 'Aptos Display', fontSize: 26, bold: true, color: COLORS.navy, margin: 0, breakLine: false, fit: 'shrink' })
  slide.addShape('line', { x: 0.7, y: 1.6, w: 11.9, h: 0, line: { color: COLORS.line, width: 1 } })
}

function addFooter(slide, index) {
  slide.addText('Bienestar Escolar', { x: 0.7, y: 7.08, w: 2.2, h: 0.16, fontFace: 'Aptos', fontSize: 8, color: COLORS.muted, margin: 0 })
  slide.addText(String(index), { x: 12.05, y: 7.08, w: 0.55, h: 0.16, fontFace: 'Aptos', fontSize: 8, color: COLORS.muted, align: 'right', margin: 0 })
}

function addBullets(slide, items, x, y, w, h, color = COLORS.navy) {
  const runs = items.slice(0, 7).map((item) => ({
    text: trim(item, 155),
    options: { bullet: { indent: 14 }, hanging: 4, breakLine: true, color },
  }))
  slide.addText(runs, { x, y, w, h, fontFace: 'Aptos', fontSize: 17, color, breakLine: false, valign: 'mid', margin: 0.08, paraSpaceAfterPt: 12, fit: 'shrink' })
}

export async function buildActionPlanPptx(plan, context) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'Bienestar Escolar'
  pptx.subject = 'Plan de acción de bienestar escolar'
  pptx.title = safe(plan.titulo)
  pptx.company = 'Bienestar Escolar'
  pptx.lang = 'es-CO'
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'es-CO',
  }

  let page = 1
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.bg }
  slide.addShape('rect', { x: 0, y: 0, w: 4.45, h: 7.5, line: { color: COLORS.primary, transparency: 100 }, fill: { color: COLORS.primary } })
  slide.addText('PLAN DE ACCIÓN', { x: 0.72, y: 0.72, w: 3.1, h: 0.3, fontFace: 'Aptos', fontSize: 13, bold: true, color: COLORS.white, charSpacing: 1.6, margin: 0 })
  slide.addText(trim(plan.titulo, 110), { x: 0.72, y: 1.35, w: 3.1, h: 2.55, fontFace: 'Aptos Display', fontSize: 29, bold: true, color: COLORS.white, margin: 0, valign: 'mid', fit: 'shrink' })
  slide.addText(safe(context?.alcance, 'Toda la institución'), { x: 0.72, y: 5.85, w: 3.1, h: 0.34, fontFace: 'Aptos', fontSize: 14, color: 'E8E5FF', margin: 0 })
  slide.addText(trim(plan.resumen, 470), { x: 5.15, y: 1.35, w: 7.15, h: 3.0, fontFace: 'Aptos', fontSize: 22, color: COLORS.navy, margin: 0.02, valign: 'mid', breakLine: false, fit: 'shrink' })
  slide.addText('Una ruta concreta para acompañar, actuar y medir avances.', { x: 5.15, y: 5.2, w: 6.6, h: 0.7, fontFace: 'Aptos Display', fontSize: 19, bold: true, color: COLORS.primary, margin: 0 })
  addFooter(slide, page++)

  if (context?.total) {
    const s = pptx.addSlide()
    s.background = { color: COLORS.white }
    addTitle(s, 'Las prioridades se concentran en acompañamiento y respuesta oportuna', 'PUNTO DE PARTIDA')
    const metrics = [
      ['Respuestas', context.total, COLORS.blue],
      ['Riesgo alto', context.risk?.alto ?? 0, COLORS.coral],
      ['Casos críticos', context.criticos ?? 0, COLORS.yellow],
      ['Solicitan apoyo', context.quierenApoyo ?? 0, COLORS.green],
    ]
    metrics.forEach(([label, value, color], i) => {
      const x = 0.75 + i * 3.08
      s.addShape('roundRect', { x, y: 2.0, w: 2.65, h: 1.55, rectRadius: 0.08, line: { color: String(color), transparency: 76, width: 1 }, fill: { color: String(color), transparency: 88 } })
      s.addText(String(value), { x: x + 0.2, y: 2.3, w: 2.25, h: 0.5, fontFace: 'Aptos Display', fontSize: 29, bold: true, color: COLORS.navy, align: 'center', margin: 0 })
      s.addText(String(label), { x: x + 0.2, y: 2.92, w: 2.25, h: 0.25, fontFace: 'Aptos', fontSize: 12, color: COLORS.muted, align: 'center', margin: 0 })
    })
    const factors = (context.factores || []).slice(0, 4)
    s.addText('Factores que requieren mayor atención', { x: 0.75, y: 4.25, w: 4.6, h: 0.35, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: COLORS.navy, margin: 0 })
    factors.forEach((factor, i) => {
      const y = 4.85 + i * 0.43
      s.addText(trim(factor.factor, 38), { x: 0.75, y, w: 3.2, h: 0.23, fontFace: 'Aptos', fontSize: 12, color: COLORS.navy, margin: 0 })
      s.addShape('rect', { x: 4.05, y: y + 0.02, w: 5.8, h: 0.14, line: { color: COLORS.line, transparency: 100 }, fill: { color: COLORS.line } })
      s.addShape('rect', { x: 4.05, y: y + 0.02, w: Math.max(0.06, 5.8 * Math.min(100, factor.pct) / 100), h: 0.14, line: { color: COLORS.primary, transparency: 100 }, fill: { color: COLORS.primary } })
      s.addText(`${factor.pct}%`, { x: 10.05, y: y - 0.03, w: 0.7, h: 0.22, fontFace: 'Aptos', fontSize: 11, bold: true, color: COLORS.primary, margin: 0 })
    })
    addFooter(s, page++)
  }

  const objectives = pptx.addSlide()
  objectives.background = { color: COLORS.white }
  addTitle(objectives, 'Los objetivos convierten los hallazgos en compromisos claros', 'DIRECCIÓN DEL PLAN')
  objectives.addShape('rect', { x: 0.75, y: 2.0, w: 0.12, h: 3.95, line: { color: COLORS.primary, transparency: 100 }, fill: { color: COLORS.primary } })
  addBullets(objectives, plan.objetivos, 1.15, 2.0, 10.8, 4.05, COLORS.navy)
  addFooter(objectives, page++)

  const chunks = []
  for (let i = 0; i < plan.actividades.length; i += 2) chunks.push(plan.actividades.slice(i, i + 2))
  chunks.forEach((activities, chunkIndex) => {
    const s = pptx.addSlide()
    s.background = { color: COLORS.bg }
    addTitle(s, `Cada actividad tiene un responsable, un público y un plazo`, `PLAN DE TRABAJO · ${chunkIndex + 1} DE ${chunks.length}`)
    activities.forEach((a, i) => {
      const y = 1.95 + i * 2.45
      s.addShape('roundRect', { x: 0.75, y, w: 11.85, h: 2.05, rectRadius: 0.06, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.white } })
      s.addText(trim(a.nombre, 75), { x: 1.05, y: y + 0.24, w: 7.1, h: 0.4, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: COLORS.navy, margin: 0, fit: 'shrink' })
      s.addText(trim(a.descripcion, 250), { x: 1.05, y: y + 0.78, w: 7.1, h: 0.86, fontFace: 'Aptos', fontSize: 14, color: COLORS.muted, margin: 0, valign: 'top', fit: 'shrink' })
      s.addText('RESPONSABLE', { x: 8.65, y: y + 0.28, w: 1.4, h: 0.18, fontFace: 'Aptos', fontSize: 8, bold: true, color: COLORS.primary, margin: 0 })
      s.addText(trim(a.responsable, 45), { x: 8.65, y: y + 0.52, w: 3.4, h: 0.35, fontFace: 'Aptos', fontSize: 12, bold: true, color: COLORS.navy, margin: 0, fit: 'shrink' })
      s.addText('PLAZO · DIRIGIDO A', { x: 8.65, y: y + 1.05, w: 2.2, h: 0.18, fontFace: 'Aptos', fontSize: 8, bold: true, color: COLORS.primary, margin: 0 })
      s.addText(`${trim(a.plazo, 25)} · ${trim(a.dirigido_a, 38)}`, { x: 8.65, y: y + 1.3, w: 3.4, h: 0.35, fontFace: 'Aptos', fontSize: 12, color: COLORS.navy, margin: 0, fit: 'shrink' })
    })
    addFooter(s, page++)
  })

  const tracking = pptx.addSlide()
  tracking.background = { color: COLORS.white }
  addTitle(tracking, 'El seguimiento debe mostrar avance, aprendizaje y ajustes', 'MEDICIÓN')
  tracking.addText('Indicadores', { x: 0.75, y: 2.0, w: 5.5, h: 0.4, fontFace: 'Aptos Display', fontSize: 21, bold: true, color: COLORS.primary, margin: 0 })
  addBullets(tracking, plan.indicadores, 0.75, 2.6, 5.5, 3.55)
  tracking.addShape('line', { x: 6.65, y: 2.0, w: 0, h: 4.2, line: { color: COLORS.line, width: 1 } })
  tracking.addText('Recursos', { x: 7.05, y: 2.0, w: 5.1, h: 0.4, fontFace: 'Aptos Display', fontSize: 21, bold: true, color: COLORS.green, margin: 0 })
  addBullets(tracking, plan.recursos, 7.05, 2.6, 5.1, 3.55)
  addFooter(tracking, page++)

  const close = pptx.addSlide()
  close.background = { color: COLORS.navy }
  close.addText('PRÓXIMO PASO', { x: 0.75, y: 0.75, w: 3.2, h: 0.3, fontFace: 'Aptos', fontSize: 12, bold: true, color: 'BDB5FF', charSpacing: 1.5, margin: 0 })
  close.addText('Validar, asignar responsables y activar el acompañamiento.', { x: 0.75, y: 1.55, w: 10.9, h: 1.45, fontFace: 'Aptos Display', fontSize: 32, bold: true, color: COLORS.white, margin: 0, fit: 'shrink' })
  close.addShape('roundRect', { x: 0.75, y: 4.05, w: 11.1, h: 1.55, rectRadius: 0.06, line: { color: COLORS.yellow, transparency: 65, width: 1 }, fill: { color: COLORS.yellow, transparency: 88 } })
  close.addText(trim(plan.nota_seguridad, 390), { x: 1.05, y: 4.38, w: 10.5, h: 0.85, fontFace: 'Aptos', fontSize: 17, color: COLORS.white, margin: 0, valign: 'mid', fit: 'shrink' })
  addFooter(close, page++)

  return pptx.write({ outputType: 'nodebuffer' })
}
