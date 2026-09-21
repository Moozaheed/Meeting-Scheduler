interface FieldErrorProps {
  id: string;
  message?: string;
}

/** Field-level inline error, per the affirmed form-validation practice (errors are inline, not a single top-of-form banner). */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-600" data-testid={id}>
      {message}
    </p>
  );
}
