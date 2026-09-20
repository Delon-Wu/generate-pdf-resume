// 冒烟测试：用样例数据跑一遍 PPT 导出，确认无运行时错误
import { exportResumePpt } from '../src/utils/exportPpt.js'

const resume = {
  personal: {
    fullName: '张三', title: '高级前端工程师', email: 'zhangsan@example.com',
    phone: '138-0000-0000', location: '北京', github: 'github.com/zhangsan',
    linkedin: '', website: 'zhangsan.dev', telegram: '', photo: '',
  },
  summary: '拥有 8 年前端开发经验，专注中大型 Web 应用架构设计与性能优化。',
  skills: [
    { category: '编程语言', tags: ['JavaScript', 'TypeScript', 'Node.js'] },
    { category: '框架 & 库', tags: ['Vue 2/3', 'React', 'Pinia', 'Tailwind CSS'] },
    { category: '工具 & 平台', tags: ['Vite', 'Webpack', 'Docker', 'Kubernetes'] },
    { category: '数据库', tags: ['MySQL', 'Redis', 'MongoDB', 'Elasticsearch'] },
  ],
  experiences: [
    {
      id: 'e1', company: '字节跳动', position: '高级前端工程师',
      startDate: '2021-06', endDate: '', current: true,
      description: '负责电商中台前端架构设计与核心模块开发。',
      highlights: ['主导微前端架构改造，首屏加载时间降低 45%', '搭建组件库与 CI/CD 流水线'],
    },
    {
      id: 'e2', company: '阿里巴巴', position: '前端工程师',
      startDate: '2018-03', endDate: '2021-05', current: false,
      description: '参与淘宝直播核心链路开发。',
      highlights: ['实现低代码搭建方案，运营配置效率提升 80%'],
    },
    {
      id: 'e3', company: '美团', position: '前端开发工程师',
      startDate: '2016-07', endDate: '2018-02', current: false,
      description: '负责外卖商家端 Web 应用开发。',
      highlights: ['重构订单管理模块，代码体积减少 40%'],
    },
  ],
  projects: [
    {
      id: 'p1', name: '开源组件库 Aurora UI',
      description: '基于 Vue 3 + TypeScript 的企业级组件库，npm 周下载量 2 万+。',
      techStack: ['Vue 3', 'TypeScript', 'Vite', 'Vitest'],
      url: 'https://aurora-ui.dev', githubUrl: 'https://github.com/zhangsan/aurora-ui',
      startDate: '2022-01', endDate: '', current: true,
    },
    {
      id: 'p2', name: '实时协作白板',
      description: '基于 CRDT 算法的多人实时协作白板应用。',
      techStack: ['React', 'WebSocket', 'Node.js', 'Redis'],
      url: '', githubUrl: '', startDate: '2023-05', endDate: '2023-12', current: false,
    },
    {
      id: 'p3', name: '前端性能监控平台',
      description: '自研的前端性能与错误监控系统，日均处理数据 10 亿条。',
      techStack: ['Vue 3', 'Koa', 'ClickHouse'],
      url: '', githubUrl: '', startDate: '2020-03', endDate: '2021-01', current: false,
    },
  ],
  education: [
    { id: 'ed1', school: '清华大学', degree: '硕士', major: '计算机科学与技术', startDate: '2013-09', endDate: '2016-06' },
    { id: 'ed2', school: '武汉大学', degree: '学士', major: '软件工程', startDate: '2009-09', endDate: '2013-06' },
  ],
}

try {
  await exportResumePpt(resume)
  console.log('PPTX 生成成功')
} catch (err) {
  console.error('PPTX 生成失败:', err)
  process.exit(1)
}
