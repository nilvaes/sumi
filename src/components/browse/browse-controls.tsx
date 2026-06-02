"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORMAT_OPTIONS,
  GENRE_OPTIONS,
  SEASON_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  filtersToSearchParams,
  yearOptions,
  type BrowseFilters,
} from "@/lib/anilist/filters";

const ANY = "any";

export function BrowseControls({ filters }: { filters: BrowseFilters }) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(next: BrowseFilters) {
    const sp = filtersToSearchParams(next);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const hasFilters =
    filters.status ||
    filters.season ||
    filters.year ||
    filters.genre ||
    filters.format ||
    filters.sort !== "POPULARITY_DESC";

  const years = yearOptions();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Sort">
        <Select
          value={filters.sort}
          onValueChange={(v) =>
            apply({ ...filters, sort: v as BrowseFilters["sort"] })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Status">
        <Select
          value={filters.status ?? ANY}
          onValueChange={(v) =>
            apply({
              ...filters,
              status: v === ANY ? undefined : (v as BrowseFilters["status"]),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Genre">
        <Select
          value={filters.genre ?? ANY}
          onValueChange={(v) =>
            apply({ ...filters, genre: v === ANY ? undefined : v })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any genre</SelectItem>
            {GENRE_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Format">
        <Select
          value={filters.format ?? ANY}
          onValueChange={(v) =>
            apply({
              ...filters,
              format: v === ANY ? undefined : (v as BrowseFilters["format"]),
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any format</SelectItem>
            {FORMAT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Season">
        <Select
          value={filters.season ?? ANY}
          onValueChange={(v) =>
            apply({
              ...filters,
              season: v === ANY ? undefined : (v as BrowseFilters["season"]),
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any season</SelectItem>
            {SEASON_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Year">
        <Select
          value={filters.year ? String(filters.year) : ANY}
          onValueChange={(v) =>
            apply({ ...filters, year: v === ANY ? undefined : Number(v) })
          }
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any year</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {hasFilters && (
        <button
          type="button"
          onClick={() =>
            apply({ sort: "POPULARITY_DESC", search: filters.search })
          }
          className="h-9 rounded-md px-3 text-sm text-text-muted transition-colors hover:text-brand"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-text-muted">{label}</span>
      {children}
    </label>
  );
}
