export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VC-${ts}-${rand}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatINR(amount: number): string {
  return '₹ ' + amount.toLocaleString('en-IN');
}

export function stockStatus(qty: number): 'instock' | 'low' | 'out' {
  if (qty === 0) return 'out';
  if (qty <= 2) return 'low';
  return 'instock';
}

export function cx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
