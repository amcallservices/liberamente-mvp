export const eur=(cents:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(cents/100);
export const authorRoyalty=(gross:number,feeRate=0.15)=>Math.round(gross*(1-feeRate));
