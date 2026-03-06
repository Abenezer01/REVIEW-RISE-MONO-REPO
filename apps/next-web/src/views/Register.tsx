/* eslint-disable import/no-unresolved */
'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'

import classnames from 'classnames'

import { SystemMessageCode } from '@platform/contracts'

import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import type { SystemMode } from '@core/types'

import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

import themeConfig from '@configs/themeConfig'

import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { registerAction } from '@/app/actions/auth'

const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const Register = ({ mode }: { mode: SystemMode }) => {
  const { notify } = useSystemMessages()
  const t = useTranslations('auth')
  const router = useRouter()

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [state, dispatch, isPending] = useActionState(registerAction, null)

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  useEffect(() => {
    if (state?.success) {
      notify(state.messageCode || SystemMessageCode.AUTH_REGISTER_SUCCESS)
      const email = state.registeredEmail || ''
      const query = email ? `?email=${encodeURIComponent(email)}` : ''

      router.push(`/verify-email${query}`)
      
      return
    }

    if (state?.success === false) {
      notify(state.messageCode || SystemMessageCode.GENERIC_ERROR)
    }
  }, [state, notify, router])

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-dvh relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper min-is-full! p-6 md:min-is-[unset]! md:p-12 md:is-[480px]'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{t('register.title')}</Typography>
            <Typography>{t('register.subtitle')}</Typography>
            <Typography variant='body2'>{themeConfig.templateName}</Typography>
          </div>
          <form noValidate autoComplete='off' action={dispatch} className='flex flex-col gap-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <CustomTextField
                fullWidth
                name='firstName'
                label={t('register.firstName')}
                placeholder={t('register.firstName')}
                error={!!state?.errors?.firstName}
                helperText={state?.errors?.firstName?.[0]}
              />
              <CustomTextField
                fullWidth
                name='lastName'
                label={t('register.lastName')}
                placeholder={t('register.lastName')}
                error={!!state?.errors?.lastName}
                helperText={state?.errors?.lastName?.[0]}
              />
            </div>
            <CustomTextField
              fullWidth
              name='email'
              label={t('register.email')}
              placeholder={t('register.email')}
              type='email'
              error={!!state?.errors?.email}
              helperText={state?.errors?.email?.[0]}
            />
            <CustomTextField
              fullWidth
              name='password'
              label={t('register.password')}
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              error={!!state?.errors?.password}
              helperText={state?.errors?.password?.[0]}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={() => setIsPasswordShown(show => !show)} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <CustomTextField
              fullWidth
              name='confirmPassword'
              label={t('register.confirmPassword')}
              placeholder='············'
              type={isConfirmPasswordShown ? 'text' : 'password'}
              error={!!state?.errors?.confirmPassword}
              helperText={state?.errors?.confirmPassword?.[0]}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setIsConfirmPasswordShown(show => !show)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button fullWidth variant='contained' type='submit' disabled={isPending}>
              {isPending ? t('register.creatingAccount') : t('register.createAccount')}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>{t('register.haveAccount')}</Typography>
              <Typography component={Link} href='/login' color='primary.main'>
                {t('register.signIn')}
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
