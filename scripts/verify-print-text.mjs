/**
 * 验证打印输出的 PDF 文字是否可选中/可提取（AI/ATS 可检索）。
 *
 * 用法：先启动 dev server，再运行：
 *   node scripts/verify-print-text.mjs
 *
 * 脚本会：
 *  1. 向 localStorage 播种一份超过一页 A4 的长简历
 *  2. 走真实 UI 流程：加载已保存简历 → 预览页
 *  3. 用无头 Chrome 生成两份 PDF：
 *     - fixed.pdf   当前（修复后）CSS
 *     - old-rule.pdf 注入旧的 `break-inside: avoid` 规则（对照组）
 *  4. 用 pdfjs 提取两份 PDF 的文本，对比探针文字是否可提取
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'out')
const BASE_URL = 'http://localhost:5175'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

// ===== 一份超过一页 A4 的测试简历 =====
const RESUME = {
  personal: {
    fullName: '张三',
    title: '高级前端工程师',
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
    location: '北京',
    github: 'github.com/zhangsan',
    linkedin: '',
    website: 'zhangsan.dev',
    telegram: '',
    photo: '',
  },
  summary:
    '拥有 8 年前端开发经验的高级前端工程师，专注于中大型 Web 应用的架构设计与性能优化。曾主导多个千万级用户产品的核心模块开发，擅长 Vue/React 技术栈、工程化体系建设与团队协作。对用户体验与代码质量有较高追求，热衷开源社区与技术分享。',
  skills: [
    { category: '编程语言', tags: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Node.js', 'Python', 'Go'] },
    { category: '框架 & 库', tags: ['Vue 2/3', 'React', 'Nuxt', 'Next.js', 'Pinia', 'Vuex', 'Tailwind CSS', 'Element Plus'] },
    { category: '工具 & 平台', tags: ['Vite', 'Webpack', 'Git', 'Docker', 'Kubernetes', 'CI/CD', 'Nginx', 'Linux'] },
    { category: '数据库', tags: ['MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'Elasticsearch'] },
  ],
  experiences: [
    {
      id: 'e1',
      company: '字节跳动',
      position: '高级前端工程师',
      startDate: '2021-06',
      endDate: '',
      current: true,
      description: '负责抖音电商中台的前端架构设计与核心模块开发，带领 5 人小组完成多个大型项目的交付。',
      highlights: [
        '主导微前端架构改造，将 12 个业务子系统接入统一底座，首屏加载时间降低 45%',
        '搭建组件库与 CI/CD 流水线，发布效率提升 3 倍',
        '推动 TypeScript 全面落地，线上缺陷率下降 30%',
      ],
    },
    {
      id: 'e2',
      company: '阿里巴巴',
      position: '前端工程师',
      startDate: '2018-03',
      endDate: '2021-05',
      current: false,
      description: '参与淘宝直播核心链路开发，负责直播间搭建器与互动玩法模块。',
      highlights: [
        '实现直播间低代码搭建方案，运营配置效率提升 80%',
        '优化长列表渲染性能，百万级商品列表流畅滚动',
        '获得集团技术创新奖',
      ],
    },
    {
      id: 'e3',
      company: '美团',
      position: '前端开发工程师',
      startDate: '2016-07',
      endDate: '2018-02',
      current: false,
      description: '负责外卖商家端 Web 应用开发与性能优化。',
      highlights: [
        '重构订单管理模块，代码体积减少 40%',
        '引入服务端渲染，商家端首屏时间从 3s 降至 1.2s',
      ],
    },
    {
      id: 'e4',
      company: '创业公司 X',
      position: '全栈开发实习生',
      startDate: '2015-06',
      endDate: '2016-06',
      current: false,
      description: '参与公司官网与后台管理系统开发，接触完整的前后端开发流程。',
      highlights: ['独立完成官网改版', '搭建后台权限系统'],
    },
  ],
  projects: [
    {
      id: 'p1',
      name: '开源组件库 Aurora UI',
      description: '基于 Vue 3 + TypeScript 的企业级组件库，支持主题定制与按需加载，npm 周下载量 2 万+。',
      techStack: ['Vue 3', 'TypeScript', 'Vite', 'Vitest', 'Storybook'],
      url: 'https://aurora-ui.dev',
      githubUrl: 'https://github.com/zhangsan/aurora-ui',
      startDate: '2022-01',
      endDate: '',
      current: true,
    },
    {
      id: 'p2',
      name: '实时协作白板',
      description: '基于 CRDT 算法的多人实时协作白板应用，支持离线编辑与冲突自动合并，服务端采用 WebSocket + Redis。',
      techStack: ['React', 'CRDT', 'WebSocket', 'Node.js', 'Redis'],
      url: '',
      githubUrl: 'https://github.com/zhangsan/collab-board',
      startDate: '2023-05',
      endDate: '2023-12',
      current: false,
    },
    {
      id: 'p3',
      name: '前端性能监控平台',
      description: '自研的前端性能与错误监控系统，支持 SourceMap 解析、性能指标分析、告警通知，日均处理数据 10 亿条。',
      techStack: ['Vue 3', 'Koa', 'ClickHouse', 'Grafana'],
      url: '',
      githubUrl: '',
      startDate: '2020-03',
      endDate: '2021-01',
      current: false,
    },
    {
      id: 'p4',
      name: '程序员简历生成器',
      description: '纯前端简历编辑器，支持多主题模板与一键打印导出 PDF，本项目即为该工具。',
      techStack: ['Vue 3', 'Pinia', 'Tailwind CSS', 'Vite'],
      url: '',
      githubUrl: 'https://github.com/zhangsan/generate-pdf-resume',
      startDate: '2024-01',
      endDate: '',
      current: true,
    },
  ],
  education: [
    {
      id: 'ed1',
      school: '清华大学',
      degree: '硕士',
      major: '计算机科学与技术',
      startDate: '2013-09',
      endDate: '2016-06',
    },
    {
      id: 'ed2',
      school: '武汉大学',
      degree: '学士',
      major: '软件工程',
      startDate: '2009-09',
      endDate: '2013-06',
    },
  ],
}

// ===== 提取 PDF 文本 =====
async function extractText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const loadingTask = getDocument({ data, useSystemFonts: true })
  const doc = await loadingTask.promise
  let out = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const tc = await page.getTextContent()
    out += `\n===== 第 ${i} 页 =====\n`
    out += tc.items.map((it) => it.str).join('')
  }
  await loadingTask.destroy()
  return out
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  // 1. 打开应用并播种 localStorage
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
  await page.evaluate((savedList) => {
    localStorage.setItem('resume-builder', JSON.stringify({ savedList }))
  }, [{ id: 'test-1', name: '测试简历', createdAt: '2026/8/28 10:00:00', data: RESUME }])
  await page.reload({ waitUntil: 'networkidle2' })

  // 2. 点击已保存的简历，加载到表单
  const loaded = await page.evaluate(() => {
    const li = [...document.querySelectorAll('aside li')].find((el) =>
      el.textContent.includes('测试简历'),
    )
    if (li) {
      li.click()
      return true
    }
    return false
  })
  if (!loaded) throw new Error('未找到已保存的简历条目')
  await new Promise((r) => setTimeout(r, 500))

  // 3. 点击「预览 & 打印」进入预览页
  const went = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('预览 & 打印'),
    )
    if (btn) {
      btn.click()
      return true
    }
    return false
  })
  if (!went) throw new Error('未找到「预览 & 打印」按钮')
  await page.waitForFunction(() => !!document.querySelector('.print-area'), { timeout: 10000 })
  await new Promise((r) => setTimeout(r, 2000)) // 等 snapToPageHeight 与字体加载

  // 4. 生成两份 PDF：修复后 vs 注入旧规则
  const fixedBuf = await page.pdf({ printBackground: true, preferCSSPageSize: true })
  fs.writeFileSync(path.join(OUT_DIR, 'fixed.pdf'), fixedBuf)

  await page.addStyleTag({
    content:
      '@media print { .print-area aside, .print-area main { page-break-inside: avoid !important; } }',
  })
  const oldBuf = await page.pdf({ printBackground: true, preferCSSPageSize: true })
  fs.writeFileSync(path.join(OUT_DIR, 'old-rule.pdf'), oldBuf)

  await browser.close()

  // 5. 提取文本并对比
  const fixedText = await extractText(path.join(OUT_DIR, 'fixed.pdf'))
  const oldText = await extractText(path.join(OUT_DIR, 'old-rule.pdf'))

  const probes = [
    '张三', '高级前端工程师', '联系方式', '技术技能', '教育背景',
    '工作经历', '字节跳动', '项目经历', '开源组件库 Aurora UI',
    '清华大学', 'TypeScript', 'Vue 3', 'Redis', 'Elasticsearch',
  ]

  console.log('\n========== 文字可提取性对比 ==========')
  console.log(`fixed.pdf:    ${fixedText.length} 字符可提取`)
  console.log(`old-rule.pdf: ${oldText.length} 字符可提取\n`)

  let pass = true
  for (const probe of probes) {
    const inFixed = fixedText.includes(probe)
    const inOld = oldText.includes(probe)
    console.log(
      `"${probe}"  fixed: ${inFixed ? '✅' : '❌'}   old-rule: ${inOld ? '✅' : '❌'}`,
    )
    if (!inFixed) pass = false
  }

  console.log('\n========== 结论 ==========')
  console.log(pass ? '✅ 修复后 PDF 文字全部可提取，AI/ATS 可检索' : '❌ 修复后仍有文字无法提取！')
  process.exit(pass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
