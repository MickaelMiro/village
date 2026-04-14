'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Contact {
  name: string; messages: number; activeDays: number; score: number;
  topInteractions: { name: string; count: number }[];
}
interface Props {
  contacts: Contact[]; onSelect: (c: Contact) => void; selected: Contact | null;
}

export default function NetworkGraph({ contacts, onSelect, selected }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!svgRef.current || contacts.length === 0) return;
    const W = svgRef.current.clientWidth;
    const H = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current) as any;
    svg.selectAll('*').remove();
    const scoreColor = (s: number) => s >= 70 ? '#1D9E75' : s >= 40 ? '#7F77DD' : '#888780';
    const nodes: any[] = contacts.map(c => ({ ...c, id: c.name }));
    const links: any[] = [];
    contacts.forEach(c => {
      c.topInteractions.slice(0, 2).forEach(t => {
        if (contacts.find(x => x.name === t.name)) {
          links.push({ source: c.name, target: t.name, value: t.count });
        }
      });
    });
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(30));
    const g = svg.append('g');
    svg.call(d3.zoom().on('zoom', (e: any) => { g.attr('transform', e.transform.toString()); }));
    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#333').attr('stroke-width', (d: any) => Math.sqrt(d.value / 50)).attr('stroke-opacity', 0.6);
    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor', 'pointer').on('click', (_: any, d: any) => onSelect(d));
    node.call(d3.drag()
      .on('start', (e: any, d: any) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e: any, d: any) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e: any, d: an
cat > ~/village/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
