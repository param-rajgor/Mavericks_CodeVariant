import { useState, useMemo, memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Domain, OpenStatus } from '@/backend/domain/types';
import { DOMAIN_LIST, OPEN_STATUSES, STATUS_META } from '@/backend/domain/paths';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useSafe, useToast } from '@/frontend/ui/Toast';
import { useChrome } from '@/frontend/shell/AppChrome';
import { DropZone } from '@/frontend/dnd/DropZone';
import { DragLayer, type DragItem } from '@/frontend/dnd/DragLayer';
import { SPROUT, PixelSprite } from '@/frontend/ui/PixelSprite';
import { X, GripVertical, Sparkles } from 'lucide-react';
import { todayStr } from '@/backend/domain/dates';

interface SeedFormModalProps {
  open: boolean;
  onClose: () => void;
}

const isSeedCard = (item: DragItem) => item.kind === 'seed-card';

function SeedFormContent({ onClose }: { onClose: () => void }) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const { openDetail } = useChrome();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<Domain>('Software');
  const [status, setStatus] = useState<OpenStatus>('active');
  const [shaking, setShaking] = useState(false);
  const [growing, setGrowing] = useState(false);

  // Draggable seed card definition
  const seedCardData: DragItem = useMemo(
    () => ({
      kind: 'seed-card',
      label: name.trim() || 'Untitled Seed',
      preview: (
        <div className="p-4 bg-[#231e50] border-4 border-mint shadow-[0_6px_0_#14122e] text-center min-w-[180px]">
          <span className="font-display text-2xl text-mint block leading-tight">
            {name.trim() || 'Idea Seed'}
          </span>
          <span className="text-[10px] text-cream block mt-1 font-display uppercase">
            {domain} · {STATUS_META[status].label}
          </span>
          <span className="text-[10px] text-gold block mt-0.5 font-bold">
            Drop into Fertile Soil!
          </span>
        </div>
      ),
    }),
    [name, domain, status],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: 'draggable-seed-card-item',
    data: seedCardData,
    disabled: !name.trim(), // Can't drag until it has a name
  });

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 350);
  };

  const handleDropIntoSoil = async () => {
    if (!name.trim()) {
      triggerShake();
      toast.info('Name Required', 'Give your idea seed a name before sowing it into the soil.');
      return;
    }

    setGrowing(true);

    const saved = await safe(
      () =>
        actions.create({
          name: name.trim(),
          description: description.trim(),
          domain,
          status,
          progress: status === 'active' ? 10 : 0,
          startedAt: todayStr(),
          lastWorkedAt: todayStr(),
          tags: [],
          assets: [],
          assetNotes: '',
          stallReason: '',
          stallReasonDetails: '',
          currentInterest: 4,
          interestNote: '',
          completedText: '',
          remainingText: '',
        }),
      'Could not plant that project',
    );

    if (saved) {
      setTimeout(() => {
        setGrowing(false);
        toast.success(`"${saved.name}" has sprouted!`, undefined, {
          label: 'View',
          run: () => openDetail(saved.id),
        });
        onClose();
        setName('');
        setDescription('');
      }, 500);
    } else {
      setGrowing(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Plant a New Project Seed"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-[2px]"
    >
      <div className="relative w-full max-w-2xl bg-[#1e1c48] border-4 border-lavender shadow-[0_10px_0_#14122e] p-6 text-cream">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <PixelSprite sprite={SPROUT} px={3} />
            <div>
              <h3 className="font-display text-2xl text-soft leading-none">PLANT A NEW PROJECT</h3>
              <p className="text-xs text-dim mt-0.5">Add an unfinished idea or project directly into your graveyard.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="size-8 grid place-items-center bg-[#282560] border border-twilight hover:border-gold text-cream"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body + Action Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 items-start">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="font-display text-base text-gold block mb-1">
                IDEA NAME <span className="text-coral">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SocialPulse, MicroSaaS, Fantasy Novel"
                className={`w-full bg-[#151438] border-2 px-3 py-2 text-base text-soft font-body outline-none transition-all ${
                  shaking
                    ? 'shake-anim border-coral'
                    : 'border-twilight focus:border-gold'
                }`}
              />
              {shaking && (
                <span className="text-xs text-coral font-display mt-1 block">
                  Name is required to plant!
                </span>
              )}
            </div>

            <div>
              <label className="font-display text-base text-soft block mb-1">
                ONE-LINE PREMISE / DESCRIPTION
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was the core ambition or vision?"
                className="w-full bg-[#151438] border-2 border-twilight focus:border-gold px-3 py-2 text-sm text-soft font-body outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-display text-base text-soft block mb-1">DOMAIN</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full h-10 bg-[#151438] border-2 border-twilight text-cream font-display text-sm px-2.5 outline-none focus:border-gold"
                >
                  {DOMAIN_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-display text-base text-soft block mb-1">STATUS</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OpenStatus)}
                  className="w-full h-10 bg-[#151438] border-2 border-twilight text-cream font-display text-sm px-2.5 outline-none focus:border-gold"
                >
                  {OPEN_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Draggable Seed Card Preview */}
            <div className="pt-2">
              <span className="text-xs font-display text-dim block mb-1.5 uppercase tracking-wide">
                1. GRAB YOUR PREPARED SEED CARD:
              </span>
              <div
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                data-draggable
                onClick={() => {
                  if (!name.trim()) triggerShake();
                }}
                className={`p-3 bg-[#241f54] border-2 border-dashed transition-all select-none flex items-center justify-between ${
                  !name.trim()
                    ? 'border-dim/40 opacity-50 cursor-not-allowed'
                    : isDragging
                      ? 'ghost-slot border-mint opacity-40'
                      : 'border-mint hover:border-gold cursor-grab hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 text-mint" />
                  <div>
                    <span className="font-display text-lg text-mint block leading-tight">
                      {name.trim() || '(Enter idea name above)'}
                    </span>
                    <span className="text-[10px] text-cream/80 block">
                      {domain} · {STATUS_META[status].label}
                    </span>
                  </div>
                </div>
                <span className="font-display text-xs text-gold uppercase tracking-wider">
                  {name.trim() ? '✋ DRAG ME →' : 'FILL NAME'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Zone: Fertile Soil */}
          <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-[#151438] border-2 border-twilight text-center h-full">
            <span className="text-xs font-display text-dim uppercase tracking-wider">
              2. SOW INTO SOIL:
            </span>

            {growing ? (
              <div className="sprout-grow-anim flex flex-col items-center gap-2 py-6">
                <PixelSprite sprite={SPROUT} px={5} />
                <span className="font-display text-xl text-mint animate-pulse">SPROUTING...</span>
              </div>
            ) : (
              <DropZone
                id="fertile-soil-zone"
                label="FERTILE SOIL"
                description="Drop your Seed Card here to plant your project in the graveyard"
                color="#a8e6a1"
                icon={SPROUT}
                accepts={isSeedCard}
                onDrop={handleDropIntoSoil}
                idleHint="Drop Seed Card here"
                width="100%"
                height={160}
                style={{
                  border: '3px dashed #a8e6a1',
                }}
              >
                <span className="text-[11px] text-cream/70 font-display mt-1 block">
                  CANVAS PROTOCOL ACTION
                </span>
              </DropZone>
            )}

            <p className="text-[11px] text-dim leading-snug">
              No standard submit button. Drag your Seed Card into the Fertile Soil to sow!
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-dim">
          <span>You can flesh out milestones, assets, and reasons anytime via Edit.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-display text-xs text-gold hover:underline uppercase"
          >
            Cancel / Close
          </button>
        </div>
      </div>
    </div>
  );
}

export const SeedFormModal = memo(function SeedFormModal({ open, onClose }: SeedFormModalProps) {
  if (!open) return null;
  return (
    <DragLayer>
      <SeedFormContent onClose={onClose} />
    </DragLayer>
  );
});
