import { FieldApi } from "@tanstack/react-form"

export const FieldInfo = ({
  field,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any>
}) => {
  return (
    <>
      {field.state.meta.errors ? (
        <p className="text-sm font-medium text-destructive">
          {field.state.meta.errors.join(",")}
        </p>
      ) : undefined}
      {field.state.meta.isValidating ? (
        <p className="text-sm font-medium">Validating...</p>
      ) : undefined}
    </>
  )
}
