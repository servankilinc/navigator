// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CENTER_LNG: number;
  readonly VITE_CENTER_LAT: number;
  readonly VITE_MIN_VITE_ZOOM: number;
  readonly VITE_MAX_VITE_ZOOM: number;
  readonly VITE_ZOOM: number;
  // diğer VITE_ değişkenlerin...
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
