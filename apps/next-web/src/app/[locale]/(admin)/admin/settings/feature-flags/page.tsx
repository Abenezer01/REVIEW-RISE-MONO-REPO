/* eslint-disable import/no-unresolved */

import { getFeatureFlags } from '@/app/actions/feature-flags'

import FeatureFlagsClient from './FeatureFlagsClient'

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlags()

  return (
    <div>
      <FeatureFlagsClient initialFlags={flags} />
    </div>
  )
}
