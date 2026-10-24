// Opens data/app.db and creates tables on first use.
// API routes and the seed script both import this file.

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { INTEREST_SAMPLE_JOBS, isSuggestedInterest } from "./suggested/samples";
import type { Job, NewJob, NewWorker, Review, Trade, WorkRequest, Worker, WorkerPhoto } from "./types";

type WorkerRow = {
  id: number;
  name: string;
  phone: string;
  trade: string;
  headline: string;
  summary: string;
  skills: string;
  years_experience: number | null;
  area: string;
  languages: string;
  raw_description: string;
  created_at: string;
};

type JobRow = {
  id: number;
  customer_name: string;
  raw_text: string;
  trade: string;
  area: string;
  size_estimate: string | null;
  timeframe: string | null;
  summary: string;
  created_at: string;
  interest: string | null;
};

const globalForDb = globalThis as unknown as { tradelinkDb?: Database.Database };

function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      trade TEXT NOT NULL,
      headline TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      skills TEXT NOT NULL DEFAULT '[]',
      years_experience INTEGER,
      area TEXT NOT NULL DEFAULT '',
      languages TEXT NOT NULL DEFAULT '[]',
      raw_description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS worker_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      trade TEXT NOT NULL,
      area TEXT NOT NULL,
      size_estimate TEXT,
      timeframe TEXT,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS job_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      author_key TEXT NOT NULL,
      author_name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS job_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      actor_key TEXT NOT NULL,
      reaction TEXT NOT NULL CHECK (reaction IN ('like', 'interested')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (job_id, actor_key, reaction),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    CREATE INDEX IF NOT EXISTS job_comments_job_id ON job_comments(job_id);
    CREATE INDEX IF NOT EXISTS job_reactions_job_id ON job_reactions(job_id);
  `);
  const columns = db.prepare("PRAGMA table_info(jobs)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "interest")) {
    db.exec("ALTER TABLE jobs ADD COLUMN interest TEXT");
  }
  ensureInterestSamples(db);
}

function ensureInterestSamples(db: Database.Database) {
  const existing = db.prepare("SELECT summary FROM jobs WHERE interest IS NOT NULL").all() as { summary: string }[];
  const saved = new Set(existing.map((row) => row.summary));
  const insert = db.prepare(
    `INSERT INTO jobs (customer_name, raw_text, trade, area, size_estimate, timeframe, summary, created_at, interest)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const write = db.transaction(() => {
    for (const job of INTEREST_SAMPLE_JOBS) {
      if (saved.has(job.summary)) continue;
      insert.run(
        job.customer_name,
        job.raw_text,
        job.trade,
        job.area,
        job.size_estimate,
        job.timeframe,
        job.summary,
        job.created_at,
        job.interest,
      );
    }
  });
  write();
}

export function getDb(): Database.Database {
  if (!globalForDb.tradelinkDb) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const db = new Database(path.join(dir, "app.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 3000");
    globalForDb.tradelinkDb = db;
  }
  ensureSchema(globalForDb.tradelinkDb);
  return globalForDb.tradelinkDb;
}

function asStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
}

function safePhotoPath(value: string): string | null {
  if (!value.startsWith("/uploads/") || value.includes("..")) return null;
  return value;
}

function mapWorker(row: WorkerRow, photos: WorkerPhoto[], reviews?: Review[]): Worker {
  return {
    ...row,
    skills: asStringArray(row.skills),
    languages: asStringArray(row.languages),
    photos: photos.filter((photo) => photo.worker_id === row.id && safePhotoPath(photo.path)),
    reviews,
  };
}

function photosFor(workerId?: number): WorkerPhoto[] {
  const db = getDb();
  if (workerId) {
    return db.prepare("SELECT id, worker_id, path FROM worker_photos WHERE worker_id = ? ORDER BY id").all(workerId) as WorkerPhoto[];
  }
  return db.prepare("SELECT id, worker_id, path FROM worker_photos ORDER BY id").all() as WorkerPhoto[];
}

export function listWorkers(filters: { trade?: string; area?: string; id?: number }): Worker[] {
  const db = getDb();
  const where: string[] = [];
  const params: Array<string | number> = [];
  if (filters.id) {
    where.push("id = ?");
    params.push(filters.id);
  }
  if (filters.trade) {
    where.push("lower(trade) = lower(?)");
    params.push(filters.trade);
  }
  if (filters.area) {
    where.push("lower(area) = lower(?)");
    params.push(filters.area);
  }
  const sql = `SELECT * FROM workers ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY name COLLATE NOCASE`;
  const rows = db.prepare(sql).all(...params) as WorkerRow[];
  const photos = photosFor();
  return rows.map((row) => {
    const reviews = filters.id ? listReviews(row.id) : undefined;
    return mapWorker(row, photos, reviews);
  });
}

export function getWorker(id: number): Worker | null {
  return listWorkers({ id })[0] ?? null;
}

