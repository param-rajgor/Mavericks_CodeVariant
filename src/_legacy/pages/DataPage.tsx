import { useRef, useState } from 'react';
import { Download, HardDrive, Rocket, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useProjects } from '../store/ProjectsContext';
import { Button, PageHeader, SectionTitle } from '../components/ui';
import { Dialog } from '../components/Dialog';
import { useSafe, useToast } from '../components/Toast';

export function DataPage() {
  const { projects, actions, memoryOnly } = useProjects();
  const toast = useToast();
  const safe = useSafe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    const ok = await safe(async () => {
      await actions.removeAll();
      return true;
    }, 'Could not delete your data');
    setBusy(false);
    if (ok) {
      setConfirmWipe(false);
      toast.success('All local data deleted', 'Your projects were removed from this device.');
    }
  };

  return (
    <>
      <PageHeader title="Your data" subtitle="Relaunch keeps everything on this device. There is no account and nothing is sent anywhere." />

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rl-panel space-y-3 p-5" aria-labelledby="priv">
          <h2 id="priv" className="flex items-center gap-2 text-lg font-extrabold"><ShieldCheck aria-hidden className="size-5" /> Privacy and storage</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Projects are stored in your browser's IndexedDB, so they work offline.</li>
            <li>Scores are calculated on this device with a transparent formula. No AI service is called.</li>
            <li>Clearing site data, or using a different browser or profile, can remove or hide your projects. Export a backup to be safe.</li>
          </ul>
          <p className="flex items-center gap-2 text-sm font-bold">
            <HardDrive aria-hidden className="size-4" />
            {memoryOnly ? 'Storage unavailable: changes are not being saved.' : `${projects.length} project${projects.length === 1 ? '' : 's'} stored on this device.`}
          </p>
        </section>

        <section className="rl-panel space-y-3 p-5" aria-labelledby="backup">
          <h2 id="backup" className="flex items-center gap-2 text-lg font-extrabold"><Download aria-hidden className="size-5" /> Backup</h2>
          <p className="text-sm text-muted">Download a JSON file with your projects, score inputs, chosen paths, timelines and archive notes.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="gold" onClick={exportData} disabled={projects.length === 0}>
              <Download aria-hidden className="size-4" /> Export backup
            </Button>
            <Button onClick={() => fileRef.current?.click()}>
              <Upload aria-hidden className="size-4" /> Restore from backup
            </Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Choose a Relaunch backup file" onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          {projects.length === 0 && <p className="text-xs text-muted">Nothing to export yet.</p>}
        </section>

        <section className="rl-panel space-y-3 p-5 md:col-span-2" aria-labelledby="del">
          <h2 id="del" className="flex items-center gap-2 text-lg font-extrabold"><Trash2 aria-hidden className="size-5" /> Delete my data</h2>
          <p className="text-sm text-muted">This permanently removes every project and its history from this device. It is different from archiving, which keeps everything. Consider exporting a backup first.</p>
          <Button variant="rose" onClick={() => setConfirmWipe(true)} disabled={projects.length === 0}>
            Delete all local data
          </Button>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="road">
        <SectionTitle id="road">Future roadmap (not available yet)</SectionTitle>
        <div className="rl-panel-flat p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Rocket aria-hidden className="size-4" /> These are ideas for later. None of them exist today.</p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            <li><span className="font-extrabold">Cloud sync</span>: use Relaunch across devices.</li>
            <li><span className="font-extrabold">GitHub and Notion import</span>: bring projects in automatically.</li>
            <li><span className="font-extrabold">Team boards</span>: decide on shared projects together.</li>
            <li><span className="font-extrabold">Tuned score weights</span>: refined from real usage.</li>
          </ul>
        </div>
      </section>

      <Dialog
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        size="sm"
        title="Delete all local data?"
        description={`This removes all ${projects.length} project${projects.length === 1 ? '' : 's'} from this device and cannot be undone.`}
        footer={
          <>
            <Button variant="gold" onClick={() => setConfirmWipe(false)} data-autofocus>
              Keep my data
            </Button>
            <Button variant="rose" onClick={wipe} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete everything'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Sample projects will not come back after a deliberate delete.</p>
      </Dialog>
    </>
  );
}
