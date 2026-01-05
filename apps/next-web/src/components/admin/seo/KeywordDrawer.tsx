'use client'

import Box from '@mui/material/Box'

import type { KeywordDTO } from '@platform/contracts'

import CustomSideDrawer from '@/components/shared/drawer/side-drawer'
import KeywordForm from './KeywordForm'


interface KeywordDrawerProps {
  open: boolean
  initialData?: KeywordDTO | null
  businessId: string
  onClose: () => void
  onSuccess: () => Promise<void> | void
}

const KeywordDrawer = ({ open, initialData, businessId, onClose, onSuccess }: KeywordDrawerProps) => {
  return (
    <CustomSideDrawer open={open} title="Keyword" handleClose={onClose} width={700}>
      {() => (
        <Box>
          <KeywordForm
            businessId={businessId}
            initialData={initialData}
            onCancel={onClose}
            onSuccess={onSuccess}
          />
        </Box>
      )}
    </CustomSideDrawer>
  )
}

export default KeywordDrawer

