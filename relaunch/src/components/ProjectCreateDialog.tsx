import { useId, useRef, useState, type FormEvent } from "react";
import { ASSET_OPTIONS, INTERESTS, STALL_REASONS, STATUS_FILTERS, STATUS_LABEL } from "@/src/data/demoProjects";
import type { Interest, ProjectStatus } from "@/src/data/types";
import { Modal } from "./Modal";
import { PixelButton } from "./PixelButton";

export interface NewProjectInput {
  name: string;
  description: string;
  status: ProjectStatus;
  reason: string;
  assets: string[];
  interest: Interest;
}

interface Props {
  onClose: () => void;
  onSubmit: (input: NewProjectInput) => void;
}

const STATUSES = STATUS_FILTERS.filter((s): s is ProjectStatus => s !== "All");

type Errors = Partial<Record<"name" | "description" | "status" | "reason", string>>;

export function ProjectCreateDialog({ onClose, onSubmit }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [reason, setReason] = useState("");
  const [assets, setAssets] = useState<string[]>([]);
  const [interest, setInterest] = useState<Interest>("Medium");
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Give your project a name (at least 2 characters).";
    if (description.trim().length < 5) e.description = "Add a short description (at least 5 characters).";
    if (!status) e.status = "Choose where the project stands right now.";
    if (!reason) e.reason = "Pick the closest reason it stalled.";
    return e;
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const firstKey = (["name", "description", "status", "reason"] as const).find((k) => e[k]);
    if (firstKey) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim(), status: status as ProjectStatus, reason, assets, interest });
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-1.5 text-[13px] font-semibold text-[#ff9db5]">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Errors) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
  });

  return (
    <Modal titleId={titleId} descId={descId} onClose={onClose} accent="#FFC857" initialFocus='input[name="name"]' maxWidth="40rem">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="p-6 pt-8 sm:p-8">
        <h2 id={titleId} className="pr-14 font-pixel text-[14px] leading-snug text-soft sm:text-[16px]">
          Add a project to the graveyard
        </h2>
        <p id={descId} className="mt-3 text-[14px] leading-relaxed text-[#d8d3f5]">
          This is a demo: your tombstone lives in this page's memory only and disappears on refresh. Nothing is sent anywhere.
        </p>

        <div className="mt-6 grid gap-5">
          <div>
            <label htmlFor={`${uid}-name`} className="mb-1.5 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
              Project name <span aria-hidden="true">*</span>
            </label>
            <input id={`${uid}-name`} name="name" required className="px-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Recipe Remix" {...aria("name")} />
            {err("name")}
          </div>

          <div>
            <label htmlFor={`${uid}-desc-in`} className="mb-1.5 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
              Short description <span aria-hidden="true">*</span>
            </label>
            <textarea id={`${uid}-desc-in`} name="description" required rows={2} className="px-input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} placeholder="What was it meant to be?" {...aria("description")} />
            {err("description")}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-status`} className="mb-1.5 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
                Project status <span aria-hidden="true">*</span>
              </label>
              <select id={`${uid}-status`} name="status" required className="px-input" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} {...aria("status")}>
                <option value="">Select a status…</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              {err("status")}
            </div>
            <div>
              <label htmlFor={`${uid}-reason`} className="mb-1.5 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
                Why did it stall? <span aria-hidden="true">*</span>
              </label>
              <select id={`${uid}-reason`} name="reason" required className="px-input" value={reason} onChange={(e) => setReason(e.target.value)} {...aria("reason")}>
                <option value="">Select a reason…</option>
                {STALL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {err("reason")}
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">Existing assets (optional)</legend>
            <div className="flex flex-wrap gap-2.5">
              {ASSET_OPTIONS.map((a) => {
                const on = assets.includes(a);
                return (
                  <label
                    key={a}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 border-[3px] px-3 font-mono text-[13px] font-bold ${
                      on ? "border-mint bg-mint text-navy" : "border-twilight bg-navy text-cream hover:border-lavender"
                    } focus-within:outline focus-within:outline-[3px] focus-within:outline-gold`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setAssets((cur) => (on ? cur.filter((x) => x !== a) : [...cur, a]))}
                    />
                    <span aria-hidden="true">{on ? "■" : "□"}</span>
                    {a}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">Current interest level</legend>
            <div className="grid grid-cols-3 gap-2.5">
              {INTERESTS.map((i) => {
                const on = interest === i;
                return (
                  <label
                    key={i}
                    className={`flex min-h-[44px] cursor-pointer items-center justify-center border-[3px] font-mono text-[13px] font-bold ${
                      on ? "border-gold bg-gold text-navy" : "border-twilight bg-navy text-cream hover:border-lavender"
                    } focus-within:outline focus-within:outline-[3px] focus-within:outline-gold`}
                  >
                    <input type="radio" name="interest" className="sr-only" checked={on} onChange={() => setInterest(i)} />
                    {i}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <PixelButton type="submit" variant="gold" size="md" accent="arrow">
            Lay it to rest
          </PixelButton>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-cream underline decoration-2 underline-offset-4 hover:text-gold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
