"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeftSidebar } from "@/components/left-sidebar";
import { GraphVisualization } from "@/components/graph-visualization";
import { RightSidebar } from "@/components/right-sidebar";

export interface GraphNode {
  id: string;
  name: string;
  bio?: string;
  connections: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NodeStyle {
  color: string;
  size: number;
  strokeWidth: number;
  strokeColor: string;
}

export interface GraphLink {
  source: string;
  target: string;
  strength?: number;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface User {
  id: string;
  name: string;
  bio?: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [relationshipNode, setRelationshipNode] = useState<GraphNode | null>(
    null
  );
  const [mainPerson, setMainPerson] = useState<GraphNode | null>(null);
  const nodeStyle: NodeStyle = {
    color: "#C15F3C",
    size: 29,
    strokeWidth: 3,
    strokeColor: "#FFFFFF",
  };
  const graphRef = useRef<HTMLDivElement | null>(null);

  // Check authentication
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      setUser({ id: userName, name: userName });
    } else {
      router.push("/login");
    }
  }, [router]);

  // Filter graph data to show only main person and their connections
  const filteredGraphData = mainPerson
    ? (() => {
        const connectedNodeIds = new Set<string>([mainPerson.id]);
        graphData.links.forEach((link) => {
          if (link.source === mainPerson.id) {
            connectedNodeIds.add(link.target);
          } else if (link.target === mainPerson.id) {
            connectedNodeIds.add(link.source);
          }
        });

        return {
          nodes: graphData.nodes.filter((node) =>
            connectedNodeIds.has(node.id)
          ),
          links: graphData.links.filter(
            (link) =>
              (link.source === mainPerson.id ||
                link.target === mainPerson.id) &&
              connectedNodeIds.has(link.source) &&
              connectedNodeIds.has(link.target)
          ),
        };
      })()
    : graphData;

  const handleSetMainPerson = (node: GraphNode) => {
    if (mainPerson?.id === node.id) {
      // Toggle off if clicking the same person
      setMainPerson(null);
    } else {
      setMainPerson(node);
      setRelationshipNode(null);
    }
  };

  // Fetch graph data from Neo4j
  const fetchGraphData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/graph?userName=${encodeURIComponent(user.name)}`
      );
      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
        if (data.nodes.length > 0 && !selectedNode) {
          setSelectedNode(data.nodes[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGraphData();
    }
  }, [user]);

  const addNode = async (name: string, bio?: string) => {
    try {
      const response = await fetch("/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });

      if (response.ok) {
        await fetchGraphData();
      }
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const addConnection = async (
    targetName: string,
    strength = 1,
    type?: string
  ) => {
    if (!user) return;

    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.name,
          targetName,
          strength,
          type,
        }),
      });

      if (response.ok) {
        await fetchGraphData();
      }
    } catch (error) {
      console.error("Error adding connection:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    router.push("/login");
  };

  if (!user || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-pampas">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-crail border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-pampas">
      {/* Left Sidebar */}
      <LeftSidebar
        onAddNode={addNode}
        onAddConnection={addConnection}
        currentUser={user}
      />

      {/* Center Graph Visualization */}
      <div className="flex-1 flex flex-col bg-pampas">
        <div className="flex-1 relative overflow-hidden" ref={graphRef}>
          <GraphVisualization
            data={filteredGraphData}
            onNodeClick={setSelectedNode}
            onSecondNodeClick={setRelationshipNode}
            selectedNode={selectedNode}
            relationshipNode={relationshipNode}
            containerRef={graphRef}
            nodeStyle={nodeStyle}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        selectedNode={selectedNode}
        relationshipNode={relationshipNode}
        setRelationshipNode={setRelationshipNode}
        graphData={graphData}
        onSetMainPerson={handleSetMainPerson}
        mainPerson={mainPerson}
        currentUser={user}
        onLogout={handleLogout}
      />
    </div>
  );
}
