import { PixelSprite, SPROUT, type SpriteDef } from '@/frontend/ui/PixelSprite';
import { Button } from '@/frontend/ui/primitives';
import { SeedPacket } from '@/frontend/graveyard/SeedPacket';

const ROCK: SpriteDef = {
  rows: ['....oooooooo....', '..ooRRRRRRRRoo..', '.oRRRRrrRRRRRRo.', 'oRRRRRRRRRRRrRRo', 'oRrRRRRRRRRRRRRo', 'oooooooooooooooo'],
  palette: { o: '#3c2a52', R: '#8a8aa8', r: '#6e6e92' },
};

function Box({ children, tone = 'rule' }: { children: React.ReactNode; tone?: 'rule' | 'rose' }) {
  return (
    <div className={`rl-panel-flat flex flex-col items-center gap-3 px-6 py-10 text-center ${tone === 'rose' ? 'rl-panel-rose' : ''}`} style={tone === 'rose' ? { borderColor: '#ff9db5' } : undefined}>
      {children}
    </div>
  );
}

export function EmptyGraveyard({ onNew, filtered = false }: { onNew: () => void; filtered?: boolean }) {
  return (
    <Box>
      <PixelSprite sprite={SPROUT} px={5} />
      <h2 className="rl-title max-w-sm text-2xl">{filtered ? 'No ideas match that.' : 'Your graveyard is waiting for its first idea.'}</h2>
      <p className="text-sm text-dim">{filtered ? 'Try another filter or a different search.' : 'Grab a seed packet to plant an unfinished project.'}</p>
      <SeedPacket onClick={onNew} />
    </Box>
  );
}

export function EmptyArchive() {
  return (
    <Box>
      <PixelSprite sprite={ROCK} px={6} />
      <h2 className="rl-title text-2xl">Nothing resting here yet.</h2>
      <p className="max-w-sm text-sm text-dim">Archived projects will appear here, and can always be restored.</p>
    </Box>
  );
}

export function LoadingBlock() {
  return (
    <div role="status" aria-label="Loading your projects" className="rl-panel-flat space-y-3 p-5">
      <span className="sr-only">Loading…</span>
      <div className="h-6 w-1/3 animate-pulse rounded bg-panel-2" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-panel-2" />
      <div className="h-4 w-4/6 animate-pulse rounded bg-panel-2" />
      <div className="h-24 animate-pulse rounded bg-panel-2" />
    </div>
  );
}

export function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <Box tone="rose">
      <h2 className="rl-title text-2xl">We could not load your projects.</h2>
      <p className="max-w-sm text-sm text-dim">Your saved ideas are safe. Check your connection and try again.</p>
      <Button onClick={onRetry}>Try again</Button>
    </Box>
  );
}
