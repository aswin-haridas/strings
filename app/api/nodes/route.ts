import { NextResponse } from "next/server";
import { getSession } from "@/lib/neo4j";

export async function POST(request: Request) {
  const session = await getSession();

  try {
    const { name, bio } = await request.json();

    const result = await session.run(
      `CREATE (n:Person {name: $name, bio: $bio})
       RETURN n`,
      { name, bio: bio || "" }
    );

    const node = result.records[0].get("n");

    return NextResponse.json({
      id: node.identity.toString(),
      name: node.properties.name,
      bio: node.properties.bio,
      connections: 0,
    });
  } catch (error) {
    console.error("Error creating node:", error);
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
