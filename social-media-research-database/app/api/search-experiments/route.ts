import { NextRequest, NextResponse } from "next/server";
import { queryDB } from "@/app/api/utils";
import { z } from "zod";

const querySchema = z.object({
  name: z.string().min(1, "Project name is required"),
});

type FieldResult = {
  field_name: string;
  result: string | null;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get("project_name");

  const parsed = querySchema.safeParse({ name });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project name" }, { status: 400 });
  }

  try {
    const query = `
      SELECT
        p.text,
        p.datetime,
        p.username,
        p.social_name,
        p.city,
        p.region,
        p.country,
        p.likes,
        p.dislikes,
        p.has_multimedia,
        fr.field_name,
        fr.result
      FROM FieldResult fr
      LEFT JOIN Post p
        ON fr.post_datetime = p.datetime 
        AND fr.post_username = p.username 
        AND fr.post_social_name = p.social_name
      WHERE fr.project_name = ?;
    `;

    const results = await queryDB(query, [name]);

    console.log("Results:", results);

    const posts: {
      datetime: string;
      username: string;
      social_name: string;
      text: string | null;
      city: string | null;
      region: string | null;
      country: string | null;
      likes: number | null;
      dislikes: number | null;
      has_multimedia: boolean | null;
      field_results: FieldResult[];
    }[] = [];

    const postMap: Record<string, typeof posts[0]> = {};

    results.forEach((row: any) => {
      const key = `${row.datetime}|${row.username}|${row.social_name}`;
      if (!postMap[key]) {
        postMap[key] = {
          datetime: row.datetime,
          username: row.username,
          social_name: row.social_name,
          text: row.text,
          city: row.city,
          region: row.region,
          country: row.country,
          likes: row.likes,
          dislikes: row.dislikes,
          has_multimedia: row.has_multimedia,
          field_results: [],
        };
      }
      postMap[key].field_results.push({
        field_name: row.field_name,
        result: row.result,
      });
    });

    Object.values(postMap).forEach((post) => posts.push(post));

    const statsQuery = `
      SELECT
        field_name,
        COUNT(*) AS total,
        COUNT(result) AS with_result
      FROM FieldResult
      WHERE project_name = ?
      GROUP BY field_name;
    `;

    const statsResults = await queryDB(statsQuery, [name]);

    const field_stats = statsResults.map((stat: any) => ({
      field: stat.field_name,
      percentage_with_value: (stat.with_result / stat.total) * 100,
    }));

    return NextResponse.json({
      posts,
      field_stats,
    });
  } catch (err: any) {
    console.error("API ERROR:", err.message);
    return NextResponse.json({ error: "Failed to fetch project field results" }, { status: 500 });
  }
}
