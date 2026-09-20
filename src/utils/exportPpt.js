import PptxGenJS from 'pptxgenjs'
import { fmtDate } from './format.js'

/**
 * 将简历数据导出为 A4 纵向（与打印预览一致）演示风格的 PPTX。
 * 一页一主题：封面 → 关于我+教育背景 → 技术技能 → 工作经历 → 项目经历。
 * 所有文字均为真文本（可选中、可被 AI 检索）。
 */

// A4 纵向：210mm × 297mm ≈ 8.27in × 11.69in
const SLIDE_W = 8.27
const SLIDE_H = 11.69
const MARGIN = 0.6
const CONTENT_W = SLIDE_W - MARGIN * 2
const FONT = '微软雅黑'

// 与网页版一致的配色
const C = {
  dark: '1A1A2E',      // resume-dark
  accent: '4FC3F7',    // resume-accent
  cyan: '22D3EE',
  gray900: '1F2937',
  gray600: '4B5563',
  gray500: '6B7280',
  gray400: '9CA3AF',
  blueLink: '2563EB',
  tagBg: 'E8F4FD',     // resume-tag
  tagText: '1565C0',   // resume-tag-text
  // 技能四类标签配色（与表单页一致）
  skillColors: [
    { bg: 'DBEAFE', fg: '1D4ED8' },   // 编程语言 - 蓝
    { bg: 'EDE9FE', fg: '6D28D9' },   // 框架 & 库 - 紫
    { bg: 'D1FAE5', fg: '047857' },   // 工具 & 平台 - 绿
    { bg: 'FEF3C7', fg: 'B45309' },   // 数据库 - 黄
  ],
}

// 估算文字宽度（pt）：中文/全角按字号全宽，其余按 0.55 倍
function textWpt(text, fontSize) {
  let w = 0
  for (const ch of text) {
    const code = ch.codePointAt(0)
    const fullWidth =
      (code >= 0x2e80 && code <= 0x9fff) ||   // CJK 汉字/部首
      (code >= 0xf900 && code <= 0xfaff) ||   // CJK 兼容汉字
      (code >= 0xff00 && code <= 0xffef)      // 全角字符
    w += fullWidth ? fontSize : fontSize * 0.55
  }
  return w
}

// 章节标题（标题文字 + 青色短横线），返回正文起始 y
function addSectionTitle(slide, title) {
  slide.addText(title, {
    x: MARGIN, y: 0.4, w: CONTENT_W, h: 0.35,
    fontSize: 16, bold: true, color: C.gray900, fontFace: FONT, charSpacing: 1,
  })
  slide.addShape('rect', {
    x: MARGIN, y: 0.82, w: 0.5, h: 0.035,
    fill: { color: C.cyan }, line: { type: 'none' },
  })
  return 1.1
}

// 标签胶囊流式排布（自动换行），返回下一行起始 y
function layoutPills(slide, tags, startY, style) {
  const fontSize = 12
  const gap = 0.12
  const rowH = 0.42
  let x = MARGIN
  let y = startY
  const pills = []
  for (const tag of tags) {
    const w = textWpt(tag, fontSize) / 72 + 0.28
    if (x + w > SLIDE_W - MARGIN) {
      x = MARGIN
      y += rowH
    }
    pills.push({ tag, x, y, w })
    x += w + gap
  }
  pills.forEach((p) => {
    slide.addShape('roundRect', {
      x: p.x, y: p.y, w: p.w, h: 0.3,
      fill: { color: style.bg }, line: { type: 'none' }, rectRadius: 0.15,
    })
    slide.addText(p.tag, {
      x: p.x, y: p.y, w: p.w, h: 0.3,
      fontSize, color: style.fg, fontFace: FONT, align: 'center', valign: 'middle',
    })
  })
  return y + 0.3 + 0.14
}