export function createWorker(input: NewWorker): Worker {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO workers
        (name, phone, trade, headline, summary, skills, years_experience, area, languages, raw_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.phone,
      input.trade,
      input.headline,
      input.summary,
      JSON.stringify(input.skills),
      input.years_experience,
      input.area,
      JSON.stringify(input.languages),
      input.raw_description,
    );
  const worker = getWorker(Number(info.lastInsertRowid));
  if (!worker) throw new Error("The worker was saved but could not be read back.");
  return worker;
}

export function countPhotos(workerId: number): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM worker_photos WHERE worker_id = ?").get(workerId) as { n: number };
  return row.n;
}

export function addWorkerPhoto(workerId: number, photoPath: string): WorkerPhoto {
  const info = getDb().prepare("INSERT INTO worker_photos (worker_id, path) VALUES (?, ?)").run(workerId, photoPath);
  return { id: Number(info.lastInsertRowid), worker_id: workerId, path: photoPath };
}

export function listReviews(workerId: number): Review[] {
  return getDb()
    .prepare("SELECT id, worker_id, rating, comment, reviewer_name FROM reviews WHERE worker_id = ? ORDER BY id DESC")
    .all(workerId) as Review[];
}

export function insertReview(workerId: number, rating: number, comment: string, reviewerName: string) {
  getDb().prepare("INSERT INTO reviews (worker_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?)").run(workerId, rating, comment, reviewerName);
}

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    customer_name: row.customer_name,
    raw_text: row.raw_text,
    trade: row.trade,
    area: row.area,
    size_estimate: row.size_estimate,
    timeframe: row.timeframe,
    summary: row.summary,
    created_at: row.created_at,
  };
}

export function listJobs(id?: number): Job[] {
  const db = getDb();
  if (id) {
    const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
    return row ? [mapJob(row)] : [];
  }
  return (
    db.prepare("SELECT * FROM jobs WHERE interest IS NULL OR trim(interest) = '' ORDER BY id DESC").all() as JobRow[]
  ).map(mapJob);
}

export function getJob(id: number): Job | null {
  return listJobs(id)[0] ?? null;
}

