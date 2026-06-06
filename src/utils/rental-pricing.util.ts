export interface RentalBreakdown {
  baseHtCdf: number;
  baseHtUsd: number;
  vatCdf: number;
  vatUsd: number;
  totalTtcCdf: number;
  totalTtcUsd: number;
}

const roundCdf = (n: number): number => Math.round(n);
const roundUsd = (n: number): number => Math.round(n * 100) / 100;

export const computeRentalBreakdown = (
  amountCdf: number,
  amountUsd: number,
  vatRate: number,
  vatIncluded: boolean,
): RentalBreakdown => {
  const rate = Math.max(0, vatRate) / 100;

  if (vatIncluded) {
    const baseHtCdf = rate > 0 ? roundCdf(amountCdf / (1 + rate)) : amountCdf;
    const baseHtUsd = rate > 0 ? roundUsd(amountUsd / (1 + rate)) : amountUsd;
    return {
      baseHtCdf,
      baseHtUsd,
      vatCdf: roundCdf(amountCdf - baseHtCdf),
      vatUsd: roundUsd(amountUsd - baseHtUsd),
      totalTtcCdf: amountCdf,
      totalTtcUsd: amountUsd,
    };
  }

  const vatCdf = roundCdf(amountCdf * rate);
  const vatUsd = roundUsd(amountUsd * rate);
  return {
    baseHtCdf: amountCdf,
    baseHtUsd: amountUsd,
    vatCdf,
    vatUsd,
    totalTtcCdf: roundCdf(amountCdf + vatCdf),
    totalTtcUsd: roundUsd(amountUsd + vatUsd),
  };
};
