'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
export default function NetworkGraph({ contacts, onSelect, selected }: any) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!svgRef.current || contacts.length === 0) return;
    const W = svgRef.current.clientWidth, H = svgRef.current.clientHeight;
    const svg: any = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const color = (s: number) => s >= 70 ? '#1D9E75' : s >= 40 ? '#7F77DD' : '#888780';
    const nodes: any[] = contacts.map((c: any) => ({ ...c, id: c.name }));
    const links: any[] = [];
    contacts.forEach((c: any) => c.topInteractions.slice(0,2).forEach((t: any) => {
      if (contacts.find((x: any) => x.name === t.name)) links.push({ source: c.name, target: t.name, value: t.count });
    }));
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(W/2, H/2))
      .force('collision', d3.forceCollide().radius(30));
    const g = svg.append('g');
    svg.call((d3.zoom() as any).on('zoom', (e: any) => g.attr('transform', e.transform.toString())));
    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke','#333').attr('stroke-width',(d: any) => Math.sqrt(d.value/50)).attr('stroke-opacity',0.6);
    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor','pointer').on('click',(_: any, d: any) => onSelect(d));
    (node as any).call((d3.drag() as any)
      .on('start',(e: any,d: any) => { if(!e.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag',(e: any,d: any) => { d.fx=e.x; d.fy=e.y; })
      .on('end',(e: any,d: any) => { if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }));
    node.append('circle').attr('r',(d: any) => 6+d.score/14).attr('fill',(d: any) => color(d.score))
      .attr('opacity',0.85).attr('stroke',(d: any) => selected?.name===d.name ? '#fff' : 'none').attr('stroke-width',2);
    node.append('text').text((d: any) => d.name.split(' ')[0]).attr('dy',(d: any) => 10+d.score/14)
      .attr('text-anchor','middle').attr('fill','#888').attr('font-size',10).attr('pointer-events','none');
    sim.on('tick', () => {
      link.attr('x1',(d: any) => d.source.x).attr('y1',(d: any) => d.source.y)
          .attr('x2',(d: any) => d.target.x).attr('y2',(d: any) => d.target.y);
      node.attr('transform',(d: any) => 'translate(' + d.x + ',' + d.y + ')');
    });
    return () => sim.stop();
  }, [contacts, selected, onSelect]);
  return <svg ref={svgRef} style={{ width: '100%', height: '100%', background: '#0f0f0f' }} />;
}