export function createJob(input: NewJob): Job {
  const info = getDb()
    .prepare(
      `INSERT INTO jobs (customer_name, raw_text, trade, area, size_estimate, timeframe, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(input.customer_name, input.raw_text, input.trade, input.area, input.size_estimate, input.timeframe, input.summary);
  const job = getJob(Number(info.lastInsertRowid));
  if (!job) throw new Error("The job was saved but could not be read back.");
  return job;
}

export function workersForMatch(trade: Trade, area: string): Worker[] {
  return listWorkers({ trade, area });
}

export function findRequest(jobId: number, workerId: number): WorkRequest | null {
  const row = getDb()
    .prepare("SELECT id, job_id, worker_id, status, created_at FROM requests WHERE job_id = ? AND worker_id = ?")
    .get(jobId, workerId) as WorkRequest | undefined;
  return row ?? null;
}

export function createRequest(jobId: number, workerId: number): WorkRequest {
  const info = getDb().prepare("INSERT INTO requests (job_id, worker_id) VALUES (?, ?)").run(jobId, workerId);
  const row = getDb()
    .prepare("SELECT id, job_id, worker_id, status, created_at FROM requests WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as WorkRequest;
  return row;
}

export type FeedComment = {
  id: number;
  job_id: number;
  author_name: string;
  body: string;
  created_at: string;
};

export type FeedReaction = "like" | "interested";

export type FeedReactionSummary = {
  like: number;
  interested: number;
  mine: { like: boolean; interested: boolean };
};

function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function interestClause(interests: string[] | undefined, where: string[], params: string[]) {
  if (interests) {
    const allowed = interests.filter(isSuggestedInterest);
    if (allowed.length === 0) {
      where.push("1 = 0");
      return;
    }
    where.push(`interest IN (${allowed.map(() => "?").join(", ")})`);
    params.push(...allowed);
    return;
  }
  where.push("(interest IS NULL OR trim(interest) = '')");
}

export function listJobFilterOptions(interests?: string[]): { areas: string[]; trades: string[] } {
  const db = getDb();
  const where: string[] = [];
  const params: string[] = [];
  interestClause(interests, where, params);
  const scope = where.join(" AND ");
  const areas = db
    .prepare(`SELECT DISTINCT area FROM jobs WHERE ${scope} AND trim(area) != '' ORDER BY area COLLATE NOCASE`)
    .all(...params) as { area: string }[];
  const trades = db
    .prepare(`SELECT DISTINCT trade FROM jobs WHERE ${scope} AND trim(trade) != '' ORDER BY trade COLLATE NOCASE`)
    .all(...params) as { trade: string }[];
  return { areas: areas.map((row) => row.area), trades: trades.map((row) => row.trade) };
}

export function listFeedJobs(filters: { area?: string; trade?: string; search?: string; interests?: string[] }): Job[] {
  const db = getDb();
  const where: string[] = [];
  const params: string[] = [];
  interestClause(filters.interests, where, params);
  if (filters.area) {
    where.push("lower(area) = lower(?)");
    params.push(filters.area);
  }
  if (filters.trade) {
    where.push("lower(trade) = lower(?)");
    params.push(filters.trade);
  }
  if (filters.search) {
    where.push(
      `(lower(summary) LIKE ? ESCAPE '\\' OR lower(raw_text) LIKE ? ESCAPE '\\' OR lower(trade) LIKE ? ESCAPE '\\' OR lower(area) LIKE ? ESCAPE '\\' OR lower(ifnull(timeframe, '')) LIKE ? ESCAPE '\\')`,
    );
    const pattern = likePattern(filters.search.toLowerCase());
    params.push(pattern, pattern, pattern, pattern, pattern);
  }
  const sql = `SELECT * FROM jobs ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY datetime(created_at) DESC, id DESC`;
  return (db.prepare(sql).all(...params) as JobRow[]).map(mapJob);
}

export function listFeedComments(jobIds: number[]): FeedComment[] {
  if (jobIds.length === 0) return [];
  const marks = jobIds.map(() => "?").join(", ");
  return getDb()
    .prepare(
      `SELECT id, job_id, author_name, body, created_at FROM job_comments WHERE job_id IN (${marks}) ORDER BY id`,
    )
    .all(...jobIds) as FeedComment[];
}

export function addFeedComment(jobId: number, authorKey: string, authorName: string, body: string): FeedComment {
  const info = getDb()
    .prepare("INSERT INTO job_comments (job_id, author_key, author_name, body) VALUES (?, ?, ?, ?)")
    .run(jobId, authorKey, authorName, body);
  const row = getDb()
    .prepare("SELECT id, job_id, author_name, body, created_at FROM job_comments WHERE id = ?")
    .get(Number(info.lastInsertRowid)) as FeedComment | undefined;
  if (!row) throw new Error("The comment was saved but could not be read back.");
  return row;
}

export function reactionSummary(jobIds: number[], actorKey: string): Map<number, FeedReactionSummary> {
  const summaries = new Map<number, FeedReactionSummary>();
  for (const id of jobIds) {
    summaries.set(id, { like: 0, interested: 0, mine: { like: false, interested: false } });
  }
  if (jobIds.length === 0) return summaries;
  const marks = jobIds.map(() => "?").join(", ");
  const db = getDb();
  const counts = db
    .prepare(`SELECT job_id, reaction, COUNT(*) AS n FROM job_reactions WHERE job_id IN (${marks}) GROUP BY job_id, reaction`)
    .all(...jobIds) as { job_id: number; reaction: string; n: number }[];
  for (const row of counts) {
    const summary = summaries.get(row.job_id);
    if (!summary) continue;
    if (row.reaction === "like" || row.reaction === "interested") summary[row.reaction] = row.n;
  }
  const mine = db
    .prepare(`SELECT job_id, reaction FROM job_reactions WHERE actor_key = ? AND job_id IN (${marks})`)
    .all(actorKey, ...jobIds) as { job_id: number; reaction: string }[];
  for (const row of mine) {
    const summary = summaries.get(row.job_id);
    if (!summary) continue;
    if (row.reaction === "like" || row.reaction === "interested") summary.mine[row.reaction] = true;
  }
  return summaries;
}

export function toggleFeedReaction(jobId: number, actorKey: string, reaction: FeedReaction): FeedReactionSummary {
  const db = getDb();
  const run = db.transaction(() => {
    const existing = db
      .prepare("SELECT id FROM job_reactions WHERE job_id = ? AND actor_key = ? AND reaction = ?")
      .get(jobId, actorKey, reaction) as { id: number } | undefined;
    if (existing) {
      db.prepare("DELETE FROM job_reactions WHERE id = ?").run(existing.id);
    } else {
      try {
        db.prepare("INSERT INTO job_reactions (job_id, actor_key, reaction) VALUES (?, ?, ?)").run(jobId, actorKey, reaction);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!message.includes("UNIQUE")) throw error;
      }
    }
  });
  run();
  return reactionSummary([jobId], actorKey).get(jobId) ?? { like: 0, interested: 0, mine: { like: false, interested: false } };
}

export function listRequestsForWorker(workerId: number): WorkRequest[] {
  return getDb()
    .prepare(
      `SELECT r.id, r.job_id, r.worker_id, r.status, r.created_at,
              j.customer_name, j.summary, j.trade, j.area, j.timeframe
       FROM requests r
       JOIN jobs j ON j.id = r.job_id
       WHERE r.worker_id = ?
       ORDER BY r.id DESC`,
    )
    .all(workerId) as WorkRequest[];
}
