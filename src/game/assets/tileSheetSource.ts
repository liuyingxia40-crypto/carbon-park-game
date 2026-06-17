/** `src/assets/tiles/` 下的整张 tiles 图集（Vite ?url） */
const modules = import.meta.glob<string>('../../assets/tiles/*.{png,PNG,jpg,JPG}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function pickSheetUrl(): string | null {
  const entries = Object.entries(modules);
  if (entries.length === 0) return null;

  const named = entries.find(([p]) => /tiles_sheet/i.test(p));
  if (named) return named[1];

  if (entries.length === 1) return entries[0][1];
  return entries[0][1];
}

export const TILES_SHEET_URL = pickSheetUrl();
