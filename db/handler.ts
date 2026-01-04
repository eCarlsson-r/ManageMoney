import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'Transactions';

export type AccountRow = {
  id: number;
  name: string;
  currency: string;
};

export type RecordRow = {
  id: number;
  date: string;
  description: string | null;
  amount: number;
  bookId: string;
};

export type RecentRecordRow = RecordRow & {
  accountName: string;
  currency: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

export async function closeDb(): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  dbPromise = null;
  await db.closeAsync();
}

export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      currency TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      bookId INTEGER NOT NULL,
      FOREIGN KEY (bookId) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_records_bookId ON records(bookId);
  `);
}

export async function createAccount(input: Omit<AccountRow, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO accounts (name, currency) VALUES (?, ?)',
    input.name,
    input.currency
  );
  return result.lastInsertRowId;
}

export async function getAccount(id: number): Promise<AccountRow | null> {
  const db = await getDb();
  return await db.getFirstAsync<AccountRow>('SELECT id, name, currency FROM accounts WHERE id = ?', id);
}

export async function getAllAccounts(): Promise<AccountRow[]> {
  const db = await getDb();
  return await db.getAllAsync<AccountRow>('SELECT id, name, currency FROM accounts ORDER BY name COLLATE NOCASE');
}

export async function updateAccount(account: AccountRow): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'UPDATE accounts SET name = ?, currency = ? WHERE id = ?',
    account.name,
    account.currency,
    account.id
  );
  return result.changes;
}

export async function deleteAccount(accountId: string): Promise<void> {
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM records WHERE bookId = ?', accountId);
    await txn.runAsync('DELETE FROM accounts WHERE id = ?', accountId);
  });
}

export async function createRecord(input: Omit<RecordRow, 'id'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO records (date, description, amount, bookId) VALUES (?, ?, ?, ?)',
    input.date,
    input.description,
    input.amount,
    input.bookId
  );
  return result.lastInsertRowId;
}

export async function updateRecord(record: RecordRow): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'UPDATE records SET date = ?, description = ?, amount = ? WHERE id = ?',
    record.date,
    record.description,
    record.amount,
    record.id
  );
  return result.changes;
}

export async function getRecord(id: number): Promise<RecordRow | null> {
  const db = await getDb();
  return await db.getFirstAsync<RecordRow>(
    'SELECT id, date, description, amount, bookId FROM records WHERE id = ?',
    id
  );
}

export async function getAllRecords(bookId: string): Promise<RecordRow[]> {
  const db = await getDb();
  return await db.getAllAsync<RecordRow>(
    'SELECT id, date, description, amount, bookId FROM records WHERE bookId = ? ORDER BY date DESC, id DESC',
    bookId
  );
}

export async function getRecentRecords(limit = 5): Promise<RecentRecordRow[]> {
  const db = await getDb();
  return await db.getAllAsync<RecentRecordRow>(
    `
      SELECT
        r.id,
        r.date,
        r.description,
        r.amount,
        r.bookId,
        a.name as accountName,
        a.currency as currency
      FROM records r
      INNER JOIN accounts a ON a.id = r.bookId
      ORDER BY r.date DESC, r.id DESC
      LIMIT ?
    `,
    limit
  );
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM records WHERE id = ?', id);
}

export async function getRecordCount(bookId?: number): Promise<number> {
  const db = await getDb();
  const row = bookId == null
    ? await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM records')
    : await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM records WHERE bookId = ?', bookId);
  return row?.count ?? 0;
}

export async function getRecordSum(bookId?: number): Promise<number> {
  const db = await getDb();
  const row = bookId == null
    ? await db.getFirstAsync<{ sum: number | null }>('SELECT SUM(amount) as sum FROM records')
    : await db.getFirstAsync<{ sum: number | null }>('SELECT SUM(amount) as sum FROM records WHERE bookId = ?', bookId);
  return row?.sum ?? 0;
}
