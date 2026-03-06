/* eslint-disable import/no-unresolved */
import type { Metadata } from 'next'

import VerifyEmail from '@views/VerifyEmail'

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your account email'
}

const VerifyEmailPage = () => {
  return <VerifyEmail />
}

export default VerifyEmailPage

