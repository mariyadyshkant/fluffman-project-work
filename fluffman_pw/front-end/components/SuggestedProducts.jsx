import CardItem from "./CardComponent/CardItem";
import { useState, useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "../styles/SuggestedProducts.css";
import "../styles/Arrows.css";

export default function SuggestedProducts() {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(true);
  // Wishlist gestita tramite context
  const { wishlist, toggleWishlist } = useWishlist();
  // Stato del carrello aggiornato per gestire gli oggetti { id, quantity }
  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const resProd = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products?t=${Date.now()}`
        );
        const productsData = await resProd.json();

        const resImg = await fetch(
          `${import.meta.env.VITE_API_URL}/api/images?t=${Date.now()}`
        );
        const imagesData = await resImg.json();

        const mergedProducts = productsData.map((p) => {
          const img = imagesData.find((i) => i.product_id === p.id);
          const imageUrl = img
            ? `${import.meta.env.VITE_API_URL}/products_image/${img.name}`
            : "/images/default.jpg";
          return {
            ...p,
            image: imageUrl,
            image_path: img?.name || null
          };
        });

        const shuffledProducts = mergedProducts.sort(() => 0.5 - Math.random());
        const finalProducts = shuffledProducts.slice(0, 16);

        setProducts(finalProducts);
      } catch (err) {
        console.error("Errore fetch:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    function handleSize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleSize);
    return () => window.removeEventListener("resize", handleSize);
  }, []);



  // Salva il carrello nel localStorage quando cambia
  // Funzione di aggiunta/rimozione tramite context
  const onToggleAddToCart = (productId) => {
    const existingProduct = cart.find(item => item?.id === productId);
    if (existingProduct) {
      removeFromCart(productId);
    } else {
      addToCart(productId, 1);
    }
  }





  let cardsPerPage = 4;
  const isTablet = windowWidth >= 768 && windowWidth < 992;
  const isMobile = windowWidth < 768;
  if (isTablet) cardsPerPage = 2;

  const totalGroups = Math.ceil(products.length / cardsPerPage);

  function handleNext() {
    setCurrentIndex((currentIndex + 1) % totalGroups);
  }

  function handlePrev() {
    setCurrentIndex((currentIndex - 1 + totalGroups) % totalGroups);
  }

  const start = currentIndex * cardsPerPage;
  const visibleProducts = products.slice(start, start + cardsPerPage);

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Caricamento in corso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section_container">
      <h2 className="my-4 text-center">I Consigli di Oggi</h2>

      {!isMobile ? (
        <div className="position-relative">
          <div className="arrow_left" onClick={handlePrev}></div>
          <div className="row justify-content-center g-3 px-2 mx-5">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className={`col-12 ${isTablet ? "col-md-6" : "col-md-3"}`}
              >
                <CardItem
                  product={product}
                  isFavorite={wishlist.some(item => item.id === product.id)}
                  onToggleFavorite={toggleWishlist}
                  isInCart={cart.some(item => item?.id === product.id)}
                  onToggleAddToCart={onToggleAddToCart}
                />
              </div>
            ))}
          </div>
          <div className="arrow_right" onClick={handleNext}></div>
        </div>
      ) : (
        <div className="d-flex overflow-auto gap-3 pb-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: "80%", maxWidth: "250px" }}
            >
              <CardItem
                product={product}
                isFavorite={wishlist.some(item => item.id === product.id)}
                onToggleFavorite={toggleWishlist}
                isInCart={cart.some(item => item.id === product.id)}
                onToggleAddToCart={onToggleAddToCart}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
