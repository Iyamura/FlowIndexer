"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3-force";

interface Node {
  id: string;
  address: string;
  displayName?: string;
  type: string;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  trustType: string;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
}

export function TrustGraphViewer({ nodes, edges }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = svgRef.current;
    const width = svg.clientWidth || 600;
    const height = 400;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const sim = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(edges as any).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    svg.appendChild(g);

    const lines = edges.map((e) => {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("stroke", "#e2e8f0");
      line.setAttribute("stroke-width", "1.5");
      g.appendChild(line);
      return line;
    });

    const circles = nodes.map((n) => {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("r", "8");
      circle.setAttribute("fill", n.type === "organization" ? "hsl(142.1 76.2% 36.3%)" : "hsl(221.2 83.2% 53.3%)");
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "2");
      const title = document.createElementNS(ns, "title");
      title.textContent = n.displayName ?? n.address;
      circle.appendChild(title);
      g.appendChild(circle);
      return circle;
    });

    sim.on("tick", () => {
      lines.forEach((line, i) => {
        const edge = edges[i] as any;
        line.setAttribute("x1", edge.source.x ?? 0);
        line.setAttribute("y1", edge.source.y ?? 0);
        line.setAttribute("x2", edge.target.x ?? 0);
        line.setAttribute("y2", edge.target.y ?? 0);
      });
      circles.forEach((circle, i) => {
        const node = nodes[i] as any;
        circle.setAttribute("cx", node.x ?? 0);
        circle.setAttribute("cy", node.y ?? 0);
      });
    });

    return () => { sim.stop(); };
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
        No trust graph data yet. Index some trust relationships to see the network.
      </div>
    );
  }

  return (
    <div className="relative">
      <svg ref={svgRef} width="100%" height={400} className="bg-muted/20 rounded-md" />
      <div className="absolute bottom-3 left-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> User
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-600" /> Organization
        </span>
      </div>
    </div>
  );
}
