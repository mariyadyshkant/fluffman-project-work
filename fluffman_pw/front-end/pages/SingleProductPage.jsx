import "../styles/SingleProductPage.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import TagsComponent from "../components/TagsComponent";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import RelatedProducts from "../components/RelatedProducts";

function SingleProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  // Wishlist gestita tramite context
  const { wishlist, toggleWishlist } = useWishlist();

  // Stato per la quantità selezionata dall'utente, inizializzato a 1.
  const [quantity, setQuantity] = useState(1);

  // Usa CartContext per il carrello
  const { addToCart } = useCart();

  // Stato per il toast di conferma aggiunta al carrello
  const [showCartToast, setShowCartToast] = useState(false);

  // Stato per il toast della wishlist
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistToastMessage, setWishlistToastMessage] = useState("");
  const [wishlistToastClass, setWishlistToastClass] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Prodotto non trovato.");
        }
        return res.json();
      })
      .then((productData) => {
        if (!productData) {
          throw new Error("Dati del prodotto non disponibili.");
        }
        setProduct(productData);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [slug]);



  // Funzione per incrementare la quantità, con un limite massimo
  const handleIncreaseQuantity = () => {
    if (product?.quantity && quantity < product.quantity) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  // Funzione per decrementare la quantità, con un minimo di 1
  const handleDecreaseQuantity = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };

  // Funzione per gestire l'input manuale nel campo di testo
  // const handleQuantityChange = (e) => {
  //   const value = parseInt(e.target.value, 10);
  //   if (!isNaN(value) && value >= 1) {
  //     if (product?.quantity) {
  //       setQuantity(Math.min(value, product.quantity));
  //     } else {
  //       setQuantity(value);
  //     }
  //   } else if (e.target.value === "") {
  //     setQuantity("");
  //   }
  // };

  // Funzione per aggiungere o rimuovere un prodotto dai preferiti tramite context
  const handleAddToWishlist = () => {
    if (product) {
      const wasFavorite = wishlist.some((item) => item.id === product.id);
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
      }, 4000);
    }
  };

  // Funzione per aggiungere il prodotto al carrello tramite context
  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      setShowCartToast(true);
      setTimeout(() => {
        setShowCartToast(false);
      }, 4000);
    }
  };

  if (error) {
    return <div className="text-center mt-5 text-danger">Errore: {error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-5">Caricamento...</div>;
  }

  // Controlla se la quantità del prodotto è bassa (tra 1 e 49)
  const isLowOnStock = product.quantity && product.quantity > 0 && product.quantity < 50;

  return (
    <div className="bg">
      {/* Contenitore dei toast: li impila in verticale così non si sovrappongono mai */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x mt-3 d-flex flex-column align-items-center gap-2"
        style={{ zIndex: 1050 }}
      >
        {showCartToast && (
          <div className="alert alert-success py-2 px-3 shadow mb-0" role="alert">
            <p className="mb-0">
              {quantity}x {product.name} aggiunto al carrello con successo!
            </p>
          </div>
        )}

        {showWishlistToast && (
          <div className={`alert ${wishlistToastClass} py-2 px-3 shadow mb-0`} role="alert">
            <p className="mb-0">{wishlistToastMessage}</p>
          </div>
        )}
      </div>
      <div className="container p-2">
        <div className="text-center">
          <h1 className="p-2">{product?.name || "Dettagli sul prodotto"}</h1>
        </div>

        <div className="single-product-card shadow-sm p-4 position-relative">
          <button
            className="wishlist-icon-btn"
            type="button"
            onClick={handleAddToWishlist}
            title={
              wishlist.some((item) => item.id === product.id)
                ? "Rimuovi dalla Wishlist"
                : "Aggiungi alla Wishlist"
            }
          >
            <i
              className={`fa-star ${wishlist.some((item) => item.id === product.id)
                ? "fa-solid text-warning"
                : "fa-regular text-secondary"
                }`}
            ></i>
          </button>
          <div className="row g-4">
            <div className="col-md-6">
              <img
                src={
                  product.image_path
                    ? `${import.meta.env.VITE_API_URL}/api/images/${product.image_path}`
                    : "/images/default.jpg"
                }
                className="img-fluid rounded"
                alt={product.name}
              />
              <TagsComponent product={product} />
              <p className="single-product-brand fw-bold mt-2 mb-0">
                <FontAwesomeIcon icon={faTag} className="me-2" />
                {product.brand_name}
              </p>
            </div>

            <div className="col-md-6 d-flex flex-column">
              <div>
                <b>
                  <p className="mt-3 mb-0 text-dark fs-5">Descrizione Prodotto</p>
                </b>
                <p className="text-dark ">{product?.description}</p>
                <b>
                  <p className="mt-3 mb-0 text-dark fs-5">
                    Informazioni Aggiuntive
                  </p>
                </b>
                <p className="text-dark ">{product?.additional_information}</p>

                {/* Messaggio di scorte limitate, visibile solo se la quantità è bassa */}
                {isLowOnStock && (
                  <div className="mt-3 text-danger fw-bold">
                    Affrettati! Rimangono solo {product.quantity} pezzi!
                  </div>
                )}
              </div>

              {/* Riquadro a parte con prezzo, quantità e bottone carrello */}
              <div className="purchase-panel d-flex flex-column mt-4">
                <div className="price-block d-flex justify-content-center align-items-center">
                  {product.discount_price ? (
                    <div className="price-container d-flex align-items-center">
                      <span className="text-decoration-line-through text-muted me-2">
                        € {product.price}
                      </span>
                      <span className="text-danger fw-bold fs-3">
                        € {product.discount_price}
                      </span>
                    </div>
                  ) : (
                    <span className="price text-dark fw-bold fs-3">
                      € {product.price}
                    </span>
                  )}
                </div>

                <div className="quantity-container d-flex flex-column align-items-center mt-2">
                  <p className="mb-2 text-black">Quantità</p>
                  <div className="d-flex align-items-center">
                    <button
                      className="qty-btn"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="form-control text-center mx-3"
                      style={{ width: "50px" }}
                      value={quantity}
                      readOnly />
                    <button
                      className="qty-btn"
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= product.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="button-container d-flex justify-content-center">
                  <button
                    className="cart-btn mt-2 w-50 p-2"
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? "Non disponibile" : "Aggiungi al Carrello"}  <i className="fa-solid fa-cart-shopping btn-cart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container m-2 p-2">
          <RelatedProducts productId={product.id} />
        </div>
      </div>
    </div>
  );
}

export default SingleProductPage;