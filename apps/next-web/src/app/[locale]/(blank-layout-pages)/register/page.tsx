/* eslint-disable import/no-unresolved */
import type { Metadata } from 'next'

import Register from '@views/Register'

import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your account'
}

const RegisterPage = async () => {
  const mode = await getServerMode()

  return <Register mode={mode} />
}

export default RegisterPage
