import { SlidersHorizontal } from 'lucide-react'
import { Segmented } from './ui/segmented'
import type { Messages } from '@shared/i18n'
import { activeFilterCount, useStore, type Filters } from '@/store'
import { useT } from '@/lib/i18n'

type Option<K extends keyof Filters> = { value: Filters[K]; label: string }
type Groups = { [K in keyof Filters]: { title: string; options: Option<K>[] } }

function groups(t: Messages): Groups {
  const all = t.filters.all
  return {
    status: {
      title: t.filters.status,
      options: [
        { value: 'any', label: all },
        { value: 'active', label: t.filters.active },
        { value: 'ended', label: t.filters.ended }
      ]
    },
    workplace: {
      title: t.filters.workplace,
      options: [
        { value: 'any', label: all },
        { value: 'remote', label: t.tags.remote },
        { value: 'onsite', label: t.tags.onsite }
      ]
    },
    contract: {
      title: t.filters.contract,
      options: [
        { value: 'any', label: all },
        { value: 'b2b', label: t.tags.b2b },
        { value: 'employee', label: t.tags.employee }
      ]
    },
    companyType: {
      title: t.filters.companyType,
      options: [
        { value: 'any', label: all },
        { value: 'product', label: t.tags.product },
        { value: 'consulting', label: t.tags.consulting }
      ]
    },
    region: {
      title: t.filters.region,
      options: [
        { value: 'any', label: all },
        { value: 'italian', label: t.tags.italian },
        { value: 'european', label: t.tags.european }
      ]
    }
  }
}

export function FiltersSidebar() {
  const filters = useStore((s) => s.filters)
  const setFilter = useStore((s) => s.setFilter)
  const clearFilters = useStore((s) => s.clearFilters)
  const count = activeFilterCount(filters)
  const t = useT()
  const all = groups(t)

  return (
    <aside
      aria-label={t.filters.title}
      className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border px-5 pt-4 pb-6"
    >
      <div className="flex h-7 items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
          <SlidersHorizontal className="size-4 text-subtle" />
          {t.filters.title}
          {count > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[11px] leading-4 font-semibold text-accent-fg">
              {count}
            </span>
          )}
        </h2>
        {count > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md px-1.5 py-0.5 text-[12px] font-medium text-muted hover:bg-surface-2 hover:text-fg"
          >
            {t.filters.clear}
          </button>
        )}
      </div>

      {(Object.keys(all) as (keyof Filters)[]).map((key) => (
        <FilterGroup key={key} group={all[key]} value={filters[key]} onChange={(v) => setFilter(key, v)} />
      ))}
    </aside>
  )
}

function FilterGroup<K extends keyof Filters>({
  group,
  value,
  onChange
}: {
  group: Groups[K]
  value: Filters[K]
  onChange: (value: Filters[K]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold tracking-wider text-subtle uppercase">{group.title}</h3>
      <Segmented size="sm" className="w-full" value={value} onChange={onChange} options={group.options} />
    </div>
  )
}
