"use client"

import { useState, useRef } from "react"
import { LeftSidebar } from "@/components/left-sidebar"
import { GraphVisualization } from "@/components/graph-visualization"
import { RightSidebar } from "@/components/right-sidebar"

export interface GraphNode {
  id: string
  name: string
  bio?: string
  connections: number
}

export interface GraphLink {
  source: string
  target: string
  strength?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { id: "1", name: "Alice", bio: "Developer & Designer", connections: 5 },
      { id: "2", name: "Bob", bio: "Product Manager", connections: 3 },
      { id: "3", name: "Carol", bio: "Data Scientist", connections: 4 },
      { id: "4", name: "David", bio: "DevOps Engineer", connections: 2 },
      { id: "5", name: "Eve", bio: "UX Researcher", connections: 3 },
    ],
    links: [
      { source: "1", target: "2", strength: 1 },
      { source: "1", target: "3", strength: 1 },
      { source: "2", target: "3", strength: 0.8 },
      { source: "2", target: "4", strength: 0.6 },
      { source: "3", target: "5", strength: 1 },
      { source: "1", target: "5", strength: 0.7 },
    ],
  })

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(graphData.nodes[0])
  const [relationshipNode, setRelationshipNode] = useState<GraphNode | null>(null)
  const graphRef = useRef<HTMLDivElement>(null)

  const addNode = (name: string, bio?: string) => {
    const newNode: GraphNode = {
      id: String(graphData.nodes.length + 1),
      name,
      bio,
      connections: 0,
    }
    setGraphData((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }))
  }

  const addConnection = (sourceName: string, targetName: string, strength = 1) => {
    const sourceNode = graphData.nodes.find((n) => n.name.toLowerCase() === sourceName.toLowerCase())
    const targetNode = graphData.nodes.find((n) => n.name.toLowerCase() === targetName.toLowerCase())

    if (sourceNode && targetNode) {
      const linkExists = graphData.links.some(
        (l) =>
          (l.source === sourceNode.id && l.target === targetNode.id) ||
          (l.source === targetNode.id && l.target === sourceNode.id),
      )

      if (!linkExists) {
        setGraphData((prev) => ({
          ...prev,
          links: [...prev.links, { source: sourceNode.id, target: targetNode.id, strength }],
        }))
      }
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-pampas">
      {/* Left Sidebar */}
      <LeftSidebar onAddNode={addNode} onAddConnection={addConnection} />

      {/* Center Graph Visualization */}
      <div className="flex-1 flex flex-col bg-pampas">
        <div className="p-6 border-b border-border bg-white rounded-b-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-crail text-white flex items-center justify-center font-bold">C</div>
            <h1 className="text-2xl font-bold text-foreground">Friendship Network</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            {graphData.nodes.length} people • {graphData.links.length} connections
            {relationshipNode && selectedNode && relationshipNode.id !== selectedNode.id && (
              <span className="ml-4 text-crail font-medium">
                Showing path: {selectedNode.name} → {relationshipNode.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex-1 relative overflow-hidden" ref={graphRef}>
          <GraphVisualization
            data={graphData}
            onNodeClick={setSelectedNode}
            onSecondNodeClick={setRelationshipNode}
            selectedNode={selectedNode}
            relationshipNode={relationshipNode}
            containerRef={graphRef}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        selectedNode={selectedNode}
        relationshipNode={relationshipNode}
        setRelationshipNode={setRelationshipNode}
        graphData={graphData}
      />
    </div>
  )
}
