// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // diğer VITE_ değişkenlerin...
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
