import { NextRequest, NextResponse } from "next/server";
import { db, initDb, seedDefaultCategories } from "@/lib/db";
import { getUserId } from "@/lib/identity";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  await initDb();
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No user" }, { status: 401 });

  await seedDefaultCategories(userId);

  const result = await db.execute({
    sql: "SELECT * FROM categories WHERE user_id = ? ORDER BY created_at ASC",
    args: [userId],
  });

  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No user" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const clean = name.trim();

  const existing = await db.execute({
    sql: "SELECT id FROM categories WHERE user_id = ? AND name = ?",
    args: [userId, clean],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const id = uuidv4();
  await db.execute({
    sql: "INSERT INTO categories (id, user_id, name, is_default) VALUES (?, ?, ?, 0)",
    args: [id, userId, clean],
  });

  const result = await db.execute({
    sql: "SELECT * FROM categories WHERE id = ?",
    args: [id],
  });

  return NextResponse.json(result.rows[0]);
}
