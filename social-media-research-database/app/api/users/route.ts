import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryDB } from "@/app/api/utils";

// Common Zod Validators
const isoDate = z.coerce.date({ invalid_type_error: "Invalid date format" }).transform(d => d.toISOString().split("T")[0]);

// Create/Update user schema
const userSchema = z.object({
  username: z.string().min(1, "Username is required").max(100, "Username is too long"),
  social_name: z.string().min(1, "Social platform is required").max(100, "Social platform is too long"),
  first_name: z.string().max(50, "First name is too long").optional(),
  last_name: z.string().max(50, "Last name is too long").optional(),
  birthdate: isoDate.optional(),
  gender: z.string().max(10, "Gender is too long").optional(),
  birth_country: z.string().max(50, "Birth country is too long").optional(),
  residence_country: z.string().max(50, "Residence country is too long").optional(),
  verified: z.coerce.boolean(),
});

// Used for deletion and identifying rows
const userIdentitySchema = z.object({
  username: z.string().min(1, "Username is required").max(100, "Username is too long"),
  social_name: z.string().min(1, "Social platform is required").max(100, "Social platform is too long"),
});

// GET all users
export async function GET() {
  try {
    const query = `SELECT * FROM user`;
    const results = await queryDB(query);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Create a user
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parseResult = userSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
  }

  try {
    const { username, social_name, first_name, last_name, birthdate, gender, birth_country, residence_country, verified } =
      parseResult.data;

    const query = `
      INSERT INTO user (username, social_name, first_name, last_name, birthdate, gender, birth_country, residence_country, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await queryDB(query, [
      username,
      social_name,
      first_name || null,
      last_name || null,
      birthdate || null,
      gender || null,
      birth_country || null,
      residence_country || null,
      verified,
    ]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update a user
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parseResult = userSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
  }

  try {
    const { first_name, last_name, birthdate, gender, birth_country, residence_country, username, social_name, verified } =
      parseResult.data;

    const query = `
      UPDATE user
      SET first_name = ?, last_name = ?, birthdate = ?, gender = ?, birth_country = ?, residence_country = ?, verified = ?
      WHERE username = ? AND social_name = ?
    `;
    const result = await queryDB(query, [
      first_name,
      last_name,
      birthdate,
      gender,
      birth_country,
      residence_country,
      username,
      social_name,
      verified,
    ]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const parseResult = userIdentitySchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
  }

  try {
    const { username, social_name } = parseResult.data;
    const query = `DELETE FROM user WHERE username = ? AND social_name = ?`;
    const result = await queryDB(query, [username, social_name]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
