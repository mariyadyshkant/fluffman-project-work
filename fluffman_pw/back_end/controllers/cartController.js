import pool from "../db/connection.js";

// Funzione per aggiungere un prodotto al carrello
export async function addToCart(req, res) {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: true, message: "ID Prodotto e quantità validi sono obbligatori." });
    }

    try {
        // Controllo della disponibilità
        const { rows: product } = await pool.query("SELECT quantity FROM products WHERE id = $1", [productId]);

        if (product.length === 0) {
            return res.status(404).json({ error: true, message: "Prodotto non trovato." });
        }

        const availableQuantity = product[0].quantity;

        if (availableQuantity <= 0 || availableQuantity < quantity) {
            return res.status(409).json({ error: true, message: "Prodotto esaurito o quantità richiesta non disponibile." });
        }

        // A questo punto, il front-end può procedere. Non serve logica di database qui,
        // perché il carrello è solitamente gestito sul front-end (es. in uno stato React)
        // o in una sessione del back-end, non in una tabella permanente.

        res.status(200).json({ success: true, message: "Prodotto aggiunto al carrello con successo." });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}