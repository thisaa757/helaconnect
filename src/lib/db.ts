// Opens data/app.db and creates tables on first use.
// API routes and the seed script both import this file.

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
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
};

const globalForDb = globalThis as unknown as { tradelinkDb?: Database.Database };

export function getDb(): Database.Database {
  if (globalForDb.tradelinkDb) return globalForDb.tradelinkDb;

  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, "app.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 3000");
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
  `);

  globalForDb.tradelinkDb = db;
  return db;
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
  return row;
}

export function listJobs(id?: number): Job[] {
  const db = getDb();
  if (id) {
    const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
    return row ? [mapJob(row)] : [];
  }
  return (db.prepare("SELECT * FROM jobs ORDER BY id DESC").all() as JobRow[]).map(mapJob);
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
