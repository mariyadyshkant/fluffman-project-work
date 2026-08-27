import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Link, NavLink } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  let navigate = useNavigate();

  // Calcola solo gli item con id valido (evita badge errato se ci sono oggetti vuoti)
  const wishlistCount = Array.isArray(wishlist)
    ? wishlist.filter((item) => item && item.id != null).length
    : 0;
  const cartCount = Array.isArray(cart)
    ? cart.filter((item) => item && item.id != null).length
    : 0;

  // Valore inserito nella searchbar
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Richiesta all'api per i prodotti
  const fetchData = (value) => {
    if (value.trim() == "") {
      setSearchResults([]);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/products/search`)
      // Logica di gestione degli errori
      .then((res) => {
        if (!res.ok) {
          throw new Error("Errore nel caricamento dei prodotti.");
        }
        return res.json();
      })

      // Filtro per il valore inserito dall'utente
      .then((data) => {
        const results = data.filter((product) => {
          return product.name.toLowerCase().includes(value);
        });

        setSearchResults(results);
      });
  };

  const handleChange = (value) => {
    setSearchValue(value);
    fetchData(value);
  };

  const handleOffCanvasCLick = () => {
    const closeButton = document.getElementById("search-bar-close-btn");

    if (closeButton) {
      closeButton.click();
    }
  };

  // rimanda alla productsPage con i valori per la ricerca inseriti nella barra dall'utente
  const searchProduct = (searchValue) => {

    if (searchValue.length > 0) {
      handleOffCanvasCLick();
      navigate('/products', {
        state: { researchValue: searchValue }
      });
    }
  };

  //handlekeydown per utilizzo tasti esc e invio
  const handleKeyDown = (e) => {
    // Se il tasto premuto è 'Enter'
    if (e.key === "Enter") {
      searchProduct(searchValue); // Lancia la funzione di ricerca
    }
    // Se il tasto premuto è 'Escape'
    if (e.key === "Escape") {
      handleOffCanvasCLick(); // Chiude l'offcanvas
    }
  };

  const handleMenuOffCanvasClick = () => {
    // Trova il pulsante di chiusura del menu offcanvas
    const closeButton = document.querySelector(
      '#offcanvasScrolling .btn-close'
    );

    // Se il pulsante esiste, lo schiaccia in automatico
    if (closeButton) {
      closeButton.click();
    }
  };

  return (
    <header className="position-sticky top-0 w-100">
      {/* Sezione spedizione gratuita */}
      <div className="upper-header d-flex justify-content-center align-items-center">
        <p className="m-0 p-1 text-light">
          Spedizione gratuita a partire da €19,99{" "}
          <i className="fa-solid fa-truck-fast ps-2 text-light"></i>
        </p>
      </div>

      {/* Header navbar */}
      <nav className="w-100 px-5 py-3 d-flex justify-content-between align-items-center bg-body-tertiary">
        {/* Loghi */}
        <div>
          {/* Pagina estesa */}
          <Link to="/">
            <img
              src="/Logo3.png"
              className="header-logo-fromLg d-none d-lg-block"
            />
          </Link>

          {/* Pagina ridotta */}
          <Link to="/">
            <img
              src="/Logo1.png"
              className="header-logo-belowLg d-block d-lg-none"
            />
          </Link>
        </div>

        {/* Voci menù */}
        <ul className="d-none d-lg-flex list-unstyled m-0 gap-4 align-items-center nav-list-desktop">
          <li>
            <NavLink to="/products" style={{ textDecoration: "none" }}>
              <p className="m-0">Prodotti</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dogproducts" style={{ textDecoration: "none" }}>
              <p className="m-0">Cane</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/catproducts" style={{ textDecoration: "none" }}>
              <p className="m-0">Gatto</p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/otheranimalproducts"
              style={{ textDecoration: "none" }}
            >
              <p className="m-0">Altri animali</p>
            </NavLink>
          </li>
          <li>
            <button
              className="p-0"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasTop"
              aria-controls="offcanvasTop"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </li>
          <li>
            <NavLink to="/Wishlist">
              <div className="position-relative">
                <i className="fa-solid fa-star m-0"></i>
                {wishlistCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </div>
            </NavLink>
          </li>
          <li>
            <NavLink to={"/cart"}>
              <div className="position-relative">
                <i className="fa-solid fa-cart-shopping m-0"></i>
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            </NavLink>
          </li>
        </ul>

        {/* Offcanvas ricerca */}
        <div
          className="offcanvas offcanvas-top py-4"
          tabIndex="-1"
          id="offcanvasTop"
          aria-labelledby="offcanvasTopLabel"
        >
          <div className="offcanvas-header px-5">
            <button
              type="button"
              className="btn-close "
              data-bs-dismiss="offcanvas"
              aria-label="Close"
              id="search-bar-close-btn"
            ></button>
          </div>

          {/* Sezione ricerca */}
          <div className="gap-3 d-flex justify-content-center align-items-center flex-column">
            <label htmlFor="searchBar">
              <h1 className="p-2 search-title">Ricerca prodotti</h1>
            </label>

            {/* Barra di ricerca */}
            <div className="header-search-bar d-flex justify-content-between align-items-center">
              <input
                value={searchValue}
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
                onKeyUp={handleKeyDown}
                id="searchBar"
                type="text"
                className="input-bar"
              />

              <button className="form-button" onClick={() => searchProduct(searchValue)}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* Risultati ricerca */}
          <div className="py-3 row list-unstyled">
            {searchResults.map((result) => {
              return (
                <li key={result.id} className="bg-white px-5 py-3 col-12">
                  <Link
                    onClick={handleOffCanvasCLick}
                    style={{ textDecoration: "none" }}
                    to={`/products/${result.slug}`}
                  >
                    <div className="py-4 d-flex d-sm-none justify-content-between align-items-center container container-sm search-card">
                      <h5 className="m-0">{result.name}</h5>
                      <h5 className="ms-5 mb-0">€{result.price}</h5>
                    </div>

                    <div className="py-4 w-75 d-none d-sm-flex justify-content-between align-items-center container container-sm search-card">
                      <h5 className="m-0">{result.name}</h5>
                      <h5 className="ms-5 mb-0">€{result.price}</h5>
                    </div>
                  </Link>
                </li>
              );
            })}
          </div>
        </div>

        {/* Elementi nav tablet-mobile */}
        <div className="d-lg-none d-flex jsutify-content-center align-items-center gap-3">
          {/* Bottone ricerca (mobile - tablet) */}
          <button
            className="d-block d-lg-none offcanvas-btn"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasTop"
            aria-controls="offcanvasTop"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          {/* Offcanvas con relativi tipi di bottoni: uno tablet e uno mobile */}
          <button
            className="offcanvas-btn d-none d-sm-block d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasScrolling"
            aria-controls="offcanvasScrolling"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <button
            className="offcanvas-btn d-block d-sm-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasScrolling"
            aria-controls="offcanvasScrolling"
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>

          <div
            className="offcanvas offcanvas-start"
            data-bs-scroll="true"
            data-bs-backdrop="false"
            tabIndex="-1"
            id="offcanvasScrolling"
            aria-labelledby="offcanvasScrollingLabel"
          >
            <div className="offcanvas-header">
              <Link to="/">
                <img
                  src="DogFaceLogo.png"
                  className="header-logo-belowLg d-block d-lg-none"
                  id="offcanvasScrollingLabel"
                />
              </Link>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            {/* Voci menù */}
            <div className="offcanvas-body px-4 bg-light">
              <ul className="list-unstyled m-0">
                <NavLink to="/products" style={{ textDecoration: "none" }} onClick={handleMenuOffCanvasClick}>
                  <li className="py-3 d-flex justify-content-center align-items-center offcanvas-item">
                    <p className="m-0">Prodotti</p>
                  </li>
                </NavLink>

                <NavLink to="/dogproducts" style={{ textDecoration: "none" }} onClick={handleMenuOffCanvasClick}>
                  <li className="py-3 d-flex justify-content-center align-items-center offcanvas-item">
                    <p className="m-0">Cane</p>
                  </li>
                </NavLink>

                <NavLink to="/catproducts" style={{ textDecoration: "none" }} onClick={handleMenuOffCanvasClick}>

                  <li className="py-3 d-flex justify-content-center align-items-center offcanvas-item">
                    <p className="m-0">Gatto</p>
                  </li>
                </NavLink>

                <NavLink to="/otheranimalproducts" style={{ textDecoration: "none" }} onClick={handleMenuOffCanvasClick}>

                  <li className="py-3 d-flex justify-content-center align-items-center offcanvas-item">
                    <p className="m-0">Altri animali</p>
                  </li>
                </NavLink>

                <NavLink to="/wishlist" style={{ textDecoration: "none" }} onClick={handleMenuOffCanvasClick}>
                  <li className="py-3 d-flex justify-content-center align-items-center offcanvas-item">
                    <p className="m-0">Wishlist</p>
                  </li>
                </NavLink>

                <NavLink to="/cart" style={{ textDecoration: "none" }} onClick={handleMenuOffCanvasClick}>
                  <li className="py-3 d-flex justify-content-center align-items-center offcanvas-item">
                    <i className="fa-solid fa-cart-shopping m-0"></i>
                  </li>
                </NavLink>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
