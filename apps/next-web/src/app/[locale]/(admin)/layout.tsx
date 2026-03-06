/* eslint-disable import/no-unresolved */
// MUI Imports
import Button from '@mui/material/Button'
import { prisma } from '@platform/db'

// Type Imports
import type { ChildrenType } from '@core/types'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import ScrollToTop from '@core/components/scroll-to-top'

// Util Imports
import { getMode, getSystemMode } from '@core/utils/serverHelpers'
import { getServerUser } from '@/utils/serverAuth'
import Onboarding from '@views/Onboarding'

const Layout = async (props: ChildrenType) => {
    const { children } = props

    // Vars
    const direction = 'ltr'
    const mode = await getMode()
    const systemMode = await getSystemMode()
    const user = await getServerUser()

    let needsBusinessOnboarding = false

    if (user?.id) {
      const hasBusinessRole = await prisma.userBusinessRole.findFirst({
        where: {
          userId: user.id,
          deletedAt: null
        },
        select: { id: true }
      })

      needsBusinessOnboarding = !hasBusinessRole
    }

    if (needsBusinessOnboarding) {
      return (
        <Providers direction={direction}>
          <Onboarding modalOnly />
        </Providers>
      )
    }

    return (
        <Providers direction={direction}>
            <LayoutWrapper
                systemMode={systemMode}
                verticalLayout={
                    <VerticalLayout navigation={<Navigation mode={mode} />} navbar={<Navbar />} footer={<VerticalFooter />}>
                        {children}
                    </VerticalLayout>
                }
                horizontalLayout={
                    <HorizontalLayout header={<Header />} footer={<HorizontalFooter />}>
                        {children}
                    </HorizontalLayout>
                }
            />
            <ScrollToTop className='mui-fixed'>
                <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
                    <i className='tabler-arrow-up' />
                </Button>
            </ScrollToTop>
        </Providers>
    )
}

export default Layout
