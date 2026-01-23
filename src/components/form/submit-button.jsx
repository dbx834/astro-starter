import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

/**
 * SubmitButton — ShadCN + Formik-friendly
 *
 * If the button is *outside* the <form>, pass `formId` (e.g., "contact-form")
 * so it can submit natively without onClick.
 */
export default function SubmitButton({
  form = {},
  state = {},
  formId, // e.g., "contact-form" if the button sits outside the form
  submitMessage = 'Submit',
  workingMessage = 'Working…',
  completedMessage = 'Done',
  errorMessage = 'Error!',
  className = '',
  style, // optional: keep your CSS vars for theming
}) {
  const started = state.started === true
  const finished = state.finished === true
  const disableSubmit = state.disableSubmit === true
  const isSubmitting = form.isSubmitting === true

  const errors = form.errors || {}
  const submitCount =
    typeof form.submitCount === 'number' ? form.submitCount : 0
  const hasError = Object.keys(errors).length > 0 && submitCount > 0

  // Message
  let displayMessage = submitMessage
  if (started && !finished) displayMessage = workingMessage
  if (started && finished)
    displayMessage = hasError ? errorMessage : completedMessage

  // Visual / behavior flags
  const loading = started && !finished
  const disabled = disableSubmit || isSubmitting
  const danger = finished && hasError

  const handleClick = () => {
    // If we're not using formId (native submit), fall back to Formik submit
    if (!formId && typeof form.submitForm === 'function' && !disabled) {
      form.submitForm()
    }
  }

  return (
    <Button
      // Visual appearance
      variant={danger ? 'destructive' : 'default'}
      className={[
        'x-button submit-button inline-flex items-center',
        loading ? 'cursor-wait' : '',
        className,
      ].join(' ')}
      // Behavior
      type={formId ? 'submit' : 'button'}
      form={formId}
      onClick={handleClick}
      disabled={disabled || loading}
      // A11y
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      title={displayMessage}
      // Optional theming parity with your old inline styles
      style={
        style ??
        (disabled || loading
          ? { background: 'var(--gray-3)' }
          : { background: 'var(--green-3)' })
      }
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {displayMessage}
    </Button>
  )
}
