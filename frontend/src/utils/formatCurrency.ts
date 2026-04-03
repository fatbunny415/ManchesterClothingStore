/**
 * Formatea un número como moneda colombiana (COP).
 * Ejemplo: 45000 → "$ 45.000"
 * Ejemplo: 160000 → "$ 160.000"
 */
export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
