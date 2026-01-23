import React from 'react'
import isTouchedAndCanShowErrors from './methods/is-touched-and-can-show-errors'
import exists from '../../methods/exists'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Tracker — shadcn version
 *
 * Props:
 *  - form: Formik-like bag { errors, touched, submitCount, isValid? }
 *  - state: { started?, finished?, serverMessage?, finishedMessage? }
 *  - requiredFields: string[] to compute canShowError (uses helper)
 *  - id?: string
 *  - className?: string (extra classes on the wrapper)
 */
export default function Tracker({
  form = {},
  state = {},
  requiredFields = [],
  id = null,
  className = '',
}) {
  const errors = form.errors || {}
  const touched = form.touched || {}
  const submitCount =
    typeof form.submitCount === 'number' ? form.submitCount : 0

  const isValid =
    typeof form.isValid === 'boolean'
      ? form.isValid
      : Object.keys(errors).length === 0

  const started = state.started === true
  const finished = state.finished === true
  const serverMessage = state.serverMessage ?? null
  const finishedMessage = state.finishedMessage ?? null

  const canShowError =
    Array.isArray(requiredFields) && requiredFields.length > 0
      ? isTouchedAndCanShowErrors(form, requiredFields)
      : submitCount > 0 || Object.keys(touched).length > 0

  const errorCount = Object.keys(errors).length
  const hasErrors = canShowError && !isValid && errorCount > 0

  const primaryMessage =
    (finished && exists(finishedMessage) && finishedMessage) ||
    (started && exists(serverMessage) && serverMessage) ||
    null

  return (
    <div
      className={['x-form-tracker space-y-2', className].join(' ').trim()}
      id={id || undefined}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {hasErrors && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            There{' '}
            {errorCount === 1 ? 'is an error' : `are ${errorCount} errors`}.
            Please review your inputs.
          </AlertDescription>
        </Alert>
      )}

      {primaryMessage && (
        <Alert>
          <AlertDescription>{primaryMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
