import { NextResponse } from "next/server";
import { getSession } from "@/lib/neo4j";

export async function POST(request: Request) {
  const session = await getSession();

  try {
    const { userName, targetName, strength, type } = await request.json();

    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create connection from logged-in user to target
    const result = await session.run(
      `MERGE (source:Person {name: $userName})
       MERGE (target:Person {name: $targetName})
       MERGE (source)-[r:CONNECTED_TO {strength: $strength, type: $type}]->(target)
       RETURN source, target, r`,
      { userName, targetName, strength: strength || 1, type: type || null }
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: "Failed to create connection" },
        { status: 404 }
      );
    }

    const source = result.records[0].get("source");
    const target = result.records[0].get("target");
    const relationship = result.records[0].get("r");

    return NextResponse.json({
      source: source.identity.toString(),
      target: target.identity.toString(),
      strength: relationship.properties.strength,
      type: relationship.properties.type,
    });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
