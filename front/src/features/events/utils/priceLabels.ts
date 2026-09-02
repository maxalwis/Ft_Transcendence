import type { Lang } from '../../../context/language/LanguageContext';

const PRICE_LABELS: Record<Lang, { payant: string; gratuit: string }> = {
  fr: { payant: 'Payant', gratuit: 'Gratuit' },
  en: { payant: 'Paid', gratuit: 'Free' },
  es: { payant: 'De pago', gratuit: 'Gratis' },
};

export function getPriceLabel(priceType: string | undefined, lang: Lang): string | undefined {
  const normalized = priceType?.trim().toLowerCase();
  if (!normalized) return undefined;

  if (normalized.includes('payant') || normalized.includes('fee-based') || normalized.includes('paid')) {
    return PRICE_LABELS[lang].payant;
  }
  if (normalized.includes('gratuit') || normalized.includes('free')) {
    return PRICE_LABELS[lang].gratuit;
  }
  return priceType?.trim(); // valeur inconnue, on la laisse telle quelle
}
