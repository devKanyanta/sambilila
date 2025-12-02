import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractTextFromPDF(buffer: Buffer) {
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    fullText += content.items
      .map((item: any) => item.str)
      .join(" ");
  }

  return fullText;
}
