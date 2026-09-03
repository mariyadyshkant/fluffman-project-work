import { useState, useEffect } from "react";
import "../styles/CheckOutPage.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CardCheckout from "../components/CardCheckout";

// regex restrittiva (accetta solo .com .it .org .net .edu) - case insensitive
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.(com|it|org|net|edu)$/i;
// lista dei domini validi
export const VALID_DOMINIONS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "libero.it",
  "tiscali.it",
  "alice.it",
  "virgilio.it",
  "hotmail.it",
  "icloud.com",
  "protonmail.com",
  "mail.com",
  "zoho.com"
];
// regex per numero di telefono (solo cifre, 10 caratteri, senza spazi o trattini)
export const PHONE_PATTERN = /^\+39 \d{10}$/;

// Regex per nome e cognome (accetta lettere, spazi e caratteri accentati)
export const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

// URLs per i test e la produzione
const BASE_URL = import.meta.env.VITE_API_URL;
const SITE_BASE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const SELLER_EMAIL = "seller@example.com";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [cartProducts, setCartProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showDeliveryAddress, setShowDeliveryAddress] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  // Nuovi stati per la validazione di nome e cognome
  const [nameError, setNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    billing: {
      address: "",
      address2: "",
      zip: "",
      city: "",
      province: "",
      country: "",
    },
    delivery: {
      address: "",
      address2: "",
      zip: "",
      city: "",
      province: "",
      country: "",
    },
    payment: {
      cardNumber: "",
      expireDate: "",
      securityCode: "",
      cardOwner: "",
    },
  });

  const [missingFields, setMissingFields] = useState([]);
  const [showFieldErrors, setShowFieldErrors] = useState(false);

  // Fetch cart products
  useEffect(() => {
    async function fetchData() {
      if (cart.length === 0) {
        setCartProducts([]);
        setTotalPrice(0);
        return;
      }
      try {
        const productsResponse = await fetch(`${BASE_URL}/api/products`);
        const productsData = await productsResponse.json();

        const cartListData = cart
          .map((item) => {
            const product = productsData.find((p) => p?.id === item?.id);
            if (!product) return null;

            let imageUrl = null;
            if (product?.image_path) {
              let cleanPath = product.image_path.trim();
              const baseUrlPattern = "/api/images/";
              if (cleanPath.includes(baseUrlPattern)) {
                cleanPath = cleanPath.split(baseUrlPattern)[1];
              }
              imageUrl = `${BASE_URL}/api/images/${cleanPath}`;
            }

            return {
              ...product,
              image: imageUrl,
              currentQuantity: item.quantity,
              availableQuantity: product.quantity,
              price: parseFloat(product.price),
            };
          })
          .filter(Boolean);

        setCartProducts(cartListData);
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
      }
    }
    fetchData();
  }, [cart]);

  useEffect(() => {
    const subtotal = cartProducts.reduce(
      (sum, product) => sum + product.price * product.currentQuantity,
      0
    );
    const SHIPPING_THRESHOLD = 19.99;
    const SHIPPING_COST = 3.99;
    let shippingCost = 0;

    if (subtotal > 0 && subtotal < SHIPPING_THRESHOLD) {
      shippingCost = SHIPPING_COST;
    }
    const finalTotal = subtotal + shippingCost;
    setTotalPrice(finalTotal);
  }, [cartProducts]);

  // Funzione per formattare il numero di carta di credito con spazi ogni 4 cifre
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")          // elimina tutto ciò che non è numero
      .replace(/(.{4})/g, "$1 ")   // aggiunge uno spazio ogni 4 cifre
      .trim();
  };
  // Funzione per formattare la data di scadenza nel formato MM/AA
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, ""); // solo numeri
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleInputChange = (e, section) => {
    let { name, value } = e.target;

    // sezione "payment": applico i formati
    if (section === "payment") {
      if (name === "cardNumber") {
        value = formatCardNumber(value);
      }
      if (name === "expireDate") {
        value = formatExpiryDate(value);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleDirectInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validazione per nome
    if (name === "name") {
      const isValid = NAME_PATTERN.test(value.trim());
      setNameError(!isValid);
    }
    // Validazione per cognome
    if (name === "lastName") {
      const isValid = NAME_PATTERN.test(value.trim());
      setLastNameError(!isValid);
    }

    if (name === "email") {
      if (value.trim() === "") {
        setEmailError(true); // vuoto = errore
      } else {
        setEmailError(!EMAIL_PATTERN.test(value.trim()));
      }
    }

    if (name === "phone") {
      if (value.trim() === "") {
        setPhoneError(true); // vuoto = errore
      } else {
        setPhoneError(!PHONE_PATTERN.test(value.trim()));
      }
    }
  };

  const getMissingFields = () => {
    const { name, lastName, email, phone, billing } = formData;
    const fields = [];
    if (!name || nameError) fields.push("name");
    if (!lastName || lastNameError) fields.push("lastName");
    if (!email || emailError) fields.push("email");
    if (!phone || phoneError) fields.push("phone");
    if (!billing.address) fields.push("billing.address");
    if (!billing.zip) fields.push("billing.zip");
    if (!billing.city) fields.push("billing.city");
    if (!billing.province) fields.push("billing.province");
    if (!billing.country) fields.push("billing.country");

    if (showDeliveryAddress) {
      const { delivery } = formData;
      if (!delivery.address) fields.push("delivery.address");
      if (!delivery.zip) fields.push("delivery.zip");
      if (!delivery.city) fields.push("delivery.city");
      if (!delivery.province) fields.push("delivery.province");
      if (!delivery.country) fields.push("delivery.country");
    }
    return fields;
  };

  useEffect(() => {
    setMissingFields(getMissingFields());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, nameError, lastNameError]);



  const handleOrder = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // evita doppio invio se l'utente clicca più volte

    const missing = getMissingFields();
    setMissingFields(missing);

    if (missing.length > 0) {
      setShowFieldErrors(true);
      window.scrollTo({ behavior: "smooth", top: 0 });
      return;
    }
    setShowFieldErrors(false);

    const newErrors = {};

    const { cardNumber, expireDate, securityCode, cardOwner } = formData.payment;


    // Numero carta: 16 cifre con spazi
    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
      newErrors.cardNumber = "Il numero di carta non è valido";
    }

    // Data scadenza: formato MM/YY e mese valido
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expireDate)) {
      newErrors.expireDate = "La data di scadenza non è valida";
    }

    // CVV: 3 o 4 cifre
    if (!/^\d{3,4}$/.test(securityCode)) {
      newErrors.securityCode = "Il codice di sicurezza non è valido";
    }

    // Nome intestatario: almeno 2 caratteri
    if (!cardOwner.trim() || cardOwner.trim().length < 2) {
      newErrors.cardOwner = "Il nome dell'intestatario non è valido";
    }

    if (Object.keys(newErrors).length > 0) {
      setPaymentErrors(newErrors);
      return;
    }
    setPaymentErrors({});
    setIsSubmitting(true);


    const shippingCost =
      totalPrice -
      cartProducts.reduce(
        (sum, product) => sum + product.price * product.currentQuantity,
        0
      );

    const orderData = {
      userEmail: formData.email,
      userName: formData.name,
      userLastName: formData.lastName,
      userPhone: formData.phone,
      billingAddress: formData.billing,
      totalPrice: totalPrice,
      products: cartProducts.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.currentQuantity,
        price: p.price,
      })),
    };

    if (showDeliveryAddress) {
      orderData.deliveryAddress = formData.delivery;
    }

    try {
      const purchaseResponse = await fetch(`${BASE_URL}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!purchaseResponse.ok) {
        const purchaseErrorData = await purchaseResponse.json();
        throw new Error(
          purchaseErrorData.message ||
          "Errore sconosciuto nel salvataggio dell'ordine"
        );
      }

      const purchaseData = await purchaseResponse.json();
      const orderNumber = purchaseData.order_number;

      const productListHtml = cartProducts
        .map(
          (p) =>
            `<li>${p.name} (${p.currentQuantity}x) - €${(
              p.price * p.currentQuantity
            ).toFixed(2)}</li>`
        )
        .join("");

      // URL del logo che funziona sia in locale che in produzione
      const logoUrl = `${SITE_BASE_URL}/Logo3.png`;

      const emailBodyBuyer = `
      <div style="text-align: center;">
        <img src="${logoUrl}" alt="Logo Azienda" style="max-width: 150px; height: auto; margin-bottom: 20px;">
      </div>
      <h1>Riepilogo del tuo Ordine</h1>
      <p>Gentile ${formData.name},</p>
        <p>Ti rigraziamo per aver acquistato presso il nostro PetShop Fluffman,</p>
        <p>in data ${new Date().toLocaleDateString()}</p>
      <p>Il tuo ordine <b>#${orderNumber}</b> è stato ricevuto con successo. Di seguito trovi il riepilogo:</p>
      
      <h2>Dettagli Ordine</h2>
      <ul>
        ${productListHtml}
      </ul>
      <p>Costo di spedizione: €${shippingCost.toFixed(2)}</p>
      <p><b>Totale ordine: €${totalPrice.toFixed(2)}</b></p>
      
      <hr/>
      
      <h2>Indirizzo di Fatturazione</h2>
      <ul>
          <li>Indirizzo: ${formData.billing.address}</li>
          ${formData.billing.address2 ? `<li>Dettagli aggiuntivi: ${formData.billing.address2}</li>` : ''}
          <li>Città: ${formData.billing.city}, ${formData.billing.province} ${formData.billing.zip}</li>
          <li>Nazione: ${formData.billing.country}</li>
      </ul>
      
      ${showDeliveryAddress ? `
        <h2>Indirizzo di Consegna</h2>
        <ul>
            <li>Indirizzo: ${formData.delivery.address}</li>
            ${formData.delivery.address2 ? `<li>Dettagli aggiuntivi: ${formData.delivery.address2}</li>` : ''}
            <li>Città: ${formData.delivery.city}, ${formData.delivery.province} ${formData.delivery.zip}</li>
            <li>Nazione: ${formData.delivery.country}</li>
        </ul>

        
        ` : ''}
      <h2>Dettagli del Pagamento</h2>
      <p>Metodo di pagamento utilizzato: carta di credito/debito che termina con ${formData.payment.cardNumber.slice(-4)}</p>
        
      <p>Grazie per il tuo acquisto!</p>
    `;

      const emailBodySeller = `
        <h1>Nuovo Ordine Ricevuto</h1>
        <p>Ciao venditore,</p>
        <p>Hai ricevuto un nuovo ordine da ${formData.name} ${formData.lastName}.</p>
        <p>Numero d'ordine: <b>#${orderNumber}</b></p>
        <p>Dettagli dell'ordine:</p>
        <ul>
            ${productListHtml}
        </ul>
        <p>Costo di spedizione: €${shippingCost.toFixed(2)}</p>
        <p><b>Totale ordine: €${totalPrice.toFixed(2)}</b></p>
        <p>Dettagli utente:</p>
        <ul>
            <li>Nome: ${formData.name}</li>
            <li>Cognome: ${formData.lastName}</li>
            <li>Email: ${formData.email}</li>
            <li>Telefono: ${formData.phone}</li>
        </ul>
        <p>Indirizzo di fatturazione:</p>
        <ul>
            <li>Indirizzo: ${formData.billing.address}</li>
            <li>CAP: ${formData.billing.zip}</li>
            <li>Città: ${formData.billing.city}</li>
            <li>Provincia: ${formData.billing.province}</li>
            <li>Nazione: ${formData.billing.country}</li>
        </ul>
        ${showDeliveryAddress
          ? `
            <p>Indirizzo di consegna:</p>
            <ul>
                <li>Indirizzo: ${formData.delivery.address}</li>
                <li>CAP: ${formData.delivery.zip}</li>
                <li>Città: ${formData.delivery.city}</li>
                <li>Provincia: ${formData.delivery.province}</li>
                <li>Nazione: ${formData.delivery.country}</li>
            </ul>
        `
          : ""
        }
    `;

      // Le email di conferma sono "fire and forget": l'ordine è già stato
      // salvato con successo, quindi non blocchiamo l'utente in attesa che
      // Gmail risponda (può essere lento, specie dopo un cold start del
      // backend). Un eventuale errore di invio viene solo loggato.
      fetch(`${BASE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.email,
          subject: `Conferma del tuo Ordine #${orderNumber}`,
          body: emailBodyBuyer,
        }),
      }).catch((err) => console.error("Invio email cliente fallito:", err));

      fetch(`${BASE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: SELLER_EMAIL,
          subject: `Nuovo Ordine #${orderNumber} da ${formData.name} ${formData.lastName}`,
          body: emailBodySeller,
        }),
      }).catch((err) => console.error("Invio email venditore fallito:", err));

      // Svuota il carrello usando la funzione corretta dal Context
      clearCart();

      setFormData({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        billing: {
          address: "",
          address2: "",
          zip: "",
          city: "",
          province: "",
          country: "",
        },
        delivery: {
          address: "",
          address2: "",
          zip: "",
          city: "",
          province: "",
          country: "",
        },
        payment: {
          cardNumber: "",
          expireDate: "",
          securityCode: "",
          cardOwner: "",
        },
      });
      setShowDeliveryAddress(false);
      setIsAccordionOpen(false);

      const summary = {
        products: cartProducts,
        totalPrice: totalPrice,
        shippingCost: shippingCost,
      };

      navigate("/thankyou", { state: { orderSummary: summary, orderNumber: orderNumber } });

    } catch (error) {
      console.error("Errore durante l'elaborazione dell'ordine:", error);
      alert(`Si è verificato un errore durante l'ordine: ${error.message}. Riprova più tardi.`);
      setIsSubmitting(false);
    }
  };

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <>
      <style>
        {`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f7f9fc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .card {
          background-color: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 1024px) {
          .card {
            flex-direction: row;
          }
        }
        .form-section {
          padding: 2.5rem;
          flex: 3;
        }
        .summary-section {
          padding: 2.5rem;
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          flex: 2;
          border-radius: 0 0 1.5rem 1.5rem;
        }
        @media (min-width: 1024px) {
          .summary-section {
            border-top: none;
            border-left: 1px solid #e5e7eb;
            border-radius: 0 1.5rem 1.5rem 0;
          }
        }
        .title {
          font-size: 2.25rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1rem;
        }
        .subtitle {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          margin-top: 1.5rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 0.25rem;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
          outline: none;
        }
        /* Stili per gli input con errori */
        .form-group input.input-error {
            border-color: #ef4444; /* Colore rosso per il bordo */
        }
        .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
        .checkbox-group input {
          margin-right: 0.5rem;
        }
        .accordion-container {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          margin-top: 2rem;
        }
        .accordion-header {
          padding: 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        .accordion-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }
        .accordion-body {
          padding: 1rem;
        }
        .btn-submit {
          width: 100%;
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
          font-weight: bold;
          color: #ffffff;
          background-color: #10b981;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: background-color 0.15s ease-in-out;
        }
        .btn-submit:hover {
          background-color: #059669;
        }
        .product-list {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .product-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background-color: #ffffff;
          padding: 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }
        .product-item img {
          width: 64px;
          height: 64px;
          border-radius: 0.5rem;
          object-fit: cover;
        }
        .product-item h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #4b5563;
          margin: 0;
        }
        .product-item p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }
        .product-item span {
          font-weight: bold;
          color: #1f2937;
          margin-left: auto;
        }
        .summary-totals {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .summary-total-line {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1f2937;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 1rem;
        }
          .card-checkout:hover{
          transform: none;
          }
      `}
      </style>
      <div className="container">
        <CardCheckout
          handleOrder={handleOrder}
          formData={formData}
          handleDirectInputChange={handleDirectInputChange}
          handleInputChange={handleInputChange}
          showFieldErrors={showFieldErrors}
          emailError={emailError}
          phoneError={phoneError}
          nameError={nameError}
          lastNameError={lastNameError}
          paymentErrors={paymentErrors}
          showDeliveryAddress={showDeliveryAddress}
          setShowDeliveryAddress={setShowDeliveryAddress}
          handleAccordionToggle={handleAccordionToggle}
          isAccordionOpen={isAccordionOpen}
          isSubmitting={isSubmitting}
          cartProducts={cartProducts}
          missingFields={missingFields}
          totalPrice={totalPrice} />
      </div>
    </>
  );
}

export default CheckoutPage;