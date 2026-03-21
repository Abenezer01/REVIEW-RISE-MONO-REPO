import React from 'react';

type WhiteLabelConfig = {
  primaryColor?: string | null;
  accentColor?: string | null;
  title?: string | null;
  intro?: string | null;
  footer?: string | null;
  logoDataUrl?: string | null;
};

type BuildPdfInput = {
  sections: string[];
  whiteLabel: WhiteLabelConfig;
  formatSectionTitle: (value: string) => string;
};

export const buildReportsCenterPdf = async (input: BuildPdfInput): Promise<Buffer> => {
  const { sections, whiteLabel, formatSectionTitle } = input;

  const {
    Document: Doc,
    Page: Pg,
    Text: Txt,
    View: Vw,
    Image: Img,
    StyleSheet,
    renderToBuffer
  } = (await import('@react-pdf/renderer')) as any;

  const styles = StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 11,
      color: '#0f172a',
      backgroundColor: '#ffffff'
    },
    header: {
      padding: 24,
      backgroundColor: whiteLabel.primaryColor || '#0F172A',
      color: '#ffffff'
    },
    headerTitle: {
      fontSize: 20,
      marginTop: 8,
      marginBottom: 4
    },
    headerIntro: {
      fontSize: 11,
      lineHeight: 1.4
    },
    logo: {
      width: 96,
      height: 32,
      objectFit: 'contain' as const
    },
    content: {
      padding: 24,
      gap: 12
    },
    section: {
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      padding: 16
    },
    sectionTitle: {
      fontSize: 13,
      color: whiteLabel.accentColor || '#2563EB',
      marginBottom: 6
    },
    sectionBody: {
      fontSize: 11,
      lineHeight: 1.5
    },
    footer: {
      padding: 16,
      position: 'absolute' as const,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f8fafc',
      fontSize: 9,
      color: '#475569'
    }
  });

  const PdfDocument = (
    <Doc>
      <Pg size="A4" style={styles.page}>
        <Vw style={styles.header}>
          {whiteLabel.logoDataUrl ? <Img style={styles.logo} src={whiteLabel.logoDataUrl} /> : null}
          <Txt style={styles.headerTitle}>{whiteLabel.title || 'Monthly Performance Report'}</Txt>
          {whiteLabel.intro ? <Txt style={styles.headerIntro}>{whiteLabel.intro}</Txt> : null}
        </Vw>
        <Vw style={[styles.content, { paddingBottom: 72 }]}>
          {sections.map((section) => (
            <Vw key={section} style={styles.section}>
              <Txt style={styles.sectionTitle}>{formatSectionTitle(section)}</Txt>
              <Txt style={styles.sectionBody}>
                Key findings and highlights for {formatSectionTitle(section)} will appear here.
              </Txt>
            </Vw>
          ))}
        </Vw>
        <Vw style={styles.footer} fixed>
          <Txt>{whiteLabel.footer || ''}</Txt>
        </Vw>
      </Pg>
    </Doc>
  );

  const pdfBuffer = await renderToBuffer(PdfDocument);
  return Buffer.from(pdfBuffer);
};
