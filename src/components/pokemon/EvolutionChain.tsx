'use client';

import { useEffect, useState } from 'react';
import { EvolutionNode } from '@/types/evolution';
import { getEvolutionChain } from '@/lib/api/pokeapi';
import { parseEvolutionChain } from '@/lib/utils/evolution';
import { EvolutionSkeleton } from '../ui/LoadingSkeleton';
import ErrorState from '../ui/ErrorState';
import { TYPE_COLORS } from '@/lib/utils/type-colors';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface EvolutionChainProps {
  chainId: number;
  currentPokemonName: string;
  onNodeClick: (name: string) => void;
}

export function EvolutionChain({ chainId, currentPokemonName, onNodeClick }: EvolutionChainProps) {
  const [rootNode, setRootNode] = useState<EvolutionNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadEvolution() {
      try {
        setLoading(true);
        setError(false);
        const rawChain = await getEvolutionChain(chainId);
        const parsed = await parseEvolutionChain(rawChain.chain);
        
        if (active) {
          setRootNode(parsed);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading evolution chain:', err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadEvolution();

    return () => {
      active = false;
    };
  }, [chainId]);

  if (loading) return <EvolutionSkeleton />;
  if (error || !rootNode) {
    return (
      <ErrorState
        title="Evolution Chain Offline"
        message="Could not load evolution pathways for this creature."
        onRetry={() => {
          setLoading(true);
          getEvolutionChain(chainId)
            .then((raw) => parseEvolutionChain(raw.chain))
            .then((parsed) => {
              setRootNode(parsed);
              setLoading(false);
            })
            .catch(() => setError(true));
        }}
      />
    );
  }

  // Render a single Pokemon node card in the tree
  const NodeCard = ({ node }: { node: EvolutionNode }) => {
    const isCurrent = node.name.toLowerCase() === currentPokemonName.toLowerCase();
    const formattedName = node.name.charAt(0).toUpperCase() + node.name.slice(1);

    return (
      <div
        onClick={() => !isCurrent && onNodeClick(node.name)}
        className={`flex flex-col items-center p-3 rounded-2xl transition-all select-none w-28 text-center ${
          isCurrent
            ? 'ring-2 ring-blue-500/80 dark:ring-blue-400/80 bg-blue-50/20 dark:bg-blue-950/20 cursor-default'
            : 'glass-interactive cursor-pointer hover:-translate-y-1'
        }`}
      >
        {/* Artwork */}
        <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
          <Image
            src={node.sprite}
            alt={node.name}
            width={64}
            height={64}
            className="object-contain drop-shadow-md"
            unoptimized
          />
        </div>

        {/* Info */}
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">
          {formattedName}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          #{String(node.id).padStart(3, '0')}
        </span>

        {/* Miniature types display */}
        <div className="flex gap-0.5 mt-1.5 justify-center">
          {node.types.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[8px] px-1 rounded-sm border font-semibold scale-90"
              style={{
                backgroundColor: TYPE_COLORS[t].bg,
                borderColor: TYPE_COLORS[t].border,
                color: TYPE_COLORS[t].text,
              }}
            >
              {t.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Render connector arrow with condition labels
  const Connector = ({ conditions }: { conditions: EvolutionNode['conditions'] }) => {
    return (
      <div className="flex flex-col items-center justify-center px-1 py-2 font-sans min-w-[70px] text-center">
        {conditions.length > 0 ? (
          <div className="space-y-0.5 mb-1 max-w-[90px]">
            {conditions.map((cond, idx) => (
              <span
                key={idx}
                className="block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 leading-tight truncate"
                title={cond.label}
              >
                {cond.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[9px] font-bold text-slate-400 mb-1">Evolve</span>
        )}
        <div className="flex items-center text-slate-300 dark:text-slate-700 animate-pulse">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    );
  };

  // Recursive tree layout renderer
  const renderTree = (node: EvolutionNode) => {
    const hasEvolutions = node.evolvesTo.length > 0;

    return (
      <div className="flex items-center gap-2">
        {/* Parent Card */}
        <NodeCard node={node} />

        {/* Children Branches */}
        {hasEvolutions && (
          <div className="flex flex-col justify-center gap-6 border-l border-dashed border-slate-200 dark:border-slate-800/60 pl-4 py-2">
            {node.evolvesTo.map((child) => (
              <div key={child.id} className="flex items-center">
                <Connector conditions={child.conditions} />
                {renderTree(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar scroll-smooth py-4">
      <div className="min-w-max px-6 mx-auto flex justify-center">
        {renderTree(rootNode)}
      </div>
    </div>
  );
}

export default EvolutionChain;
