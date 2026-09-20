<script setup>
import { useRouter } from 'vue-router'
import { useResumeStore } from '@/stores/resume'
import { computed } from 'vue'
import { fmtDate } from '@/utils/format'

const router = useRouter()
const store = useResumeStore()

const resume = computed(() => store.resume)

// ===== 打印 =====
function doPrint() {
  window.print()
}

// ===== 导出 PPT（pptxgenjs 体积较大，点击时才动态加载） =====
async function doExportPpt() {
  const { exportResumePpt } = await import('@/utils/exportPpt')
  await exportResumePpt(resume.value)
}

// ===== 返回编辑 =====
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="print-wrapper min-h-screen bg-gray-200 py-6 px-4">
    <!-- ===== 顶部操作栏 (不打印) ===== -->
    <div class="max-w-[210mm] mx-auto mb-6 flex items-center justify-between no-print">
      <button
        class="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        @click="goBack"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        返回编辑
      </button>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!store.hasContent"
          @click="doExportPpt"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          导出 PPT
        </button>
        <button
          class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          @click="doPrint"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          打印简历
        </button>
      </div>
    </div>

    <!-- ===== A4 简历卡片（单栏，从上到下） ===== -->
    <article class="print-area max-w-[210mm] mx-auto bg-white shadow-xl overflow-hidden">
      <!-- ============ 顶部：照片 / 姓名 / 职位 ============ -->
      <header class="px-8 pt-8 flex items-center gap-5">
        <div
          v-if="resume.personal.photo"
          class="w-20 h-20 rounded-full border border-gray-200 overflow-hidden flex-shrink-0"
        >
          <img
            :src="resume.personal.photo"
            alt="头像"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="min-w-0">
          <h1 v-if="resume.personal.fullName" class="text-3xl font-extrabold text-gray-900 tracking-tight">
            {{ resume.personal.fullName }}
          </h1>
          <p v-if="resume.personal.title" class="text-lg text-gray-500 font-medium mt-1">
            {{ resume.personal.title }}
          </p>
          <div v-if="!resume.personal.fullName && !resume.personal.title" class="text-gray-300 text-lg py-2">
            请在表单中填写信息
          </div>
        </div>
      </header>

      <!-- ============ 联系方式 & 链接 ============ -->
      <div
        v-if="resume.personal.email || resume.personal.phone || resume.personal.location || resume.personal.github || resume.personal.linkedin || resume.personal.website || resume.personal.telegram"
        class="px-8 pt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-600"
      >
        <span v-if="resume.personal.email" class="inline-flex items-center gap-1.5 break-all">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {{ resume.personal.email }}
        </span>
        <span v-if="resume.personal.phone" class="inline-flex items-center gap-1.5">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {{ resume.personal.phone }}
        </span>
        <span v-if="resume.personal.location" class="inline-flex items-center gap-1.5">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ resume.personal.location }}
        </span>
        <span v-if="resume.personal.github" class="inline-flex items-center gap-1.5 break-all">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <a :href="resume.personal.github" target="_blank">{{ resume.personal.github }}</a>
        </span>
        <span v-if="resume.personal.linkedin" class="inline-flex items-center gap-1.5 break-all">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <a :href="resume.personal.linkedin" target="_blank">{{ resume.personal.linkedin }}</a>
        </span>
        <span v-if="resume.personal.website" class="inline-flex items-center gap-1.5 break-all">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <a :href="resume.personal.website" target="_blank">{{ resume.personal.website }}</a>
        </span>
        <span v-if="resume.personal.telegram" class="inline-flex items-center gap-1.5 break-all">
          <svg class="w-4 h-4 flex-shrink-0 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/>
          </svg>
          <a :href="resume.personal.telegram" target="_blank">{{ resume.personal.telegram }}</a>
        </span>
      </div>

      <!-- 分割线 -->
      <hr class="mx-8 mt-5 border-gray-200" />

      <!-- ============ 正文区块 ============ -->
      <div class="resume-body px-8 py-3 flex flex-col gap-3">
        <!-- 个人简介 -->
        <section v-if="resume.summary">
          <h2 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">关于我</h2>
          <p class="text-sm text-gray-600 leading-relaxed text-justify" v-html="resume.summary"></p>
        </section>

        <!-- 技术技能：列表两列布局，左列 category，右列 tags -->
        <section v-if="resume.skills.some(s => s.tags.length > 0)">
          <h2 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">技术技能</h2>
          <ul class="space-y-2.5">
            <li
              v-for="(skillCat, catIndex) in resume.skills"
              :key="skillCat.category"
              v-show="skillCat.tags.length > 0"
              class="grid grid-cols-[5rem_1fr] gap-x-3 items-baseline"
            >
              <span class="text-xs font-medium text-gray-500">{{ skillCat.category }}</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in skillCat.tags"
                  :key="tag"
                  :class="['tag-pill', `tag-skill-${catIndex}`]"
                >{{ tag }}</span>
              </div>
            </li>
          </ul>
        </section>

        <!-- 工作经历 -->
        <section v-if="resume.experiences.some(e => e.company || e.position)">
          <h2 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">工作经历</h2>
          <div class="space-y-3">
            <div
              v-for="exp in resume.experiences"
              :key="exp.id"
              v-show="exp.company || exp.position"
              class="experience-item relative pl-5 border-l-2 border-gray-100"
            >
              <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400"></div>
              <div class="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                <h3 class="font-semibold text-gray-800">{{ exp.company || '公司' }} - {{ exp.position || '职位' }}</h3>
                <span class="text-xs text-gray-400">
                  <template v-if="exp.startDate">{{ fmtDate(exp.startDate) }} — {{ exp.current ? '至今' : fmtDate(exp.endDate) }}</template>
                </span>
              </div>

              <p v-if="exp.description" class="text-sm text-gray-600 leading-relaxed mb-2" v-html="exp.description"></p>
              <ul v-if="exp.highlights.length > 0" class="space-y-1">
                <li
                  v-for="(h, hi) in exp.highlights"
                  :key="hi"
                  class="text-sm text-gray-600 flex items-baseline gap-2"
                >
                  <span class="text-cyan-400 mt-1.5 flex-shrink-0">▹</span>
                  <span v-html="h"></span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 项目经历 -->
        <section v-if="resume.projects.some(p => p.name)">
          <h2 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">项目经历</h2>
          <div class="space-y-5">
            <div
              v-for="proj in resume.projects"
              :key="proj.id"
              v-show="proj.name"
              class="project-item relative pl-5 border-l-2 border-gray-100"
            >
              <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-purple-400"></div>
              <div class="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                <h3 class="font-semibold text-gray-800">{{ proj.name }}</h3>
                <span v-if="proj.startDate" class="text-xs text-gray-400">
                  {{ fmtDate(proj.startDate) }} — {{ proj.current ? '至今' : fmtDate(proj.endDate) }}
                </span>
              </div>
              <div class="flex gap-2 text-xs mb-1">
                <a
                  v-if="proj.url"
                  :href="proj.url"
                  target="_blank"
                  class="text-blue-500 hover:text-blue-700 transition-colors"
                >🔗 线上</a>
                <a
                  v-if="proj.githubUrl"
                  :href="proj.githubUrl"
                  target="_blank"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >GitHub</a>
              </div>
              <p v-if="proj.description" class="text-sm text-gray-600 leading-relaxed mb-2" v-html="proj.description"></p>
              <ul v-if="proj.responsibilities?.length > 0" class="space-y-1 mb-2">
                <li
                  v-for="(r, ri) in proj.responsibilities"
                  :key="ri"
                  class="text-sm text-gray-600 flex items-baseline gap-2"
                >
                  <span class="text-purple-400 mt-1.5 flex-shrink-0">▹</span>
                  <span v-html="r"></span>
                </li>
              </ul>
              <div v-if="proj.techStack.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tech in proj.techStack"
                  :key="tech"
                  class="inline-block px-2 py-0.5 text-xs rounded-full bg-resume-tag text-resume-tag-text"
                >{{ tech }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 教育背景 -->
        <section v-if="resume.education.some(e => e.school)">
          <h2 class="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">教育背景</h2>
          <div class="space-y-3">
            <div v-for="edu in resume.education" :key="edu.id">
              <template v-if="edu.school">
                <div class="flex flex-wrap items-baseline justify-between gap-1">
                  <p class="text-sm font-medium text-gray-800">{{ edu.school }}</p>
                  <span v-if="edu.startDate" class="text-xs text-gray-400">
                    {{ fmtDate(edu.startDate) }} — {{ edu.endDate ? fmtDate(edu.endDate) : '至今' }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">{{ edu.degree }}<span v-if="edu.major"> · {{ edu.major }}</span></p>
              </template>
            </div>
          </div>
        </section>
      </div>
    </article>

    <!-- 底部提示 (不打印) -->
    <p class="text-center text-xs text-gray-400 mt-6 no-print">
      按 <kbd class="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl + P</kbd> 或点击上方按钮打印 · A4 纸张 · 现代卡片风格
    </p>
  </div>
</template>
