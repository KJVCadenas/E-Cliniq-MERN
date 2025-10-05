export type FormatType = 'short' | 'medium' | 'long' | 'full' | 'iso';

const formatters: Record<FormatType, Intl.DateTimeFormatOptions> = {
  short: { dateStyle: 'short' },
  medium: { dateStyle: 'medium' },
  long: { dateStyle: 'long' },
  full: { dateStyle: 'full' },
  iso: {}, // We'll call toISOString() directly for ISO
};

export function formatDate(
  input: string | number | Date | undefined | null,
  type: FormatType = 'medium',
  locale: string = 'en-US'
): string {
  if (input == null) return ''; // handle null/undefined directly

  const date = input instanceof Date ? input : new Date(input);
  // Invalid Date check
  if (isNaN(date.getTime())) return '';

  if (type === 'iso') {
    return date.toISOString();
  }

  return new Intl.DateTimeFormat(locale, formatters[type]).format(date);
}
