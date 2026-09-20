<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResumeStore } from '@/stores/resume'

const store = useResumeStore()
const router = useRouter()

// ===== 保存弹窗 =====
const showSaveDialog = ref(false)
const saveName = ref('')
const editingSaveId = ref(null) // 正在编辑的已保存简历 ID

function openSaveDialog() {
  saveName.value = store.resume.personal.fullName || ''
  editingSaveId.value = null
  showSaveDialog.value = true
}

function selectSavedForEdit(item) {
  saveName.value = item.name
  editingSaveId.value = item.id
}

function doSave() {
  store.saveResume(saveName.value || `简历-${store.savedList.length + 1}`)
  editingSaveId.value = null
  showSaveDialog.value = false
}

// ===== 加载简历 =====
function onLoad(id) {
  if (store.hasContent) {
    if (!confirm('当前表单有未保存的内容，确定要加载吗？')) return
  }
  store.loadResume(id)
}

// ===== 新建简历 =====
function onNew() {
  if (store.hasContent) {
    if (!confirm('确定新建空白简历？当前内容未保存。')) return
  }
  store.newResume()
}

// ===== 照片上传 =====
const photoInput = ref(null)
function triggerPhotoUpload() {
  photoInput.value?.click()
}

function onPhotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    store.resume.personal.photo = ev.target.result
  }
  reader.readAsDataURL(file)
  // 重置 input 以便重复选择同一文件
  e.target.value = ''
}

function removePhoto() {
  store.resume.personal.photo = ''
}

// ===== 导出 / 导入 =====
const importInput = ref(null)

