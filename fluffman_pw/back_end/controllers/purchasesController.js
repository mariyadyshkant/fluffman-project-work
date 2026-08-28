import pool from "../db/connection.js";

// STORE
export async function store(req, res) {
    const {
        totalPrice,
        userName,
        userLastName,
        userEmail,
        userPhone,
        billingAddress,
        deliveryAddress,
    } = req.body;

    const productsInCart = req.body.products;

    if (!productsInCart || productsInCart.length === 0) {
        return res.status(400).json({ error: true, message: "Il carrello è vuoto." });
    }

    const user_id = 0;
    const date = new Date().toISOString().split('T')[0];
    const card_number = 'N/A';
    const total_price = totalPrice;
    const name = userName;
    const last_name = userLastName;
    const email = userEmail;
    const phone_number = userPhone;
    const address = billingAddress.address;
    const state = billingAddress.city;
    const cap = billingAddress.zip;
    const shipping = 'Standard';
    const invoice = false;
    const status = 'Pending';
    const shipping_invoice = deliveryAddress ? deliveryAddress.address : billingAddress.address;

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        for (const item of productsInCart) {
            const { rows: productRows } = await client.query(
                "SELECT quantity FROM products WHERE id = $1 FOR UPDATE",
                [item.id]
            );

            if (productRows.length === 0) {
                await client.query("ROLLBACK");
                return res.status(404).json({ error: true, message: `Prodotto con ID ${item.id} non trovato.` });
            }

            const available = productRows[0].quantity;

            if (available < item.quantity) {
                await client.query("ROLLBACK");
                return res.status(409).json({ error: true, message: `La quantità richiesta per il prodotto con ID ${item.id} non è disponibile.` });
            }

            await client.query(
                "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
                [item.quantity, item.id]
            );
        }

        // Inserimento dell'acquisto senza order_number
        const { rows: [purchase] } = await client.query(
            "INSERT INTO purchases (user_id, date, card_number, total_price, name, last_name, email, phone_number, address, state, cap, shipping, invoice, status, shipping_invoice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
            [user_id, date, card_number, total_price, name, last_name, email, phone_number, address, state, cap, shipping, invoice, status, shipping_invoice]
        );

        const purchaseId = purchase.id;

        // Genera il numero d'ordine basato sull'ID dell'acquisto
        const orderNumber = `ORD-${purchaseId}`;
        const { rows: [updatedPurchase] } = await client.query(
            "UPDATE purchases SET order_number = $1 WHERE id = $2 RETURNING *",
            [orderNumber, purchaseId]
        );

        for (const item of productsInCart) {
            await client.query(
                "INSERT INTO product_purchase (purchase_id, product_id, quantity, name, price) VALUES ($1, $2, $3, $4, $5)",
                [purchaseId, item.id, item.quantity, item.name, item.price]
            );
        }

        await client.query("COMMIT");

        res.status(201).json(updatedPurchase);

    } catch (err) {
        if (client) {
            await client.query("ROLLBACK");
        }
        res.status(500).json({ error: true, message: err.message });
    } finally {
        if (client) {
            client.release();
        }
    }
}

// INDEX
export async function index(req, res) {
    try {
        const { rows } = await pool.query("SELECT * FROM purchases ORDER BY date DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// SHOW
export async function show(req, res) {
    const { id } = req.params;
    try {
        const { rows } = await pool.query("SELECT * FROM purchases WHERE id = $1", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "Acquisto non trovato." });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// UPDATE STATUS
export async function updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: true, message: "Stato non specificato." });
    }

    try {
        const { rows: [updatedPurchase] } = await pool.query("UPDATE purchases SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
        if (!updatedPurchase) {
            return res.status(404).json({ error: true, message: "Acquisto non trovato." });
        }
        res.json(updatedPurchase);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// DELETE (destroy): Elimina un acquisto
export async function destroy(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM purchases WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: true, message: "Acquisto non trovato." });
        }
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}
