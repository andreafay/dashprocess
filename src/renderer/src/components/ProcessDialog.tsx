import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { CURRENCIES, PAY_PERIODS, type ProcessInput } from '@shared/types'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input, Label, Textarea } from './ui/input'
import { Select } from './ui/select'
import { Segmented } from './ui/segmented'
import { Switch } from './ui/switch'
import { useStageLabel, useT } from '@/lib/i18n'
import { useStore } from '@/store'

/** Form state: like ProcessInput, but pay amounts are kept as typed text. */
type FormState = Omit<ProcessInput, 'payMin' | 'payMax'> & { payMin: string; payMax: string }

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ProcessDialog() {
  const editing = useStore((s) => s.editing)
  const openEditor = useStore((s) => s.openEditor)
  const stages = useStore((s) => s.stages)
  const processes = useStore((s) => s.processes)
  const createProcess = useStore((s) => s.createProcess)
  const updateProcess = useStore((s) => s.updateProcess)
  const deleteProcess = useStore((s) => s.deleteProcess)

  const existing = editing?.mode === 'edit' ? processes.find((p) => p.id === editing.id) : undefined
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const t = useT()
  // Focus the feedback field when the user marks the process as rejected or withdrawn.
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const [focusReason, setFocusReason] = useState(false)
  useEffect(() => {
    if (!focusReason) return
    reasonRef.current?.focus()
    setFocusReason(false)
  }, [focusReason])
  const label = useStageLabel()

  // Reset the form each time the dialog opens.
  useEffect(() => {
    setError(null)
    setConfirmDelete(false)
    if (!editing) return
    if (existing) {
      const { id: _id, position: _pos, createdAt: _c, updatedAt: _u, ...rest } = existing
      setForm({ ...rest, payMin: rest.payMin?.toString() ?? '', payMax: rest.payMax?.toString() ?? '' })
    } else {
      setForm({
        company: '',
        role: '',
        stageId: (editing.mode === 'new' && editing.stageId) || stages[0]?.id,
        status: 'active',
        remote: true,
        b2b: false,
        companyType: 'product',
        region: 'italian',
        startDate: today(),
        payMin: '',
        payMax: '',
        payCurrency: 'EUR',
        payPeriod: 'year',
        notes: '',
        jobUrl: '',
        endReason: ''
      })
    }
    // Only when the dialog target changes, not on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const open = editing !== null && form !== null
  const close = () => openEditor(null)
  const set = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    if (!form.company.trim() || !form.role.trim()) {
      setError(t.form.required)
      return
    }
    const min = form.payMin === '' ? null : Number(form.payMin)
    const max = form.payMax === '' ? null : Number(form.payMax)
    if (min != null && max != null && min > max) {
      setError(t.form.payRange)
      return
    }
    const input: ProcessInput = { ...form, payMin: min, payMax: max, startDate: form.startDate || null }
    setSaving(true)
    const ok = existing ? await updateProcess(existing.id, input) : await createProcess(input)
    setSaving(false)
    if (ok) close()
  }

  if (!form) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && close()}
      title={existing ? t.form.editTitle : t.form.newTitle}
      description={existing ? `${existing.company} · ${existing.role}` : t.form.newDescription}
      className="w-[620px]"
      footer={
        <>
          {existing &&
            (confirmDelete ? (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await deleteProcess(existing.id)
                  close()
                }}
              >
                <Trash2 /> {t.form.confirmDelete}
              </Button>
            ) : (
              <Button variant="danger-ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> {t.form.delete}
              </Button>
            ))}
          <div className="flex-1" />
          <Button size="sm" onClick={close}>
            {t.common.cancel}
          </Button>
          <Button variant="primary" size="sm" type="submit" form="process-form" disabled={saving}>
            {existing ? t.form.save : t.form.create}
          </Button>
        </>
      }
    >
      <form id="process-form" onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.form.company} htmlFor="company">
            <Input
              id="company"
              autoFocus
              value={form.company}
              onChange={(e) => set({ company: e.target.value })}
              placeholder={t.form.companyPlaceholder}
            />
          </Field>
          <Field label={t.form.role} htmlFor="role">
            <Input
              id="role"
              value={form.role}
              onChange={(e) => set({ role: e.target.value })}
              placeholder={t.form.rolePlaceholder}
            />
          </Field>
          <Field label={t.form.stage} htmlFor="stage">
            <Select
              id="stage"
              value={String(form.stageId)}
              onChange={(v) => set({ stageId: Number(v) })}
              options={stages.map((s) => ({ value: String(s.id), label: label(s) }))}
            />
          </Field>
          <Field label={t.form.status} htmlFor="status">
            <Segmented
              className="w-full"
              value={form.status}
              onChange={(status) => {
                set({ status })
                if (status !== 'active') setFocusReason(true)
              }}
              options={[
                { value: 'active', label: t.status.active },
                { value: 'rejected', label: t.status.rejected },
                { value: 'withdrawn', label: t.status.withdrawn }
              ]}
            />
          </Field>
        </div>

        {form.status !== 'active' && (
          <Field
            label={form.status === 'rejected' ? t.form.rejectionFeedback : t.form.withdrawReason}
            htmlFor="end-reason"
          >
            <Textarea
              id="end-reason"
              ref={reasonRef}
              value={form.endReason}
              onChange={(e) => set({ endReason: e.target.value })}
              placeholder={
                form.status === 'rejected' ? t.form.rejectionPlaceholder : t.form.withdrawPlaceholder
              }
              rows={3}
            />
          </Field>
        )}

        <Section title={t.form.details}>
          <div className="grid grid-cols-2 gap-3">
            <ToggleCard id="remote" label={t.form.remote} checked={form.remote} onChange={(remote) => set({ remote })} />
            <ToggleCard id="b2b" label={t.form.b2b} checked={form.b2b} onChange={(b2b) => set({ b2b })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.form.companyType}>
              <Segmented
                className="w-full"
                value={form.companyType}
                onChange={(companyType) => set({ companyType })}
                options={[
                  { value: 'product', label: t.tags.product },
                  { value: 'consulting', label: t.tags.consulting }
                ]}
              />
            </Field>
            <Field label={t.form.region}>
              <Segmented
                className="w-full"
                value={form.region}
                onChange={(region) => set({ region })}
                options={[
                  { value: 'italian', label: t.tags.italian },
                  { value: 'european', label: t.tags.european }
                ]}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.form.startDate} htmlFor="start">
              <Input
                id="start"
                type="date"
                value={form.startDate ?? ''}
                onChange={(e) => set({ startDate: e.target.value || null })}
              />
            </Field>
          </div>
        </Section>

        <Section title={t.form.pay}>
          <div className="grid grid-cols-[1fr_1fr_96px_128px] gap-3">
            <Field label={t.form.min} htmlFor="pay-min">
              <Input
                id="pay-min"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.payMin}
                onChange={(e) => set({ payMin: e.target.value })}
                placeholder="50000"
              />
            </Field>
            <Field label={t.form.max} htmlFor="pay-max">
              <Input
                id="pay-max"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.payMax}
                onChange={(e) => set({ payMax: e.target.value })}
                placeholder="65000"
              />
            </Field>
            <Field label={t.form.currency} htmlFor="currency">
              <Select
                id="currency"
                value={form.payCurrency}
                onChange={(payCurrency) => set({ payCurrency })}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label={t.form.period} htmlFor="period">
              <Select
                id="period"
                value={form.payPeriod}
                onChange={(v) => set({ payPeriod: v as FormState['payPeriod'] })}
                options={PAY_PERIODS.map((p) => ({ value: p, label: t.pay.periodLabel[p] }))}
              />
            </Field>
          </div>
        </Section>

        <Field label={t.form.notes} htmlFor="notes">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder={t.form.notesPlaceholder}
            rows={3}
          />
        </Field>

        <Field label={t.form.jobAdLink} htmlFor="job-url">
          <Input
            id="job-url"
            inputMode="url"
            spellCheck={false}
            value={form.jobUrl}
            onChange={(e) => set({ jobUrl: e.target.value })}
            placeholder={t.form.jobAdPlaceholder}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</p>
        )}
      </form>
    </Dialog>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <h3 className="text-[11px] font-semibold tracking-wider text-subtle uppercase">{title}</h3>
      {children}
    </div>
  )
}

function ToggleCard({
  id,
  label,
  checked,
  onChange
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex h-10 cursor-pointer items-center justify-between rounded-lg border border-border px-3 text-[13px] font-medium has-[[data-state=checked]]:border-accent-text/50 has-[[data-state=checked]]:bg-accent-soft/50"
    >
      {label}
      <Switch id={id} checked={checked} onChange={onChange} />
    </label>
  )
}
