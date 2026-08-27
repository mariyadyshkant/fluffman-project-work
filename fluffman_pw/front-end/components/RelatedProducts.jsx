import CardItem from "./CardComponent/CardItem";
import { useState, useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "../styles/SuggestedProducts.css";
import "../styles/Arrows.css";

// Il tuo componente RelatedProducts ora accetta l'ID del prodotto principale come prop.
export default function RelatedProducts({ productId }) {
    const { wishlist, toggleWishlist } = useWishlist();
    const { cart, addToCart, removeFromCart } = useCart();

    // Stato per i prodotti correlati
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Funzione per l'aggiunta/rimozione dal carrello
    const onToggleAddToCart = (itemId) => {
        const existingProduct = cart.find(item => item?.id === itemId);
        if (existingProduct) {
            removeFromCart(itemId);
        } else {
            addToCart(itemId, 1);
        }
    }

    // Aggiunto per gestire gli ID dei prodotti nel carrello
    const isInCart = (productId) => cart.some(item => item?.id === productId);

    useEffect(() => {
        if (!productId) {
            setIsLoading(false);
            return;
        }

        async function fetchRelatedProducts() {
            try {
                setIsLoading(true);

                // 1. Esegui la fetch
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/related`);

                // 2. Controlla se la risposta HTTP è OK (Status 200-299)
                if (!res.ok) {
                    // Se la risposta non è OK, logga l'errore e non procedere
                    const errorBody = await res.json();
                    console.error("Errore HTTP nel fetch prodotti correlati:", res.status, errorBody);
                    setProducts([]); // Imposta un array vuoto
                    return;
                }

                // 3. Parsa la risposta JSON
                const relatedProductsData = await res.json();

                // 4. VERIFICA CHIAVE: Assicurati che 'relatedProductsData' sia effettivamente un array
                if (!Array.isArray(relatedProductsData)) {
                    console.error("La risposta non è un array:", relatedProductsData);
                    setProducts([]); // Imposta un array vuoto per evitare l'errore .map
                    return;
                }

                // 5. Se è un array, mappa correttamente
                const productsWithFullImage = relatedProductsData.map(p => ({
                    ...p,
                    // Utilizza il percorso immagine dal backend per costruire l'URL completo
                    image: `${import.meta.env.VITE_API_URL}/products_image/${p.image_path}`
                }));

                setProducts(productsWithFullImage);
            } catch (err) {
                console.error("Errore fetch dei prodotti correlati:", err);
                setProducts([]); // Assicura che lo stato sia un array in caso di errore di rete
            } finally {
                setIsLoading(false);
            }
        }

        fetchRelatedProducts();
    }, [productId]);

    // Logica per il ridimensionamento della finestra
    useEffect(() => {
        function handleSize() {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener("resize", handleSize);
        return () => window.removeEventListener("resize", handleSize);
    }, []);

    // Logica di rendering per lo slider (card per pagina)
    let cardsPerPage = 4;
    const isTablet = windowWidth >= 768 && windowWidth < 992;
    const isMobile = windowWidth < 768;
    if (isTablet) cardsPerPage = 2;
    if (isMobile) cardsPerPage = 1; // Unico prodotto per mobile per coerenza

    // Calcola il numero totale di gruppi (pagine)
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

    // Non mostrare il componente se non ci sono prodotti correlati
    if (products.length === 0) {
        return null;
    }

    return (
        <>
            <div className="section_container">
                <h2 className="my-4 text-center">Prodotti Correlati</h2>

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
                                        isInCart={isInCart(product.id)}
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
                                    isInCart={isInCart(product.id)}
                                    onToggleAddToCart={onToggleAddToCart}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}