import React, { useMemo, useState, useId } from 'react'

import { COUNTRIES } from '@/lib/countries'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * CountryCombobox — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: string (default 'country')
 *  - label: boolean|string (true -> "Country", string -> custom, false -> no label)
 *  - placeholder: string (default 'Select country')
 *  - required: boolean
 *  - className: container classes
 *  - disabled: boolean
 *  - preferred: string[] (countries to pin on top; e.g., ['India', 'United States'])
 */
export default function CountryCombobox({
  form,
  name = 'country',
  label = true,
  placeholder = 'Select country',
  required = false,
  className = '',
  disabled = false,
  preferred = ['India', 'United States', 'United Kingdom'],
}) {
  const id = useId()
  const fieldId = `${name}-${id}`

  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const showError = Boolean(touched && error)

  const value = form.values?.[name] || ''
  const [open, setOpen] = useState(false)

  // Build list with preferred on top (deduped), then the rest.
  const options = useMemo(() => {
    const set = new Set(preferred.filter(Boolean))
    const rest = COUNTRIES.filter((c) => !set.has(c))
    return [...set, ...rest]
  }, [preferred])

  const selectedLabel = value || ''

  const onSelect = (country) => {
    form.setFieldValue(name, country)
    // touch the field to show validation (optional)
    if (!touched) form.setFieldTouched(name, true, true)
    setOpen(false)
  }

  const onClear = (e) => {
    e.preventDefault()
    form.setFieldValue(name, '')
    if (!touched) form.setFieldTouched(name, true, true)
  }

  const labelText =
    label === true ? 'Country' : typeof label === 'string' ? label : null

  return (
    <div className={cn('mb-4', className)}>
      {labelText && (
        <Label htmlFor={fieldId} className="country">
          {labelText}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={showError ? 'true' : 'false'}
            className={cn(
              'w-full justify-between',
              showError && 'border-destructive'
            )}
            disabled={disabled}
          >
            <span
              className={cn(
                'truncate',
                !selectedLabel && 'text-muted-foreground'
              )}
            >
              {selectedLabel || placeholder}
            </span>

            <span className="flex items-center gap-1">
              {value && (
                <X
                  className="h-4 w-4 opacity-60 hover:opacity-100"
                  onClick={onClear}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label="Clear country"
                />
              )}
              <ChevronsUpDown className="ml-1 h-4 w-4 opacity-60" />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[16rem] p-0">
          <Command shouldFilter>
            <CommandInput placeholder="Search countries…" />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandList>
              <CommandGroup heading="Countries">
                {options.map((country) => (
                  <CommandItem
                    key={country}
                    value={country}
                    onSelect={onSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        country === value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {country}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showError ? (
        <p id={`${fieldId}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
