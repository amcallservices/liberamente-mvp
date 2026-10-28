export type ReaderBlock={kind:'heading'|'paragraph';text:string};

const formatMarker='\u2063LIBERAMENTE_READER_V2\n';

export function markReaderText(text:string){return `${formatMarker}${normaliseReaderText(text)}`}
export function isCurrentReaderText(text?:string|null){return Boolean(text?.startsWith(formatMarker))}

export function normaliseReaderText(text:string){
  return text.replace(new RegExp(`^${formatMarker}`),'').replace(/\r/g,'').replace(/-\n(?=[a-zà-ÿ])/gi,'').replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}

function sentences(text:string){
  const compact=text.replace(/\s+/g,' ').trim();
  // Regola locale e prevedibile: evita dipendenze runtime non necessarie.
  return compact.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map(value=>value.trim()).filter(Boolean)??[];
}

function looksLikeHeading(value:string){
  const line=value.replace(/^#+\s*/,'').trim();
  return /^#+\s+/.test(value)||/^(capitolo|chapter|parte|prefazione|introduzione|prologo|epilogo|conclusioni?|indice|ringraziamenti)\b/i.test(line)||/^(?:\d+|[IVXLCDM]+)[.:-]\s+.{2,}$/i.test(line)||(/^[A-ZÀ-Ý0-9 ,.'’!?&()-]{4,90}$/.test(line)&&line.split(/\s+/).length<=12);
}

export function readerBlocksFromText(source:string):ReaderBlock[]{
  const raw=normaliseReaderText(source);
  if(!raw)return [];
  const groups=raw.split(/\n\s*\n/).map(group=>group.trim()).filter(Boolean);
  const blocks:ReaderBlock[]=[];
  for(const group of groups){
    const lines=group.split('\n').map(line=>line.trim()).filter(Boolean);
    if(!lines.length)continue;
    if(lines.length===1&&looksLikeHeading(lines[0])){blocks.push({kind:'heading',text:lines[0].replace(/^#+\s*/,'')});continue;}
    const joined=lines.join(' ').replace(/\s+/g,' ').trim();
    if(looksLikeHeading(joined)&&joined.length<120){blocks.push({kind:'heading',text:joined.replace(/^#+\s*/,'')});continue;}
    const parts=sentences(joined);
    if(joined.length>1100&&parts.length>3){
      for(let index=0;index<parts.length;index+=3)blocks.push({kind:'paragraph',text:parts.slice(index,index+3).join(' ')});
    }else blocks.push({kind:'paragraph',text:joined});
  }
  return blocks;
}

export function speechChunksFromBlocks(blocks:ReaderBlock[]){
  return blocks.flatMap((block,blockIndex)=>{
    if(block.kind==='heading')return [{blockIndex,text:`${block.text}.`}];
    const chunks:string[]=[];let current='';
    for(const sentence of sentences(block.text)){
      if(current&&current.length+sentence.length+1>360){chunks.push(current);current=sentence;}
      else current=`${current}${current?' ':''}${sentence}`;
    }
    if(current)chunks.push(current);
    return chunks.map(text=>({blockIndex,text}));
  });
}
