import { useId, useRef, useState, type FormEvent } from "react";
import { ASSET_OPTIONS, INTERESTS, STALL_REASONS, STATUS_FILTERS, STATUS_LABEL } from "@/src/landing/data/demoProjects";
import type { Interest, ProjectStatus } from "@/src/landing/data/types";
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
          Your project will be planted directly into your browser's graveyard. No account needed.
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
                Current status <span aria-hidden="true">*</span>
              </label>
              <select id={`${uid}-status`} name="status" required className="px-input" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} {...aria("status")}>
                <option value="">Select a status...</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              {err("status")}
            </div>

            <div>
              <label htmlFor={`${uid}-interest`} className="mb-1.5 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
                Do you still care?
              </label>
              <select id={`${uid}-interest`} name="interest" className="px-input" value={interest} onChange={(e) => setInterest(e.target.value as Interest)}>
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-reason`} className="mb-1.5 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
              Why did it stall? <span aria-hidden="true">*</span>
            </label>
            <select id={`${uid}-reason`} name="reason" required className="px-input" value={reason} onChange={(e) => setReason(e.target.value)} {...aria("reason")}>
              <option value="">Pick the closest reason...</option>
              {STALL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {err("reason")}
          </div>

          <fieldset>
            <legend className="mb-2 block font-mono text-[12px] font-bold uppercase tracking-wide text-lavender">
              Any reusable assets? (optional)
            </legend>
            <div className="flex flex-wrap gap-2">
              {ASSET_OPTIONS.map((a) => {
                const checked = assets.includes(a);
                return (
                  <label key={a} className={`px-box flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-[13px] font-mono text-soft ${checked ? "bg-lavender text-navy" : "bg-navy"}`} style={{ ["--bc" as string]: checked ? "#17183e" : "#5543a5", ["--sh" as string]: "transparent" }}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={(e) => {
                        setAssets((list) => (e.target.checked ? [...list, a] : list.filter((x) => x !== a)));
                      }}
                    />
                    <span aria-hidden="true" className="font-bold">
                      {checked ? "✓" : "+"}
                    </span>
                    {a}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <PixelButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton type="submit" variant="gold" size="sm" accent="arrow">
            Plant in graveyard
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
}
