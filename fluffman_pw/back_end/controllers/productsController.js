import pool from "../db/connection.js";
import {
  validateId,
  validatePrice,
  sanitizeAndValidateNumberField,
} from "../utils/validators.js";

// INDEX - Mostra tutti i prodotti
export async function index(req, res) {
  try {
    const { rows } = await pool.query(`
            SELECT
                p.*,
                i.name AS image_path
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            ORDER BY p.id ASC
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}

// SHOW - Mostra un singolo prodotto tramite ID
export async function show(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `
            SELECT
                p.*,
                b.name AS brand_name,
                i.name AS image_path
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            JOIN brands AS b ON p.brand_id = b.id
            WHERE p.id = $1
        `,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Prodotto non trovato." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}

// SEARCH - Cerca e filtra prodotti con il percorso immagine
export async function search(req, res) {
  const {
    name,
    brand_id,
    animal_id,
    price_min,
    price_max,
    sort_by,
    sort_order,
    price_range,
  } = req.query;

  let query = `
    SELECT
        p.*,
        b.name AS brand_name,
        i.name AS image_path,
        COALESCE(p.discount_price, p.price) AS final_price
    FROM products AS p
    JOIN images AS i ON p.id = i.product_id
    LEFT JOIN brands AS b ON p.brand_id = b.id
`;
  // ho inserito la COALESCE per i filtri
  const values = [];
  const conditions = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`p.name LIKE $${values.length}`);
  }
  //filtro per DISCOUNT PRICE === 1 == TRUE
  if (req.query.discount === "1") {
    conditions.push(`p.discount_price IS NOT NULL AND p.discount_price > 0`);
  }

  if (brand_id) {
    values.push(brand_id);
    conditions.push(`p.brand_id = $${values.length}`);
  }

  if (animal_id) {
    values.push(animal_id);
    conditions.push(`p.animal_id = $${values.length}`);
  }

  if (price_min) {
    values.push(price_min);
    conditions.push(`p.price >= $${values.length}`);
  }

  if (price_max) {
    values.push(price_max);
    conditions.push(`p.price <= $${values.length}`);
  }

  if (price_range) {
    switch (price_range) {
      case "under10":
        conditions.push(`COALESCE(p.discount_price, p.price) < 10`);
        break;
      case "10to20":
        conditions.push(
          `COALESCE(p.discount_price, p.price) BETWEEN 10 AND 20`
        );
        break;
      case "20to40":
        conditions.push(
          `COALESCE(p.discount_price, p.price) BETWEEN 20 AND 40`
        );
        break;
      case "over40":
        conditions.push(`COALESCE(p.discount_price, p.price) > 40`);
        break;
    }
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(` AND `);
  }

  let order = "p.id";
  let orderDirection = "ASC";

  if (sort_by) {
    const allowedSorts = ["price", "name"];
    if (allowedSorts.includes(sort_by)) {
      order = `p.${sort_by}`;
    }
  }

  if (
    sort_order &&
    (sort_order.toUpperCase() === "DESC" || sort_order.toUpperCase() === "ASC")
  ) {
    orderDirection = sort_order.toUpperCase();
  }

  query += ` ORDER BY ${order} ${orderDirection}`;

  try {
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error("Errore durante la ricerca:", err);
    res.status(500).json({
      error: true,
      message: "Errore interno del server durante la ricerca.",
    });
  }
}

// GET - Mostra prodotti correlati
export async function getRelatedProducts(req, res) {
  const { id } = req.params;

  try {
    //prodotto principale e attributi per la correlazione
    const { rows: mainProductRows } = await pool.query(
      `
            SELECT
            animal_id,
                brand_id,
                accessories,
                age,
                weight,
                food_type,
                hair
            FROM products
            WHERE id = $1
        `,
      [id]
    );

    if (mainProductRows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Prodotto non trovato." });
    }

    const mainProduct = mainProductRows[0];
    const { brand_id, animal_id, age, weight, food_type, hair, accessories } = mainProduct;

    //query di ricerca con un sistema di punteggio in modo che sia in ordine decrescente
    // NB: HAVING senza GROUP BY funziona in MySQL come filtro riga per riga, ma non in
    // Postgres (standard SQL) — qui lo score va quindi calcolato in una subquery e filtrato con WHERE.
    let query = `
        SELECT * FROM (
            SELECT
                p.*,
                i.name AS image_path,
                (
                  (p.animal_id = $1)::int * 10 +
                  (p.brand_id = $2)::int * 3 +
                  (p.accessories = $3)::int * 2 +
                  (p.age = $4)::int * 2 +
                  (p.weight = $5)::int * 2 +
                  (p.food_type = $6)::int * 1 +
                  (p.hair = $7)::int * 1
                ) AS score
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            WHERE p.id != $8 AND p.animal_id = $9
        ) AS scored
        WHERE score > 0
        ORDER BY score DESC, RANDOM()
        LIMIT 20
    `;

    const values = [
      animal_id,
      brand_id,
      accessories,
      age,
      weight,
      food_type,
      hair,
      id,
      animal_id,
    ];

    const { rows: relatedProducts } = await pool.query(query, values);

    //se la query complessa non trova nulla, prova a cercare solo per brand_id o animal_id con questa query
    if (relatedProducts.length === 0) {
      let fallbackQuery = `
            SELECT
                p.*,
                i.name AS image_path
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            WHERE p.id != $1 AND (p.brand_id = $2 OR p.animal_id = $3)
            ORDER BY RANDOM()
            LIMIT 12
        `;
      const { rows: fallbackProducts } = await pool.query(fallbackQuery, [id, brand_id, animal_id]);
      return res.json(fallbackProducts);
    }

    res.json(relatedProducts);
  } catch (err) {
    console.error("Errore durante il recupero dei prodotti correlati:", err);
    res.status(500).json({
      error: true,
      message: "Errore interno del server durante il recupero dei prodotti correlati.",
    });
  }
}

export async function showBySlug(req, res) {
  const { slug } = req.params;
  try {
    const { rows } = await pool.query(
      `
            SELECT
                p.*,
                b.name AS brand_name,
                i.name AS image_path
            FROM products AS p
            JOIN images AS i ON p.id = i.product_id
            LEFT JOIN brands AS b ON p.brand_id = b.id
            WHERE p.slug = $1
        `,
      [slug]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Prodotto non trovato." });
    }
    // La riga successiva aggiungerà la quantità alla risposta
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}

// STORE - Crea un nuovo prodotto
export async function store(req, res) {
  const {
    animal_id,
    brand_id,
    name,
    description,
    quantity,
    price,
    discount_price,
    age,
    weight,
    accessories,
    food_type,
    biological,
    pet_food_necessity,
    hair,
    additional_information,
    product_weight,
    slug,
  } = req.body;

  // Validazione e sanitizzazione dei campi
  const validatedQuantity = sanitizeAndValidateNumberField(
    quantity,
    "quantity"
  );
  if (validatedQuantity.error) {
    return res.status(400).json(validatedQuantity);
  }
  const validatedPrice = validatePrice(price, "price");
  if (validatedPrice.error) {
    return res.status(400).json(validatedPrice);
  }

  try {
    const { rows: [newProduct] } = await pool.query(
      "INSERT INTO products (animal_id, brand_id, name, description, quantity, price, discount_price, age, weight, accessories, food_type, biological, pet_food_necessity, hair, additional_information, product_weight, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *",
      [
        animal_id,
        brand_id,
        name,
        description,
        validatedQuantity,
        validatedPrice,
        discount_price,
        age,
        weight,
        accessories,
        food_type,
        biological,
        pet_food_necessity,
        hair,
        additional_information,
        product_weight,
        slug,
      ]
    );
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}

//Update solo prezzo
export async function changePrice(req, res) {
  const { id } = req.params;
  const { new_price } = req.body;

  try {
    await pool.query("UPDATE products SET price = $1 WHERE id = $2", [
      new_price,
      id,
    ]);
    res.json({ message: "Prezzo aggiornato con successo." });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}

// UPDATE - Aggiorna un prodotto esistente
export async function update(req, res) {
  const { id } = req.params;
  const {
    animal_id,
    brand_id,
    name,
    description,
    quantity,
    price,
    discount_price,
    age,
    weight,
    accessories,
    food_type,
    biological,
    pet_food_necessity,
    hair,
    additional_information,
    product_weight,
    slug,
  } = req.body;

  // Validazione e sanitizzazione
  const validatedQuantity = sanitizeAndValidateNumberField(
    quantity,
    "quantity"
  );
  if (validatedQuantity.error) {
    return res.status(400).json(validatedQuantity);
  }
  const validatedPrice = validatePrice(price, "price");
  if (validatedPrice.error) {
    return res.status(400).json(validatedPrice);
  }

  try {
    await pool.query(
      "UPDATE products SET animal_id = $1, brand_id = $2, name = $3, description = $4, quantity = $5, price = $6, discount_price = $7, age = $8, weight = $9, accessories = $10, food_type = $11, biological = $12, pet_food_necessity = $13, hair = $14, additional_information = $15, product_weight = $16, slug = $17 WHERE id = $18",
      [
        animal_id,
        brand_id,
        name,
        description,
        validatedQuantity,
        validatedPrice,
        discount_price,
        age,
        weight,
        accessories,
        food_type,
        biological,
        pet_food_necessity,
        hair,
        additional_information,
        product_weight,
        slug,
        id,
      ]
    );

    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}

// DESTROY - Elimina un prodotto
export async function destroy(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.status(200).json({ message: "Prodotto eliminato con successo." });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}
