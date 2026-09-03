import { useState, useEffect } from "react";
import CardItem from "./CardComponent/CardItem";
import { useWishlist } from "../context/WishlistContext";
// import { useCart } from "../context/CartContext";
import "../styles/ProductsSlider.css";

export default function ProductsSlider({ title, products }) {
  const { wishlist, toggleWishlist } = useWishlist();
  // const { cart } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let cardsPerPage = 4;
  const isTablet = windowWidth >= 768 && windowWidth < 992;
  const isMobile = windowWidth < 768;

  if (isTablet) cardsPerPage = 2;

  const totalGroups = Math.ceil(products.length / cardsPerPage);

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % totalGroups);
  }

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + totalGroups) % totalGroups);
  }

  const start = currentIndex * cardsPerPage;
  const visibleProducts = products.slice(start, start + cardsPerPage);

  return (

    <div className="container">

      <div className="product-slider-section p-2 ">
        <h2 className="p-2 text-center">{title}</h2>

        {!isMobile ? (
          <div className="position-relative">
            <div className="arrow_left_slider" onClick={handlePrev}></div>
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
                  />
                </div>
              ))}
            </div>
            <div className="arrow_right_slider" onClick={handleNext}></div>
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
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>

  );
}