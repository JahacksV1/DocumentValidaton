import turso from './turso';

export async function insertDocument(dealId, filename, fileUrl, status = 'pending') {
  await turso.execute(
    "INSERT INTO documents (deal_id, filename, file_url, status, uploaded_at) VALUES (?, ?, ?, ?, ?)",
    [dealId, filename, fileUrl, status, new Date().toISOString()]
  );
}

export async function getDocumentsByDealId(dealId) {
  const results = await turso.execute(
    "SELECT * FROM documents WHERE deal_id = ? ORDER BY uploaded_at DESC",
    [dealId]
  );
  return results.rows;
}

export async function updateDocumentStatus(filename, status) {
  await turso.execute(
    "UPDATE documents SET status = ? WHERE filename = ?",
    [status, filename]
  );
}