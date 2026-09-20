<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isPreview = computed(() => route.name === 'Preview')
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 — 预览页隐藏 -->
    <header
      v-if="!isPreview"
      class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 no-print"
    >
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <span class="text-white font-bold text-sm">&lt;/&gt;</span>
          </div>
          <div>
            <h1 class="font-semibold text-sm text-gray-900">程序员简历生成器</h1>
            <p class="text-xs text-gray-400">Dev Resume Builder</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 hidden sm:inline">填写表单 → 预览 → 打印</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main>
      <router-view />
    </main>
  </div>
</template>
