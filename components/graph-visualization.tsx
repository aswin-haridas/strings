"use client";

import type React from "react";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GraphData, GraphNode, NodeStyle } from "@/app/page";

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onSecondNodeClick: (node: GraphNode | null) => void;
  selectedNode: GraphNode | null;
  relationshipNode: GraphNode | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  nodeStyle: NodeStyle;
}

export function GraphVisualization({
  data,
  onNodeClick,
  onSecondNodeClick,
  selectedNode,
  relationshipNode,
  containerRef,
  nodeStyle,
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  console.log("running");

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create simulation
    const simulation = d3
      .forceSimulation(data.nodes as any[])
      .force(
        "link",
        d3
          .forceLink(data.links as any[])
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(nodeStyle.size + 20));

    const crailColor = "#C15F3C";
    const cloudyColor = "#B1ADA1";

    // Draw links
    const links = svg
      .append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", cloudyColor)
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.4)
      .attr("stroke-linecap", "round");

    const relationshipPathGroup = svg
      .append("g")
      .attr("class", "relationship-path");

    // Draw nodes as groups containing circle and label
    const nodeGroups = svg
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(data.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        if (selectedNode?.id === d.id) {
          onSecondNodeClick(null);
        } else if (relationshipNode?.id === d.id) {
          onSecondNodeClick(null);
        } else if (!relationshipNode) {
          onSecondNodeClick(d);
        } else {
          // If relationship node exists and new node clicked, make it the primary selected
          onNodeClick(d);
          onSecondNodeClick(null);
        }
        onNodeClick(d);
      });

    // Add circles to node groups
    nodeGroups
      .append("circle")
      .attr("r", nodeStyle.size)
      .attr("fill", (d) => (d.degree === 2 ? "#FFFFFF" : nodeStyle.color))
      .attr("stroke", (d) =>
        d.degree === 2 ? "#9CA3AF" : nodeStyle.strokeColor
      )
      .attr("stroke-width", nodeStyle.strokeWidth)
      .attr("opacity", 1);

    // Add labels to node groups
    nodeGroups
      .append("text")
      .text((d) => d.name)
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) => (d.degree === 2 ? "#374151" : "#FFFFFF"))
      .attr("pointer-events", "none");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroups.attr("transform", (d) => {
        const padding = nodeStyle.size;
        const x = Math.max(padding, Math.min(width - padding, d.x as number));
        const y = Math.max(padding, Math.min(height - padding, d.y as number));
        return `translate(${x},${y})`;
      });

      relationshipPathGroup.selectAll("*").remove();
      if (
        selectedNode &&
        relationshipNode &&
        selectedNode.id !== relationshipNode.id
      ) {
        const sourceNode = data.nodes.find((n) => n.id === selectedNode.id);
        const targetNode = data.nodes.find((n) => n.id === relationshipNode.id);

        if (
          sourceNode &&
          targetNode &&
          sourceNode.x &&
          sourceNode.y &&
          targetNode.x &&
          targetNode.y
        ) {
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
            .attr("stroke-linecap", "round");
        }
      }
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [
    data,
    containerRef,
    onNodeClick,
    onSecondNodeClick,
    selectedNode,
    relationshipNode,
    nodeStyle,
  ]);

  return <svg ref={svgRef} className="w-full h-full" />;
}
