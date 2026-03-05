import { ref, computed } from 'vue'
import { ofetch, FetchError } from 'ofetch'

const token = ref(localStorage.getItem('aitabs-token') ?? '')
const username = ref(localStorage.getItem('aitabs-username') ?? '')
const userId = ref(localStorage.getItem('aitabs-userId') ?? '')

export const isLoggedIn = computed(() => !!token.value)

async function login(user: string, pass: string): Promise<void> {
  const res = await ofetch<{ token: string; userId: string; username: string }>('/api/auth/login', {
    method: 'POST',
    body: { username: user, password: pass },
  })
  _saveSession(res.token, res.userId, res.username)
}

async function register(user: string, pass: string): Promise<void> {
  const res = await ofetch<{ token: string; userId: string; username: string }>('/api/auth/register', {
    method: 'POST',
    body: { username: user, password: pass },
  })
  _saveSession(res.token, res.userId, res.username)
}

function logout(): void {
  token.value = ''
  username.value = ''
  userId.value = ''
  localStorage.removeItem('aitabs-token')
  localStorage.removeItem('aitabs-username')
  localStorage.removeItem('aitabs-userId')
}

async function checkSession(): Promise<boolean> {
  if (!token.value) return false
  try {
    const res = await ofetch<{ userId: string; username: string }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    username.value = res.username
    userId.value = res.userId
    return true
  } catch (err) {
    if (err instanceof FetchError && err.response?.status === 401) {
      logout()
    }
    return false
  }
}

function _saveSession(t: string, uid: string, uname: string): void {
  token.value = t
  userId.value = uid
  username.value = uname
  localStorage.setItem('aitabs-token', t)
  localStorage.setItem('aitabs-userId', uid)
  localStorage.setItem('aitabs-username', uname)
}

export function useAuth() {
  return { token, username, userId, isLoggedIn, login, register, logout, checkSession }
}
