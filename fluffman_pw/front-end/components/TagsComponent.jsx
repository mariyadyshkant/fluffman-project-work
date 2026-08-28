import "../styles/Tags.css";

export default function Tags({ product }) {
  const animalTypes = {
    1: "Cane",
    2: "Gatto",
    3: "Pesce",
    4: "Roditore",
    5: "Uccello",
  };

  return (
    <div className="mt-2">
      {(product?.animal_id ||
        product?.pet_food_necessity ||
        product?.food_type ||
        product?.age ||
        product?.weight ||
        product?.hair ||
        product?.biological ||
        product?.accessories) && (
          <div className="tags">
            <ul className="list-unstyled d-flex flex-row gap-2 flex-wrap justify-content-start mb-0">
              {product?.animal_id && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">
                    {animalTypes[product.animal_id]}
                  </p>
                </li>
              )}
              {product?.pet_food_necessity && product.pet_food_necessity !== "0" && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">
                    {product.pet_food_necessity}
                  </p>
                </li>
              )}
              {product?.food_type && product.food_type !== "0" && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">{product.food_type}</p>
                </li>
              )}
              {product?.age && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">{product.age}</p>
                </li>
              )}
              {product?.weight && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">{product.weight}</p>
                </li>
              )}
              {product?.hair && product.hair !== "0" && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">{product.hair}</p>
                </li>
              )}
              {product?.biological === true && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">Bio</p>
                </li>
              )}
              {product?.accessories === true && (
                <li className="tag px-2 py-1 bg-body-secondary rounded">
                  <p className="text-success my-0 small">Accessori</p>
                </li>
              )}
            </ul>
          </div>
        )}
    </div>
  );
}
