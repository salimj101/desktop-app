// src/main/lib/auth.service.ts
import axios from 'axios'
// Make sure to import getSession!
import { getSessionDb, clearSession, getSession } from './session.db'

async function checkToken(token: string) {
  try {
    const response = await axios.post(`http://localhost:3001/api/auth/check-token`, { token })
    return response.data.data.expirationDate
  } catch (error) {
    console.error('[checkToken] Error checking token:', error)
    throw error
  }
}

export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required')
  }
  try {
    const response = await axios.post(`http://localhost:3001/api/auth/login`, {
      email,
      password,
      rememberMe: true
    })

    const { access_token, refresh_token, user } = response.data.data

    if (user.userType !== 'developer') {
      throw new Error('Only developers can login')
    }

    const accessTokenExpiresAt = await checkToken(access_token)
    const refreshTokenExpiresAt = await checkToken(refresh_token)

    const db = getSessionDb()
    clearSession()
    db.prepare(
      `INSERT INTO session
       (id, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, userId, email, userType)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run([
      1,
      access_token,
      refresh_token,
      new Date(accessTokenExpiresAt).toISOString(),
      new Date(refreshTokenExpiresAt).toISOString(),
      user._id.toString(),
      user.email,
      user.userType
    ])

    console.info(`✅ Login successful for user: ${user.email}`)
    return {
      userId: user._id,
      email: user.email,
      userType: user.userType
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || 'Login failed'
      console.error(`❌ Login failed with status ${error.response.status}:`, errorMessage)
      throw new Error(errorMessage)
    }
    throw error
  }
}

export async function checkAndRefreshSession() {
  const db = getSessionDb()
  // The Fix: Use the correct helper function to get the session data row.
  const session = getSession()

  if (!session) {
    throw new Error('No active session.')
  }

  const now = new Date()
  const accessTokenExpiresAt = new Date(session.accessTokenExpiresAt)

  // Add a 60-second buffer to be safe.
  if (accessTokenExpiresAt.getTime() > now.getTime() + 60000) {
    console.log('[Session] Access token is valid.')
    return {
      userId: session.userId,
      email: session.email,
      userType: session.userType
    }
  }

  console.warn('[Session] Access token expired, attempting refresh...')
  const refreshTokenExpiresAt = new Date(session.refreshTokenExpiresAt)

  if (now >= refreshTokenExpiresAt) {
    clearSession()
    throw new Error('Session expired. Please re-authenticate.')
  }

  try {
    const response = await axios.post(`${process.env.VITE_API_URL}/auth/refresh`, {
      refreshToken: session.refreshToken
    })

    const { access_token } = response.data.data
    const newAccessTokenExpiresAt = await checkToken(access_token)

    db.prepare('UPDATE session SET accessToken = ?, accessTokenExpiresAt = ? WHERE id = ?').run(
      access_token,
      new Date(newAccessTokenExpiresAt).toISOString(),
      1
    )

    console.info('[Session] Access token refreshed and session updated.')
    return {
      userId: session.userId,
      email: session.email,
      userType: session.userType
    }
  } catch (err) {
    clearSession()
    let errorMessage = 'Failed to refresh session. Please re-authenticate.'
    if (axios.isAxiosError(err) && err.response) {
      console.error(
        '[Session] Failed to refresh access token:',
        err.response.data?.message || err.message
      )
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Authentication service is down or unreachable.'
      }
    } else {
      console.error('[Session] Failed to refresh access token:', (err as Error).message)
    }
    throw new Error(errorMessage)
  }
}