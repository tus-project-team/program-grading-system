import { act, renderHook } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { useControlledState } from "./use-controlled-state"

describe(useControlledState.name, () => {
  test("defaultValueのみ渡された場合、defaultValueからstateとsetStateが生成されること", () => {
    const { result } = renderHook(() => useControlledState(0))
    expect(result.current[0]).toBe(0)
    expect(result.current[1]).toBeInstanceOf(Function)

    act(() => {
      result.current[1](1)
    })
    expect(result.current[0]).toBe(1)
  })

  test("defaultValueとvalueとsetValueが渡された場合、valueとsetValueがそのまま返されること", () => {
    const setState = vi.fn()
    const { result } = renderHook(() =>
      useControlledState<number>(0, 0, setState),
    )
    expect(result.current[0]).toBe(0)
    expect(result.current[1]).toBeInstanceOf(Function)

    act(() => {
      result.current[1](1)
    })
    expect(result.current[0]).toBe(0)
    expect(setState).toHaveBeenCalledWith(1)
  })

  test("defaultValueとvalueのみ渡された場合、valueがstateとして返され、setStateとしてはダミー関数が返されること", () => {
    const { result } = renderHook(() => useControlledState(0, 1))
    expect(result.current[0]).toBe(1)
    expect(result.current[1]).toBeInstanceOf(Function)

    act(() => {
      result.current[1](2)
    })
    expect(result.current[0]).toBe(1)
  })
})
