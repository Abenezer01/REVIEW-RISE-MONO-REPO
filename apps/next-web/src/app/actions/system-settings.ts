'use server'

import { writeFile, mkdir } from 'fs/promises'

import { join } from 'path'

import { revalidatePath } from 'next/cache'

import { prisma } from '@platform/db'

export type SystemSettingsData = {
  site_name: string
  site_title: string
  site_logo: string
  footer_text: string
  default_timezone: string
  notification_defaults: {
    email: boolean
    sms: boolean
    push: boolean
  }
  rate_limit_config: {
    max_requests: number
    window_ms: number
    strategy: string
  }
  email_config: {
    smtp_host: string
    smtp_port: number
    smtp_user: string
    smtp_password: string
    from_email: string
    from_name: string
  }
  security_config: {
    session_timeout_minutes: number
    password_min_length: number
    require_special_chars: boolean
    require_numbers: boolean
    require_uppercase: boolean
    enable_2fa: boolean
  }
  maintenance_mode: boolean
}

const DEFAULT_SETTINGS: SystemSettingsData = {
  site_name: 'RiseReview',
  site_title: 'RiseReview - Review Management Platform',
  site_logo: '',
  footer_text: '© 2024 RiseReview. All rights reserved.',
  default_timezone: 'UTC',
  notification_defaults: { email: true, sms: false, push: true },
  rate_limit_config: { max_requests: 100, window_ms: 60000, strategy: 'ip' },
  email_config: {
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: 'noreply@risereview.com',
    from_name: 'RiseReview',
  },
  security_config: {
    session_timeout_minutes: 60,
    password_min_length: 8,
    require_special_chars: true,
    require_numbers: true,
    require_uppercase: true,
    enable_2fa: false,
  },
  maintenance_mode: false,
}

export async function getSystemSettings(): Promise<SystemSettingsData> {
  try {
    const settings = await prisma.systemSetting.findMany()

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value

      return acc
    }, {} as Record<string, any>)

    // Merge with defaults
    return {
      ...DEFAULT_SETTINGS,
      ...settingsMap,
      notification_defaults: {
        ...DEFAULT_SETTINGS.notification_defaults,
        ...(settingsMap.notification_defaults || {}),
      },
      rate_limit_config: {
        ...DEFAULT_SETTINGS.rate_limit_config,
        ...(settingsMap.rate_limit_config || {}),
      },
      email_config: {
        ...DEFAULT_SETTINGS.email_config,
        ...(settingsMap.email_config || {}),
      },
      security_config: {
        ...DEFAULT_SETTINGS.security_config,
        ...(settingsMap.security_config || {}),
      },
    }
  } catch (error) {
    console.error('Failed to fetch system settings:', error)

    return DEFAULT_SETTINGS
  }
}

export async function updateSystemSettings(formData: FormData) {
  try {
    const siteName = formData.get('site_name') as string
    const siteTitle = formData.get('site_title') as string
    const footerText = formData.get('footer_text') as string
    let siteLogo = formData.get('site_logo') as string

    // Handle File Upload
    const logoFile = formData.get('site_logo_file') as File | null

    if (logoFile && logoFile.size > 0 && logoFile.name !== 'undefined') {
      try {
        const bytes = await logoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'images', 'uploads')

        await mkdir(uploadDir, { recursive: true })

        const filename = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)
        siteLogo = `/images/uploads/${filename}`
      } catch (uploadError) {
        console.error('Failed to upload logo:', uploadError)
      }
    }

    const timezone = formData.get('default_timezone') as string
    const maintenanceMode = formData.get('maintenance_mode') === 'on'

    // Notifications
    const notificationDefaults = {
      email: formData.get('notification_email') === 'on',
      sms: formData.get('notification_sms') === 'on',
      push: formData.get('notification_push') === 'on',
    }

    // Rate Limit
    const rateLimitConfig = {
      max_requests: Number(formData.get('rate_limit_max_requests')),
      window_ms: Number(formData.get('rate_limit_window_ms')),
      strategy: formData.get('rate_limit_strategy') as string || 'ip',
    }

    // Email Config
    const emailConfig = {
      smtp_host: formData.get('smtp_host') as string || '',
      smtp_port: Number(formData.get('smtp_port')) || 587,
      smtp_user: formData.get('smtp_user') as string || '',
      smtp_password: formData.get('smtp_password') as string || '',
      from_email: formData.get('from_email') as string || '',
      from_name: formData.get('from_name') as string || '',
    }

    // Security Config
    const securityConfig = {
      session_timeout_minutes: Number(formData.get('session_timeout_minutes')) || 60,
      password_min_length: Number(formData.get('password_min_length')) || 8,
      require_special_chars: formData.get('require_special_chars') === 'on',
      require_numbers: formData.get('require_numbers') === 'on',
      require_uppercase: formData.get('require_uppercase') === 'on',
      enable_2fa: formData.get('enable_2fa') === 'on',
    }

    const updates = [
      { key: 'site_name', value: siteName },
      { key: 'site_title', value: siteTitle },
      { key: 'site_logo', value: siteLogo },
      { key: 'footer_text', value: footerText },
      { key: 'default_timezone', value: timezone },
      { key: 'maintenance_mode', value: maintenanceMode },
      { key: 'notification_defaults', value: notificationDefaults },
      { key: 'rate_limit_config', value: rateLimitConfig },
      { key: 'email_config', value: emailConfig },
      { key: 'security_config', value: securityConfig },
    ]

    for (const update of updates) {
      await prisma.systemSetting.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value },
      })
    }

    revalidatePath('/[locale]/admin/settings/system', 'page')

    return { success: true }
  } catch (error) {
    console.error('Failed to update system settings:', error)

    return { success: false, error: 'Failed to update settings' }
  }
}
