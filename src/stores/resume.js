import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 空白简历模板
function emptyResume() {
  return {
    // 个人信息
    personal: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      github: '',
      linkedin: '',
      website: '',
      telegram: '',
      photo: '',        // base64 data URL
    },
    // 个人简介
    summary: '',
    // 技术技能 — 分类+标签数组
    skills: [
      { category: '编程语言', tags: [] },
      { category: '框架 & 库', tags: [] },
      { category: '工具 & 平台', tags: [] },
      { category: '数据库', tags: [] },
    ],
    // 工作经历
    experiences: [
      {
        id: crypto.randomUUID(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        highlights: [],
      },
    ],
    // 项目经历
    projects: [
      {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        techStack: [],
        responsibilities: [],
        url: '',
        githubUrl: '',
        startDate: '',
        endDate: '',
        current: false,
      },
    ],
    // 教育背景
    education: [
      {
        id: crypto.randomUUID(),
        school: '',
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
      },
    ],
  }
}

export const useResumeStore = defineStore('resume', () => {
  // ===== 当前编辑的简历 =====
  const resume = ref(emptyResume())

  // ===== 已保存的简历列表 =====
  const savedList = ref([])
  // 每项: { id, name, createdAt, data }

  // ===== 计算: 当前简历是否有内容 =====
  const hasContent = computed(() => {
    const p = resume.value.personal
    return !!(p.fullName || p.title || p.email || resume.value.summary)
  })

  // ===== 重置当前表单 =====
  function newResume() {
    resume.value = emptyResume()
  }

  // ===== 数据规范化：兼容旧版本保存/导入的数据 =====
  function normalizeResume(data) {
    const r = JSON.parse(JSON.stringify(data))
    ;(r.projects || []).forEach((p) => {
      if (!Array.isArray(p.responsibilities)) p.responsibilities = []
    })
    return r
  }

  // ===== 加载已保存的简历到表单 =====
  function loadResume(id) {
    const found = savedList.value.find((s) => s.id === id)
    if (found) {
      resume.value = normalizeResume(found.data)
    }
  }

  // ===== 保存当前简历到列表 =====
  function saveResume(name) {
    const existing = savedList.value.find((s) => s.id === name || s.name === name)
    const now = new Date().toLocaleString('zh-CN')
    const data = JSON.parse(JSON.stringify(resume.value))

    if (existing) {
      // 更新已有
      existing.data = data
      existing.createdAt = now
    } else {
      savedList.value.push({
        id: crypto.randomUUID(),
        name: name || `未命名-${savedList.value.length + 1}`,
        createdAt: now,
        data,
      })
    }
  }

  // ===== 删除已保存的简历 =====
  function deleteResume(id) {
    savedList.value = savedList.value.filter((s) => s.id !== id)
  }

  // ===== 添加技能标签 =====
  function addSkillTag(categoryIndex, tag) {
    const trimmed = tag.trim()
    if (trimmed && !resume.value.skills[categoryIndex].tags.includes(trimmed)) {
      resume.value.skills[categoryIndex].tags.push(trimmed)
    }
  }

  function removeSkillTag(categoryIndex, tag) {
    const tags = resume.value.skills[categoryIndex].tags
    resume.value.skills[categoryIndex].tags = tags.filter((t) => t !== tag)
  }

  // ===== 添加/删除工作经历 =====
  function addExperience() {
    resume.value.experiences.push({
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
    })
  }

  function removeExperience(index) {
    if (resume.value.experiences.length > 1) {
      resume.value.experiences.splice(index, 1)
    }
  }

  function addHighlight(expIndex, highlight) {
    const trimmed = highlight.trim()
    if (trimmed && !resume.value.experiences[expIndex].highlights.includes(trimmed)) {
      resume.value.experiences[expIndex].highlights.push(trimmed)
    }
  }

  function removeHighlight(expIndex, idx) {
    resume.value.experiences[expIndex].highlights.splice(idx, 1)
  }

  // ===== 添加/删除项目 =====
  function addProject() {
    resume.value.projects.push({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      techStack: [],
      responsibilities: [],
      url: '',
      githubUrl: '',
    })
  }

  function removeProject(index) {
    if (resume.value.projects.length > 1) {
      resume.value.projects.splice(index, 1)
    }
  }

  function addProjectTech(projIndex, tech) {
    const trimmed = tech.trim()
    if (trimmed && !resume.value.projects[projIndex].techStack.includes(trimmed)) {
      resume.value.projects[projIndex].techStack.push(trimmed)
    }
  }

  function removeProjectTech(projIndex, techIdx) {
    resume.value.projects[projIndex].techStack.splice(techIdx, 1)
  }

  function addProjectResponsibility(projIndex, text) {
    const trimmed = text.trim()
    if (trimmed && !resume.value.projects[projIndex].responsibilities.includes(trimmed)) {
      resume.value.projects[projIndex].responsibilities.push(trimmed)
    }
  }

  function removeProjectResponsibility(projIndex, idx) {
    resume.value.projects[projIndex].responsibilities.splice(idx, 1)
  }

  // ===== 添加/删除教育 =====
  function addEducation() {
    resume.value.education.push({
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
    })
  }

  function removeEducation(index) {
    if (resume.value.education.length > 1) {
      resume.value.education.splice(index, 1)
    }
  }

  return {
    resume,
    savedList,
    hasContent,
    newResume,
    normalizeResume,
    loadResume,
    saveResume,
    deleteResume,
    addSkillTag,
    removeSkillTag,
    addExperience,
    removeExperience,
    addHighlight,
    removeHighlight,
    addProject,
    removeProject,
    addProjectTech,
    removeProjectTech,
    addProjectResponsibility,
    removeProjectResponsibility,
    addEducation,
    removeEducation,
  }
}, {
  persist: {
    key: 'resume-builder',
    storage: localStorage,
    pick: ['savedList'],         // 只持久化已保存列表；当前编辑表单不自动持久化
  },
})
