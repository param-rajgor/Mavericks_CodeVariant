import { useMemo, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Download, HardDrive, Rocket, ShieldCheck, Trash2, Upload, GripVertical, FileCode } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { PageHeader } from '@/frontend/ui/primitives';
import { useSafe, useToast } from '@/frontend/ui/Toast';
import { DragLayer, type DragItem } from '@/frontend/dnd/DragLayer';
import { DropZone } from '@/frontend/dnd/DropZone';

function DraggableSettingsToken({ id, label, icon: Icon, color, hint }: { id: string; label: string; icon: typeof Rocket; color: string; hint: string }) {
  const data: DragItem = useMemo(
    () => ({
      kind: 'card',
      label,
      preview: (
        <div
          className="p-3 bg-[#1e1c48] border-2 shadow-[0_4px_0_#14122e] flex items-center gap-2 select-none"
          style={{ borderColor: color }}
        >
          <Icon className="size-4" style={{ color }} />
          <span className="font-display text-base text-soft uppercase tracking-wide">{label}</span>
        </div>
      ),
    }),
    [id, label, color],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, data });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable
      title={`Drag onto designated action zone: ${hint}`}
      className={`px-3 py-2 bg-[#221d4c] border-2 shadow-[0_3px_0_#14122e] flex items-center justify-between gap-3 cursor-grab select-none transition-all ${
        isDragging ? 'opacity-30 scale-95 border-dashed' : 'hover:-translate-y-0.5'
      }`}
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="size-4 text-dim shrink-0" />
        <Icon className="size-4 shrink-0" style={{ color }} />
        <span className="font-display text-base text-cream uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-[10px] font-display text-gold uppercase tracking-wider">
        ✋ DRAG
      </span>
    </div>
  );
}

