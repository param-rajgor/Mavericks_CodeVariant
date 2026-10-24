import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { ASSET_META, DOMAIN_LIST, INTEREST_LABELS, STALL_REASON_META, STATUS_META, OPEN_STATUSES } from '@/backend/domain/paths';
import { ASSET_CATEGORIES, STALL_REASONS, type AssetCategory, type StallReason } from '@/backend/domain/types';
import type { DraftErrors, ProjectDraft } from '@/backend/domain/draft';
import { todayStr } from '@/backend/domain/dates';
import { Field, Group } from '@/frontend/ui/primitives';

export interface SectionProps {
  draft: ProjectDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<ProjectDraft>) => void;
}

function TagInput({ tags, onChange, id, describedBy }: { tags: string[]; onChange: (t: string[]) => void; id: string; describedBy?: string }) {
  const [text, setText] = useState('');
  const add = (raw: string) => {
    const t = raw.trim().replace(/,+$/, '').trim();
    if (!t || t.length > 24) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    if (tags.length >= 12) return;
    onChange([...tags, t]);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(text);
      setText('');
    } else if (e.key === 'Backspace' && !text && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };
  return (
    <div>
      <input
        id={id}
        aria-describedby={describedBy}
        className="rl-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => {
          add(text);
          setText('');
        }}
        placeholder="Type a tag and press Enter"
        maxLength={24}
      />
      {tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Added tags">
          {tags.map((t) => (
            <li key={t} className="chip !pr-1">
              {t}
              <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="grid size-6 place-items-center  hover:bg-twilight">
                <X aria-hidden className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function IdeaSection({ draft, errors, onChange }: SectionProps) {
  return (
    <div className="space-y-5">
      <Field label="Project name" error={errors.name}>
        {({ id, describedBy, invalid }) => (
          <input id={id} aria-describedby={describedBy} aria-invalid={invalid} className="rl-input" value={draft.name} maxLength={80} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. AI Study App" data-autofocus />
        )}
      </Field>
      <Field label="What was the idea?" hint="A sentence or two is plenty." error={errors.description}>
        {({ id, describedBy, invalid }) => (
          <textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="rl-input min-h-24" rows={3} maxLength={600} value={draft.description} onChange={(e) => onChange({ description: e.target.value })} />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" error={errors.domain}>
          {({ id, describedBy, invalid }) => (
            <select id={id} aria-describedby={describedBy} aria-invalid={invalid} className="rl-input" value={draft.domain} onChange={(e) => onChange({ domain: e.target.value as ProjectDraft['domain'] })}>
              <option value="">Choose one…</option>
              {DOMAIN_LIST.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="When did you start?" error={errors.startedAt}>
          {({ id, describedBy, invalid }) => (
            <input id={id} aria-describedby={describedBy} aria-invalid={invalid} type="date" max={todayStr()} className="rl-input" value={draft.startedAt} onChange={(e) => onChange({ startedAt: e.target.value })} />
          )}
        </Field>
      </div>
      <Field label="Tags" hint="Add as many as help you find it later." optional>
        {({ id, describedBy }) => <TagInput id={id} describedBy={describedBy} tags={draft.tags} onChange={(tags) => onChange({ tags })} />}
      </Field>
    </div>
  );
}

export function ProgressSection({ draft, errors, onChange }: SectionProps) {
  const p = draft.progress;
  return (
    <div className="space-y-5">
      <Field label="How far did you get?" hint="A rough estimate is fine." error={errors.progress}>
        {({ id, describedBy, invalid }) => (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={p ?? 0}
              onChange={(e) => onChange({ progress: Number(e.target.value) })}
              aria-label="Progress percentage slider"
              className="h-11 flex-1 accent-twilight"
              data-autofocus
            />
            <div className="flex items-center gap-1">
              <input id={id} aria-describedby={describedBy} aria-invalid={invalid} type="number" min={0} max={100} inputMode="numeric" className="rl-input !w-20 text-center font-mono" value={p ?? ''} placeholder="—" onChange={(e) => onChange({ progress: e.target.value === '' ? null : Number(e.target.value) })} />
              <span className="font-mono text-sm">%</span>
            </div>
          </div>
        )}
      </Field>
      <Field label="What has already been built?" hint="One item per line." optional>
        {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className="rl-input" rows={3} value={draft.completedText} onChange={(e) => onChange({ completedText: e.target.value })} placeholder={'Login screen\nDatabase schema'} />}
      </Field>
      <Field label="What remains to be done?" hint="One item per line. These become your first next steps." optional>
        {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className="rl-input" rows={3} value={draft.remainingText} onChange={(e) => onChange({ remainingText: e.target.value })} placeholder={'Payments\nUser testing'} />}
      </Field>
      <Group legend="Existing assets" hint="What could be reused, even if the project never continues?">
        <div className="grid gap-2 sm:grid-cols-3">
          {ASSET_CATEGORIES.map((a) => {
            const on = draft.assets.includes(a);
            return (
              <label key={a} className={`flex min-h-11 cursor-pointer items-center gap-2  border-2 px-3 text-sm font-bold ${on ? 'border-lavender bg-panel-2' : 'border-rule bg-panel-2'}`}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onChange({ assets: on ? draft.assets.filter((x) => x !== a) : ([...draft.assets, a] as AssetCategory[]) })}
                  className="size-4 accent-twilight"
                />
                {ASSET_META[a].label}
              </label>
            );
          })}
        </div>
      </Group>
      <Field label="Notes about your assets" hint="Where do they live? A repo name, a Figma link, a folder." optional>
        {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className="rl-input" value={draft.assetNotes} onChange={(e) => onChange({ assetNotes: e.target.value })} />}
      </Field>
    </div>
  );
}

export function StoppedSection({ draft, errors, onChange, showStatus = true }: SectionProps & { showStatus?: boolean }) {
  return (
    <div className="space-y-5">
      <p className=" bg-[#17361f] p-3 text-sm text-mint">Projects stall for ordinary reasons. Naming yours helps you decide what to do next, with no judgement.</p>
      <Group legend="Why did it stop?" error={errors.stallReason}>
        <div className="grid gap-2 sm:grid-cols-2">
          {STALL_REASONS.map((r: StallReason, i) => {
            const on = draft.stallReason === r;
            return (
              <label key={r} className={`flex min-h-11 cursor-pointer items-start gap-3  border-2 p-3 ${on ? 'border-lavender bg-panel-2' : 'border-rule bg-panel-2'}`}>
                <input
                  type="radio"
                  name="stall-reason"
                  checked={on}
                  onChange={() =>
                    onChange({ stallReason: r, ...(showStatus && r === 'unclear-direction' && draft.status === 'stalled' ? { status: 'needs-direction' as const } : {}) })
                  }
                  className="mt-1 size-4 accent-twilight"
                  data-autofocus={i === 0 ? true : undefined}
                />
                <span>
                  <span className="block text-sm font-extrabold">{STALL_REASON_META[r].label}</span>
                  <span className="block text-xs text-dim">{STALL_REASON_META[r].hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </Group>
      <Field label="Anything else about it?" optional>
        {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className="rl-input" rows={3} value={draft.stallReasonDetails} onChange={(e) => onChange({ stallReasonDetails: e.target.value })} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="When did you last work on it?" hint="Leave blank if you are not sure." optional error={errors.lastWorkedAt}>
          {({ id, describedBy, invalid }) => (
            <input id={id} aria-describedby={describedBy} aria-invalid={invalid} type="date" max={todayStr()} className="rl-input" value={draft.lastWorkedAt} onChange={(e) => onChange({ lastWorkedAt: e.target.value })} />
          )}
        </Field>
        {showStatus && (
          <Field label="Where does it stand?" hint={STATUS_META[draft.status].definition}>
            {({ id, describedBy }) => (
              <select id={id} aria-describedby={describedBy} className="rl-input" value={draft.status} onChange={(e) => onChange({ status: e.target.value as ProjectDraft['status'] })}>
                {OPEN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
      </div>
    </div>
  );
}

export function InterestSection({ draft, errors, onChange }: SectionProps) {
  return (
    <div className="space-y-5">
      <Group legend="How interested are you in this right now?" hint="Be honest. Low interest is useful information, not a failure." error={errors.currentInterest}>
        <div className="grid gap-2 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = draft.currentInterest === n;
            return (
              <label key={n} className={`flex min-h-11 cursor-pointer flex-col items-center gap-1  border-2 p-3 text-center ${on ? 'border-lavender bg-panel-2' : 'border-rule bg-panel-2'}`}>
                <input type="radio" name="interest" checked={on} onChange={() => onChange({ currentInterest: n })} className="size-4 accent-twilight" data-autofocus={n === 1 ? true : undefined} />
                <span className="font-mono text-lg font-semibold">{n}</span>
                <span className="text-xs font-extrabold">{INTEREST_LABELS[n].label}</span>
                <span className="text-[0.85rem] leading-tight text-dim">{INTEREST_LABELS[n].hint}</span>
              </label>
            );
          })}
        </div>
      </Group>
      <Field label="Why does it still matter, or why not?" optional>
        {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} className="rl-input" rows={3} value={draft.interestNote} onChange={(e) => onChange({ interestNote: e.target.value })} />}
      </Field>
    </div>
  );
}
