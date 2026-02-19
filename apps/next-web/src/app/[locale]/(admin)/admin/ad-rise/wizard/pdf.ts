type PdfSection = {
  title: string;
  lines: string[];
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT_MARGIN = 48;
const TOP_MARGIN = 800;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const MAX_CHARS_PER_LINE = 92;
const MAX_LINES_PER_PAGE = 50;

function escapePdfText(text: string) {
  const asciiSafe = text.replace(/[^\x20-\x7E]/g, '?');

  return asciiSafe
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(text: string, width: number) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return [''];

  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);

  return lines;
}

function splitIntoPages(lines: string[]) {
  const pages: string[][] = [];

  for (let i = 0; i < lines.length; i += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + MAX_LINES_PER_PAGE));
  }

  return pages.length > 0 ? pages : [['']];
}

function serializePdf(objects: string[]) {
  let output = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((obj, index) => {
    offsets.push(output.length);
    output += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = output.length;

  output += `xref\n0 ${objects.length + 1}\n`;
  output += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return output;
}

export function downloadSimplePdf(params: {
  fileName: string;
  title: string;
  sections: PdfSection[];
}) {
  const allLines: string[] = [];

  allLines.push(params.title);
  allLines.push('');

  params.sections.forEach((section) => {
    allLines.push(section.title);
    allLines.push(...section.lines);
    allLines.push('');
  });

  const wrappedLines = allLines.flatMap(line => wrapLine(line, MAX_CHARS_PER_LINE));
  const pages = splitIntoPages(wrappedLines);
  const objects: string[] = [];
  const fontId = 3;
  const pageIds: number[] = [];

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [] /Count 0 >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  pages.forEach((pageLines) => {
    const contentParts: string[] = [];

    contentParts.push('BT');
    contentParts.push(`/F1 ${FONT_SIZE} Tf`);
    contentParts.push(`${LEFT_MARGIN} ${TOP_MARGIN} Td`);

    pageLines.forEach((line) => {
      contentParts.push(`(${escapePdfText(line)}) Tj`);
      contentParts.push(`0 -${LINE_HEIGHT} Td`);
    });

    contentParts.push('ET');

    const contentStream = contentParts.join('\n');
    const contentObj = `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`;

    objects.push(contentObj);
    const contentId = objects.length;

    const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;

    objects.push(pageObj);
    const pageId = objects.length;

    pageIds.push(pageId);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  const pdfText = serializePdf(objects);
  const blob = new Blob([pdfText], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = params.fileName.endsWith('.pdf') ? params.fileName : `${params.fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
