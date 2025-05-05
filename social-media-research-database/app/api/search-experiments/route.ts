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
        p.*,
        fr.field_name,
        fr.result
      FROM project_post pp
      LEFT JOIN FieldResult fr
        ON fr.project_name = pp.project_name
        AND fr.post_datetime = pp.datetime
        AND fr.post_username = pp.username
        AND fr.post_social_name = pp.social_name
      LEFT JOIN Post p
        ON p.datetime = pp.datetime
        AND p.username = pp.username
        AND p.social_name = pp.social_name
      WHERE pp.project_name = ?;
    `;

    const results = await queryDB(query, [name]);

    const fieldsQuery = `
      SELECT name
      FROM Field
      WHERE project_name = ?;
    `;

    const fieldsResults = await queryDB(fieldsQuery, [name]);
    const allFields = fieldsResults.map((field: any) => field.name);

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

    Object.values(postMap).forEach((post) => {
      // Ensure all fields are included in field_results
      const existingFields = new Set(post.field_results.map((fr) => fr.field_name));
      allFields.forEach((field: string) => {
        if (!existingFields.has(field)) {
          post.field_results.push({ field_name: field, result: null });
        }
      });
      posts.push(post);
    });

    console.log("Post Field Results:", posts.map((post) => post.field_results));

    const statsQuery = `
      SELECT
        fr.field_name,
        COUNT(DISTINCT CONCAT(fr.post_datetime, '|', fr.post_username, '|', fr.post_social_name)) AS posts_with_field,
        (SELECT COUNT(*)
          FROM project_post pp
          WHERE pp.project_name = ?
        ) AS total_posts
      FROM project_post pp
      LEFT JOIN FieldResult fr
      ON fr.post_datetime = pp.datetime
      AND fr.post_username = pp.username
      AND fr.post_social_name = pp.social_name
      WHERE pp.project_name =?
      GROUP BY fr.field_name;
    `;

    const statsResults = await queryDB(statsQuery, [name, name]);

    const totalPostsQuery = `
      SELECT COUNT(*) as total_posts
          FROM project_post pp
          WHERE pp.project_name = ?;
    `;

    const totalPostsResult = await queryDB(totalPostsQuery, [name]);
    const totalPosts = totalPostsResult[0]?.total_posts || 0;

    const fieldStatsMap: Record<string, number> = {};
    statsResults.forEach((stat: any) => {
      fieldStatsMap[stat.field_name] = (stat.posts_with_field / totalPosts) * 100;
    });

    const field_stats = allFields.map((field: string) => ({
      field,
      percentage_with_value: fieldStatsMap[field] || 0,
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
