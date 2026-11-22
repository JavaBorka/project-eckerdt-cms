import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

// PostgreSQL row shape (snake_case)
interface CategoryRow {
  id: number;
  name: string;
  is_system: boolean;
}

// OpenAPI response shape (camelCase)
interface Category {
  id: number;
  name: string;
  isSystem: boolean;
}

export default async (request: Request) => {
  // Step 1: Support GET and POST only.
  if (request.method !== "GET" && request.method !== "POST") {
    return Response.json(
      { message: "Method not allowed" },
      { status: 405, headers: { Allow: "GET, POST" } },
    );
  }

  try {
    // GET: Retrieve all categories.
    if (request.method === "GET") {
      const db = getDatabase();
      const rows = await db.sql<CategoryRow>`
        SELECT id, name, is_system
        FROM categories
        ORDER BY name ASC
      `;

      const categories: Category[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        isSystem: row.is_system,
      }));

      return Response.json(categories, { status: 200 });
    }

    // Step 2: Read and validate the POST JSON body.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return Response.json(
        { message: "Request body must be an object" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    if (typeof input.name !== "string") {
      return Response.json(
        { message: "Category name is required and must be a string" },
        { status: 400 },
      );
    }

    const name = input.name.trim();

    if (name.length < 1 || name.length > 255) {
      return Response.json(
        { message: "Category name must contain 1 to 255 characters" },
        { status: 400 },
      );
    }

    // Temporary test response. Step 3 will INSERT into PostgreSQL
    // and return 201 Created with the Category object.
    return Response.json(
      { message: "Valid category input", name },
      { status: 200 },
    );
  } catch (error) {
    console.error("Categories API error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/cms/categories",
};
