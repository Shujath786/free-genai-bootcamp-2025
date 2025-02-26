/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
