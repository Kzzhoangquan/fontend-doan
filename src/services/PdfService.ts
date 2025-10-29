export async function exportPolicyPdf({
  content,
  filename = 'generated-document.pdf',
  metadata,
}: {
  content: any;
  filename?: string;
  metadata?: { version: string; establishmentDate: string };
}) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const response = await fetch(`${apiBase}/api/v1/pdf/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'policy',
      filename,
      metadata,
      content,
    }),
  });
  const pdfBlob = await response.blob();
  const fileURL = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = fileURL;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(fileURL);
}
