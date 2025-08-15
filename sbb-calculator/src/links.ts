export interface PurchaseLinks {
  halbtax: string;
  halbtaxPlus: string;
  ga: string;
  streckenabo: string;
  myride: string;
}

export const defaultLinks: PurchaseLinks = {
  halbtax: 'https://www.sbb.ch/de/billette-angebote/abos/halbtax.html',
  halbtaxPlus: 'https://www.sbb.ch/de/angebote/halbtax-plus',
  ga: 'https://www.sbb.ch/de/billette-angebote/abos/ga/ga-preise.html',
  streckenabo: 'https://www.sbb.ch/de/billette-angebote/abos/strecken-verbund-abo/streckenabonnemente.html',
  myride: 'https://myride.ch'
};

export const getStoredLinks = (): PurchaseLinks => {
  const stored = localStorage.getItem('purchaseLinks');
  if (stored) {
    try {
      return { ...defaultLinks, ...JSON.parse(stored) };
    } catch {
      return defaultLinks;
    }
  }
  return defaultLinks;
};

export const saveLinks = (links: PurchaseLinks): void => {
  localStorage.setItem('purchaseLinks', JSON.stringify(links));
};