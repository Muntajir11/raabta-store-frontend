/** CSS font-family values; load matching families via Google Fonts in index.html */
export const EDITOR_FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
  { label: 'Raleway', value: 'Raleway, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Ubuntu', value: 'Ubuntu, sans-serif' },
  { label: 'Rubik', value: 'Rubik, sans-serif' },
  { label: 'Work Sans', value: '"Work Sans", sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'Source Sans 3', value: '"Source Sans 3", sans-serif' },
  { label: 'Noto Sans', value: '"Noto Sans", sans-serif' },
  { label: 'PT Sans', value: '"PT Sans", sans-serif' },
  { label: 'Fira Sans', value: '"Fira Sans", sans-serif' },
  { label: 'Barlow', value: 'Barlow, sans-serif' },
  { label: 'Mulish', value: 'Mulish, sans-serif' },
  { label: 'Quicksand', value: 'Quicksand, sans-serif' },
  { label: 'Cabin', value: 'Cabin, sans-serif' },
  { label: 'Manrope', value: 'Manrope, sans-serif' },
  { label: 'Teko', value: 'Teko, sans-serif' },
  { label: 'Anton', value: 'Anton, sans-serif' },
  { label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Lobster', value: 'Lobster, cursive' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  { label: 'Caveat', value: 'Caveat, cursive' },
  { label: 'Indie Flower', value: '"Indie Flower", cursive' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Abril Fatface', value: '"Abril Fatface", serif' },
  { label: 'Permanent Marker', value: '"Permanent Marker", cursive' },
];

export type TextFontStyle = 'normal' | 'italic' | 'bold' | 'bold italic';

export function parseFontStyle(style: string): { bold: boolean; italic: boolean } {
  const s = style || 'normal';
  return {
    bold: s.includes('bold'),
    italic: s.includes('italic'),
  };
}

export function toFontStyle(bold: boolean, italic: boolean): TextFontStyle {
  if (bold && italic) return 'bold italic';
  if (bold) return 'bold';
  if (italic) return 'italic';
  return 'normal';
}
