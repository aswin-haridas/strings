import { NextResponse } from "next/server";
import { getSession } from "@/lib/neo4j";

export async function POST(request: Request) {
  const session = await getSession();

  try {
    const { sourceName, targetName, strength } = await request.json();

    const result = await session.run(
      `MATCH (source:Person {name: $sourceName})
       MATCH (target:Person {name: $targetName})
       MERGE (source)-[r:CONNECTED_TO {strength: $strength}]->(target)
       RETURN source, target, r`,
      { sourceName, targetName, strength: strength || 1 }
    );

    if (result.records.length === 0) {
      return NextResponse.json({ error: "Nodes not found" }, { status: 404 });
    }

    const source = result.records[0].get("source");
    const target = result.records[0].get("target");
    const relationship = result.records[0].get("r");

    return NextResponse.json({
      source: source.identity.toString(),
      target: target.identity.toString(),
      strength: relationship.properties.strength,
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
