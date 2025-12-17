import type { ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

import Head from 'next/head';

// material-ui
import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';

import useTranslation from '@/hooks/useTranslation';

// ==============================|| Page - SET TITLE & META TAGS ||============================== //

interface Props extends BoxProps {
  children: ReactNode;
  meta?: ReactNode;
  title?: string;
  titleId?: string;
}

const Page = forwardRef<HTMLDivElement, Props>(({ children, title = '', titleId, meta, ...other }: Props, ref: Ref<HTMLDivElement>) => {
  const transl = useTranslation();

  return (
    <>
      <Head>
        <title>{`${titleId ? transl(titleId) : title} | ECDMS`}</title>
        {meta}
      </Head>

      <Box ref={ref} {...other}>
        {children}
      </Box>
    </>
  );
});

// Add displayName for better debugging
Page.displayName = 'Page';

export default Page;