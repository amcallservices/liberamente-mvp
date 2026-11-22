import {describe,expect,it} from 'vitest';
import {tourFor} from '../components/guided-tour';

describe('guided tour',()=>{
  it('picks the right tour for each store page, in both languages',()=>{
    expect(tourFor('/')?.id).toBe('home');
    expect(tourFor('/en')?.id).toBe('home');
    expect(tourFor('/catalogo')?.id).toBe('catalog');
    expect(tourFor('/en/catalogo')?.id).toBe('catalog');
    expect(tourFor('/ebook/alchimia-del-koji-ff6562')?.id).toBe('book');
    expect(tourFor('/plus')?.id).toBe('plus');
    expect(tourFor('/autore')?.id).toBe('author');
    expect(tourFor('/blog')).toBeNull();
    expect(tourFor('/admin')).toBeNull();
  });

  it('has the same number of steps in Italian and English',()=>{
    for(const path of ['/','/catalogo','/ebook/x','/plus','/autore']){
      const tour=tourFor(path)!;
      expect(tour.steps.en.length).toBe(tour.steps.it.length);
    }
  });

  it('starts by itself only for the home page and the author area',()=>{
    expect(['/','/catalogo','/ebook/x','/plus','/autore'].filter(path=>tourFor(path)!.autoStart)).toEqual(['/','/autore']);
  });
});
