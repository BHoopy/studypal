/** Quick smoke test for document parsing — run: npx tsx scripts/test-parse.ts */
import fs from 'fs';
import path from 'path';
import { parseDocument } from '../src/services/docProcessor';

async function main() {
  const samplePath = path.join(__dirname, '../../docling-service/test_sample.md');
  const buffer = fs.readFileSync(samplePath);
  const result = await parseDocument(buffer, 'test_sample.md');
  console.log('OK — text parse');
  console.log('  chars:', result.markdown.length);
  console.log('  pages:', result.metadata.page_count);
  console.log('  preview:', result.markdown.slice(0, 120).replace(/\n/g, ' '));

  // Minimal valid PDF (single page, "Hello Docling")
  const pdf = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n' +
    '4 0 obj<</Length 44>>stream\nBT /F1 24 Tf 100 700 Td (Hello Docling) Tj ET\nendstream\nendobj\n' +
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n' +
    'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000261 00000 n \n0000000355 00000 n \n' +
    'trailer<</Size 6/Root 1 0 R>>\nstartxref\n422\n%%EOF'
  );

  try {
    const pdfResult = await parseDocument(pdf, 'hello.pdf');
    console.log('\nOK — PDF parse');
    console.log('  chars:', pdfResult.markdown.length);
    console.log('  pages:', pdfResult.metadata.page_count);
    console.log('  preview:', pdfResult.markdown.slice(0, 200).replace(/\n/g, ' '));
  } catch (err) {
    console.error('\nPDF parse failed:', err instanceof Error ? err.message : err);
    console.error('  (Will try Docling if DOCLING_SERVICE_URL is set and service is running)');
  }
}

main().catch(err => {
  console.error('FAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
