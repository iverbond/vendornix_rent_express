import { AssetType, PricingPeriod } from "../constants/enums";
import type { AssetEntity, ClientEntity, OrganizationEntity, RentalEntity } from "../types/entity.types";
import { computeRentalBreakdown } from "../utils/rental-pricing.util";

const PERIOD_LABELS: Record<PricingPeriod, string> = {
  HOURLY: "à l'heure",
  DAILY: "à la journée",
  MONTHLY: "au mois",
  YEARLY: "à l'année",
};

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  VEHICLE: "Véhicule",
  HOUSE: "Maison",
  BUILDING: "Immeuble",
  APARTMENT: "Appartement",
  HOTEL: "Hôtel",
  ROOM: "Chambre",
  OFFICE: "Bureau",
  LAND: "Terrain",
  SHOP: "Magasin",
  OTHER: "Autre",
};

const formatCdf = (n: number): string =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

const formatUsd = (n: number): string =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR", { dateStyle: "long" });
};

export const buildContractNumber = (rentalId: string): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `LOC-${date}-${rentalId.slice(0, 8).toUpperCase()}`;
};

export interface RentalContractContext {
  rental: RentalEntity;
  organization: OrganizationEntity;
  asset: AssetEntity;
  client: ClientEntity;
  contractNumber: string;
}

export const generateRentalContract = (ctx: RentalContractContext): string => {
  const { rental, organization, asset, client, contractNumber } = ctx;
  const breakdown = computeRentalBreakdown(
    Number(rental.amountCdf),
    Number(rental.amountUsd),
    Number(rental.vatRate),
    rental.vatIncluded,
  );

  const clientName = `${client.firstName} ${client.lastName}`.trim();
  const periodLabel = PERIOD_LABELS[rental.pricingPeriod] ?? rental.pricingPeriod;
  const assetType = ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType;
  const endLine = rental.endDate
    ? `Date de fin : ${formatDate(rental.endDate)}`
    : "Durée : indéterminée (résiliation selon conditions ci-dessous)";

  const depositBlock =
    rental.depositCdf || rental.depositUsd
      ? `Caution / garantie locative : ${formatCdf(Number(rental.depositCdf ?? 0))} CDF${
          rental.depositUsd ? ` (${formatUsd(Number(rental.depositUsd))} USD)` : ""
        }`
      : "Caution / garantie locative : non exigée";

  const notesBlock = rental.notes?.trim()
    ? `\n\nConditions particulières :\n${rental.notes.trim()}`
    : "";

  const vatMode = rental.vatIncluded
    ? "Montants exprimés TTC (TVA incluse)"
    : "Montants exprimés HT (TVA en sus)";

  return `CONTRAT DE LOCATION
Référence : ${contractNumber}
Date d'établissement : ${formatDate(new Date().toISOString().slice(0, 10))}

═══════════════════════════════════════════════════════════════

ENTRE LES SOUSSIGNÉS

Le BAILLEUR :
  ${organization.name}
  (ci-après « le Bailleur »)

ET

Le LOCATAIRE :
  ${clientName}
  ${client.nationalId ? `Pièce d'identité : ${client.nationalId}\n  ` : ""}${client.phone ? `Téléphone : ${client.phone}\n  ` : ""}${client.email ? `E-mail : ${client.email}\n  ` : ""}${client.address ? `Adresse : ${client.address}` : ""}
  (ci-après « le Locataire »)

═══════════════════════════════════════════════════════════════

ARTICLE 1 — OBJET DU CONTRAT

Le Bailleur loue au Locataire le bien suivant :

  Désignation : ${asset.name}
  Type        : ${assetType}
  Localisation: ${asset.location ?? "Non précisée"}
  ${asset.description ? `Description : ${asset.description}` : ""}

═══════════════════════════════════════════════════════════════

ARTICLE 2 — DURÉE

Date de début : ${formatDate(rental.startDate)}
${endLine}

═══════════════════════════════════════════════════════════════

ARTICLE 3 — LOYER ET FACTURATION

Période de facturation : ${periodLabel}
${vatMode}

  Base HT     : ${formatCdf(breakdown.baseHtCdf)} CDF / ${formatUsd(breakdown.baseHtUsd)} USD
  TVA (${rental.vatRate} %) : ${formatCdf(breakdown.vatCdf)} CDF / ${formatUsd(breakdown.vatUsd)} USD
  Total TTC   : ${formatCdf(breakdown.totalTtcCdf)} CDF / ${formatUsd(breakdown.totalTtcUsd)} USD

Devise de référence pour la facturation : ${rental.billingCurrency}

${depositBlock}

═══════════════════════════════════════════════════════════════

ARTICLE 4 — OBLIGATIONS DU LOCATAIRE

Le Locataire s'engage à :
  • Utiliser le bien conformément à sa destination ;
  • Payer le loyer aux échéances convenues ;
  • Entretenir le bien et signaler toute dégradation ;
  • Restituer le bien en bon état à la fin du contrat.

═══════════════════════════════════════════════════════════════

ARTICLE 5 — OBLIGATIONS DU BAILLEUR

Le Bailleur s'engage à :
  • Mettre le bien à disposition en état d'usage ;
  • Assurer la jouissance paisible du bien ;
  • Effectuer les réparations incombant au propriétaire.

═══════════════════════════════════════════════════════════════

ARTICLE 6 — RÉSILIATION

En cas de manquement grave aux obligations du présent contrat, la partie lésée pourra
résilier le contrat après mise en demeure restée sans effet pendant quinze (15) jours.

═══════════════════════════════════════════════════════════════

ARTICLE 7 — DISPOSITIONS DIVERSES

Le présent contrat est régi par la législation en vigueur en République Démocratique du Congo.
Tout litige relatif à l'interprétation ou l'exécution du présent contrat sera soumis aux
tribunaux compétents du ressort du lieu du bien.${notesBlock}

═══════════════════════════════════════════════════════════════

SIGNATURES

Fait en deux exemplaires originaux.


Le Bailleur                              Le Locataire
${organization.name}                     ${clientName}


_______________________                  _______________________
`;
};
