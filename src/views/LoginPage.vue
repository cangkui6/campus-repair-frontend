<template>
  <div class="page login-shell">
    <div class="aurora aurora-a"></div>
    <div class="aurora aurora-b"></div>
    <section class="login-panel card">
      <div class="eyebrow">Campus Repair Command</div>
      <h1>校园智能报修与派单系统</h1>
      <p class="subtle">面向报修用户、维修人员与管理员的一体化多角色业务平台。</p>
      <form class="stack-lg" @submit.prevent="handleLogin">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="form.username" placeholder="例如：admin001 / reporter001" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model.trim="form.password" type="password" placeholder="请输入密码" />
        </label>
        <button class="btn btn-primary" :disabled="loading">{{ loading ? '登录中...' : '进入系统' }}</button>
      </form>
      <p v-if="error" class="feedback feedback-error">{{ error }}</p>
      <div class="demo-grid">
        <button v-for="demo in demos" :key="demo.username" class="demo-chip" @click="applyDemo(demo)">
          <strong>{{ demo.label }}</strong>
          <span>{{ demo.username }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { unwrap } from '../api'
import { setAuth } from '../store/auth'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = reactive({ username: 'admin001', password: '123456' })

const demos = [
  { label: '管理员演示', username: 'admin001', password: '123456' },
  { label: '报修用户演示', username: 'reporter001', password: '123456' },
  { label: '维修人员演示', username: 'worker001', password: '123456' }
]

function applyDemo(demo) {
  form.username = demo.username
  form.password = demo.password
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const loginData = unwrap(await http.post('/auth/login', form))
    const me = unwrap(await http.get('/auth/me', {
      headers: { Authorization: `Bearer ${loginData.token}` }
    }))
    setAuth(loginData.token, me)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script>
