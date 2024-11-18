import { Dispatch, SetStateAction, useState } from "react"

export const useControlledState = <S,>(
  defaultValue: S,
  value?: S,
  setValue?: Dispatch<SetStateAction<S>>,
) => {
  const [state, setState] = useState(defaultValue)
  const isControlled = value != undefined
  if (isControlled) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return [value, setValue ?? (() => {})] as const
  }
  return [state, setState] as const
}
