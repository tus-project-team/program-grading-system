import { Dispatch, SetStateAction, useEffect, useState } from "react"

export const usePersistedState = <T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue !== null) {
      return JSON.parse(storedValue)
    }
    return defaultValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}
