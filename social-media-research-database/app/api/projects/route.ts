import { NextResponse, NextRequest } from "next/server";
import { queryDB } from "@/app/api/utils";
import { z } from "zod";

export const projectSchema = z.object({
    name: z
        .string({ required_error: "Project name is required" })
        .min(1, "Project name is required")
        .describe("Project Name"),

    manager_first: z
        .string({ required_error: "Manager first name is required" })
        .min(1, "Manager first name is required")
        .max(50, "Manager first name must be at most 50 characters")
        .describe("Manager First Name"),

    manager_last: z
        .string({ required_error: "Manager last name is required" })
        .min(1, "Manager last name is required")
        .max(50, "Manager last name must be at most 50 characters")
        .describe("Manager Last Name"),

    institute: z
        .string({ required_error: "Institute is required" })
        .min(1, "Institute is required")
        .max(100, "Institute name must be at most 100 characters")
        .describe("Institute"),

    start_date: z
        .coerce.date({ invalid_type_error: "Start date must be a valid date" })
        .describe("Start Date")
        .transform((d) => d.toISOString().split("T")[0]),

    end_date: z
        .coerce.date({ invalid_type_error: "End date must be a valid date" })
        .describe("End Date")
        .transform((d) => d.toISOString().split("T")[0]),
}).superRefine((data, ctx) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    if (end <= start) {
        ctx.addIssue({
            path: ["end_date"],
            code: z.ZodIssueCode.custom,
            message: "End date must be on or after start date",
        });
    }
});

const deleteSchema = z.object({
    name: z.string().min(1),
});

export async function GET() {
    try {
        const query = `
      SELECT p.*,
      JSON_ARRAYAGG(f.name) as fields
      FROM project p
      LEFT JOIN field f ON p.name = f.project_name
      GROUP BY p.name;
    `;
        const results = await queryDB(query);
        // clean up results to remove null fields
        const cleanedResults = (results as any[]).map((r) => {
            const parsed = typeof r.fields === "string" ? JSON.parse(r.fields) : r.fields;
            return { ...r, fields: (parsed ?? []).filter(Boolean) };
        });

        return NextResponse.json(cleanedResults);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const parseResult = projectSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }

    const { name, manager_first, manager_last, institute, start_date, end_date } = parseResult.data;

    try {
        const query = `
      INSERT INTO project (name, manager_first, manager_last, institute, start_date, end_date)
      VALUES (?,?,?,?,?,?)
      `;
        const results = await queryDB(query, [name, manager_first, manager_last, institute, start_date, end_date]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const parseResult = deleteSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }
    const { name } = parseResult.data;

    try {
        const query = `
        DELETE FROM project
        WHERE name = ?;
      `;
        const results = await queryDB(query, [name]);
        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const parseResult = projectSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: "Invalid input", details: parseResult.error.format() }, { status: 400 });
    }

    const { name, manager_first, manager_last, institute, start_date, end_date } = parseResult.data;

    try {
        const query = `
        UPDATE project
        SET manager_first = ?, manager_last = ?, institute = ?, start_date = ?, end_date = ?
        WHERE name = ?;
      `;
        const results = await queryDB(query, [manager_first, manager_last, institute, start_date, end_date, name]);

        return NextResponse.json(results);
    } catch (err: any) {
        console.error("ERROR: API -", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
