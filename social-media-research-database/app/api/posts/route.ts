import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryDB } from "@/app/api/utils";


// Common Zod Validators
const isoDateTime = z.string().datetime({local: true, invalid_type_error: "Invalid date format"}).transform(s => s.replace("T", " "));

// Create/Update user schema
const postSchema = z.object({
  datetime: isoDateTime,
  username: z.string().min(1, "Username is required").max(100, "Username is too long"),
  social_name: z.string().min(1, "Social platform is required").max(100, "Social platform is too long"),
  text: z.string().optional(),
  country: z.string().max(50, "Country is too long").optional(),
  region: z.string().max(50, "State is too long").optional(),
  city: z.string().max(50, "City is too long").optional(),
  likes: z.number().int().nonnegative(),
  dislikes: z.number().int().nonnegative(),
  has_multimedia: z.coerce.boolean(),
});

// Used for deletion and identifying rows
const postIdentitySchema = z.object({
  datetime: isoDateTime,
  username: z.string().min(1, "Username is required").max(100, "Username is too long"),
  social_name: z.string().min(1, "Social platform is required").max(100, "Social platform is too long"),
});

const querySchema = z.object({
  social_name: z.string().max(100).optional(),
  username: z.string().max(100).optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  first_name: z.string().max(50).optional(),
  last_name: z.string().max(50).optional(),
});


// GET all posts w/ optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const queryParams = Object.fromEntries(searchParams.entries());

  const result = querySchema.safeParse(queryParams);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: result.error.errors }, { status: 400 });
  }

  const { social_name, username, start, end, first_name, last_name } = result.data;


  let query = `
    SELECT post.* FROM post
    JOIN user ON post.username = user.username AND post.social_name = user.social_name
    WHERE 1=1
  `;
  const params: any[] = [];

  if (social_name) {
    query += " AND post.social_name = ?";
    params.push(social_name);
  }

  if (username) {
    query += " AND post.username = ?";
    params.push(username);
  }

  if (start) {
    query += " AND post.datetime >= ?";
    params.push(start);
  }

  if (end) {
    query += " AND post.datetime <= ?";
    params.push(end);
  }

  if (first_name) {
    query += " AND user.first_name = ?";
    params.push(first_name);
  }

  if (last_name) {
    query += " AND user.last_name = ?";
    params.push(last_name);
  }

  try {
    const results = await queryDB(query, params);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Create a post
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parseResult = postSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
  }

  try {
    const { datetime, username, social_name, text, country, region, city, likes, dislikes, has_multimedia } =
      parseResult.data;

    const query = `
      INSERT INTO post (datetime, username, social_name, text, country, region, city, likes, dislikes, has_multimedia)
      VALUES (CONVERT_TZ(?, '+00:00', 'SYSTEM'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await queryDB(query, [
      datetime,
      username,
      social_name,
      text,
      country,
      region,
      city,
      likes,
      dislikes,
      has_multimedia
    ]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update a post
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parseResult = postSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
  }

  try {
    const { datetime, username, social_name, text, country, region, city, likes, dislikes, has_multimedia } =
      parseResult.data;

    const query = `
      UPDATE post
      SET text = ?, country = ?, region = ?, city = ?, likes = ?, dislikes = ?, has_multimedia = ?
      WHERE datetime = CONVERT_TZ(?, '+00:00', 'SYSTEM') AND username = ? AND social_name = ?
    `;
    const result = await queryDB(query, [
      text,
      country,
      region,
      city,
      likes,
      dislikes,
      has_multimedia,
      datetime,
      username,
      social_name,
    ]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete a post
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const parseResult = postIdentitySchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
  }

  try {
    const { datetime, username, social_name } = parseResult.data;
    const query = `DELETE FROM post WHERE datetime = CONVERT_TZ(?, '+00:00', 'SYSTEM') AND username = ? AND social_name = ?`;
    const result = await queryDB(query, [datetime, username, social_name]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ERROR: API -", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
