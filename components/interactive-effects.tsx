'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

/* Elements that fade in while scrolling, and covers that tilt under the mouse. */
const REVEAL='main > section, main > div > section, .lm-card, .lm-blog__card, .review-card, .plus-grid article, .faq-item, .lm-bp__extra';
const TILT='.lm-card__cover img, .lm-thumb img, .related-title img, .lm-bp__cover img, .lm-blog__lead';

export function InteractiveEffects(){
  const pathname=usePathname();
  useEffect(()=>{
    const root=document.documentElement;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups:Array<()=>void>=[];

    if(!reduced&&'IntersectionObserver' in window){
      const targets=Array.from(document.querySelectorAll<HTMLElement>(REVEAL)).filter(el=>!el.closest('.lm-stagepanel'));
      const viewport=window.innerHeight;
      const observer=new IntersectionObserver(entries=>{
        for(const entry of entries) if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
      },{rootMargin:'0px 0px -8% 0px',threshold:.08});
      targets.forEach(el=>{
        // Already on screen: show at once, never hide what the visitor is looking at.
        if(el.getBoundingClientRect().top<viewport*.92){el.classList.add('is-visible');}
        else{
          const siblings=el.parentElement?Array.from(el.parentElement.children):[];
          el.style.transitionDelay=`${Math.min(siblings.indexOf(el)%4,3)*70}ms`;
          observer.observe(el);
        }
        el.setAttribute('data-reveal','');
      });
      root.classList.add('fx-ready');
      cleanups.push(()=>observer.disconnect());
    }

    const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if(!reduced&&finePointer){
      document.querySelectorAll<HTMLElement>(TILT).forEach(el=>{
        el.setAttribute('data-tilt','');
        const move=(event:PointerEvent)=>{
          const r=el.getBoundingClientRect();
          const x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
          el.style.transform=`perspective(900px) rotateY(${(x*14).toFixed(1)}deg) rotateX(${(-y*12).toFixed(1)}deg) translateY(-6px) scale(1.02)`;
        };
        const leave=()=>{el.style.transform='';};
        el.addEventListener('pointermove',move);
        el.addEventListener('pointerleave',leave);
        cleanups.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);});
      });
    }
    return ()=>cleanups.forEach(fn=>fn());
  },[pathname]);
  return null;
}
