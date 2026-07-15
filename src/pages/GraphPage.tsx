/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { noteStorage } from '../services/noteStorage';
import { useTranslation } from '../i18n/i18n';
import { useToast } from '../hooks/useToast';
import { 
  Network, 
  Folder, 
  Star, 
  RefreshCw, 
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface GraphNode {
  id: string;
  title: string;
  folder: string;
  isFavorite: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export function GraphPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rawNodes, setRawNodes] = useState<any[]>([]);
  const [rawLinks, setRawLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFolder, setSelectedFolder] = useState<string>('All Folders');
  const [starredOnly, setStarredOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active simulated nodes & links
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const loadGraphData = async () => {
    try {
      const data = await noteStorage.getGraphData();
      setRawNodes(data.nodes || []);
      setRawLinks(data.links || []);
    } catch (err) {
      toast('Failed to load workspace graph', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraphData();
  }, []);

  // Compute unique folders for filter dropdown
  const folders = useMemo(() => {
    const set = new Set<string>();
    rawNodes.forEach(n => {
      if (n.folder) set.add(n.folder);
    });
    return ['All Folders', ...Array.from(set).sort()];
  }, [rawNodes]);

  // Apply filters on nodes and links
  const filteredData = useMemo(() => {
    let nodesResult = [...rawNodes];

    // Filter by Folder
    if (selectedFolder !== 'All Folders') {
      nodesResult = nodesResult.filter(n => n.folder === selectedFolder);
    }

    // Filter by Starred
    if (starredOnly) {
      nodesResult = nodesResult.filter(n => n.isFavorite);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      nodesResult = nodesResult.filter(n => n.title.toLowerCase().includes(query));
    }

    const nodeIds = new Set(nodesResult.map(n => n.id));

    // Links are only valid if both source and target are in our filtered nodes
    const linksResult = rawLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    return { nodes: nodesResult, links: linksResult };
  }, [rawNodes, rawLinks, selectedFolder, starredOnly, searchQuery]);

  // Re-initialize physics nodes when filtered data updates or container resizes
  useEffect(() => {
    if (filteredData.nodes.length === 0) {
      setNodes([]);
      return;
    }

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 500;

    // Preserve existing simulated nodes positions if possible, otherwise initialize randomly near center
    const idToNodeMap = new Map(nodes.map(n => [n.id, n]));

    const newNodes: GraphNode[] = filteredData.nodes.map(n => {
      const existing = idToNodeMap.get(n.id);
      if (existing) {
        return {
          ...existing,
          title: n.title,
          folder: n.folder,
          isFavorite: n.isFavorite,
        };
      }
      return {
        id: n.id,
        title: n.title,
        folder: n.folder,
        isFavorite: n.isFavorite,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
      };
    });

    setNodes(newNodes);
  }, [filteredData.nodes]);

  // Physics Simulation Loop (Standard force-directed iterative step)
  useEffect(() => {
    if (nodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 500;

    const runPhysicsStep = () => {
      setNodes(prevNodes => {
        if (prevNodes.length === 0) return prevNodes;

        // Clone positions to update safely
        const nextNodes = prevNodes.map(n => ({ ...n }));
        const idToNodeIndex = new Map(nextNodes.map((n, idx) => [n.id, idx]));

        // 1. Charge Force (Repulsion between all nodes)
        const kRepulsion = 400; // push strength
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeA = nextNodes[i];
            const nodeB = nextNodes[j];

            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distSq = dx * dx + dy * dy + 0.1; // avoid divide by zero
            const dist = Math.sqrt(distSq);

            if (dist < 300) {
              const force = kRepulsion / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              // Don't apply physics displacement to the node currently being dragged by user
              if (nodeA.id !== draggedNodeId) {
                nodeA.vx -= fx;
                nodeA.vy -= fy;
              }
              if (nodeB.id !== draggedNodeId) {
                nodeB.vx += fx;
                nodeB.vy += fy;
              }
            }
          }
        }

        // 2. Link Force (Attractive spring force pull between linked nodes)
        const kSpring = 0.05; // spring stiffness
        const desiredLength = 120; // default link length
        filteredData.links.forEach(link => {
          const idxSource = idToNodeIndex.get(link.source);
          const idxTarget = idToNodeIndex.get(link.target);

          if (idxSource !== undefined && idxTarget !== undefined) {
            const nodeA = nextNodes[idxSource];
            const nodeB = nextNodes[idxTarget];

            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

            const displacement = dist - desiredLength;
            const force = displacement * kSpring;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (nodeA.id !== draggedNodeId) {
              nodeA.vx += fx;
              nodeA.vy += fy;
            }
            if (nodeB.id !== draggedNodeId) {
              nodeB.vx -= fx;
              nodeB.vy -= fy;
            }
          }
        });

        // 3. Gravity/Center Pull Force & Update Positions with damping
        const kCenter = 0.01; // pull strength to center
        const centerX = width / 2;
        const centerY = height / 2;
        const damping = 0.85; // friction factor

        nextNodes.forEach(node => {
          if (node.id === draggedNodeId) return; // ignore physics for active dragged node

          // Pull to center
          node.vx += (centerX - node.x) * kCenter;
          node.vy += (centerY - node.y) * kCenter;

          // Apply velocity and damping
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= damping;
          node.vy *= damping;

          // Stay within screen padding
          node.x = Math.max(40, Math.min(width - 40, node.x));
          node.y = Math.max(40, Math.min(height - 40, node.y));
        });

        return nextNodes;
      });

      animationRef.current = requestAnimationFrame(runPhysicsStep);
    };

    animationRef.current = requestAnimationFrame(runPhysicsStep);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [nodes.length, filteredData.links, draggedNodeId]);

  // Node Drag Handler
  const handleMouseDown = (nodeId: string) => {
    setDraggedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNodeId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(n => {
      if (n.id === draggedNodeId) {
        return {
          ...n,
          x,
          y,
          vx: 0,
          vy: 0,
        };
      }
      return n;
    }));
  };

  const handleMouseUpOrLeave = () => {
    setDraggedNodeId(null);
  };

  // Helper colors for folders to distinguish nodes beautifully
  const getFolderColor = (folder: string): string => {
    const f = folder.toLowerCase();
    if (f === 'personal') return '#6366f1'; // Indigo
    if (f === 'work') return '#10b981'; // Emerald
    if (f === 'study') return '#f59e0b'; // Amber
    if (f === 'projects') return '#ec4899'; // Pink
    if (f === 'ideas') return '#8b5cf6'; // Violet
    return '#64748b'; // Slate / Default
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 flex flex-col min-h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] w-full max-w-full overflow-hidden">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-850 shrink-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Network className="h-8 w-8 text-indigo-500" />
              <span>{t('graph')}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Explore structural relationships between your notes. Drag nodes, adjust filters, and double-click to navigate.
            </p>
          </div>

          <button
            onClick={loadGraphData}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes in graph..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
              />
            </div>

            {/* Folder Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-white/5 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <Folder className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="bg-transparent focus:outline-hidden font-semibold cursor-pointer"
              >
                {folders.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Starred Filter button */}
            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                starredOnly 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'bg-slate-50 dark:bg-slate-950 border border-transparent hover:border-slate-200 text-slate-500'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${starredOnly ? 'fill-amber-500' : ''}`} />
              <span>{t('starred')}</span>
            </button>
          </div>

          {/* Color Key Legend */}
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Personal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Work
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Study
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              Projects
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              Ideas
            </span>
          </div>
        </div>

        {/* Dynamic Simulation Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 relative shadow-inner overflow-hidden min-h-[500px] sm:min-h-[600px] w-full max-w-full">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-xs">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                Running Graph Simulation...
              </span>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 text-xs max-w-sm mx-auto space-y-3">
              <Network className="h-10 w-10 text-slate-300" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Linked Nodes Found</p>
              <p className="leading-relaxed">To view a mind graph, create some links in your notes by writing brackets like <code className="bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 border border-slate-200/40 dark:border-white/5 rounded-md text-[11px]">[[Another Note Title]]</code>.</p>
            </div>
          ) : (
            <div ref={containerRef} className="absolute inset-0 w-full h-full">
              <svg
                width="100%"
                height="100%"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="w-full h-full select-none cursor-grab active:cursor-grabbing"
              >
                {/* SVG Links */}
                <g className="stroke-slate-200 dark:stroke-slate-800 stroke-[1.5]">
                  {filteredData.links.map((link, idx) => {
                    const srcNode = nodes.find(n => n.id === link.source);
                    const tgtNode = nodes.find(n => n.id === link.target);
                    if (!srcNode || !tgtNode) return null;

                    return (
                      <line
                        key={`link-${idx}`}
                        x1={srcNode.x}
                        y1={srcNode.y}
                        x2={tgtNode.x}
                        y2={tgtNode.y}
                        className="opacity-70 transition-all duration-75"
                      />
                    );
                  })}
                </g>

                {/* SVG Nodes */}
                <g>
                  {nodes.map(node => {
                    const color = getFolderColor(node.folder);
                    return (
                      <g 
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={() => handleMouseDown(node.id)}
                        onDoubleClick={() => navigate(`/note/${node.id}`)}
                        className="cursor-pointer group"
                      >
                        {/* Outer Glow ring on hover */}
                        <circle
                          r="18"
                          fill={color}
                          className="opacity-0 group-hover:opacity-15 transition-opacity duration-200"
                        />
                        {/* Main Node body */}
                        <circle
                          r="8"
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="shadow-md transition-transform duration-200 group-hover:scale-125"
                        />
                        {/* Title Label */}
                        <text
                          y="22"
                          textAnchor="middle"
                          className="text-[10px] sm:text-[11px] font-bold fill-slate-700 dark:fill-slate-300 font-sans tracking-tight opacity-90 select-none pointer-events-none drop-shadow-xs"
                        >
                          {node.title}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Float navigation guide */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/5 rounded-xl px-3 py-1.5 text-[9px] font-bold text-slate-300 tracking-wider uppercase">
                Double-click node to edit note
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
