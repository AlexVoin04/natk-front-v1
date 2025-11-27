interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  // другие переменные окружения, если есть
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}