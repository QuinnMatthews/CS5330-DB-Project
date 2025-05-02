import { NextRequest, NextResponse } from "next/server";

// In-memory mock store
let mockFields: { project_name: string; field_name: string }[] = [
    { project_name: "Election Study", field_name: "Political Leaning" },
    { project_name: "Election Study", field_name: "Sentiment" },
    { project_name: "Health Sentiment", field_name: "Emotion" },
];

// Helper to decode project name from params
function getProjectNameFromRequest(request: NextRequest): string {
    const urlParts = request.url.split("/");
    const idx = urlParts.findIndex((part) => part === "projects");
    return decodeURIComponent(urlParts[idx + 1]);
}

// GET
export async function GET(_: NextRequest, context: { params: { project_name: string } }) {
    const params = await context.params;
    const projectName = params.project_name;

    const result = mockFields.filter((f) => f.project_name === projectName);
    return NextResponse.json(result);
}

// POST
export async function POST(request: NextRequest, context: { params: { project_name: string } }) {
    const { field_name } = await request.json();
    const params = await context.params;
    const projectName = params.project_name;

    mockFields.push({ project_name: projectName, field_name });
    return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest, context: { params: { project_name: string } }) {
    const { field_name } = await request.json();
    const params = await context.params;
    const projectName = params.project_name;

    mockFields = mockFields.filter(
        (f) => !(f.project_name === projectName && f.field_name === field_name)
    );
    return NextResponse.json({ success: true });
}

