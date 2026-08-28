import pool from "../db/connection.js";

/**
 * Sanifica e valida un campo numerico che potrebbe essere null.
 * Converte esplicitamente stringhe vuote, undefined o 'NULL' in un valore null.
 * Inoltre, verifica che il valore, se presente, sia un numero valido e positivo.
 * @param {*} value - Il valore da sanificare.
 * @param {boolean} isRequiredAndPositive - Se il campo deve essere obbligatorio e positivo.
 * @returns {number|null|object} - Il valore numerico, null o un oggetto di errore.
 */
const sanitizeAndValidateNumberField = (value, isRequiredAndPositive = false) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.toUpperCase() === 'NULL')) {
        if (isRequiredAndPositive) {
            return { error: true, message: "Il campo 'quantity' deve essere un numero intero non negativo." };
        }
        return null;
    }

    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        return { error: true, message: "Il campo 'quantity' deve essere un numero valido." };
    }

    if (isRequiredAndPositive && (!Number.isInteger(numberValue) || numberValue < 0)) {
        return { error: true, message: "Il campo 'quantity' deve essere un numero intero non negativo." };
    }

    return numberValue;
};

// La funzione INDEX del tuo controller dei prodotti
export async function index(req, res) {
    try {
        const { rows } = await pool.query(`
            SELECT
                p.*,
                i.name AS image_name
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            ORDER BY p.id ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// SHOW
export async function show(req, res) {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(`
            SELECT
                p.*,
                i.name AS image_name
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            WHERE p.id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "Prodotto non trovato." });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

export async function showBySlug(req, res) {
    const { slug } = req.params;

    try {
        const { rows } = await pool.query(
            `
            SELECT
                a.*,
                b.name AS breed_name,
                i.name AS image_path
            FROM animals AS a
            LEFT JOIN breeds AS b ON a.breed_id = b.id
            LEFT JOIN images AS i ON a.id = i.animal_id
            WHERE a.slug = $1
            `,
            [slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "Animale non trovato." });
        }

        // La query potrebbe restituire più righe se un animale ha più immagini.
        // Se vuoi solo una singola riga, puoi prendere la prima, ma se vuoi tutte le immagini,
        // potresti dover raggruppare i risultati o modificare la query.
        // Per semplicità, questa versione restituisce il primo risultato.
        res.json(rows[0]);
    } catch (err) {
        console.error('Errore durante la ricerca per slug:', err);
        res.status(500).json({ error: true, message: err.message });
    }
}

// CREATE (store): Crea un nuovo prodotto
export async function store(req, res) {
    const {
        name, description, quantity, price, discount_price, age, weight,
        accessories, food_type, biological, pet_food_necessity, hair,
        additional_information, product_weight, animal_id, brand_id
    } = req.body;

    // Controllo avanzato per il nome: deve essere una stringa non vuota
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: true, message: "Il nome del prodotto è obbligatorio e non può essere vuoto." });
    }

    // Validazione del prezzo
    const finalPrice = Number(price);
    if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ error: true, message: "Il prezzo deve essere un numero valido e maggiore di zero." });
    }

    // Validazione della quantità
    const finalQuantity = sanitizeAndValidateNumberField(quantity, true);
    if (finalQuantity && finalQuantity.error) {
        return res.status(400).json(finalQuantity);
    }

    try {
        const finalDiscountPrice = sanitizeAndValidateNumberField(discount_price);
        const finalProductWeight = sanitizeAndValidateNumberField(product_weight);

        const query = `INSERT INTO products (
            name, description, quantity, price, discount_price, age, weight,
            accessories, food_type, biological, pet_food_necessity, hair,
            additional_information, product_weight, animal_id, brand_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`;

        const values = [
            name.trim(),
            description ? description.trim() : null,
            finalQuantity,
            finalPrice,
            finalDiscountPrice,
            age || null,
            weight || null,
            accessories || 0,
            food_type || null,
            biological || 0,
            pet_food_necessity || null,
            hair || null,
            additional_information || null,
            finalProductWeight,
            animal_id || null,
            brand_id || null
        ];

        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// UPDATE: Aggiorna il prezzo
export async function changePrice(req, res) {
    const { id } = req.params;
    const { new_price } = req.body;

    const finalNewPrice = Number(new_price);
    if (isNaN(finalNewPrice) || finalNewPrice <= 0) {
        return res.status(400).json({ error: true, message: "Il prezzo deve essere un numero valido e maggiore di zero." });
    }

    try {
        const { rows: [updatedProduct] } = await pool.query("UPDATE products SET price = $1 WHERE id = $2 RETURNING *", [finalNewPrice, id]);

        if (!updatedProduct) {
            return res.status(404).json({ error: true, message: "Prodotto non trovato" });
        }

        res.status(200).json({
            success: true,
            message: `Prezzo del prodotto ${id} aggiornato con successo`,
            updatedProduct
        });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// UPDATE
export async function update(req, res) {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: true, message: "ID del prodotto non valido." });
    }

    const {
        name, description, quantity, price, discount_price, age, weight,
        accessories, food_type, biological, pet_food_necessity, hair,
        additional_information, product_weight, animal_id, brand_id
    } = req.body;

    // Controllo avanzato per il nome: deve essere una stringa non vuota
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: true, message: "Il nome del prodotto è obbligatorio e non può essere vuoto." });
    }

    // Validazione del prezzo
    const finalPrice = Number(price);
    if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ error: true, message: "Il prezzo deve essere un numero valido e maggiore di zero." });
    }

    // Validazione della quantità
    const finalQuantity = sanitizeAndValidateNumberField(quantity, true);
    if (finalQuantity && finalQuantity.error) {
        return res.status(400).json(finalQuantity);
    }

    try {
        const finalDiscountPrice = sanitizeAndValidateNumberField(discount_price);
        const finalProductWeight = sanitizeAndValidateNumberField(product_weight);

        const query = `UPDATE products SET
            name = $1, description = $2, quantity = $3, price = $4, discount_price = $5, age = $6, weight = $7,
            accessories = $8, food_type = $9, biological = $10, pet_food_necessity = $11, hair = $12,
            additional_information = $13, product_weight = $14, animal_id = $15, brand_id = $16
            WHERE id = $17 RETURNING *`;
        const values = [
            name.trim(),
            description ? description.trim() : null,
            finalQuantity,
            finalPrice,
            finalDiscountPrice,
            age || null,
            weight || null,
            accessories || 0,
            food_type || null,
            biological || 0,
            pet_food_necessity || null,
            hair || null,
            additional_information || null,
            finalProductWeight,
            animal_id || null,
            brand_id || null,
            id
        ];
        const { rows: [updatedProduct] } = await pool.query(query, values);

        if (!updatedProduct) {
            return res.status(404).json({ error: true, message: "Prodotto non trovato" });
        }

        res.json({ success: true, message: "Prodotto aggiornato con successo", product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}

// DESTROY
export async function destroy(req, res) {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
        return res.status(400).json({ error: true, message: "ID non valido" });
    }

    try {
        const result = await pool.query("DELETE FROM products WHERE id = $1", [productId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: true, message: "Prodotto non trovato" });
        }

        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
}