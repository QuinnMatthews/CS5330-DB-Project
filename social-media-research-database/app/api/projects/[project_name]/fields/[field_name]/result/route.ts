import { NextResponse, NextRequest } from "next/server";
import { queryDB } from "@/app/api/utils";
import { z } from "zod";

const isoDateTime = z.string().datetime({ local: true }).transform(s => s.replace("T", " "));

const fieldResultSchema = z.object({
    project_name: z.string().min(1).max(100),
    field_name: z.string().min(1).max(100),
    post_datetime: isoDateTime,
    post_username: z.string().min(1).max(100),
    post_social_name: z.string().min(1).max(100),
    result: z.string()
});

const fieldResultQuerySchema = z.object({
    project_name: z.string().min(1).max(100),
    field_name: z.string().min(1).max(100),
    start_datetime: isoDateTime,
    end_datetime: isoDateTime
});

// GET
export async function GET(request: NextRequest, context: { params: Promise<{ project_name: string, field_name: string }> }) {
    const params = await context.params;
    const body = await request.json();
    const parseResult = fieldResultQuerySchema.safeParse({ ...body, ...params });

    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }


    try {
        let query = `SELECT * FROM fieldresult WHERE project_name = ? AND field_name = ?`;
        const parameters = [parseResult.data.project_name, parseResult.data.field_name];

        if (parseResult.data.start_datetime) {
            parameters.push(parseResult.data.start_datetime);
            query += ` AND post_datetime >= CONVERT_TZ(?, '+00:00', 'SYSTEM')`;
        }
        if (parseResult.data.end_datetime) {
            parameters.push(parseResult.data.end_datetime);
            query += ` AND post_datetime <= CONVERT_TZ(?, '+00:00', 'SYSTEM')`;
        }

        const results = await queryDB(query, parameters);

        if (!results.length) {
            return NextResponse.json({ error: "No results found" }, { status: 404 });
        }

        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest, context: { params: Promise<{ project_name: string, field_name: string }> }) {
    const params = await context.params;
    const body = await request.json();
    const parseResult = fieldResultSchema.safeParse({ ...body, ...params });

    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }

    try {
        const query = `DELETE FROM fieldresult WHERE project_name = ? AND field_name = ? AND post_datetime = CONVERT_TZ(?, '+00:00', 'SYSTEM') AND post_username = ? AND post_social_name = ?`;
        const { project_name, field_name, post_datetime, post_username, post_social_name } = parseResult.data;
        const results = await queryDB(query, [project_name, field_name, post_datetime, post_username, post_social_name]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT
export async function PUT(request: NextRequest, context: { params: Promise<{ project_name: string, field_name: string }> }) {
    const params = await context.params;
    const body = await request.json();
    const parseResult = fieldResultSchema.safeParse({ ...body, ...params });
    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }

    try {
        const query = `INSERT INTO fieldresult (project_name, field_name, post_datetime, post_username, post_social_name, result) VALUES (?,?,CONVERT_TZ(?, '+00:00', 'SYSTEM'),?,?,?) ON DUPLICATE KEY UPDATE result = ?`;
        const { project_name, field_name, post_datetime, post_username, post_social_name, result } = parseResult.data;
        const results = await queryDB(query, [project_name, field_name, post_datetime, post_username, post_social_name, result, result]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
