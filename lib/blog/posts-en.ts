import type {BlogPost} from './index';

const D='2026-11-10';

export const englishPosts:BlogPost[]=[
{
id:'publish-guide',slug:'how-to-publish-an-ebook',audience:'authors',published:D,updated:D,
title:'How to publish an ebook in 2026: a step-by-step guide',
description:'From finished manuscript to first reader: files, cover, ISBN, pricing, platforms and launch. A practical 2026 guide to publishing an ebook independently.',
excerpt:'From finished manuscript to first reader: what to prepare, what it costs, which decisions really matter and which mistakes to avoid when you publish independently.',
keywords:['how to publish an ebook','self-publishing 2026','publish a book independently','indie author guide','publish ebook for free'],
body:`Publishing an ebook no longer needs a publisher or a big upfront investment. It does need a few decisions made well: a polished text, a readable file, a cover that works at thumbnail size and a sensible price. This guide puts the steps in the order worth tackling them.

## 1. Really finish the text

The first step is also the one most often skipped. Before thinking about the cover, have the manuscript read by at least two people who don't know you too well, then do a proper proofread. Typos and inconsistencies are the main reason indie books get poor reviews, and no amount of promotion fixes them.

If the book is still in progress, a guided writing tool such as [Scrittore.site](https://scrittoresite.streamlit.app/) can help you structure chapters and revisions.

## 2. Prepare the file

The format depends on where you sell. Stores such as Kindle and Kobo mainly work with EPUB, or with Word files they convert. On LIBERAMENTE you upload the manuscript as a **PDF**: a fixed layout, so what you see is exactly what the reader will see.

For a PDF that reads well on a phone too:

- use a compact page size (A5 or 6×9 inches) with generous margins;
- set body text at 11–12 pt with comfortable line spacing;
- include a table of contents linked to the chapters;
- export with selectable text, never as scanned images.

## 3. Design a cover that reads as a thumbnail

In a catalogue your cover will be the size of a stamp. A legible title, one strong image and no tiny details: always look at it shrunk to 200 pixels wide before approving it. Only use images you have the rights to.

## 4. Decide whether you need an ISBN

An ISBN isn't always required for an ebook, but it identifies your edition in catalogues and databases and lets you publish under your own imprint. We cover costs and options in [Do you need an ISBN for an ebook?](/en/blog/do-you-need-an-isbn-for-an-ebook).

## 5. Set a price

Most independent fiction ebooks sit between $2.99 and $9.99. Too low can make a book look careless; too high puts off readers who don't know you yet. Consider length, genre and how much you earn per copy on each platform, explained in [Ebook royalties compared](/en/blog/ebook-royalties-compared).

## 6. Choose where to publish

You can go exclusive on one platform or publish "wide" on several stores. Exclusivity can unlock subscription programmes; going wide makes you less dependent on a single channel.

On LIBERAMENTE the process is:

1. in the [Author area](/en/autore) you create the book page and upload the PDF, cover and publishing details;
2. you submit the title for review: the editorial team publishes it, asks for changes or declines it, and the notes stay visible in your area;
3. once it's live you earn **50% of the price** on every single sale, with royalties payable after 30 days;
4. you can join [LIBERAMENTE Plus](/en/plus), the subscription where authors are paid by pages read.

## 7. Plan the launch before you publish

A book released with nobody waiting for it stays invisible. In the weeks before launch, collect a few email addresses, prepare an excerpt and line up trusted readers to be among the first. Our no-budget ideas are in [How to promote your book without spending money](/en/blog/promote-your-book-without-a-budget).

## The most common mistakes

- Publishing the first draft, with no outside review.
- A rushed cover that is unreadable as a thumbnail.
- A book description that retells the plot instead of making people want to read it.
- Disappearing after launch: the first weeks matter, but a book can sell for years if you keep talking about it.

> Publishing is the start of the work, not the end. A good text, a clean file and a few readers talking about the book beat any trick.`,
sources:[{title:'KDP – ISBNs and imprints',url:'https://kdp.amazon.com/it_IT/help/topic/G201834170'},{title:'LIBERAMENTE.site – Frequently asked questions',url:'https://liberamente.site/en/faq'}]
},
{
id:'royalties',slug:'ebook-royalties-compared',audience:'authors',published:D,updated:D,
title:'Ebook royalties compared: what independent authors really earn in 2026',
description:'Kindle, Kobo and LIBERAMENTE compared: royalty rates, price bands, delivery costs and the July 2026 KDP change, with worked examples on a $5.99 ebook.',
excerpt:'Rates, price bands and hidden costs: an honest comparison with worked examples, to see how much an author actually keeps from every copy sold.',
keywords:['ebook royalties','kdp royalty 70%','kobo writing life royalties','how much do authors earn','self-publishing income'],
body:`"How much do I make per copy?" is the first question every independent author asks. The answer depends on the platform, the price and a few rules that aren't always obvious. Here's how the main ones work today.

## Amazon Kindle (KDP)

KDP offers two royalty options: **35%** and **70%**. The 70% rate only applies within a price band. Since **7 July 2026** that band on Amazon.com runs from **$2.99 to $12.99** (the ceiling used to be $9.99), with equivalent amounts in other marketplaces. Outside the band, you earn 35%.

Two details matter for the 70% option:

- the rate applies to the list price **excluding VAT** where VAT applies;
- Amazon deducts a **delivery cost** based on file size, $0.15 per megabyte on Amazon.com. For a text-only novel that's small; for an image-heavy book it can make the 35% option pay more.

In some countries (Brazil, Japan, Mexico and India) the 70% rate requires KDP Select exclusivity.

## Kobo Writing Life

Kobo pays **70%** of the list price (excluding taxes) when the price is at least $2.99 (£1.99 or €1.99 in those currencies), and **45%** below that. There is no upper cap and no per-megabyte delivery fee.

## LIBERAMENTE

On LIBERAMENTE authors earn **50% of the sale price** on every copy sold individually, with no price bands and no delivery fees. Royalties become payable after 30 days provided the sale wasn't refunded, via Stripe Connect, PayPal or bank transfer. [LIBERAMENTE Plus](/en/plus) adds a second channel: 60% of the subscription's distributable fund is shared among authors by qualified pages read.

## A worked example on a $5.99 ebook

Take a text-only novel, a 1 MB file, sold at $5.99 in the US.

- **Kindle, 70% option:** 70% of ($5.99 − $0.15) ≈ **$4.09**.
- **Kobo, 70%:** 70% of $5.99 ≈ **$4.19**.
- **LIBERAMENTE:** 50% of the price ≈ **$3.00** (we price in euros, so the exact figure depends on the exchange rate).

Per copy, the big stores pay a higher percentage. So why add an independent store?

## The percentage isn't everything

Your yearly income depends on **how many copies you sell**, not just what you earn per copy. In the biggest stores your book competes with millions of titles; in a smaller catalogue dedicated to independent writers it's easier to be seen. Also consider:

- **exclusivity:** being on several channels makes you less dependent on one set of rules;
- **trust:** reviews from verified purchases only, plus free excerpts, help readers try an author they don't know;
- **simplicity:** no price band to respect and no file-size maths.

> Many independent authors distribute the same ebook across several stores, as long as they don't enrol in an exclusive programme. Always check each platform's terms.

## In short

1. The top royalty on big stores only applies within certain price bands and may carry delivery costs.
2. The same book can live on several platforms if you don't choose exclusivity.
3. For an author starting from zero, visibility matters as much as the percentage.

Want to try? Upload your ebook from the [Author area](/en/autore): your estimated earnings per copy are shown while you set the price.`,
sources:[{title:'KDP – eBook list price requirements (70% band from 7 July 2026)',url:'https://kdp.amazon.com/en_US/help/topic/G200634560'},{title:'KDP – Digital book royalty options',url:'https://kdp.amazon.com/help/topic/A29FL26OKE7R7B'},{title:'Kobo Writing Life – Royalty structure',url:'https://kobowritinglife.zendesk.com/hc/en-us/articles/360058976032'},{title:'LIBERAMENTE.site – Frequently asked questions',url:'https://liberamente.site/en/faq'}]
},
{
id:'isbn',slug:'do-you-need-an-isbn-for-an-ebook',audience:'authors',published:D,updated:D,
title:'Do you need an ISBN for an ebook? Costs, rules and options',
description:'When an ebook needs an ISBN, what it costs in the US, UK and Canada, why every format gets its own number, and the catch with free ISBNs from platforms.',
excerpt:'It isn’t always mandatory, but an ISBN changes how your ebook is identified, distributed and credited. Here’s when it’s worth it and what it costs.',
keywords:['isbn for ebook','do i need an isbn','isbn cost','bowker isbn price','free isbn'],
body:`The ISBN (International Standard Book Number) is the 13-digit code that uniquely identifies a specific edition of a book. You see it on the back of printed books, but ebooks can have one too. The question is whether you need one.

## Is it mandatory?

Not always for ebooks. Amazon, for example, states that an ISBN isn't required for eBooks on KDP; the book is identified by an internal code instead. Many platforms work the same way. There are still three good reasons to get one.

## 1. It identifies your book everywhere

With an ISBN your ebook can be identified unambiguously by bookshops, libraries, distributors and bibliographic databases. That helps if you want to be on several stores, appear in library catalogues or be taken seriously by people who select books.

## 2. Every format gets its own number

An ISBN identifies **one edition in one format**. If the same book comes out in print and as an ebook, you need two different numbers; different digital formats of the same text (PDF and EPUB, for instance) should each have their own ISBN too. Once assigned, an ISBN is never reused for another publication.

## 3. It keeps you as the publisher

Some platforms give away free ISBNs (KDP does so for print editions). The catch: the platform is then registered as the publisher, and the number usually can't be used elsewhere. Buying your own lets you publish under your name or your own imprint, on any store.

## What it costs

ISBNs are issued by a national agency in each country, and prices vary a lot:

- **United States:** Bowker sells them through MyIdentifiers. As of October 2026, one ISBN costs $125, ten cost $295 and 100 cost $575: buying in blocks is far cheaper per book.
- **United Kingdom and Ireland:** the Nielsen ISBN Agency sells single numbers and blocks.
- **Canada:** ISBNs are free for Canadian publishers through Library and Archives Canada.
- **Italy and other countries:** each has its own agency (in Italy it's EDISER, run by the Italian Publishers Association).

Always check the current price list on your agency's site before buying.

## When it's worth buying

- You publish in several formats or on several stores: your own ISBN follows you everywhere.
- You plan a series: a block of numbers costs much less per title.
- You want your own imprint name on the book.

If you're just testing the waters with a first short story, you can start without and add one for the definitive edition.

## And on LIBERAMENTE?

In the [Author area](/en/autore) you can enter your book's publishing details, including the ISBN if you have one. If you're preparing your launch, read [How to publish an ebook in 2026](/en/blog/how-to-publish-an-ebook).`,
sources:[{title:'KDP – ISBNs and imprints',url:'https://kdp.amazon.com/it_IT/help/topic/G201834170'},{title:'PPC Land – ISBN: prices and rules (October 2026)',url:'https://ppc.land/isbn/'},{title:'EU Publications Office – ISBN for each edition and format',url:'https://ec-europa-eu.libguides.com/identifiers/objects/isbn'}]
},
{
id:'accessibility',slug:'european-accessibility-act-ebooks',audience:'authors',published:D,updated:D,
title:'Accessible ebooks and the European Accessibility Act: what authors need to know',
description:'Since 28 June 2025 ebooks sold to EU consumers fall under the European Accessibility Act. Who must comply, the micro-enterprise exemption and how to make a PDF accessible.',
excerpt:'Since June 2025 EU accessibility law covers ebooks, even for sellers outside the EU. Who has to comply, who is exempt and what you can do anyway for your readers.',
keywords:['european accessibility act ebooks','accessible ebooks','accessible pdf','eaa publishing','ebook accessibility'],
body:`Since **28 June 2025**, Directive (EU) 2019/882, known as the European Accessibility Act (EAA), has applied across the European Union. Among the services it covers are **ebooks**, which brings the whole digital publishing chain into scope. It matters beyond Europe too: the rules apply to businesses outside the EU that sell to EU consumers.

## What the law asks for

The goal is that people with disabilities, such as blind or partially sighted readers, people with dyslexia or limited mobility, can use digital products and services independently. For an ebook that means, in practice, it should work with assistive technology: screen readers, magnification, text-to-speech and keyboard navigation.

## Who must comply

The obligations apply to economic operators offering these services to consumers in the EU. There is an important exemption: **micro-enterprises**, businesses with fewer than 10 employees and annual turnover of no more than €2 million, are exempt as far as services are concerned. Many independent authors fall into this category.

There are also transition rules: some services already provided before 28 June 2025 have until 2030 to comply, unless they are substantially changed.

> This article is for information only and is not legal advice. If you publish as a company or exceed the micro-enterprise thresholds, check your position with a professional.

## Why it's worth doing anyway

Even if you're exempt, an accessible ebook is simply a better ebook: it reads better on small screens, works with text-to-speech and reaches more readers. Excluding people with reading difficulties helps nobody.

## How to make a PDF more accessible

On LIBERAMENTE ebooks are PDFs. These good practices can be applied when you export from your writing software:

1. **Real text, not images.** Never scan pages: text must be selectable, or a screen reader can't read it.
2. **Use heading styles.** Set chapters as Heading 1, sections as Heading 2 and so on: they become the PDF's navigable structure.
3. **Export a tagged PDF.** Word, LibreOffice and InDesign have an option to include accessibility tags and bookmarks: switch it on.
4. **Alt text for images.** Briefly describe every meaningful image; mark purely decorative ones as decorative.
5. **Set the document language and title** in the file properties.
6. **Contrast and legibility.** Dark text on a light background, a reasonable font size, no text over busy images.
7. **A linked table of contents** to move between chapters.

Checkers such as Adobe Acrobat's accessibility check or the free PAC tool flag the most common problems.

## In short

- The European Accessibility Act has covered ebooks since 28 June 2025, including sellers outside the EU.
- Micro-enterprises are exempt for services, but the good practice is still worth following.
- A few export settings give you a much more accessible PDF.

Preparing your book file? Start from the [publishing guide](/en/blog/how-to-publish-an-ebook), then upload it from the [Author area](/en/autore).`,
sources:[{title:'Origami – The EU Accessibility Act for EPUB publishers',url:'https://origami.publica.la/en/resources/eu-accessibility-act-epub'},{title:'iubenda – Guide to the European Accessibility Act',url:'https://www.iubenda.com/it/help/181740-eaa-compliance'},{title:'Agenda Digitale – EAA and digital publishing (C. Mussinelli, Fondazione LIA)',url:'https://www.agendadigitale.eu/?p=248812'}]
},
{
id:'promote',slug:'promote-your-book-without-a-budget',audience:'authors',published:D,updated:D,
title:'How to promote your book without spending money: 9 ideas that work',
description:'Promote your book as an independent author with no ad budget: excerpts, verified reviews, short videos, a newsletter, book bloggers and a dated launch.',
excerpt:'You don’t need an advertising budget to get your book noticed. You need consistency and a few of the right tools: nine concrete ideas you can start today.',
keywords:['promote a book','book marketing for authors','free book promotion','indie author marketing','booktok'],
body:`Many independent authors discover after launch that publishing is the easy part. Letting people know the book exists is the real work. The good news: the most effective strategies cost time, not money.

## 1. Switch on the free excerpt

People who don't know you want to try before they buy. On LIBERAMENTE you can enable a preview that readers open right on the book page: the simplest way to win over someone who's undecided. Pick an excerpt that stands on its own and ends on an open question.

## 2. Polish the book page

Title, subtitle, cover and description work for you around the clock. The description shouldn't retell the plot: it should say who the book is for and what they'll feel reading it. Read it aloud; if it bores you, it will bore others.

## 3. Start with people you know

Your first readers are almost always friends, colleagues and acquaintances. Don't only ask them to buy: ask them to **share** the link and, if they enjoyed it, to leave a review. On LIBERAMENTE only readers who bought the book can review it, which makes every review count for more.

## 4. Short videos, once a week

TikTok and Instagram Reels have become major showcases for books (BookTok, Bookstagram). No professional production needed:

- read the opening aloud;
- show the place that inspired the story;
- introduce a character in 20 seconds;
- answer "why did you write this book?".

Consistency beats polish: one video a week for three months is worth more than ten videos in a day.

## 5. A newsletter, even a small one

An email list is the only audience you truly own: social platforms change their rules, your list stays. Offer something for signing up (an unpublished short story, an early chapter) and write once a month.

## 6. Book bloggers and bookstagrammers

Look for accounts that review your genre, small ones included, and offer a free copy in exchange for an honest review. Write a personal message, explain why you chose them and take a no gracefully.

## 7. Reader groups and communities

Facebook groups, forums, Reddit and genre communities are full of readers looking for recommendations. Join the conversations for real and mention your book only when it's relevant: pushy promotion backfires.

## 8. Content people find on Google

An article on your book's subject (the history of the place it's set in, the recipe the main character cooks, the research behind it) can bring readers for years. Think about what someone who'd love your book would search for.

## 9. A launch with a date

Set a release day and prepare for it: tell your list, schedule a post, ask your first readers to share on the same day. Concentrated attention helps a book get noticed.

> You don't have to do everything. Pick two or three of these ideas and keep at them for three months: it works better than spreading yourself thin.

## Where to start today

1. Switch on the excerpt and reread your book description.
2. Send the link to ten people and ask them to share it.
3. Record your first video, even an imperfect one.

Not published yet? Start with the [step-by-step guide](/en/blog/how-to-publish-an-ebook) and the [Author area](/en/autore).`,
sources:[{title:'LIBERAMENTE.site – Frequently asked questions (previews and verified reviews)',url:'https://liberamente.site/en/faq'}]
},
{
id:'why-indie',slug:'why-read-independent-authors',audience:'readers',published:D,updated:D,
title:'Why read independent authors (and how to find the good ones)',
description:'Independent ebooks offer different stories, fair prices and a direct line to the people who write them. How to discover indie authors and pick quality books.',
excerpt:'Stories you won’t find in the charts, affordable prices and the pleasure of supporting writers directly. Why it’s worth a try, and how to choose well.',
keywords:['independent authors','indie books','self-published books worth reading','new authors to read','indie ebooks'],
body:`When we decide what to read, we usually look at bestseller lists, prizes and the front tables of big bookshops. That's understandable, but it means missing a huge share of what's being written today: books by independent authors.

## Where the new voices are

Digital publishing has made it possible for writers to reach readers without going through a traditional publisher. Ebook stores, subscription services and independent catalogues are where many authors now make their debut, and where you'll find books that never get a marketing budget.

## What you get from an independent book

### Stories off the beaten track

An independent author doesn't have to convince a marketing department their book will sell. They can write about a niche, a specific place or an unusual passion: novels set somewhere you know, practical nonfiction about a trade, poetry collections, cookbooks by people who actually cook.

### Affordable prices

Many independent ebooks cost between $3 and $9, little enough to try a new author without thinking twice.

### A direct relationship

Independent writers often answer messages, read reviews and listen to readers. And when you buy their book, a large share of the price goes to them: on LIBERAMENTE, authors receive 50% of every sale.

## How to choose well

Not every independent book is equally polished, and it's fair to be demanding. A few habits help:

1. **Read the excerpt.** Many LIBERAMENTE book pages have a free preview: two pages are enough to know whether the style suits you.
2. **Check verified reviews.** In our catalogue only people who bought the book can review it.
3. **Look at the description and cover.** A careful presentation is often a sign of a careful book.
4. **Start from the genre you love.** Use the [catalogue](/en/catalogo) filters by genre, price and rating.
5. **Follow authors you liked.** If one book won you over, the next one probably will too.

## Reading independent is also a choice

Every purchase is a small vote: for a wider range of voices, for authors who'd otherwise have no space, for a less concentrated market. You don't have to give up your favourite authors; just add a discovery now and then.

> A tip: next time you finish a book, before checking the charts, try an author you don't know. You might find your new favourite voice.

Ready to try? [Browse the catalogue](/en/catalogo) or read [how to choose your next book](/en/blog/how-to-choose-your-next-book).`,
sources:[{title:'LIBERAMENTE.site – Frequently asked questions',url:'https://liberamente.site/en/faq'}]
},
{
id:'ebook-vs-print',slug:'ebook-vs-print-book',audience:'readers',published:D,updated:D,
title:'Ebook or print book? Pros, cons and how to choose',
description:'Price, convenience, reading comfort, environment and tax: the real differences between ebooks and print books, and when each one makes more sense.',
excerpt:'It isn’t a contest: ebooks and print answer different needs. The concrete differences in price, convenience and reading, so you can pick the right format each time.',
keywords:['ebook vs print','ebook advantages','digital books vs paper','are ebooks worth it','ebook price'],
body:`The "ebook versus paper" debate has run for years, often like a sports rivalry. In reality most readers use both, depending on the moment. Here are the concrete differences.

## Price

On average an ebook costs less than its print edition, because there's no printing, warehousing or shipping. For independent books the gap is often even wider: many independent ebooks cost between $3 and $9.

Tax is part of the picture in some countries. In the EU, member states have been allowed since 2018 to apply the same reduced VAT rates to ebooks as to printed books, and several, including Italy, now do. Where that's the case, the price difference comes from production costs, not tax.

## Convenience

This is digital's most obvious advantage:

- **a library in your pocket:** hundreds of books on your phone or e-reader, weighing nothing in your suitcase;
- **instant:** buy and start reading in a minute, at any hour;
- **always with you:** on LIBERAMENTE purchased books stay in your [Reader area](/en/lettore), where you can read them online or download them.

## The reading experience

Paper has strong arguments: no battery, no notifications, the pleasure of the object and a more "spatial" memory of where a sentence was. Many readers find it easier to concentrate on a printed book.

Digital answers with other strengths: you can enlarge the text, read in the dark, search for a word and highlight without damaging anything. For readers with poor eyesight or who read in short breaks, that's a lot.

> An e-reader with an e-ink screen is far easier on the eyes than a phone. If you read a lot digitally, it's the purchase that makes the difference.

## Environment

The comparison is less obvious than it seems. A print book's impact comes from paper, printing and transport; an e-reader's impact is concentrated in making the device, and is spread out the more books you read on it. For heavy readers, digital tends to be the lighter choice; for occasional readers, a shared or library print book is still a great option.

## Gifts, lending, resale

Paper wins here: you can give it, lend it, resell it or pass it on. Ebooks are tied to the buyer's account.

## So which should you choose?

- **Ebook** if you read while travelling or commuting, want to try new authors cheaply, or need larger text.
- **Print** if the book is a gift, if you want to underline and keep it on a shelf, or if screens make it hard to focus.

Many readers use digital to discover and print for the books they want to keep. That's a perfectly reasonable compromise.

Want to try? The [catalogue](/en/catalogo) has ebooks by independent authors, often with a free excerpt. Not sure how to read them on your device? See our [guide for phones, tablets and e-readers](/en/blog/how-to-read-pdf-ebooks-on-any-device).`,
sources:[{title:'Money.it – ECOFIN allows reduced VAT on digital publications (2018)',url:'https://www.money.it/e-book-iva-ridotta-pubblicazioni-digitali-online-direttiva-ecofin'},{title:'Il Post – The European Commission on ebook VAT',url:'https://www.ilpost.it/2016/12/05/iva-ebook-commissione-europea/'}]
},
{
id:'read-pdf',slug:'how-to-read-pdf-ebooks-on-any-device',audience:'readers',published:D,updated:D,
title:'How to read a PDF ebook on your phone, tablet, Kindle or Kobo',
description:'A practical guide to reading PDF ebooks anywhere: online, on smartphones, tablets, Kindle (via Send to Kindle) and Kobo, with tips for comfortable reading.',
excerpt:'Bought a PDF ebook and want to read it on your favourite device? How to do it on phones, tablets, computers, Kindle and Kobo, plus a few tricks for easier reading.',
keywords:['read pdf on kindle','how to read an ebook','pdf ebook on phone','send to kindle pdf','read pdf on kobo'],
body:`LIBERAMENTE ebooks come as **PDF** files: a universal format that opens on almost any device and keeps the layout the author intended. Here's how to read them comfortably, anywhere.

## First: where to find your books

Once your payment is confirmed, the book appears in your [Reader area](/en/lettore). From there you can:

- **read it online**, right in your browser, without downloading anything;
- **download the PDF**, to read it with the app or device you prefer.

## On your phone

The PDF opens in the Files app (iPhone) or the default PDF viewer (Android). For more comfortable reading:

- on iPhone and iPad, open the file in **Apple Books**: tap Share, then Books;
- on Android, upload it to **Google Play Books**, which accepts your own PDF and EPUB files and syncs them across devices;
- turn the phone sideways to enlarge the page, or pinch to zoom.

## On tablets and computers

A larger screen is ideal for PDFs, which have a fixed layout. Use your browser, Apple Books, Google Play Books or any PDF reader. On a computer, full-screen or reading mode removes distractions.

## On Kindle

Kindles read PDFs. The easiest way to send one is Amazon's free **Send to Kindle** service:

1. open the Send to Kindle page in your browser, install the desktop app, or use your Kindle's email address (find it in your Amazon account under "Manage your content and devices");
2. upload or email the PDF;
3. the book appears in your Kindle library, synced across your devices.

Send to Kindle accepts PDF, EPUB, DOCX and TXT among other formats. Remember that a PDF keeps its fixed layout: on a 6-inch screen it can help to rotate the Kindle to landscape or zoom in.

> If you send by email, first add the address you're sending from to the approved list in your Amazon settings.

## On Kobo

Kobo e-readers open PDFs without any conversion:

1. connect the Kobo to your computer with the USB cable;
2. copy the PDF into the device's storage;
3. eject the Kobo: the book appears in your library.

## Tips for reading PDFs comfortably

- **Crop the margins:** many apps and some e-readers can trim white margins and enlarge the text.
- **Use night mode** on your phone in the evening to reduce eye strain.
- **Choose an e-reader** if you read for hours: e-ink screens are much less tiring.
- **Keep a copy safe:** save the file in a folder or cloud drive; either way, the book stays in your Reader area.

## What about LIBERAMENTE Plus titles?

Books included in [LIBERAMENTE Plus](/en/plus) are read **online**, in sequence, and aren't downloadable: all you need is a browser, on any device. The reader remembers where you stopped.

Still have questions about a purchase? See the [FAQ](/en/faq) or [browse the catalogue](/en/catalogo).`,
sources:[{title:'Amazon – Send to Kindle supported file types',url:'https://digprjsurvey.amazon.com/csad/help/node/G5WYD9SAF7PGXRNA'},{title:'Liliputing – Kindles now accept EPUB through Send to Kindle',url:'https://liliputing.com/amazon-kindles-now-support-epub-books-sort-of-but-mobi-and-azw-support-is-ending-in-2022/'},{title:'LIBERAMENTE.site – Frequently asked questions',url:'https://liberamente.site/en/faq'}]
},
{
id:'subscriptions',slug:'are-ebook-subscriptions-worth-it',audience:'readers',published:D,updated:D,
title:'Are ebook subscriptions worth it? Kindle+, LIBERAMENTE Plus and buying single books',
description:'Kindle Unlimited is now Kindle+; LIBERAMENTE Plus starts at €4.99 a month. A simple calculation to see whether an ebook subscription is worth it for you.',
excerpt:'Kindle Unlimited has become Kindle+, and LIBERAMENTE has its own subscription. A simple calculation to see if one pays off, and what to check beyond the price.',
keywords:['ebook subscription','kindle unlimited price','kindle plus','is kindle unlimited worth it','liberamente plus'],
body:`Subscriptions changed how we listen to music and watch films. For books they work in a similar way: a monthly fee and a catalogue you can read without buying every title. But are they worth it?

## What's new in 2026

- Since **22 October 2026**, Amazon's Kindle Unlimited has been called **Kindle+**. In the US the plan costs $11.99 a month and now includes thousands of audiobooks; in other countries the price and content vary (in Italy it's still €9.99 a month, without audiobooks for now).
- **LIBERAMENTE Plus** is our store's subscription dedicated to independent authors: it starts at **€4.99 a month** and you can cancel anytime.

## The basic calculation

The right question is: how much would I spend buying the books I actually read in a month?

1. Count how many books you finish in a typical month (not the ones you'd like to read: the ones you finish).
2. Multiply by the average price of the ebooks you buy.
3. Compare with the monthly fee.

Example: if you read two ebooks a month at $6, you spend $12. A subscription around €5 saves you money, **provided the books you want are in the catalogue**. If you read one book every two months, buying single books almost always wins.

## Beyond the price: what to check

### The catalogue

A subscription is only worth the books it contains. Before signing up, check that it includes the authors and genres you read: big bestsellers are often not part of subscription services.

### How you read

Some services let you download books to your device, others are online only. In LIBERAMENTE Plus, for example, titles are read online in sequence and can't be downloaded or printed; the reader remembers where you stopped.

### Do you own the book?

No: with a subscription the book is on loan as long as you pay. If you loved a title enough to want to reread it, buy it.

### Who gets paid

In subscriptions authors are paid according to reading. In LIBERAMENTE Plus, 60% of the distributable fund goes to authors, shared by pages read and confirmed by readers: every page you read genuinely counts for the person who wrote it.

## Our rule of thumb

- **You read more than one book a month** and the catalogue appeals to you: a subscription pays off.
- **You read little, or only specific authors:** buy single books.
- **You want to discover independent writers** cheaply: a dedicated subscription is the most economical way to try many.

> Before subscribing, browse the included catalogue and try it for a month: it's the most honest test.

See what [LIBERAMENTE Plus](/en/plus) includes, or browse the [catalogue](/en/catalogo) to buy single books.`,
sources:[{title:'Your Life Updated – Kindle Unlimited becomes Kindle+ (November 2026)',url:'https://www.yourlifeupdated.net/news/kindle-unlimited-diventa-kindle-plus'},{title:'Punto Informatico – Kindle Unlimited becomes Kindle+ (22 October 2026)',url:'https://www.punto-informatico.it/kindle-unlimited-diventa-kindle-plus/'},{title:'LIBERAMENTE Plus – How it works',url:'https://liberamente.site/en/plus'}]
},
{
id:'choose-next',slug:'how-to-choose-your-next-book',audience:'readers',published:D,updated:D,
title:'How to choose your next book: 7 methods that work',
description:'Not sure what to read next? Seven practical ways to choose your next book: excerpts, verified reviews, genre filters, themed reading and recommendations.',
excerpt:'Finish one book and the hunt for the next begins. Seven simple methods to choose better, discover new authors and never run out of something to read.',
keywords:['what to read next','book recommendations','how to choose a book','books to read','next book to read'],
body:`There's a precise moment, right after finishing a good book, when you don't know what to read next. Sometimes you end up picking the first title in the charts, sometimes nothing at all. Here are seven ways to come out of it with the right book for you.

## 1. Start from what you just enjoyed

Ask yourself **what** you liked about the book you finished: the setting, the pace, a kind of character, the theme? That's more useful than "I liked it" and points you to similar books for the right reason, not just the same genre.

## 2. Always read the excerpt

The first pages say a lot about style and pace. Many pages in our [catalogue](/en/catalogo) have a free preview: read two pages. If at the end you want to know what happens next, you've found your book.

## 3. Trust the right reviews

Not all reviews are equal. Look for ones that explain why, not just the star rating. On LIBERAMENTE only people who bought a book can review it: a simple but effective filter against fake praise.

## 4. Use filters, not just charts

Charts reward what's already famous. Filters by genre, price and rating help you find what suits you:

- pick a genre you love;
- sort by "most reviewed" to start with titles that convinced most readers;
- or check "new" to discover recent releases.

## 5. Read to a theme

Giving yourself a small theme makes choosing more fun: a book set where you live, a debut author, a genre you've never tried, a book published the year you were born. It works like a personal challenge, without pressure.

## 6. Alternate long and short

After a demanding novel, a short book (a novella, a collection, practical nonfiction) brings back the pleasure of finishing something. Many readers stall simply because they picked a long book at the wrong moment.

## 7. Try an independent author

Independent writers often cover niches and places big publishers overlook, at lower prices. It's the cheapest way to widen your horizons; we explain why in [Why read independent authors](/en/blog/why-read-independent-authors).

## One more trick: a to-read list

Whenever someone recommends a book or you come across an interesting one, note it straight away, in a phone note or your favourites. At the end of each book, you'll already have a list to choose from.

> The right book isn't always the most famous one: it's the one that arrives at the right moment. Giving yourself permission to drop a book that isn't working is part of the game.

Looking for inspiration now? Open the [catalogue](/en/catalogo) and start from your favourite genre. And if you read a lot, see whether a [subscription](/en/blog/are-ebook-subscriptions-worth-it) is worth it for you.`,
sources:[{title:'LIBERAMENTE.site – Frequently asked questions (previews and reviews)',url:'https://liberamente.site/en/faq'}]
}
];