export function SettingsPage() {
  const { projects, actions, memoryOnly } = useProjects();
  const toast = useToast();
  const safe = useSafe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOverFile, setDragOverFile] = useState(false);

  const exportData = () => {
    try {
      const blob = new Blob([actions.exportJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relaunch-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Backup downloaded', `${projects.length} project${projects.length === 1 ? '' : 's'} saved to a JSON file.`);
    } catch (e) {
      toast.error('Could not create the backup', `${e instanceof Error ? e.message : 'Unknown error.'} Nothing was changed.`);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const r = await safe(() => actions.importJson(text), 'Could not import that file');
      if (r) toast.success('Backup restored', `${r.added} added, ${r.replaced} updated${r.skipped ? `, ${r.skipped} skipped` : ''}.`);
    } catch {
      toast.error('Could not read that file', 'Please choose a Relaunch backup (.json).');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const wipe = async () => {
    const ok = await safe(async () => {
      await actions.removeAll();
      return true;
    }, 'Could not delete your data');
    if (ok) {
      toast.success('All local data cleared', undefined, {
        label: 'Undo',
        run: () => void actions.undo(),
      });
    }
  };

  return (
    <DragLayer>
      <div className="max-w-5xl space-y-6">
        <PageHeader title="Settings" subtitle="Relaunch keeps everything on this device. Primary actions follow the Canvas Protocol." />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Privacy info */}
          <section className="rl-panel space-y-3 p-5" aria-labelledby="priv">
            <h2 id="priv" className="flex items-center gap-2 text-lg font-extrabold text-soft">
              <ShieldCheck aria-hidden className="size-5 text-mint" /> Privacy and storage
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-cream">
              <li>Projects are stored in your browser's IndexedDB, so they work offline.</li>
              <li>Scores are calculated on this device with a transparent formula. No AI service is called.</li>
              <li>Clearing site data, or using a different browser, can hide your projects. Export a backup to be safe.</li>
            </ul>
            <p className="flex items-center gap-2 text-sm font-bold text-dim">
              <HardDrive aria-hidden className="size-4" />
              {memoryOnly ? 'Storage unavailable: changes are not being saved.' : `${projects.length} project${projects.length === 1 ? '' : 's'} stored on this device.`}
            </p>
          </section>

          {/* Backup Section: Drag to Export & File Drop for Import (Audit #13) */}
          <section className="rl-panel space-y-4 p-5" aria-labelledby="backup">
            <h2 id="backup" className="flex items-center gap-2 text-lg font-extrabold text-soft">
              <Download aria-hidden className="size-5 text-gold" /> Backup & Export
            </h2>
            <p className="text-sm text-dim">
              Drag the backup crate onto the download zone to export, or drop a .json file to restore.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <DraggableSettingsToken
                id="token-export"
                label="Backup Crate"
                icon={Download}
                color="#ffd166"
                hint="Drop onto Download Zone"
              />

              <DropZone
                id="zone-export-download"
                label="DOWNLOAD BACKUP"
                description="Drop backup crate here to trigger JSON download"
                color="#ffd166"
                accepts={(i) => i.kind === 'card'}
                onDrop={exportData}
                idleHint="Drop crate here"
                width="100%"
                height={80}
              />
            </div>

            {/* Import Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverFile(true);
              }}
              onDragLeave={() => setDragOverFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverFile(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void onFile(file);
              }}
              onClick={() => fileRef.current?.click()}
              className={`p-4 border-2 border-dashed transition-all text-center cursor-pointer ${
                dragOverFile ? 'bg-[#29235a] border-mint scale-[1.02]' : 'bg-[#151438] border-twilight hover:border-lavender'
              }`}
            >
              <FileCode className="size-5 text-mint mx-auto mb-1" />
              <span className="font-display text-sm text-soft block">
                DROP A .JSON BACKUP FILE HERE TO RESTORE
              </span>
              <span className="text-[11px] text-dim block mt-0.5">Or click to browse from disk</span>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>
          </section>

          {/* Sample Projects (Audit #13) */}
          <section className="rl-panel space-y-4 p-5 md:col-span-2" aria-labelledby="samples">
            <h2 id="samples" className="flex items-center gap-2 text-lg font-extrabold text-soft">
              <Rocket aria-hidden className="size-5 text-lavender" /> Sample projects
            </h2>
            <p className="text-sm text-dim">
              Twelve made-up projects demonstrating Relaunch. Drag the sample cart into the restore zone to populate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center max-w-xl">
              <DraggableSettingsToken
                id="token-samples"
                label="12 Sample Projects"
                icon={Rocket}
                color="#b995ff"
                hint="Drop onto Restore Zone"
              />

              <DropZone
                id="zone-load-samples"
                label="ADD SAMPLE PROJECTS"
                description="Drop sample cart here to add 12 demo projects"
                color="#b995ff"
                accepts={(i) => i.kind === 'card'}
                onDrop={async () => {
                  await actions.loadSamples();
                  toast.success('Sample projects added');
                }}
                idleHint="Drop cart to restore"
                width="100%"
                height={80}
              />
            </div>
          </section>

          {/* Clear Graveyard Data (Audit #12) */}
          <section className="rl-panel space-y-4 p-5 md:col-span-2 border-2 border-coral/30" aria-labelledby="del">
            <h2 id="del" className="flex items-center gap-2 text-lg font-extrabold text-coral">
              <Trash2 aria-hidden className="size-5 text-coral" /> Clear Local Graveyard
            </h2>
            <p className="text-sm text-dim">
              Deletes all local projects from this device. Drag the graveyard token into the Clear Zone (instant undo support).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center max-w-xl">
              <DraggableSettingsToken
                id="token-wipe"
                label="Graveyard Database"
                icon={Trash2}
                color="#f6b9ab"
                hint="Drop onto Clear Zone"
              />

              <DropZone
                id="zone-wipe-clear"
                label="CLEAR ALL LOCAL DATA"
                description="Drop graveyard token here to wipe data with undo"
                color="#f6b9ab"
                accepts={(i) => i.kind === 'card'}
                onDrop={wipe}
                idleHint="Drop token to wipe"
                width="100%"
                height={80}
              />
            </div>
          </section>
        </div>
      </div>
    </DragLayer>
  );
}
