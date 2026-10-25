export const eur=(cents:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(cents/100);
export const AUTHOR_ROYALTY_RATE=0.5;
export const authorRoyalty=(gross:number)=>Math.round(gross*AUTHOR_ROYALTY_RATE);
