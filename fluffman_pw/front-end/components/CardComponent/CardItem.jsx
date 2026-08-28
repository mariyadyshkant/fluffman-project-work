import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEuroSign } from "@fortawesome/free-solid-svg-icons";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

export default function CardItem({ product }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { cart, addToCart, removeFromCart } = useCart();

  const isFavorite = wishlist.some((item) => item.id === product.id);

  const cartItem = cart.find((item) => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  // Stato per il toast del carrello
  const [showCartToast, setShowCartToast] = useState(false);
  // Stato per il toast della wishlist
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistToastMessage, setWishlistToastMessage] = useState("");
  // Stato per la classe del toast della wishlist
  const [wishlistToastClass, setWishlistToastClass] = useState("");
  // Stato per il toast di rimozione dal carrello
  const [showRemoveToast, setShowRemoveToast] = useState(false);
  // Nuovo stato per il toast di esaurimento scorte
  const [showStockToast, setShowStockToast] = useState(false);

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const BASE_URL = import.meta.env.VITE_API_URL;

  let imageUrl = null;
  if (product?.image_path) {
    let cleanPath = product.image_path.trim();
    const baseUrlPattern = `${BASE_URL}/api/images/`;
    if (cleanPath.includes(baseUrlPattern)) {
      const lastIndex = cleanPath.lastIndexOf(baseUrlPattern);
      if (lastIndex > 0) {
        cleanPath = cleanPath.substring(lastIndex);
      }
    }
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      imageUrl = cleanPath;
    } else if (cleanPath.startsWith("/api/images/")) {
      imageUrl = `${BASE_URL}${cleanPath}`;
    } else {
      imageUrl = `${BASE_URL}/api/images/${cleanPath}`;
    }
  }

  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextElementSibling?.classList.remove("d-none");
  };

  // Funzione per aggiungere un prodotto al carrello
  const handleAddToCart = () => {
    // Controlla se la quantità attuale nel carrello è inferiore alla quantità disponibile
    if (currentQuantity < product.quantity) {
      addToCart(product.id, 1);
      setShowCartToast(true);
      setTimeout(() => {
        setShowCartToast(false);
      }, 3000);
    } else {
      // Se la quantità massima è stata raggiunta, mostra un toast di avviso
      setShowStockToast(true);
      setTimeout(() => {
        setShowStockToast(false);
      }, 3000);
    }
  };

  // Funzione per diminuire la quantità del prodotto
  const handleDecreaseQuantity = () => {
    if (currentQuantity > 1) {
      addToCart(product.id, -1);
    } else {
      removeFromCart(product.id);
    }
    setShowRemoveToast(true);
    setTimeout(() => {
      setShowRemoveToast(false);
    }, 3000);
  };

  // Funzione per gestire la rimozione totale dal carrello
  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
    setShowRemoveToast(true);
    setTimeout(() => {
      setShowRemoveToast(false);
    }, 3000);
  };

  // Funzione per gestire il toast della wishlist e la classe dinamica
  const handleToggleWishlist = () => {
    const wasFavorite = isFavorite;
    toggleWishlist(product.id);
    if (wasFavorite) {
      setWishlistToastMessage("Rimosso dai preferiti!");
      setWishlistToastClass("alert-danger");
    } else {
      setWishlistToastMessage("Aggiunto ai preferiti!");
      setWishlistToastClass("alert-success");
    }
    setShowWishlistToast(true);
    setTimeout(() => {
      setShowWishlistToast(false);
    }, 3000);
  };

  return (
    <div className="card product_card text-center h-100 position-relative">
      {/* Toast di conferma per il carrello */}
      {showCartToast && (
        <div
          className="position-absolute top-0 start-50 translate-middle-x mt-2 alert alert-success py-2 px-3"
          role="alert"
          style={{ zIndex: 1050 }}
        >
          <p className="mb-0">Aggiunto al carrello!</p>
        </div>
      )}

      {/* Toast di conferma per la wishlist */}
      {showWishlistToast && (
        <div
          className={`position-absolute top-0 start-50 translate-middle-x mt-2 alert ${wishlistToastClass} py-2 px-3`}
          role="alert"
          style={{ zIndex: 1050 }}
        >
          <p className="mb-0">{wishlistToastMessage}</p>
        </div>
      )}

      {/* Toast per la rimozione dal carrello */}
      {showRemoveToast && (
        <div
          className="position-absolute top-0 start-50 translate-middle-x mt-2 alert alert-danger py-2 px-3"
          role="alert"
          style={{ zIndex: 1050 }}
        >
          <p className="mb-0">Articolo rimosso dal carrello!</p>
        </div>
      )}

      {/* Nuovo toast per esaurimento scorte */}
      {showStockToast && (
        <div
          className="position-absolute top-0 start-50 translate-middle-x mt-2 alert alert-warning py-2 px-3"
          role="alert"
          style={{ zIndex: 1050 }}
        >
          <p className="mb-0">Limite massimo di pezzi raggiunto!</p>
        </div>
      )}

      <div className="card-top mx-auto my-3 card-image-container">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              className="card-img-top img-fluid w-75"
              alt={product?.name || "Immagine prodotto"}
              onClick={handleCardClick}
              onError={handleImageError}
              style={{ cursor: "pointer" }}
            />
            <div className="placeholder-image d-none">
              <div className="text-muted p-3">
                <i className="bi bi-image fs-1"></i>
                <p className="mt-2">Immagine non disponibile</p>
              </div>
            </div>
          </>
        ) : (
          <div className="placeholder-image">
            <div className="text-muted p-3">
              <i className="bi bi-image fs-1"></i>
              <p className="mt-2">Nessuna immagine</p>
            </div>
          </div>
        )}
      </div>

      <div className="card-body">
        <h5
          className="card-title product_name"
          onClick={handleCardClick}
          style={{ cursor: "pointer" }}
        >
          {product?.name}
        </h5>

        <div className="card-bottom d-flex flex-column align-items-center">
          {product.discount_price ? (
            <>
              <div className="price-container mb-2">
                <span className="text-decoration-line-through text-muted me-1">
                  <FontAwesomeIcon icon={faEuroSign} />
                  {product.price}
                </span>
                <span className="text-danger fw-bold fs-5">
                  <FontAwesomeIcon icon={faEuroSign} />
                  {product.discount_price}
                </span>
              </div>
            </>
          ) : (
            <span className="price text-dark fw-bold fs-5 mb-2">
              <FontAwesomeIcon icon={faEuroSign} />
              {product.price}
            </span>
          )}

          <div className="card-buttons d-flex align-items-start w-100 justify-content-center">
            <button
              className="p-0"
              onClick={handleToggleWishlist}
              title={
                isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
              }
            >
              <i
                className={`bi fs-4 me-3 ${isFavorite ? "bi-star-fill text-warning" : "bi-star"
                  }`}
              ></i>
            </button>

            {currentQuantity > 0 ? (
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleDecreaseQuantity}
                >
                  -
                </button>
                <span className="mx-2">{currentQuantity}</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleAddToCart}
                  // Disabilita il pulsante se la quantità massima è stata raggiunta
                  disabled={currentQuantity >= product.quantity}
                >
                  +
                </button>
                <button
                  className="p-0 ms-2 text-danger"
                  onClick={handleRemoveFromCart}
                  title="Rimuovi dal carrello"
                >
                  <i className="bi bi-trash-fill fs-5"></i>
                </button>
              </div>
            ) : (
              // Se il prodotto non è nel carrello
              <button
                className="btn btn-success btn-sm"
                onClick={handleAddToCart}
                title="Aggiungi al carrello"
                // Disabilita il pulsante se il prodotto è esaurito
                disabled={product.quantity === 0}
              >
                {product.quantity === 0 ? "Esaurito" : "Aggiungi al Carrello"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
