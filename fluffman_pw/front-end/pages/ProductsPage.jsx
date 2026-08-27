import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardItem from "../components/CardComponent/CardItem";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEuroSign } from "@fortawesome/free-solid-svg-icons";
import "../styles/ProductPages.css";

// Hook per rilevare larghezza finestra
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export default function ProductsPage() {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState(
    location.state?.researchValue || ""
  );
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const width = useWindowWidth();
  const isMobile = width <= 768;

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loading]);

  const [filters, setFilters] = useState({
    animal_id: searchParams.get("animal_id") || "all",
    brand_id: searchParams.get("brand_id") || "",
    sort_by: searchParams.get("sort_by") || "id",
    sort_order: searchParams.get("sort_order") || "ASC",
    discount: searchParams.get("discount") || "",
    price_range: searchParams.get("price_range") || "",
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams.toString());
    if (!value) newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams, { replace: true });
  };

  const resetFilters = () => {
    const defaultFilters = {
      animal_id: "all",
      brand_id: "",
      sort_by: "id",
      sort_order: "ASC",
      discount: "",
      price_range: "",
    };
    setFilters(defaultFilters);
    setSearchValue("");
    const newParams = new URLSearchParams();
    setSearchParams(newParams, { replace: true });
  };

  const handleChange = (value) => {
    setSearchValue(value);

    if (!value.trim()) {
      setFilteredProducts(allProducts);
    } else {
      const filteredProducts = allProducts.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filteredProducts);
    }
  };

  // Funzione per scrollare la pagina in alto
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Resetta la paginazione e scrolla in alto quando i prodotti filtrati cambiano
  useEffect(() => {
    setCurrentPage(1);
    scrollToTop();
  }, [filteredProducts]);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (filters.animal_id !== "all")
      query.append("animal_id", filters.animal_id);
    if (filters.brand_id) query.append("brand_id", filters.brand_id);
    if (filters.sort_by && filters.sort_by !== "id")
      query.append("sort_by", filters.sort_by);
    if (filters.sort_order) query.append("sort_order", filters.sort_order);
    if (filters.discount) query.append("discount", "1");
    if (filters.price_range) query.append("price_range", filters.price_range);

    fetch(`${import.meta.env.VITE_API_URL}/api/products/search?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel caricamento dei prodotti.");
        return res.json();
      })
      .then((data) => {
        setAllProducts(data);

        if (searchValue.trim()) {
          const filtered = data.filter((product) =>
            product.name.toLowerCase().includes(searchValue.toLowerCase())
          );
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(data);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error("Errore caricamento brand:", err));
  }, []);

  // Calcolo per la paginazione
  const lastProductIndex = currentPage * productsPerPage;
  const firstProductIndex = lastProductIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(
    firstProductIndex,
    lastProductIndex
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (showLoading) return <Loading />;
  if (error)
    return <div className="text-center mt-5 text-danger">Errore: {error}</div>;

  return (
    <div className="hp_bg">
      <div className="p-3">
        <div className="m-2 text-center mb-3">
          <h1 className="text-center">Il nostro listino prodotti</h1>
          <p className="text-light">
            Qui troverai la nostra ampia scelta di prodotti per i tuoi amici
            animali
          </p>
        </div>

        <div className="container my-4">
          {/* FILTRI E ORDINATORI */}
          <div className="filters-sorting-row flex-wrap">
            <div className="animal-select d-flex align-items-center flex-column justify-content-center">
              <label htmlFor="animal-select" className="text-muted text-sm">
                Seleziona il tipo di Animale
              </label>
              <select
                value={filters.animal_id}
                onChange={(e) => updateFilter("animal_id", e.target.value)}
                className={`select m-2 ${isMobile ? "btn-sm" : ""}`}
                id="animal-select"
              >
                <option value="all">Tutti i Prodotti</option>
                <option value="1">Cani</option>
                <option value="2">Gatti</option>
                <option value="3">Pesci</option>
                <option value="4">Roditori</option>
                <option value="5">Uccelli</option>
              </select>
            </div>
            <div className="brand-select d-flex align-items-center flex-column justify-content-center">
              <label htmlFor="brand-select" className="text-muted text-sm">
                Seleziona Brand
              </label>
              <select
                value={filters.brand_id}
                onChange={(e) => updateFilter("brand_id", e.target.value)}
                className={`select m-2 ${isMobile ? "btn-sm" : ""}`}
                id="brand-select"
              >
                <option value="">Tutti i Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sort-order d-flex align-items-center flex-column justify-content-center">
              <label htmlFor="sort-order" className="text-muted text-sm">
                Ordinamento
              </label>
              <select
                value={`${filters.sort_by}_${filters.sort_order}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split("_");
                  updateFilter("sort_by", by);
                  updateFilter("sort_order", order);
                }}
                className={`select m-2 ${isMobile ? "btn-sm" : ""}`}
              >
                <option value="id_ASC">Default</option>
                <option value="price_ASC">Prezzo crescente ↑</option>
                <option value="price_DESC">Prezzo decrescente ↓</option>
                <option value="name_ASC">Nome A-Z</option>
                <option value="name_DESC">Nome Z-A</option>
              </select>
            </div>
            <div className="price-range d-flex align-items-center flex-column justify-content-center">
              <label htmlFor="select-range" className="text-muted text-sm">
                Budget
              </label>
              <select
                value={filters.price_range}
                onChange={(e) => updateFilter("price_range", e.target.value)}
                className={`select m-2 ${isMobile ? "btn-sm" : ""}`}
                id="select-range"
              >
                <option value="">Tutti i prezzi</option>
                <option value="under10">Sotto i 10 €</option>
                <option value="10to20">Tra 10 e 20 €</option>
                <option value="20to40">Tra 20 e 40 €</option>
                <option value="over40">Sopra i 40 €</option>
              </select>
            </div>

            {/* barra di ricerca */}
            <div className="d-flex align-items-center flex-column justify-content-center ms-1">
              <label htmlFor="select-range" className="text-muted text-sm">
                Ricerca
              </label>
              <input
                value={searchValue}
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
                id="searchBar"
                type="text"
                className="search-bar"
              />
            </div>

            <div className="d-flex align-items-center flex-column justify-content-center ms-1 ">
              <label htmlFor="reset" className="text-muted text-xs">
                Reset Filtri
              </label>
              <button
                className={`reset ${isMobile ? "btn-sm" : ""}`}
                onClick={resetFilters}
              >
                X
              </button>
            </div>
          </div>

          {/* TOGGLE GRIGLIA/LISTA + SCONTI */}
          <label htmlFor="toggle-btns" className="text-muted text-sm">
            Visualizzazione
          </label>
          <div
            className="view-toggle mb-3 mt-2 d-flex align-items-center flex-wrap"
            style={{ gap: "0.5rem" }}
            id="toggle-btns"
          >
            <div className="toggles d-flex flex-wrap" style={{ gap: "0.2rem" }}>
              <button
                className={`btn btn-success ${isMobile ? "btn-sm" : ""}`}
                onClick={() => setViewMode("grid")}
                disabled={viewMode === "grid"} // disabilita se già attivo
              >
                <i className="fa-solid fa-image" style={{ color: "white" }}></i>
              </button>
              <button
                className={`btn btn-success ${isMobile ? "btn-sm" : ""}`}
                onClick={() => setViewMode("list")}
                disabled={viewMode === "list"} // disabilita se già attivo
              >
                <i className="fa-solid fa-list" style={{ color: "white" }}></i>
              </button>
            </div>

            <label
              className="m-2 d-flex align-items-center"
              style={{ gap: "6px" }}
            >
              <input
                type="checkbox"
                checked={filters.discount === "1"}
                onChange={(e) =>
                  updateFilter("discount", e.target.checked ? "1" : "")
                }
              />
              Solo Prodotti scontati
            </label>
          </div>

          {/* Numero di prodotti e paginazione */}
          {filteredProducts.length > 0 && (
            <div className="d-flex justify-content-between align-items-center flex-wrap my-4">
              <div className="text-light-emphasis">
                Trovati: {filteredProducts.length} prodotti
              </div>
            </div>
          )}

          {/* PRODOTTI */}
          <div className="products-wrapper mb-4">
            {/* Carico il Loading durante il fetch dei products */}
            {showLoading && <Loading />}
            {/* rimosso il cat_meme durante il rendering iniziale dei prodotti */}
            {!loading && filteredProducts.length === 0 ? (
              <div className="d-flex justify-content-center flex-column align-items-center">
                <img className="cat_meme" src="/sad_cat.png" alt="Sad cat" />
                <div className="text-center mt-5 text-light-emphasis">
                  <strong>
                    Nessun prodotto trovato con i criteri selezionati! Ci
                    dispiace!
                  </strong>
                </div>
              </div>
            ) : viewMode === "list" ? (
              <ul className="list-group">
                {currentProducts.map((product) => (
                  <li
                    key={product.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    onClick={() => navigate(`/products/${product.slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="flex-shrink-1">
                      <strong>{product.name}</strong> <br />
                      <small className="text-muted">
                        {brands.find((b) => b.id === product.brand_id)?.name ||
                          "Senza brand"}
                      </small>
                    </div>
                    {product.discount_price ? (
                      <div className="price-container d-flex align-items-center flex-shrink-0">
                        <span className="text-decoration-line-through text-muted me-2 fs-7 fs-md-5">
                          <FontAwesomeIcon icon={faEuroSign} />
                          {product.price}
                        </span>
                        <span className="text-danger fw-bold fs-7 fs-md-5">
                          <FontAwesomeIcon icon={faEuroSign} />
                          {product.discount_price}
                        </span>
                      </div>
                    ) : (
                      <span className="price text-dark fw-bold fs-7 fs-md-5 flex-shrink-0">
                        <FontAwesomeIcon icon={faEuroSign} />
                        {product.price}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {currentProducts.map((product) => (
                  <div key={product.id} className="col">
                    <CardItem product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controlli di paginazione inferiori */}
          {filteredProducts.length > 0 && (
            <div className="pagination-controls d-flex justify-content-center align-items-center pt-4 pb-2">
              <button
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  scrollToTop();
                }}
                disabled={currentPage === 1}
                className="btn me-2 text-white btn-success"
              >
                Pagina precedente
              </button>
              <span className="text-light">
                Pagina {currentPage} di {totalPages}
              </span>
              <button
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  scrollToTop();
                }}
                disabled={currentPage === totalPages}
                className="btn ms-2 text-white btn-success"
              >
                Pagina successiva
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}