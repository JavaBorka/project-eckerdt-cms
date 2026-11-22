import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

// Database model: matches PostgreSQL columns
interface CategoryRow {
  id: number;
  name: string;
  is_system: boolean;
}

// API model: matches OpenAPI specification
interface Category {
  id: number;
  name: string;
  isSystem: boolean;
}

export default async (request: Request) => {
  if (request.method !== "GET") {
    return Response.json(
      { message: "Method not allowed" },
      {
        status: 405,
        headers: { Allow: "GET" },
      },
    );
  }

  try {
    const db = getDatabase();

    // Query PostgreSQL
    const rows = await db.sql<CategoryRow>`
      SELECT id, name, is_system
      FROM categories
      ORDER BY name ASC
    `;

    // Transform database records into API response
    const categories: Category[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      isSystem: row.is_system,
    }));

    // Return array directly, as defined in OpenAPI
    return Response.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/cms/categories",
};
