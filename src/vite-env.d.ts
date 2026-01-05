/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_PHONE_NUMBER: string
  readonly VITE_VAPID_PUBLIC_KEY: string
  readonly VITE_WS_URL: string
  readonly BASE44_LEGACY_SDK_IMPORTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

