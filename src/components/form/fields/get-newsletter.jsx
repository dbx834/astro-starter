import React from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * MonthlyNewsletter — ShadCN + Formik
 *
 * Props:
 *  - form: Formik bag (required)
 *  - name: string (default: 'monthlyNewsletter') — or use 'subscribeToNewsletter'
 *  - label: string (group label)
 *  - disabled: boolean
 *  - asBoolean: boolean (default: false) — if true, writes boolean to form; if false, writes "yes"/"no"
 *  - className: container classes
 */
export default function MonthlyNewsletter({
  form,
  name = 'monthlyNewsletter',
  label = 'Get our monthly newsletter:',
  disabled = false,
  asBoolean = false,
  className = '',
}) {
  const touched = form.touched?.[name]
  const error = form.errors?.[name]
  const hasError = Boolean(touched && error)
  const fieldIdYes = `${name}-yes`
  const fieldIdNo = `${name}-no`

  // Derive current radio value ("yes"|"no"|"")
  const raw = form.values?.[name]
  const radioValue =
    raw === 'yes' || raw === true
      ? 'yes'
      : raw === 'no' || raw === false
      ? 'no'
      : ''

  const handleChange = (val) => {
    const next = asBoolean ? val === 'yes' : val // boolean or "yes"/"no"
    form.setFieldValue(name, next)
  }

  return (
    <div className={['mb-4', className].join(' ')}>
      <p className="group-label text-sm font-medium">{label}</p>

      <RadioGroup
        value={radioValue}
        onValueChange={handleChange}
        className="flex gap-6"
        aria-describedby={hasError ? `${name}-error` : undefined}
        aria-invalid={hasError ? 'true' : 'false'}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem id={fieldIdYes} value="yes" disabled={disabled} />
          <Label htmlFor={fieldIdYes}>Yes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem id={fieldIdNo} value="no" disabled={disabled} />
          <Label htmlFor={fieldIdNo}>No</Label>
        </div>
      </RadioGroup>

      {hasError ? (
        <p id={`${name}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
