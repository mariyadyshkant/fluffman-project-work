import pool from "../db/connection.js";

// STORE
export async function store(req, res) {
    const { product_id, purchase_id, quantity, price, discount_price, name } = req.body;
    if (!product_id || !purchase_id || !quantity || !price) {
        return res.status(400).json({ error: true, message: "Dati mancanti. I campi product_id, purchase_id, quantity e price sono obbligatori." });
    }

    try {
        const { rows: [newItem] } = await pool.query(
            `INSERT INTO product_purchase (product_id, purchase_id, quantity, price, discount_price, name)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [product_id, purchase_id, quantity, price, discount_price, name]
        );
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// INDEX
export async function index(req, res) {
    try {
        const { rows } = await pool.query("SELECT * FROM product_purchase ORDER BY id ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// SHOW
export async function show(req, res) {
    const { id } = req.params;
    try {
        const { rows } = await pool.query("SELECT * FROM product_purchase WHERE id = $1", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "Articolo acquisto non trovato." });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// UPDATE
export async function update(req, res) {
    const { id } = req.params;
    const { quantity, price, discount_price, name } = req.body;

    try {
        const { rows: [updatedItem] } = await pool.query(
            "UPDATE product_purchase SET quantity = $1, price = $2, discount_price = $3, name = $4 WHERE id = $5 RETURNING *",
            [quantity, price, discount_price, name, id]
        );
        if (!updatedItem) {
            return res.status(404).json({ error: true, message: "Articolo acquisto non trovato." });
        }
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// DESTROY
export async function destroy(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM product_purchase WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: true, message: "Articolo acquisto non trovato." });
        }
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}