<template>
  <div class="page login-shell">
    <div class="aurora aurora-a"></div>
    <div class="aurora aurora-b"></div>
    <section class="login-panel card">
      <div class="eyebrow">Campus Repair Command</div>
      <h1>校园智能报修与派单系统</h1>
      <p class="subtle">面向报修用户、维修人员与管理员的一体化多角色业务平台。</p>
      <div class="auth-switch auth-switch--three">
        <button class="btn" :class="mode==='login'?'btn-primary':'btn-ghost'" @click="switchMode('login')">登录</button>
        <button class="btn" :class="mode==='register'?'btn-primary':'btn-ghost'" @click="switchMode('register')">用户注册</button>
        <button class="btn" :class="mode==='forgot'?'btn-primary':'btn-ghost'" @click="switchMode('forgot')">忘记密码</button>
      </div>
      <form v-if="mode==='login'" class="stack-lg" @submit.prevent="handleLogin">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="loginForm.username" placeholder="例如：admin001 / reporter001" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model.trim="loginForm.password" type="password" placeholder="请输入密码" />
        </label>
        <button class="btn btn-primary" :disabled="loading">{{ loading ? '登录中...' : '进入系统' }}</button>
      </form>
      <form v-else-if="mode==='register'" class="stack-lg" @submit.prevent="handleRegister">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="registerForm.username" placeholder="4-20位字母、数字或下划线" />
        </label>
        <label class="field">
          <span>姓名</span>
          <input v-model.trim="registerForm.realName" placeholder="请输入真实姓名" />
        </label>
        <label class="field">
          <span>手机号</span>
          <input v-model.trim="registerForm.phone" placeholder="用于找回密码，必填" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model.trim="registerForm.password" type="password" placeholder="至少6位" />
        </label>
        <label class="field">
          <span>确认密码</span>
          <input v-model.trim="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </label>
        <button class="btn btn-primary" :disabled="loading">{{ loading ? '注册中...' : '注册并进入系统' }}</button>
      </form>
      <form v-else class="stack-lg" @submit.prevent="handleForgotPassword">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="forgotForm.username" placeholder="请输入用户名" />
        </label>
        <label class="field">
          <span>预留手机号</span>
          <input v-model.trim="forgotForm.phone" placeholder="请输入账号预留手机号" />
        </label>
        <label class="field">
          <span>新密码</span>
          <input v-model.trim="forgotForm.newPassword" type="password" placeholder="至少6位" />
        </label>
        <label class="field">
          <span>确认新密码</span>
          <input v-model.trim="forgotForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </label>
        <button class="btn btn-primary" :disabled="loading">{{ loading ? '重置中...' : '重置密码' }}</button>
      </form>
      <p v-if="error" class="feedback feedback-error">{{ error }}</p>
      <p v-if="success" class="feedback feedback-success">{{ success }}</p>
      <div v-if="mode==='login'" class="demo-grid">
        <button v-for="demo in demos" :key="demo.username" class="demo-chip" @click="applyDemo(demo)">
          <strong>{{ demo.label }}</strong>
          <span>{{ demo.username }}</span>
        </button>
      </div>
      <p v-if="mode==='register'" class="subtle">注册入口仅面向报修用户。维修人员账号由管理员在后台创建；管理员账号建议由数据库初始化或系统负责人线下发放，避免高权限被随意申请。</p>
      <p v-if="mode==='forgot'" class="subtle">找回密码采用“用户名 + 预留手机号”校验。若维修人员或管理员手机号不可用，应联系管理员进行后台重置。</p>
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
const success = ref('')
const mode = ref('login')
const loginForm = reactive({ username: 'admin001', password: '123456' })
const registerForm = reactive({ username: '', realName: '', phone: '', password: '', confirmPassword: '' })
const forgotForm = reactive({ username: '', phone: '', newPassword: '', confirmPassword: '' })

const demos = [
  { label: '管理员演示', username: 'admin001', password: '123456' },
  { label: '报修用户演示', username: 'reporter001', password: '123456' },
  { label: '维修人员演示', username: 'worker001', password: '123456' }
]

function switchMode(nextMode) {
  mode.value = nextMode
  error.value = ''
  success.value = ''
}

function applyDemo(demo) {
  loginForm.username = demo.username
  loginForm.password = demo.password
}

async function enterWithToken(loginData) {
  const me = unwrap(await http.get('/auth/me', {
    headers: { Authorization: `Bearer ${loginData.token}` }
  }))
  setAuth(loginData.token, me)
  router.push('/dashboard')
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const loginData = unwrap(await http.post('/auth/login', loginForm))
    await enterWithToken(loginData)
  } catch (err) {
    error.value = err.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = {
      username: registerForm.username,
      realName: registerForm.realName,
      phone: registerForm.phone,
      password: registerForm.password
    }
    const loginData = unwrap(await http.post('/auth/register', payload))
    success.value = '注册成功，正在进入系统'
    await enterWithToken(loginData)
  } catch (err) {
    error.value = err.message || '注册失败，请检查填写信息'
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  if (forgotForm.newPassword !== forgotForm.confirmPassword) {
    error.value = '两次输入的新密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await http.post('/auth/forgot-password', {
      username: forgotForm.username,
      phone: forgotForm.phone,
      newPassword: forgotForm.newPassword
    })
    success.value = '密码已重置，请使用新密码登录'
    loginForm.username = forgotForm.username
    loginForm.password = ''
    forgotForm.newPassword = ''
    forgotForm.confirmPassword = ''
    mode.value = 'login'
  } catch (err) {
    error.value = err.message || '密码重置失败，请检查用户名和预留手机号'
  } finally {
    loading.value = false
  }
}
</script>
