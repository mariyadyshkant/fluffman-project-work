import CardProductDetail from "../components/CardComponent/CardProductDetails";
import "../styles/SingleProductPage.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      toggleWishlist(product.id);
    }
  };

  // Funzione per aggiungere il prodotto al carrello tramite context
  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
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
      <div className="container p-2">
        <div className="text-center">
          <h1 className="p-2">{product?.name || "Dettagli sul prodotto"}</h1>
        </div>

        <div className="row align-items-start g-4">
          <div className="col-md-6">
            <CardProductDetail
              product={product}
              brand={{ name: product.brand_name }}
              imagePath={product.image_path}
            />
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-around">
            <div className="p-3 border rounded h-100 bg-light">
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
              <TagsComponent product={product} />

              {/* Messaggio di scorte limitate, visibile solo se la quantità è bassa */}
              {isLowOnStock && (
                <div className="mt-3 text-danger fw-bold">
                  Affrettati! Rimangono solo {product.quantity} pezzi!
                </div>
              )}
            </div>

            <div className="quantity-container d-flex align-items-center justify-content-center mt-4">
              <p className="me-3 mb-0 text-black">Quantità:</p>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  style={{ backgroundColor: 'var(--accent)', width: '70px', height: '40px', borderRadius: '40%' }}>
                  -
                </button>
                <input
                  type="text"
                  className="form-control text-center mx-2"
                  style={{ width: "60px" }}
                  defaultValue={quantity} />
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= product.quantity}
                  style={{ backgroundColor: 'var(--accent)', width: '70px', height: '40px', borderRadius: '40%' }}
                >
                  +
                </button>
              </div>
            </div>
            <div className="button-container d-flex justify-content-center">
              <button
                className="star-btn mt-3 w-50 p-2"
                type="button"
                onClick={handleAddToWishlist}
              >
                {wishlist.some(item => item.id === product.id)
                  ? 'Rimuovi dalla Wishlist'
                  : 'Aggiungi alla Wishlist'}
                <i className="fa-solid fa-star btn-star text-light"></i>
              </button>
            </div>
            <div className="button-container d-flex justify-content-center">
              <button
                className="cart-btn mt-3 w-50 p-2"
                type="button"
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
              >
                {product.quantity === 0 ? "Non disponibile" : `Aggiungi al Carrello (${quantity})`}
                <i className="fa-solid fa-cart-shopping btn-cart"></i>
              </button>
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