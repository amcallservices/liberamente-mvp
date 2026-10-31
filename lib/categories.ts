/** Categorie editoriali disponibili nel catalogo e nella scheda autore. */
export const BOOK_CATEGORY_GROUPS=[
  {label:'Narrativa e letteratura',categories:['Narrativa contemporanea','Romanzi e letteratura','Letteratura italiana','Letteratura internazionale','Narrativa storica','Avventura e azione','Racconti brevi','Young adult','Narrativa erotica']},
  {label:'Gialli, fantasy e generi',categories:['Gialli e thriller','Crime e polizieschi','Noir e suspense','Horror','Fantasy e fantascienza','Fantasy epico e urban fantasy']},
  {label:'Romance e sentimenti',categories:['Romance','Romance contemporaneo','Romance storico','New adult']},
  {label:'Poesia, biografie e cultura',categories:['Poesia e teatro','Biografie e memorie','Autobiografie','Saggistica','Storia e politica','Società e attualità','Filosofia']},
  {label:'Benessere e relazioni',categories:['Crescita personale','Psicologia','Mindfulness e meditazione','Salute e benessere','Fitness e sport','Alimentazione e diete','Famiglia e relazioni','Genitorialità']},
  {label:'Lavoro, denaro e digitale',categories:['Business e lavoro','Marketing e comunicazione','Carriera e professioni','Economia e finanza','Investimenti e trading','Informatica e digitale','Programmazione e sviluppo','Intelligenza artificiale','Scienza e tecnologia']},
  {label:'Cucina, viaggi e passioni',categories:['Cucina e alimentazione','Vini e bevande','Viaggi','Manuali, hobby e fai da te','Giardinaggio','Animali','Ambiente e natura','Arte, fotografia e design','Design e architettura','Musica e spettacolo']},
  {label:'Spiritualità, studio e giovani',categories:['Religione e spiritualità','Lingue e apprendimento','Educazione e didattica','Bambini e ragazzi','Fumetti e graphic novel','Manga e anime']},
] as const;

export const BOOK_CATEGORIES=BOOK_CATEGORY_GROUPS.flatMap(group=>group.categories);
