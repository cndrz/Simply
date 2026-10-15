import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { getUserId } from "@/lib/identity";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "No user" }, { status: 401 });
  const { id } = await params;

  const cat = await db.execute({
    sql: "SELECT name FROM categories WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  if (cat.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const name = (cat.rows[0] as unknown as { name: string }).name;

  await db.batch(
    [
      {
        sql: "DELETE FROM categories WHERE id = ? AND user_id = ?",
        args: [id, userId],
      },
      {
        sql: "UPDATE todos SET category = NULL WHERE user_id = ? AND category = ?",
        args: [userId, name],
      },
    ],
    "write"
  );

  return NextResponse.json({ ok: true });
}
