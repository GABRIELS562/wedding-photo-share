/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_API_KEY: string
  readonly VITE_ADMIN_PASSWORD: string
  readonly VITE_CLOUDINARY_API_KEY: string
  readonly VITE_CLOUDINARY_API_SECRET: string
  readonly VITE_CLOUDINARY_URL: string
  readonly VITE_MAX_UPLOAD_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}