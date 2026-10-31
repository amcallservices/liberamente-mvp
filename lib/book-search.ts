type Profile={display_name?:string|null}|null|undefined;

export type SearchableBook={
  id:string;
  title:string;
  subtitle?:string|null;
  description?:string|null;
  category?:string|null;
  categories?:string[]|null;
  profiles?:Profile|Profile[];
};

const STOP_WORDS=new Set(['a','ad','al','allo','alla','alle','ai','agli','con','da','dal','dalla','dalle','dei','del','della','di','e','ed','gli','i','il','in','io','la','le','lo','mi','mio','per','piu','puo','su','un','una','uno','vorrei','voglio','cerco','cerca','libro','libri','ebook','storia','storie','che','cui','come','sul','sulla','sulle','sui','the','and','for']);

const INTENTS=[
  {terms:['giallo','thriller','mistero','misteri','crime','investigativo','investigazione','poliziesco'],categories:['gialli e thriller','crime e polizieschi']},
  {terms:['noir','suspense'],categories:['noir e suspense']},
  {terms:['horror','paura','gotico'],categories:['horror']},
  {terms:['fantasy','fantascienza','magia','magico','draghi','spazio','sci-fi','scifi'],categories:['fantasy e fantascienza','fantasy epico e urban fantasy']},
  {terms:['romance','romantico','romantica','amore','sentimentale'],categories:['romance','romance contemporaneo','romance storico','new adult','famiglia e relazioni']},
  {terms:['storico','storia','storica','antica','guerra'],categories:['narrativa storica','storia e politica']},
  {terms:['poesia','poesie','poetico','teatro','dramma'],categories:['poesia e teatro']},
  {terms:['biografia','biografie','memorie','autobiografia','vissuto'],categories:['biografie e memorie','autobiografie']},
  {terms:['crescita','motivazione','motivazionale','abitudini','obiettivi','produttivita','selfhelp'],categories:['crescita personale']},
  {terms:['psicologia','ansia','emozioni','mente','mentale'],categories:['psicologia','salute e benessere']},
  {terms:['mindfulness','meditazione','consapevolezza'],categories:['mindfulness e meditazione']},
  {terms:['lavoro','business','impresa','azienda'],categories:['business e lavoro']},
  {terms:['carriera','professioni','cv','colloquio'],categories:['carriera e professioni']},
  {terms:['marketing','comunicazione','branding','social'],categories:['marketing e comunicazione']},
  {terms:['finanza','soldi','risparmio','economia'],categories:['economia e finanza']},
  {terms:['investimenti','trading','borsa'],categories:['investimenti e trading']},
  {terms:['salute','benessere'],categories:['salute e benessere']},
  {terms:['fitness','sport','allenamento'],categories:['fitness e sport']},
  {terms:['dieta','alimentazione','nutrizione'],categories:['alimentazione e diete']},
  {terms:['cucina','cucinare','ricetta','ricette','chef','dolci','vegano'],categories:['cucina e alimentazione']},
  {terms:['viaggio','viaggi','vacanza','itinerario','turismo'],categories:['viaggi']},
  {terms:['arte','fotografia','illustrazione','pittura'],categories:['arte, fotografia e design']},
  {terms:['architettura','arredamento','interior'],categories:['design e architettura']},
  {terms:['musica','cinema','spettacolo','film'],categories:['musica e spettacolo']},
  {terms:['scienza','scientifico','tecnologia','fisica'],categories:['scienza e tecnologia']},
  {terms:['informatica','digitale','computer'],categories:['informatica e digitale']},
  {terms:['programmazione','sviluppo','coding','codice'],categories:['programmazione e sviluppo']},
  {terms:['intelligenza','artificiale','ai'],categories:['intelligenza artificiale']},
  {terms:['spiritualita','religione','fede','meditazione'],categories:['religione e spiritualità']},
  {terms:['famiglia','relazioni','genitori','coppia'],categories:['famiglia e relazioni']},
  {terms:['bambini','ragazzi','bambino','teen','giovani'],categories:['bambini e ragazzi','young adult']},
  {terms:['fumetti','fumetto','graphic'],categories:['fumetti e graphic novel']},
  {terms:['manga','anime'],categories:['manga e anime']},
  {terms:['lingue','inglese','francese','tedesco','spagnolo'],categories:['lingue e apprendimento']},
  {terms:['scuola','didattica','educazione','studio'],categories:['educazione e didattica']},
  {terms:['giardinaggio','orto','piante'],categories:['giardinaggio','ambiente e natura']},
  {terms:['animali','cani','gatti'],categories:['animali']},
] as const;

export function normalizeSearch(value:string){
  return value.toLocaleLowerCase('it-IT').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}

export function searchTerms(query:string){
  return [...new Set(normalizeSearch(query).split(' ').filter(term=>term.length>1&&!STOP_WORDS.has(term)))];
}

function profileName(book:SearchableBook){
  const profile=Array.isArray(book.profiles)?book.profiles[0]:book.profiles;
  return profile?.display_name??'';
}

function includesTerm(value:string,term:string){return normalizeSearch(value).includes(term)}

export function scoreBookForQuery(book:SearchableBook,query:string){
  const normalizedQuery=normalizeSearch(query);
  const terms=searchTerms(query);
  if(!normalizedQuery||!terms.length)return 0;
  const title=book.title??'';
  const subtitle=book.subtitle??'';
  const author=profileName(book);
  const categories=[book.category,...(Array.isArray(book.categories)?book.categories:[])].filter(Boolean).join(' ');
  const description=book.description??'';
  let score=0;
  if(includesTerm(title,normalizedQuery))score+=80;
  if(includesTerm(subtitle,normalizedQuery))score+=55;
  if(includesTerm(author,normalizedQuery))score+=50;
  if(includesTerm(categories,normalizedQuery))score+=42;
  if(includesTerm(description,normalizedQuery))score+=28;
  for(const term of terms){
    if(includesTerm(title,term))score+=24;
    if(includesTerm(subtitle,term))score+=15;
    if(includesTerm(author,term))score+=14;
    if(includesTerm(categories,term))score+=12;
    if(includesTerm(description,term))score+=5;
  }
  for(const intent of INTENTS){
    if(terms.some(term=>intent.terms.some(intentTerm=>intentTerm===term))&&intent.categories.some(category=>includesTerm(categories,normalizeSearch(category))))score+=22;
  }
  return score;
}

export function rankBooksForQuery<T extends SearchableBook>(books:T[],query:string){
  return books.map(book=>({book,score:scoreBookForQuery(book,query)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.book.title.localeCompare(b.book.title,'it'));
}