// ===== 第 1 页：封面 =====
function addCoverSlide(pptx, resume) {
  const slide = pptx.addSlide()
  slide.background = { color: C.dark }

  const p = resume.personal
  let y = 3.0

  if (p.photo) {
    slide.addImage({ data: p.photo, x: (SLIDE_W - 1.5) / 2, y: 1.4, w: 1.5, h: 1.5, rounding: true })
    y = 3.35
  }

  if (p.fullName) {
    slide.addText(p.fullName, {
      x: 0.5, y, w: SLIDE_W - 1, h: 0.75,
      fontSize: 36, bold: true, color: 'FFFFFF', fontFace: FONT, align: 'center',
    })
    y += 0.78
  }
  if (p.title) {
    slide.addText(p.title, {
      x: 0.5, y, w: SLIDE_W - 1, h: 0.45,
      fontSize: 17, color: C.accent, fontFace: FONT, align: 'center',
    })
    y += 0.56
  }

  const contact = [p.email, p.phone, p.location, p.github, p.linkedin, p.website, p.telegram]
    .filter(Boolean)
    .join('  ·  ')
  if (contact) {
    slide.addText(contact, {
      x: 0.8, y: Math.max(y + 0.2, 4.8), w: SLIDE_W - 1.6, h: 1.4,
      fontSize: 12, color: C.gray400, fontFace: FONT, align: 'center', valign: 'top',
      lineSpacingMultiple: 1.3,
    })
  }

  // 底部装饰色带
  slide.addShape('rect', {
    x: 0, y: SLIDE_H - 0.06, w: SLIDE_W, h: 0.06,
    fill: { color: C.accent }, line: { type: 'none' },
  })
}

// ===== 第 2 页：关于我 + 教育背景 =====
function addAboutSlide(pptx, resume) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  let y = addSectionTitle(slide, '关于我')

  if (resume.summary) {
    slide.addText(resume.summary, {
      x: MARGIN, y, w: CONTENT_W, h: 1.6,
      fontSize: 13, color: C.gray600, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.35,
    })
    y += 1.75
  }

  const edus = resume.education.filter((e) => e.school)
  if (edus.length > 0) {
    y += 0.15
    slide.addText('教育背景', {
      x: MARGIN, y, w: CONTENT_W, h: 0.35,
      fontSize: 16, bold: true, color: C.gray900, fontFace: FONT, charSpacing: 1,
    })
    slide.addShape('rect', {
      x: MARGIN, y: y + 0.42, w: 0.5, h: 0.035,
      fill: { color: C.cyan }, line: { type: 'none' },
    })
    y += 0.7

    for (const edu of edus.slice(0, 4)) {
      slide.addText(edu.school, {
        x: MARGIN, y, w: CONTENT_W * 0.62, h: 0.3,
        fontSize: 13, bold: true, color: C.gray900, fontFace: FONT,
      })
      if (edu.startDate) {
        slide.addText(
          `${fmtDate(edu.startDate)} — ${edu.endDate ? fmtDate(edu.endDate) : '至今'}`,
          {
            x: MARGIN + CONTENT_W * 0.62, y, w: CONTENT_W * 0.38, h: 0.3,
            fontSize: 10, color: C.gray400, fontFace: FONT, align: 'right',
          },
        )
      }
      slide.addText([edu.degree, edu.major].filter(Boolean).join(' · '), {
        x: MARGIN, y: y + 0.29, w: CONTENT_W, h: 0.25,
        fontSize: 11, color: C.gray500, fontFace: FONT,
      })
      y += 0.62
    }
  }
}

// ===== 技术技能 =====
function addSkillsSlide(pptx, resume) {
  const cats = resume.skills.filter((c) => c.tags.length > 0)
  if (cats.length === 0) return

  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  let y = addSectionTitle(slide, '技术技能')

  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i]
    slide.addText(cat.category, {
      x: MARGIN, y, w: CONTENT_W, h: 0.28,
      fontSize: 11, bold: true, color: C.gray500, fontFace: FONT,
    })
    y = layoutPills(slide, cat.tags, y + 0.32, C.skillColors[i % C.skillColors.length])
  }
}

