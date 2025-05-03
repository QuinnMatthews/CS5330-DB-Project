import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { queryDB } from "@/app/api/utils";

// Validation Schemas
const socialSchema = z.object({
  name: z
    .string({ required_error: "Platform name is required" })
    .min(1, "Platform name is required")
    .max(100, "Platform name should not exceed 100 characters")
    .describe("Social Platform Name"),
});

const deleteSchema = z.object({
  name: z
    .string()
    .min(1, "Platform name is required for deletion")
    .max(100, "Platform name should not exceed 100 characters"),
});

// GET all social platforms
export async function GET() {
  try {
    const query = `SELECT * FROM social`;
    const results = await queryDB(query);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST new social platform
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parseResult = socialSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const { name } = parseResult.data;
    const query = `INSERT INTO social (name) VALUES (?)`;
    const result = await queryDB(query, [name]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a social platform
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const parseResult = deleteSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const { name } = parseResult.data;
    const query = `DELETE FROM social WHERE name = ?`;
    const result = await queryDB(query, [name]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
