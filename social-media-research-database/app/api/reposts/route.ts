import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryDB } from "@/app/api/utils";


// Common Zod Validators
const isoDateTime = z.string().datetime({ local: true }).transform(s => s.replace("T", " "));

// Create/Update user schema
const repostSchema = z.object({
    repost_datetime: isoDateTime,
    repost_seconds_known: z.coerce.boolean().nullable(),
    repost_username: z.string().min(1, "Username is required").max(100, "Username is too long"),
    post_datetime: isoDateTime,
    post_username: z.string().min(1, "Username is required").max(100, "Username is too long"),
    social_name: z.string().min(1, "Social platform is required").max(100, "Social platform is too long"),
})
.refine((data) => data.repost_datetime > data.post_datetime, "Repost datetime must be after post datetime");

// GET all reposts
export async function GET(request: NextRequest) {
    let query = `SELECT * FROM repost`;

    try {
        const results = await queryDB(query, []);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Create a post
export async function POST(request: NextRequest) {
    const body = await request.json();
    const parseResult = repostSchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }

    try {
        const { } =
            parseResult.data;

        const query = `INSERT INTO repost (repost_datetime, repost_seconds_known, repost_username, post_datetime, post_username, social_name)
        VALUES (CONVERT_TZ(?, '+00:00', 'SYSTEM'), ?, ?, CONVERT_TZ(?, '+00:00', 'SYSTEM'), ?, ?)`;

        const { repost_datetime, repost_seconds_known, repost_username, post_datetime, post_username, social_name } = parseResult.data;

        const result = await queryDB(query, [
            repost_datetime,
            repost_seconds_known,
            repost_username,
            post_datetime,
            post_username,
            social_name,
        ]);

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}


// Delete a repost
export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const parseResult = repostSchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }

    try {
        const { repost_datetime, repost_username, post_datetime, post_username, social_name } = parseResult.data;

        const query = `DELETE FROM repost 
            WHERE repost_datetime = CONVERT_TZ(?, '+00:00', 'SYSTEM')
            AND repost_username = ?
            AND post_datetime = CONVERT_TZ(?, '+00:00', 'SYSTEM')
            AND post_username = ?
            AND social_name = ?`;

        const result = await queryDB(query, [
            repost_datetime,
            repost_username,
            post_datetime,
            post_username,
            social_name,
        ]);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
