import ProductsSlider from "../components/ProductsSlider";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import "../styles/ProductPages.css";
// import { useWishlist } from "../context/WishlistContext";
// import { useCart } from "../context/CartContext";

export default function OtherAnimalProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoading, setShowLoading] = useState(false);

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
        setProducts(allProducts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fishProducts = products.filter((product) => product.animal_id === 3);
  const rodentProducts = products.filter((product) => product.animal_id === 4);
  const birdProducts = products.filter((product) => product.animal_id === 5);

  if (showLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">Errore: {error}</div>;
  }

  return (
    <div className="hp_bg p-2">
      <div className="m-2 p-2 text-center">
        <h1>Non solo cani e gatti</h1>
        <p className="text-light">
          Pappagalli, criceti, pesci rossi, qui trovi prodotti per ogni animale
        </p>
      </div>

      {/* Sezione Pesci */}
      {fishProducts.length > 0 && (
        <ProductsSlider
          title="Tutto per il tuo acquario"
          products={fishProducts}
        />
      )}

      {/* Sezione Roditori */}
      {rodentProducts.length > 0 && (
        <ProductsSlider
          title="Cibo e accessori per roditori"
          products={rodentProducts}
        />
      )}

      {/* Sezione Uccelli */}
      {birdProducts.length > 0 && (
        <ProductsSlider
          title="Semi, gabbie e giochi per i tuoi uccelli"
          products={birdProducts}
        />
      )}
    </div>
  );
}
