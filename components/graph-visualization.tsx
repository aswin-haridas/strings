"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { GraphData, GraphNode } from "@/app/page"

interface GraphVisualizationProps {
  data: GraphData
  onNodeClick: (node: GraphNode) => void
  onSecondNodeClick: (node: GraphNode | null) => void
  selectedNode: GraphNode | null
  relationshipNode: GraphNode | null
  containerRef: React.RefObject<HTMLDivElement>
}

export function GraphVisualization({
  data,
  onNodeClick,
  onSecondNodeClick,
  selectedNode,
  relationshipNode,
  containerRef,
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

    // Create simulation
    const simulation = d3
      .forceSimulation(data.nodes as any[])
      .force(
        "link",
        d3
          .forceLink(data.links as any[])
          .id((d: any) => d.id)
          .distance((d: any) => 100 / (d.strength || 0.5)),
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60))

    const crailColor = "#C15F3C"
    const cloudyColor = "#B1ADA1"

    // Draw links
    const links = svg
      .append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", cloudyColor)
      .attr("stroke-width", (d: any) => (d.strength || 0.5) * 3)
      .attr("stroke-opacity", 0.4)
      .attr("stroke-linecap", "round")

    const relationshipPathGroup = svg.append("g").attr("class", "relationship-path")

    // Draw nodes
    const nodes = svg
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 40)
      .attr("fill", crailColor)
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 3)
      .attr("cursor", "pointer")
      .attr("opacity", 0.9)
      .call(d3.drag<SVGCircleElement, GraphNode>().on("start", dragstarted).on("drag", dragged).on("end", dragended))
      .on("click", (event, d) => {
        event.stopPropagation()
        if (selectedNode?.id === d.id) {
          onSecondNodeClick(null)
        } else if (relationshipNode?.id === d.id) {
          onSecondNodeClick(null)
        } else if (!relationshipNode) {
          onSecondNodeClick(d)
        } else {
          // If relationship node exists and new node clicked, make it the primary selected
          onNodeClick(d)
          onSecondNodeClick(null)
        }
        onNodeClick(d)
      })

    const labels = svg
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.name)
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#FFFFFF")
      .attr("pointer-events", "none")

    // Update positions on simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      nodes
        .attr("cx", (d) => Math.max(40, Math.min(width - 40, d.x as number)))
        .attr("cy", (d) => Math.max(40, Math.min(height - 40, d.y as number)))

      labels.attr("x", (d) => d.x).attr("y", (d) => (d.y as number) + 5)

      relationshipPathGroup.selectAll("*").remove()
      if (selectedNode && relationshipNode && selectedNode.id !== relationshipNode.id) {
        const sourceNode = data.nodes.find((n) => n.id === selectedNode.id)
        const targetNode = data.nodes.find((n) => n.id === relationshipNode.id)

        if (sourceNode && targetNode) {
          relationshipPathGroup
            .append("line")
            .attr("x1", sourceNode.x)
            .attr("y1", sourceNode.y)
            .attr("x2", targetNode.x)
            .attr("y2", targetNode.y)
            .attr("stroke", crailColor)
            .attr("stroke-width", 4)
            .attr("stroke-opacity", 0.8)
            .attr("stroke-dasharray", "8,4")
            .attr("stroke-linecap", "round")
        }
      }
    })

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [data, containerRef, onNodeClick, onSecondNodeClick, selectedNode, relationshipNode])

  return <svg ref={svgRef} className="w-full h-full" />
}
