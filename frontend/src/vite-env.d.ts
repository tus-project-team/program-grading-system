/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_MSW_MOCK: string
}

type ImportMeta = {
  readonly env: ImportMetaEnv
}
