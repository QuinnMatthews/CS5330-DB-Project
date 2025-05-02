import { NextResponse } from "next/server";

const mockProjects = [
  {
    name: "Election Study",
    manager_first_name: "Alice",
    manager_last_name: "Johnson",
    institute_name: "Civic Data Lab",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
  },
  {
    name: "Health Sentiment",
    manager_first_name: "Bob",
    manager_last_name: "Smith",
    institute_name: "Wellness Research Group",
    start_date: "2024-06-01",
    end_date: "2025-05-30",
  },
];

export async function GET() {
  return NextResponse.json(mockProjects);
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Mock add project:", body);
  return NextResponse.json({ success: true });
}
