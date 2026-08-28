import pool from "../db/connection.js";

// INDEX
export async function index(req, res) {
    try {
        const { rows } = await pool.query("SELECT * FROM images ORDER BY id ASC");
        res.json(rows);
    } catch (err) {
        // Questa riga mostra il messaggio d'errore del database
        res.status(500).json({ error: true, message: err.message });
    }
}

// SHOW
export async function show(req, res) {
    const { id } = req.params;
    try {
        const { rows } = await pool.query("SELECT * FROM images WHERE id = $1", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "Immagine non trovata." });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// STORE
export async function store(req, res) {
    const { name, product_id } = req.body;

    // Aggiungi un controllo esplicito per il nome dell'immagine
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: true, message: "Il nome dell'immagine è obbligatorio e non può essere vuoto." });
    }

    // Controlla che product_id sia un numero valido
    const finalProductId = parseInt(product_id);
    if (isNaN(finalProductId)) {
        return res.status(400).json({ error: true, message: "L'ID del prodotto non è valido." });
    }

    try {
        const { rows: [newImage] } = await pool.query(
            "INSERT INTO images (name, product_id) VALUES ($1, $2) RETURNING *",
            [name.trim(), finalProductId]
        );
        res.status(201).json(newImage);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// UPDATE
export async function update(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    // Aggiungi un controllo esplicito per il tipo e la lunghezza della stringa
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: true, message: "Il nuovo nome dell'immagine è obbligatorio e non può essere vuoto." });
    }

    try {
        const { rows: [updatedImage] } = await pool.query(
            "UPDATE images SET name = $1 WHERE id = $2 RETURNING *",
            [name.trim(), id]
        );
        if (!updatedImage) {
            return res.status(404).json({ error: true, message: "Immagine non trovata." });
        }
        res.status(200).json(updatedImage);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// DESTROY
export async function destroy(req, res) {
    const { id } = req.params;
    const imageId = parseInt(id);

    if (isNaN(imageId)) {
        return res.status(400).json({ error: true, message: "ID non valido." });
    }

    try {
        const result = await pool.query("DELETE FROM images WHERE id = $1", [imageId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: true, message: "Immagine non trovata." });
        }
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}