function doExport() {
  const json = JSON.stringify(store.resume, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const name = store.resume.personal.fullName || '简历'
  a.href = url
  a.download = `${name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importInput.value?.click()
}

function onImportFile(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.name.endsWith('.json')) {
    alert('请选择 JSON 文件')
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!data || typeof data !== 'object' || !data.personal) {
        alert('文件格式不正确：缺少个人信息')
        return
      }
      if (store.hasContent) {
        if (!confirm('当前表单有未保存的内容，确定要导入吗？')) return
      }
      store.resume = store.normalizeResume(data)
    } catch {
      alert('文件解析失败，请检查 JSON 格式')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// ===== 技能标签输入 =====
const skillInputs = ref(store.resume.skills.map(() => ''))

function onSkillKeydown(e, catIndex) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    const val = skillInputs.value[catIndex].replace(/,/g, '').trim()
    if (val) {
      store.addSkillTag(catIndex, val)
      skillInputs.value[catIndex] = ''
    }
  }
}

// ===== 工作亮点标签 =====
const highlightInputs = ref(store.resume.experiences.map(() => ''))

function ensureHighlightInput(index) {
  if (!highlightInputs.value[index]) highlightInputs.value[index] = ''
  return highlightInputs.value[index]
}

function onHighlightKeydown(e, expIndex) {
  if (e.key === 'Enter') {
    e.preventDefault()
    const val = highlightInputs.value[expIndex]?.trim()
    if (val) {
      store.addHighlight(expIndex, val)
      highlightInputs.value[expIndex] = ''
    }
  }
}

// ===== 项目技术栈输入 =====
const projectTechInputs = ref(store.resume.projects.map(() => ''))

function ensureProjectTechInput(index) {
  if (!projectTechInputs.value[index]) projectTechInputs.value[index] = ''
  return projectTechInputs.value[index]
}

function onProjectTechKeydown(e, projIndex) {
  if (e.key === 'Enter') {
    e.preventDefault()
    const val = projectTechInputs.value[projIndex]?.trim()
    if (val) {
      store.addProjectTech(projIndex, val)
      projectTechInputs.value[projIndex] = ''
    }
  }
}

// ===== 项目技术职责输入 =====
const projectRespInputs = ref(store.resume.projects.map(() => ''))

function onProjectRespKeydown(e, projIndex) {
  if (e.key === 'Enter') {
    e.preventDefault()
    const val = projectRespInputs.value[projIndex]?.trim()
    if (val) {
      store.addProjectResponsibility(projIndex, val)
      projectRespInputs.value[projIndex] = ''
    }
  }
}

// ===== 跳转预览 =====
function goPreview() {
  if (!store.resume.personal.fullName.trim()) {
    alert('请至少填写姓名再预览')
    return
  }
  router.push('/preview')
}

// ===== 侧边栏可见性 =====
const sidebarOpen = ref(false)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6 flex gap-6 relative">
    <!-- ========== 移动端侧边栏开关 ========== -->
    <button
      class="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center no-print"
      @click="sidebarOpen = !sidebarOpen"
    >
      <svg v-if="!sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- ========== 左侧边栏: 已保存列表 ========== -->
    <aside
      class="no-print flex-shrink-0 w-64 lg:block"
      :class="sidebarOpen ? 'fixed inset-0 z-40 bg-white p-6 pt-20 overflow-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0 lg:pt-0 lg:overflow-visible' : 'hidden'"
    >
      <!-- 遮罩 -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/30 lg:hidden"
        @click="sidebarOpen = false"
      />

      <div class="relative z-10 lg:sticky lg:top-20 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 class="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          已保存的简历
        </h3>

        <div v-if="store.savedList.length === 0" class="text-xs text-gray-400 py-4 text-center">
          还没有保存的简历
        </div>

        <ul class="space-y-2 max-h-[400px] overflow-y-auto">
          <li
            v-for="item in store.savedList"
            :key="item.id"
            class="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
            @click="onLoad(item.id)"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">{{ item.name }}</p>
              <p class="text-xs text-gray-400">{{ item.createdAt }}</p>
            </div>
            <button
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
              title="删除"
              @click.stop="store.deleteResume(item.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <!-- ========== 右侧: 表单主体 ========== -->
    <div class="flex-1 min-w-0 space-y-8">
      <!-- ===== 顶部操作栏 ===== -->
      <div
        v-motion="{
          initial: { opacity: 0, y: -10 },
          enter: { opacity: 1, y: 0, transition: { duration: 300 } },
        }"
        class="flex flex-wrap items-center justify-between gap-3 no-print"
      >
        <div class="flex gap-2">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            @click="goPreview"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            预览 & 打印
          </button>
          <button
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            @click="openSaveDialog"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存
          </button>
          <button
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="onNew"
          >
            新建
          </button>
          <button
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            @click="doExport"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出
          </button>
          <button
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            @click="triggerImport"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            导入
          </button>
        </div>
        <input ref="importInput" type="file" accept=".json" class="hidden" @change="onImportFile" />
        <span class="text-xs text-gray-400">
          已保存 {{ store.savedList.length }} 份简历
        </span>
      </div>

      <!-- ===== 1. 个人信息 + 照片 ===== -->
      <section
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 400, delay: 50 } },
        }"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 class="font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <span class="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
          个人信息
        </h2>

        <div class="flex flex-col sm:flex-row gap-6">
          <!-- 照片区域 -->
          <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <div
              class="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative group"
              @click="triggerPhotoUpload"
            >
              <img
                v-if="store.resume.personal.photo"
                :src="store.resume.personal.photo"
                class="w-full h-full object-cover"
                alt="头像"
              />
              <div v-else class="flex flex-col items-center text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span class="text-xs mt-1">添加照片</span>
              </div>
              <!-- 悬停遮罩 -->
              <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="text-white text-xs font-medium">更换</span>
              </div>
            </div>
            <button
              v-if="store.resume.personal.photo"
              class="text-xs text-red-400 hover:text-red-600 transition-colors"
              @click="removePhoto"
            >
              移除照片
            </button>
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPhotoChange"
            />
          </div>

          <!-- 基本字段 -->
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">姓名 *</label>
              <input v-model="store.resume.personal.fullName" type="text" placeholder="张三"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">职位头衔</label>
              <input v-model="store.resume.personal.title" type="text" placeholder="全栈工程师 / 前端开发"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">邮箱</label>
              <input v-model="store.resume.personal.email" type="email" placeholder="zhangsan@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">电话</label>
              <input v-model="store.resume.personal.phone" type="tel" placeholder="+86 138-0000-0000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">所在地</label>
              <input v-model="store.resume.personal.location" type="text" placeholder="北京 / 上海"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">GitHub</label>
              <input v-model="store.resume.personal.github" type="text" placeholder="github.com/username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">LinkedIn</label>
              <input v-model="store.resume.personal.linkedin" type="text" placeholder="linkedin.com/in/username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">个人网站</label>
              <input v-model="store.resume.personal.website" type="text" placeholder="your-site.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Telegram</label>
              <input v-model="store.resume.personal.telegram" type="text" placeholder="@username 或 t.me/username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 2. 个人简介 ===== -->
      <section
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 400, delay: 100 } },
        }"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-green-500 rounded-full inline-block"></span>
          个人简介
        </h2>
        <textarea
          v-model="store.resume.summary"
          rows="3"
          placeholder="2-3 句话概述你的技术背景和核心竞争力。例如：拥有 5 年全栈开发经验，精通 Vue/React 及 Node.js 生态，主导过日活百万级产品架构设计..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-y"
        ></textarea>
      </section>

      <!-- ===== 3. 技术技能 ===== -->
      <section
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 400, delay: 150 } },
        }"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-purple-500 rounded-full inline-block"></span>
          技术技能
        </h2>
        <p class="text-xs text-gray-400 mb-4">输入技能后按 <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs border">Enter</kbd> 或 <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs border">,</kbd> 添加标签</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="(skillCat, catIndex) in store.resume.skills" :key="catIndex">
            <label class="block text-xs font-medium text-gray-500 mb-2">{{ skillCat.category }}</label>
            <div class="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              <span
                v-for="tag in skillCat.tags"
                :key="tag"
                :class="['tag-pill', `tag-skill-${catIndex}`]"
              >
                {{ tag }}
                <button @click="store.removeSkillTag(catIndex, tag)">&times;</button>
              </span>
              <span v-if="skillCat.tags.length === 0" class="text-xs text-gray-300">暂无</span>
            </div>
            <input
              v-model="skillInputs[catIndex]"
              type="text"
              :placeholder="`添加${skillCat.category}...`"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              @keydown="onSkillKeydown($event, catIndex)"
            />
          </div>
        </div>
      </section>

      <!-- ===== 4. 工作经历 ===== -->
      <section
        v-for="(exp, expIndex) in store.resume.experiences"
        :key="exp.id"
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 400, delay: 200 + expIndex * 30 } },
        }"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <span class="w-1 h-5 bg-amber-500 rounded-full inline-block"></span>
            工作经历 {{ store.resume.experiences.length > 1 ? `#${expIndex + 1}` : '' }}
          </h2>
          <button
            v-if="store.resume.experiences.length > 1"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors"
            @click="store.removeExperience(expIndex)"
          >
            移除
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">公司名称</label>
            <input v-model="exp.company" type="text" placeholder="字节跳动"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">职位</label>
            <input v-model="exp.position" type="text" placeholder="高级前端工程师"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">时间</label>
            <div class="flex items-center gap-2">
              <input v-model="exp.startDate" type="month"
                class="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
              <span class="text-gray-300 text-sm">—</span>
              <input v-model="exp.endDate" :disabled="exp.current" type="month"
                class="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <label class="flex items-center gap-1.5 mt-1.5 cursor-pointer">
              <input v-model="exp.current" type="checkbox" class="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
              <span class="text-xs text-gray-400">至今</span>
            </label>
          </div>
        </div>

        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-500 mb-1">工作描述</label>
          <textarea v-model="exp.description" rows="5" placeholder="简要描述你的职责和技术栈..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-y"></textarea>
        </div>

        <!-- 亮点 -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">关键成果 / 亮点</label>
          <div class="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            <span
              v-for="(h, hi) in exp.highlights"
              :key="hi"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200"
            >
              {{ h }}
              <button class="hover:text-red-500 transition-colors" @click="store.removeHighlight(expIndex, hi)">&times;</button>
            </span>
            <span v-if="exp.highlights.length === 0" class="text-xs text-gray-300">如：主导前端架构升级，首屏加载提升 60%</span>
          </div>
          <input
            v-model="highlightInputs[expIndex]"
            type="text"
            placeholder="添加亮点... (按 Enter 确认)"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            @keydown="onHighlightKeydown($event, expIndex)"
          />
        </div>
      </section>

      <!-- 添加工作经历按钮 -->
      <div class="text-center no-print">
        <button
          class="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors w-full"
          @click="store.addExperience()"
        >
          + 添加工作经历
        </button>
      </div>

      <!-- ===== 5. 项目经历 ===== -->
      <section
        v-for="(proj, projIndex) in store.resume.projects"
        :key="proj.id"
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 400, delay: 250 + projIndex * 30 } },
        }"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <span class="w-1 h-5 bg-cyan-500 rounded-full inline-block"></span>
            项目经历 {{ store.resume.projects.length > 1 ? `#${projIndex + 1}` : '' }}
          </h2>
          <button
            v-if="store.resume.projects.length > 1"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors"
            @click="store.removeProject(projIndex)"
          >
            移除
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">项目名称</label>
            <input v-model="proj.name" type="text" placeholder="开源监控系统"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">线上地址 / GitHub</label>
            <div class="flex gap-2">
              <input v-model="proj.url" type="text" placeholder="https://..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
              <input v-model="proj.githubUrl" type="text" placeholder="GitHub"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-1">时间</label>
          <div class="flex items-center gap-2">
            <input v-model="proj.startDate" type="month"
              class="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            <span class="text-gray-300 text-sm">—</span>
            <input v-model="proj.endDate" :disabled="proj.current" type="month"
              class="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
          </div>
          <label class="flex items-center gap-1.5 mt-1.5 cursor-pointer">
            <input v-model="proj.current" type="checkbox" class="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
            <span class="text-xs text-gray-400">至今</span>
          </label>
        </div>

        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-500 mb-1">项目描述</label>
          <textarea v-model="proj.description" rows="5" placeholder="一句话描述项目的核心功能和价值..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-y"></textarea>
        </div>

        <!-- 技术职责 -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-1">技术职责</label>
          <div class="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            <span
              v-for="(r, ri) in proj.responsibilities"
              :key="ri"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200"
            >
              {{ r }}
              <button class="hover:text-red-500 transition-colors" @click="store.removeProjectResponsibility(projIndex, ri)">&times;</button>
            </span>
            <span v-if="proj.responsibilities?.length??[] === 0" class="text-xs text-gray-300">如：负责前端架构设计与核心模块开发</span>
          </div>
          <input
            v-model="projectRespInputs[projIndex]"
            type="text"
            placeholder="添加技术职责... (按 Enter 确认)"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            @keydown="onProjectRespKeydown($event, projIndex)"
          />
        </div>

        <!-- 技术栈标签 -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">技术栈</label>
          <div class="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            <span
              v-for="(tech, ti) in proj.techStack"
              :key="ti"
              class="tag-pill"
            >
              {{ tech }}
              <button @click="store.removeProjectTech(projIndex, ti)">&times;</button>
            </span>
            <span v-if="proj.techStack.length === 0" class="text-xs text-gray-300">暂无</span>
          </div>
          <input
            v-model="projectTechInputs[projIndex]"
            type="text"
            placeholder="添加技术栈... (按 Enter 确认)"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            @keydown="onProjectTechKeydown($event, projIndex)"
          />
        </div>
      </section>

      <!-- 添加项目按钮 -->
      <div class="text-center no-print">
        <button
          class="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors w-full"
          @click="store.addProject()"
        >
          + 添加项目经历
        </button>
      </div>

      <!-- ===== 6. 教育背景 ===== -->
      <section
        v-for="(edu, eduIndex) in store.resume.education"
        :key="edu.id"
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 400, delay: 300 + eduIndex * 30 } },
        }"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <span class="w-1 h-5 bg-pink-500 rounded-full inline-block"></span>
            教育背景 {{ store.resume.education.length > 1 ? `#${eduIndex + 1}` : '' }}
          </h2>
          <button
            v-if="store.resume.education.length > 1"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors"
            @click="store.removeEducation(eduIndex)"
          >
            移除
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">学校</label>
            <input v-model="edu.school" type="text" placeholder="清华大学"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">学位</label>
            <input v-model="edu.degree" type="text" placeholder="本科 / 硕士 / 博士"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">专业</label>
            <input v-model="edu.major" type="text" placeholder="计算机科学与技术"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">时间</label>
            <div class="flex items-center gap-2">
              <input v-model="edu.startDate" type="month"
                class="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
              <span class="text-gray-300 text-sm">—</span>
              <input v-model="edu.endDate" type="month"
                class="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
            </div>
          </div>
        </div>
      </section>

      <!-- 添加教育按钮 -->
      <div class="text-center no-print">
        <button
          class="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors w-full"
          @click="store.addEducation()"
        >
          + 添加教育背景
        </button>
      </div>

      <!-- 底部间距 -->
      <div class="pb-8 no-print"></div>
    </div>

    <!-- ===== 保存弹窗 ===== -->
    <Teleport to="body">
      <div
        v-if="showSaveDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="showSaveDialog = false"
      >
        <div
          v-motion="{ initial: { opacity: 0, scale: 0.95 }, enter: { opacity: 1, scale: 1 } }"
          class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4"
        >
          <h3 class="font-semibold text-gray-800 mb-4">保存简历</h3>
          <input
            v-model="saveName"
            type="text"
            placeholder="输入简历名称..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all mb-3"
            @keydown.enter="doSave"
            @keydown.escape="showSaveDialog = false"
            autofocus
          />
          <!-- 已保存列表可选 -->
          <div v-if="store.savedList.length > 0" class="mb-4 max-h-36 overflow-y-auto border border-gray-100 rounded-lg">
            <div
              v-for="item in store.savedList"
              :key="item.id"
              :class="[
                'px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between',
                editingSaveId === item.id
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                  : 'hover:bg-gray-50 text-gray-600 border-l-2 border-transparent'
              ]"
              @click="selectSavedForEdit(item)"
            >
              <span class="truncate">{{ item.name }}</span>
              <span class="text-xs text-gray-400 flex-shrink-0 ml-2">{{ item.createdAt }}</span>
            </div>
          </div>
          <div v-if="editingSaveId" class="text-xs text-blue-500 mb-3">
            将更新已保存的简历
          </div>
          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="showSaveDialog = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="doSave"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
