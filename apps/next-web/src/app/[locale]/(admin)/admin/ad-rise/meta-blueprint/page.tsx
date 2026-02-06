'use client';

import Page from '@/components/layout/page';
import MetaBlueprintWizard from '@/components/ad-rise/meta-blueprint/MetaBlueprintWizard';

export default function MetaBlueprintPage() {
    return (
        <Page title="Meta Ads Blueprint" titleId="menu.meta-blueprint">
            <MetaBlueprintWizard />
        </Page>
    );
}
