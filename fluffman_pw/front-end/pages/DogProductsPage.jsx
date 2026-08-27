import ProductsSlider from "../components/ProductsSlider";
import Loading from "../components/Loading";
import "../styles/ProductPages.css";
import { useEffect, useState } from "react";
// import { useWishlist } from "../context/WishlistContext";
// import { useCart } from "../context/CartContext";

export default function DogProductsPage() {
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
        const dogProducts = allProducts.filter(
          (product) => product.animal_id === 1
        );
        setProducts(dogProducts);
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

  if (showLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">Errore: {error}</div>;
  }

  return (
    <div className="hp_bg p-2">
      <div className="m-2 p-2 text-center">
        <h1>Il meglio per il tuo cane</h1>
        <p className="text-light">
          La nostra ampia scelta di prodotti per cani, propone prodotti di
          altissima qualità per prenderti cura al meglio del tuo amico a 4 zampe
        </p>
      </div>
      {/* Sezione Food */}
      {foodProducts.length > 0 && (
        <ProductsSlider
          title="Il tuo cane merita di mangiare da re"
          products={foodProducts}
        />
      )}
      {/* Sezione Accessories  */}
      {accessoryProducts.length > 0 && (
        <ProductsSlider
          title="Giochi, collari, cucce, tutto, ma proprio tutto ciò che serve per il tuo cane"
          products={accessoryProducts}
        />
      )}
    </div>
  );
}
