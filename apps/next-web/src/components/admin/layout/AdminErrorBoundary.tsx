/* eslint-disable import/no-unresolved */
'use client'

import React from 'react'

import { Alert, AlertTitle } from '@mui/material'

type Props = {
  children: React.ReactNode
}

class AdminErrorBoundaryImpl extends React.Component<Props, { hasError: boolean; error?: any }> {
  constructor(props: Props) {
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
          <AlertTitle>Something went wrong</AlertTitle>
          Please retry or contact support.
        </Alert>
      )
    }

    return this.props.children
  }
}

const AdminErrorBoundary = (props: Props) => <AdminErrorBoundaryImpl {...props} />

export default AdminErrorBoundary
