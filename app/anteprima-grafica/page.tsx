import type { Metadata } from 'next';
import styles from './preview.module.css';

export const metadata: Metadata = {
  title: 'Anteprima grafica | LIBERAMENTE.site',
  robots: { index: false, follow: false },
};

const catalogue = [
  { title: 'Dove finisce il mare', genre: 'Narrativa contemporanea', tone: 'sea' },
  { title: 'Le cose che restano', genre: 'Romanzi e racconti', tone: 'coral' },
  { title: 'Mappe di casa', genre: 'Crescita personale', tone: 'gold' },
  { title: 'Il lavoro ben fatto', genre: 'Saggi e idee', tone: 'ink' },
];

export default function GraphicPreviewPage() {
  return (
    <>
    <main className={`${styles.preview} lp-preview`}>
      <header className={styles.header}>
        <a className={styles.brand} href="#inizio" aria-label="LIBERAMENTE.site, anteprima grafica">
          <img src="/liberamente-logo.png" alt="LIBERAMENTE.site" />
          <span>– lo store di Scrittore.site</span>
        </a>
        <nav aria-label="Anteprima navigazione">
          <a href="#catalogo">Catalogo</a>
          <a href="#plus">LIBERAMENTE Plus</a>
          <a href="#autori">Per gli autori</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className={styles.headerCta} href="#autori">Scrivi il tuo libro <span aria-hidden="true">↗</span></a>
      </header>

      <section className={styles.hero} id="inizio">
        <div className={styles.heroCopy}>
          <div className={styles.ribbon} aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <p className={styles.kicker}>LIBERAMENTE.site · ebook indipendenti</p>
          <h1>Storie scelte<br />per restare.</h1>
          <p className={styles.lead}>Una libreria italiana per scoprire voci indipendenti, leggere con calma e sostenere chi scrive.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#catalogo">Esplora il catalogo <span aria-hidden="true">↓</span></a>
            <a className={styles.secondary} href="#autori">Pubblica il tuo ebook</a>
          </div>
          <p className={styles.heroNote}>Acquisti sicuri · download protetti · royalty trasparenti</p>
        </div>
        <div className={styles.heroVisual} aria-label="Composizione grafica dedicata alla libreria indipendente">
          <p>UNA LIBRERIA<br />FATTA DI VOCI</p>
          <div className={styles.bookStack} aria-hidden="true">
            <div className={styles.bookOne}><b>VOCI</b><span>indipendenti</span></div>
            <div className={styles.bookTwo}><b>LIBRI</b><span>che restano</span></div>
            <div className={styles.bookThree}><b>IDEA</b><span>di lettura</span></div>
          </div>
          <span className={styles.circle} aria-hidden="true" />
        </div>
      </section>

      <section className={styles.catalogue} id="catalogo">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>Esempio di catalogo</p>
          <h2>Una selezione che merita tempo.</h2>
          <a href="#catalogo">Vedi tutte le categorie <span aria-hidden="true">→</span></a>
        </div>
        <div className={styles.categoryStrip} aria-label="Categorie d'esempio">
          <a href="#catalogo">Narrativa</a><a href="#catalogo">Thriller e gialli</a><a href="#catalogo">Saggi</a><a href="#catalogo">Crescita personale</a><a href="#catalogo">Poesia</a>
        </div>
        <div className={styles.books}>
          {catalogue.map((book, index) => (
            <article className={styles.book} key={book.title}>
              <div className={`${styles.cover} ${styles[book.tone]}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{book.title}</strong>
                <small>LIBERAMENTE</small>
              </div>
              <p>{book.genre}</p>
              <h3>{book.title}</h3>
              <a href="#catalogo">Scopri il libro <span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.plus} id="plus">
        <div><p className={styles.kicker}>LIBERAMENTE Plus</p><h2>Più storie, nello stesso posto.</h2></div>
        <div className={styles.plusText}><p>Un accesso semplice agli ebook inclusi nel programma Plus, con letture che valorizzano gli autori.</p><a href="#plus">Scopri come funziona <span aria-hidden="true">→</span></a></div>
      </section>

      <section className={styles.authors} id="autori">
        <div className={styles.authorsVisual} aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
        <div className={styles.authorsCopy}>
          <p className={styles.kicker}>Spazio autori</p>
          <h2>Dalla bozza<br />al lettore.</h2>
          <p>Carica il tuo ebook, segui la revisione editoriale e monitora le tue vendite in un’unica area chiara.</p>
          <a className={styles.primary} href="#autori">Scopri l’area autori <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className={styles.closing} id="faq">
        <p className={styles.kicker}>Anteprima di direzione grafica</p>
        <h2>Un design più forte, senza perdere la tua identità.</h2>
        <p>Questa è solo una proposta locale: non modifica il sito pubblico e non contiene dati reali del catalogo.</p>
      </section>
    </main>
    </>
  );
}
