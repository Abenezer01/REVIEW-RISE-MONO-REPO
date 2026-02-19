/* eslint-disable import/no-unresolved */
'use client'

import React from 'react'

import { Alert, AlertTitle } from '@mui/material'

import { useTranslation } from '@/hooks/useTranslation'

type Props = {
  children: React.ReactNode
}

interface ImplProps extends Props {
  t: any
}

class AdminErrorBoundaryImpl extends React.Component<ImplProps, { hasError: boolean; error?: any }> {
  constructor(props: ImplProps) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('AdminErrorBoundary caught', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity='error' role='alert'>
          <AlertTitle>{this.props.t('common.error')}</AlertTitle>
          {this.props.t('form.error-update')}
        </Alert>
      )
    }

    return this.props.children
  }
}

const AdminErrorBoundary = (props: Props) => {
  const t = useTranslation('common')

  return <AdminErrorBoundaryImpl {...props} t={t} />
}

export default AdminErrorBoundary
