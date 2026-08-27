import ProductsSlider from "../components/ProductsSlider";
import Loading from "../components/Loading";
import "../styles/ProductPages.css";
import { useEffect, useState } from "react";
// import { useWishlist } from "../context/WishlistContext";
// import { useCart } from "../context/CartContext";

export default function CatProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usa context per wishlist e carrello
  // const { wishlist } = useWishlist();
  // const { cart } = useCart();

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Errore nel caricamento dei prodotti.");
        }
        return res.json();
      })
      .then((allProducts) => {
        const catProducts = allProducts.filter(
          (product) => product.animal_id === 2
        );
        setProducts(catProducts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const foodProducts = products.filter(
    (product) =>
      product.pet_food_necessity && product.pet_food_necessity !== "N/A"
  );
  const accessoryProducts = products.filter(
    (product) => product.accessories === 1
  );

  if (error) {
    return <div className="text-center mt-5 text-danger">Errore: {error}</div>;
  }

  if (showLoading) {
    return <Loading />;
  }

  return (
    <div className="hp_bg">
      <div className="m-2 p-2 text-center">
        <h1>Il regno dei Gatti</h1>
        <p className="text-light">
          Corrono, saltano, miagolano, qui una vasta scelta per avere un gatto
          sempre felice
        </p>
      </div>

      {foodProducts.length > 0 && (
        <ProductsSlider
          title="Un lauto pasto per il tuo gatto esigente"
          products={foodProducts}
        />
      )}

      {accessoryProducts.length > 0 && (
        <ProductsSlider
          title="Tiragraffi, lettiere, ciotole, giochi: qui trovi tutto!"
          products={accessoryProducts}
        />
      )}
    </div>
  );
}
