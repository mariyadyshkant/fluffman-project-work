# Progetto: Fluffman

E-commerce di articoli per animali domestici, suddiviso per tipo di animale (cani, gatti, altri). Progetto finale di gruppo al termine della parte generale (4 mesi) del bootcamp Boolean.

# Collaboratori:

- Mariya Dyshkant
- Nicola Domingo Rizzo
- Francesco Colucci
- Francesco Sales
- Adriano Rotondo

## Funzionalità

- Homepage, ricerca, dettaglio prodotto ✅
- Carrello e checkout ✅
- Invio email di conferma ordine (Nodemailer + OAuth2) ✅
- Doppia visualizzazione dei risultati di ricerca ✅
- Spedizione gratuita oltre soglia, prodotti in promozione ✅
- Wishlist e prodotti correlati ✅
- Gestione quantità in carrello ✅
- Pagamento 📋 (fuori scope: nessuna integrazione di pagamento reale, il checkout salva un placeholder)

## Il mio contributo

Frontend React: componenti prodotto, sistema di preferiti e carrello (rifattorizzati da state locale a Context API condivisa per risolvere un bug di sincronizzazione sul contatore nell'header), validazione del flusso di checkout.

Migrazione del database da MySQL a PostgreSQL su 7 controller, necessaria per il deploy in produzione — non solo un cambio di driver: sintassi dei placeholder diversa (`?` contro `$1, $2...`), forma diversa del risultato delle query (`[rows]` contro `{ rows }`), API di transazione completamente diversa. Il punto più interessante: una query di prodotti correlati usava `HAVING` senza `GROUP BY` per filtrare uno score calcolato riga per riga — comportamento non standard che MySQL permette silenziosamente ma che PostgreSQL rifiuta. Risolta riscrivendo la query con una subquery.

Sviluppato con l'assistenza di Claude Code — i commit co-autorati sono visibili nella cronologia Git.

## Architettura

- **Frontend:** React 19 + Vite, React Router 7, Bootstrap. Comunica con il backend via `fetch()` su endpoint REST JSON, URL configurabile tramite `VITE_API_URL`
- **Backend:** Node.js + Express 5 (ES modules), API REST pura — nessun templating server-side
- **Database:** PostgreSQL, ospitato su Railway
  Il checkout gira dentro una transazione con row-locking (`SELECT ... FOR UPDATE`): blocca la riga di ogni prodotto mentre verifica e decrementa lo stock, con rollback automatico se la quantità richiesta non è più disponibile — evita overselling in caso di richieste concorrenti sullo stesso prodotto.

Il catalogo è organizzato su 6 tabelle collegate (prodotti, marche, animali, immagini, acquisti, e una tabella ponte acquisti↔prodotti che salva uno snapshot di prezzo e quantità al momento dell'acquisto).

## Stack

**Frontend:** React 19, Vite, React Router 7, Bootstrap
**Backend:** Node.js, Express 5
**Database:** PostgreSQL (Railway)

## Sviluppo locale

```bash
# Backend
cd back_end
npm install
npm run dev        # richiede un file .env con le variabili del database

# Frontend (in un altro terminale)
cd front-end
npm install
npm run dev
```

Variabili d'ambiente principali:

- Backend: connessione al database PostgreSQL (`DATABASE_URL`), credenziali OAuth2 per l'invio email
- Frontend: `VITE_API_URL` puntato all'indirizzo del backend

## Autrice

**Mariya Dyshkant**
[Portfolio](https://mariyadyshkant.com/progetti/financed) · [LinkedIn](https://www.linkedin.com/in/mariyadyshkant/)
