import { getFilteredPokemonList } from '@/lib/api/pokeapi';
import PokemonGrid from '@/components/pokemon/PokemonGrid';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sparkles } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    generation?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // Await searchParams in compliance with Next.js 15 rules
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const type = resolvedParams.type || '';
  const generation = resolvedParams.generation || '';
  const sort = resolvedParams.sort || 'id-asc';
  const page = Number(resolvedParams.page) || 1;

  // Fetch basic lists and count matching the criteria
  const { items, totalCount } = await getFilteredPokemonList({
    query,
    type,
    generation,
    sort,
    page,
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8 min-h-screen">
      {/* Fandex Dashboard Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-500">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold font-mono uppercase tracking-widest">
              Live Database Client
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span>Fandex Index</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Explore the Fanimon universe with real-time stats, 3D tilts, and energy capture transitions.
          </p>
        </div>

        {/* Global theme controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid Interface */}
      <PokemonGrid initialItems={items} totalCount={totalCount} />
    </main>
  );
}
