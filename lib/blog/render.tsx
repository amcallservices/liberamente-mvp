import Link from 'next/link';
import {Fragment,type ReactNode} from 'react';

/** Renders the small markdown subset used by the blog articles, without HTML injection. */
function inline(text:string,key:string):ReactNode[]{
  const parts:ReactNode[]=[];
  const pattern=/\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last=0,match:RegExpExecArray|null,i=0;
  while((match=pattern.exec(text))){
    if(match.index>last) parts.push(text.slice(last,match.index));
    if(match[1]) parts.push(<strong key={`${key}-b${i}`}>{match[1]}</strong>);
    else{
      const label=match[2],href=match[3];
      parts.push(href.startsWith('/')
        ?<Link key={`${key}-l${i}`} href={href}>{label}</Link>
        :<a key={`${key}-l${i}`} href={href} target="_blank" rel="noopener">{label}</a>);
    }
    last=pattern.lastIndex;i++;
  }
  if(last<text.length) parts.push(text.slice(last));
  return parts;
}

export function slugifyHeading(text:string){
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

export function headingsOf(body:string){
  return body.split('\n').filter(line=>line.startsWith('## ')).map(line=>{const text=line.slice(3).trim();return {text,id:slugifyHeading(text)};});
}

export function renderBody(body:string){
  const blocks=body.trim().split(/\n\s*\n/);
  return blocks.map((block,index)=>{
    const key=`b${index}`;
    const lines=block.split('\n').map(line=>line.trim()).filter(Boolean);
    const first=lines[0]??'';
    if(first.startsWith('### ')) return <h3 key={key}>{inline(first.slice(4),key)}</h3>;
    if(first.startsWith('## ')){const text=first.slice(3);return <h2 key={key} id={slugifyHeading(text)}>{inline(text,key)}</h2>;}
    if(lines.every(line=>line.startsWith('- '))) return <ul key={key}>{lines.map((line,i)=><li key={i}>{inline(line.slice(2),`${key}-${i}`)}</li>)}</ul>;
    if(lines.every(line=>/^\d+\.\s/.test(line))) return <ol key={key}>{lines.map((line,i)=><li key={i}>{inline(line.replace(/^\d+\.\s/,''),`${key}-${i}`)}</li>)}</ol>;
    if(lines.every(line=>line.startsWith('> '))) return <aside className="lm-note" key={key}>{lines.map((line,i)=><Fragment key={i}>{i>0&&' '}{inline(line.slice(2),`${key}-${i}`)}</Fragment>)}</aside>;
    return <p key={key}>{inline(lines.join(' '),key)}</p>;
  });
}
