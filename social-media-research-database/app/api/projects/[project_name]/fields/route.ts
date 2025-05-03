import { NextResponse, NextRequest } from "next/server";
import { queryDB } from "@/app/api/utils";
import { z } from "zod";
import { Project } from "@/app/projects/types";

export const fieldSchema = z.object({
    field_name: z.string().min(1).max(100),
});

// POST
export async function POST(request: NextRequest, context: { params: { project_name: string } }) {
    const params = await context.params;
    const projectName = params.project_name;
    const body = await request.json();
    const parseResult = fieldSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }


    try {
    const query = `INSERT INTO field (project_name, name) VALUES (?,?)`;
        const results = await queryDB(query, [projectName, parseResult.data.field_name]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest, context: { params: { project_name: string } }) {
    const params = await context.params;
    const projectName = params.project_name;
    const body = await request.json();
    const parseResult = fieldSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }
    const field_name = parseResult.data.field_name;

    try {
        const query = `DELETE FROM field WHERE project_name = ? AND name = ?`;
        const results = await queryDB(query, [projectName, field_name]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

