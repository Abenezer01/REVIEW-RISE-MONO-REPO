'use client';

import Page from '@/components/layout/page';
import BlueprintWizard from '@/components/ad-rise/blueprint/BlueprintWizard';

export default function BlueprintPage() {
    return (
        <Page title="Google Search Blueprint" titleId="blueprint.title">
            <BlueprintWizard />
        </Page>
    );
}
