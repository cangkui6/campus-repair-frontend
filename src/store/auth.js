import { reactive } from 'vue'

const stored = JSON.parse(localStorage.getItem('campus-repair-auth') || 'null')

export const authState = reactive({
  token: stored?.token || '',
  user: stored?.user || null
})

export function setAuth(token, user) {
  authState.token = token
  authState.user = user
  localStorage.setItem('campus-repair-auth', JSON.stringify({ token, user }))
}

export function clearAuth() {
  authState.token = ''
  authState.user = null
  localStorage.removeItem('campus-repair-auth')
}
