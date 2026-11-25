/// <reference types="electron-vite/node" />

// Google sign-in keys, read from .env.local at build time (see .env.example).
interface ImportMetaEnv {
  readonly MAIN_VITE_GOOGLE_CLIENT_ID?: string
  readonly MAIN_VITE_GOOGLE_CLIENT_SECRET?: string
}
