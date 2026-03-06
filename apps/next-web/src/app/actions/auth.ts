/* eslint-disable import/no-unresolved */
'use server'

import { cookies, headers } from 'next/headers'

import { z } from 'zod'

import { SystemMessageCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'
import { ROLES } from '@/configs/roles'
import menuData, { type MenuItem } from '@/configs/menu'

import type { User } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type LoginResponse = {
  success: boolean
  user?: User
  message?: string
  messageCode?: SystemMessageCode
  errors?: Record<string, string[]>
}

type RegisterResponse = {
  success: boolean
  registeredEmail?: string
  message?: string
  messageCode?: SystemMessageCode
  errors?: Record<string, string[]>
}

export async function loginAction(prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
  // Extract data from FormData
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate input against schema
  const validationResult = loginSchema.safeParse(credentials)

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      messageCode: SystemMessageCode.VALIDATION_ERROR,
      errors: validationResult.error.flatten().fieldErrors
    }
  }

  const { email, password } = validationResult.data

  // Determine local base URL for BFF call
  const headersList = await headers()
  const host = headersList.get('host')

  // Use HTTP for internal server-to-server calls (Nginx handles external HTTPS)
  const protocol = 'http'
  const API_BASE_URL = `${protocol}://${host}`

  try {
    let data;

    try {
      const response = await backendClient('/api/auth/login', {
        method: 'POST',
        data: { email, password },
        baseUrl: API_BASE_URL
      })

      // Handle ApiResponse structure from backend
      if (response && response.user) {
        data = response
      } else if (response && response.data) {
        data = response.data
      } else {
        data = response
      }
    } catch (error) {
      throw error
    }

    // Validate user role before setting cookies
    if (data?.user) {
      const userRole = data.user.role
      const allowedRoles = Object.values(ROLES) as string[]

      if (!allowedRoles.includes(userRole)) {
        return {
          success: false,
          message: 'Invalid user role - please contact administrator',
          messageCode: SystemMessageCode.FORBIDDEN
        }
      }

      const hasAccess = (() => {
        const check = (items: MenuItem[]): boolean =>
          items.some(item => (item.allowedRoles?.includes(userRole as any) ?? false) || (item.children ? check(item.children) : false))

        return check(menuData)
      })()

      if (userRole === ROLES.OWNER && !hasAccess) {
        return {
          success: false,
          message: 'Access Denied: Your account does not have required menu permissions',
          messageCode: SystemMessageCode.FORBIDDEN
        }
      }
    }

    if (data?.accessToken) {
      const cookieStore = await cookies()

      cookieStore.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      })

      if (data.refreshToken) {
        cookieStore.set('refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/'
        })
      }
    }

    let user;

    if (data?.user) {
      const nameParts = data.user.name ? data.user.name.split(' ') : [];

      user = {
        id: data.user.id,
        email: data.user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: data.user.role,
        roles: data.user.roles || (data.user.role ? [data.user.role] : []),
        permissions: data.user.permissions || [],
        avatar: data.user.image,
        username: data.user.email
      }

      try {
        const cookieStore = await cookies()
        
        cookieStore.set('userInfo', JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        })
      } catch {}
    }

    return {
      success: true,
      user,
      messageCode: SystemMessageCode.AUTH_LOGIN_SUCCESS
    }

  } catch (error: any) {
    const status = Number(error?.status || 0)
    const code = String(error?.code || '')
    const message = String(error?.message || '')
    let messageCode = SystemMessageCode.AUTH_LOGIN_FAILED

    if (code === SystemMessageCode.AUTH_EMAIL_NOT_VERIFIED || status === 403) {
      messageCode = SystemMessageCode.AUTH_EMAIL_NOT_VERIFIED
    } else if (code === SystemMessageCode.AUTH_INVALID_CREDENTIALS || status === 401) {
      messageCode = SystemMessageCode.AUTH_INVALID_CREDENTIALS
    } else if (code === SystemMessageCode.VALIDATION_ERROR || status === 400) {
      messageCode = SystemMessageCode.VALIDATION_ERROR
    }

    return {
      success: false,
      message: message || 'Login failed',
      messageCode
    }
  }
}

export async function registerAction(
  prevState: RegisterResponse | null,
  formData: FormData
): Promise<RegisterResponse> {
  const payload = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validationResult = registerSchema.safeParse(payload)

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      messageCode: SystemMessageCode.VALIDATION_ERROR,
      errors: validationResult.error.flatten().fieldErrors
    }
  }

  const { firstName, lastName, email, password } = validationResult.data

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = 'http'
  const API_BASE_URL = `${protocol}://${host}`

  try {
    await backendClient('/api/auth/register', {
      method: 'POST',
      data: {
        firstName,
        lastName,
        email,
        password,
      },
      baseUrl: API_BASE_URL
    })

    return {
      success: true,
      registeredEmail: email,
      messageCode: SystemMessageCode.AUTH_REGISTER_SUCCESS
    }
  } catch (error: any) {
    const normalizedMessage = String(error?.message || '').toLowerCase()
    const status = Number(error?.status || 0)

    let messageCode = SystemMessageCode.AUTH_LOGIN_FAILED

    if (status === 400 && normalizedMessage.includes('already exists')) {
      messageCode = SystemMessageCode.AUTH_USER_ALREADY_EXISTS
    } else if (status === 400) {
      messageCode = SystemMessageCode.VALIDATION_ERROR
    }

    return {
      success: false,
      message: error.message || 'Registration failed',
      messageCode
    }
  }
}
