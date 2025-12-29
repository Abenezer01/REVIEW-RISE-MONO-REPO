import type { KeywordDTO } from '@platform/contracts'

import type { ListingItemAdapter } from '@/types/general/listing-item'
import { createAction, createStatus } from './adapter-utils'

export const createKeywordAdapter = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ListingItemAdapter<KeywordDTO> => {
  return (keyword) => {
    const status = (keyword.status || 'active') as 'active' | 'archived'

    const statusConfig = status === 'active'
      ? createStatus('Active', 'success', 'tonal')
      : createStatus('Archived', 'default', 'tonal')

    return {
      id: keyword.id,
      primaryLabel: keyword.keyword,
      secondaryLabel: keyword.currentRank ? `Rank: ${keyword.currentRank}` : undefined,
      tertiaryLabel: keyword.language ? `Lang: ${keyword.language}` : undefined,
      status: statusConfig,
      tags: Array.isArray(keyword.tags) ? keyword.tags : [],
      actions: [
        createAction('Edit', () => onEdit(keyword.id), { icon: 'tabler-edit', variant: 'secondary', permission: { action: 'update', subject: 'Keyword' } }),
        createAction('Delete', () => onDelete(keyword.id), { icon: 'tabler-trash', variant: 'danger', permission: { action: 'delete', subject: 'Keyword' } })
      ]
    }
  }
}

