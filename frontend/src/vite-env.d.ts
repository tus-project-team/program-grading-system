/// <reference types="vite/client" />

type ImportMeta = {
  readonly env: ImportMetaEnv
}

type ImportMetaEnv = {
  readonly VITE_MSW_MOCK: string
}
