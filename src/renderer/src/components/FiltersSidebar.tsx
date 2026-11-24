import { SlidersHorizontal } from 'lucide-react'
import { Segmented } from './ui/segmented'
import { activeFilterCount, useStore, type Filters } from '@/store'

type Option<K extends keyof Filters> = { value: Filters[K]; label: string }

const GROUPS: { [K in keyof Filters]: { title: string; options: Option<K>[] } } = {
  status: {
    title: 'Status',
    options: [
      { value: 'any', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'ended', label: 'Ended' }
    ]
  },
  workplace: {
    title: 'Workplace',
    options: [
      { value: 'any', label: 'All' },
      { value: 'remote', label: 'Remote' },
      { value: 'onsite', label: 'On-site' }
    ]
  },
  contract: {
    title: 'Contract',
    options: [
      { value: 'any', label: 'All' },
      { value: 'b2b', label: 'B2B' },
      { value: 'employee', label: 'Employee' }
    ]
  },
  companyType: {
    title: 'Company type',
    options: [
      { value: 'any', label: 'All' },
      { value: 'product', label: 'Product' },
      { value: 'consulting', label: 'Consulting' }
    ]
  },
  region: {
    title: 'Region',
    options: [
      { value: 'any', label: 'All' },
      { value: 'italian', label: 'Italian' },
      { value: 'european', label: 'European' }
    ]
  }
}

export function FiltersSidebar() {
  const filters = useStore((s) => s.filters)
  const setFilter = useStore((s) => s.setFilter)
  const clearFilters = useStore((s) => s.clearFilters)
  const count = activeFilterCount(filters)

  return (
    <aside
      aria-label="Filters"
      className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border px-5 pt-4 pb-6"
    >
      <div className="flex h-7 items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
          <SlidersHorizontal className="size-4 text-subtle" />
          Filters
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
            Clear
          </button>
        )}
      </div>

      {(Object.keys(GROUPS) as (keyof Filters)[]).map((key) => (
        <FilterGroup key={key} name={key} value={filters[key]} onChange={(v) => setFilter(key, v)} />
      ))}
    </aside>
  )
}

function FilterGroup<K extends keyof Filters>({
  name,
  value,
  onChange
}: {
  name: K
  value: Filters[K]
  onChange: (value: Filters[K]) => void
}) {
  const group = GROUPS[name]
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold tracking-wider text-subtle uppercase">{group.title}</h3>
      <Segmented size="sm" className="w-full" value={value} onChange={onChange} options={group.options} />
    </div>
  )
}