// ===== 工作经历（每页最多 3 条） =====
function addExperienceSlides(pptx, resume) {
  const exps = resume.experiences.filter((e) => e.company || e.position)
  for (let i = 0; i < exps.length; i += 3) {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    let y = addSectionTitle(slide, `工作经历${exps.length > 3 ? `（${i / 3 + 1}）` : ''}`)

    for (const exp of exps.slice(i, i + 3)) {
      slide.addText(exp.position || '职位', {
        x: MARGIN, y, w: CONTENT_W * 0.6, h: 0.32,
        fontSize: 14, bold: true, color: C.gray900, fontFace: FONT,
      })
      if (exp.startDate) {
        slide.addText(
          `${fmtDate(exp.startDate)} — ${exp.current ? '至今' : fmtDate(exp.endDate)}`,
          {
            x: MARGIN + CONTENT_W * 0.6, y, w: CONTENT_W * 0.4, h: 0.32,
            fontSize: 10, color: C.gray400, fontFace: FONT, align: 'right',
          },
        )
      }
      y += 0.34

      if (exp.company) {
        slide.addText(exp.company, {
          x: MARGIN, y, w: CONTENT_W, h: 0.26,
          fontSize: 11, color: C.gray500, fontFace: FONT,
        })
        y += 0.28
      }
      if (exp.description) {
        slide.addText(exp.description, {
          x: MARGIN, y, w: CONTENT_W, h: 0.6,
          fontSize: 11, color: C.gray500, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.25,
        })
        y += 0.65
      }
      for (const h of exp.highlights.slice(0, 4)) {
        slide.addText(`▹  ${h}`, {
          x: MARGIN, y, w: CONTENT_W, h: 0.26,
          fontSize: 11, color: C.gray600, fontFace: FONT,
        })
        y += 0.27
      }
      y += 0.28 // 条目间距
    }
  }
}

// ===== 项目经历（每页最多 3 条） =====
function addProjectSlides(pptx, resume) {
  const projs = resume.projects.filter((p) => p.name)
  for (let i = 0; i < projs.length; i += 3) {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    let y = addSectionTitle(slide, `项目经历${projs.length > 3 ? `（${i / 3 + 1}）` : ''}`)

    for (const proj of projs.slice(i, i + 3)) {
      slide.addText(proj.name, {
        x: MARGIN, y, w: CONTENT_W * 0.6, h: 0.32,
        fontSize: 14, bold: true, color: C.gray900, fontFace: FONT,
      })
      if (proj.startDate) {
        slide.addText(
          `${fmtDate(proj.startDate)} — ${proj.current ? '至今' : fmtDate(proj.endDate)}`,
          {
            x: MARGIN + CONTENT_W * 0.6, y, w: CONTENT_W * 0.4, h: 0.32,
            fontSize: 10, color: C.gray400, fontFace: FONT, align: 'right',
          },
        )
      }
      y += 0.34

      const links = []
      if (proj.url) links.push(`线上 ${proj.url}`)
      if (proj.githubUrl) links.push(`GitHub ${proj.githubUrl}`)
      if (links.length > 0) {
        slide.addText(links.join('  ·  '), {
          x: MARGIN, y, w: CONTENT_W, h: 0.24,
          fontSize: 10, color: C.blueLink, fontFace: FONT,
        })
        y += 0.28
      }
      if (proj.description) {
        slide.addText(proj.description, {
          x: MARGIN, y, w: CONTENT_W, h: 0.6,
          fontSize: 11, color: C.gray500, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.25,
        })
        y += 0.65
      }
      y = proj.techStack.length > 0
        ? layoutPills(slide, proj.techStack, y, { bg: C.tagBg, fg: C.tagText })
        : y + 0.3
      y += 0.28 // 条目间距
    }
  }
}

// ===== 入口：构建并下载 PPTX =====
export async function exportResumePpt(resume) {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'A4_PORTRAIT', width: SLIDE_W, height: SLIDE_H })
  pptx.layout = 'A4_PORTRAIT'
  pptx.title = resume.personal.fullName ? `${resume.personal.fullName} 的简历` : '简历'
  pptx.author = resume.personal.fullName || 'Dev Resume Builder'

  addCoverSlide(pptx, resume)
  addAboutSlide(pptx, resume)
  addSkillsSlide(pptx, resume)
  addExperienceSlides(pptx, resume)
  addProjectSlides(pptx, resume)

  const name = resume.personal.fullName || '简历'
  await pptx.writeFile({ fileName: `${name}-演示版.pptx` })
}
