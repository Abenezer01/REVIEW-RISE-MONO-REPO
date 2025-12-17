import { redirect } from 'next/navigation'

type Props = {
    params: Promise<{ locale: string }>
}

// Redirect locale root to home page
export default async function LocaleRootPage({ params }: Props) {
    const { locale } = await params

    redirect(`/${locale}/home`)
}
