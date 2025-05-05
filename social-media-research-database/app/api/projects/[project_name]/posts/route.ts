import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryDB } from "@/app/api/utils";

const isoDateTime = z
    .string()
    .datetime({ local: true })
    .transform((s) => s.replace("T", " "));

// Used for identifying a post
const postKeySchema = z.object({
    datetime: isoDateTime,
    username: z.string().min(1).max(100),
    social_name: z.string().min(1).max(100),
});

// GET posts associated with a project
export async function GET(request: NextRequest, context: { params: { project_name: string } }) {
    const { project_name } = await context.params;

    const query = `
    SELECT p.*
    FROM project_post pp
    JOIN post p ON pp.datetime = p.datetime AND pp.username = p.username AND pp.social_name = p.social_name
    WHERE pp.project_name = ?
  `;

    try {
        const results = await queryDB(query, [project_name]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: GET /projects/:name/posts -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Associate a post with a project
export async function POST( request: NextRequest, context: { params: { project_name: string } }
) {
    const { project_name } = await context.params;
    const body = await request.json();
    const result = postKeySchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { datetime, username, social_name } = result.data;

    try {
        const query = `INSERT INTO project_post (project_name, datetime, username, social_name)
            VALUES (?, CONVERT_TZ(?, '+00:00', 'SYSTEM'), ?, ?)`;

        await queryDB(query, [project_name, datetime, username, social_name]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("ERROR: POST /projects/:name/posts -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Unassociate a post from a project
export async function DELETE(request: NextRequest, context: { params: { project_name: string } }) {
    const body = await request.json();
    const result = postKeySchema.safeParse(body);
    const { project_name } = await context.params;

    if (!result.success) {
        return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { datetime, username, social_name } = result.data;

    try {
        const query = `DELETE FROM project_post
            WHERE project_name = ? AND datetime = CONVERT_TZ(?, '+00:00', 'SYSTEM') AND username = ? AND social_name = ?`;
        await queryDB(query, [project_name, datetime, username, social_name]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("ERROR: DELETE /projects/:name/posts -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
