export default function CardCheckout({ handleOrder, formData, handleDirectInputChange, handleInputChange, showFieldErrors, emailError, phoneError, paymentErrors, showDeliveryAddress, setShowDeliveryAddress, handleAccordionToggle, isAccordionOpen, isSubmitting, cartProducts, missingFields, totalPrice }) {
    return (
        <div className="card card-checkout">
            <div className="form-section">
                <h1 className="title">Checkout</h1>
                <form onSubmit={handleOrder}>
                    <h2 className="subtitle">Dati Personali</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Nome <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleDirectInputChange}
                                placeholder="Mario"
                                style={showFieldErrors && missingFields.includes("name") ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Cognome <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleDirectInputChange}
                                placeholder="Rossi"
                                style={(showFieldErrors && missingFields.includes("lastName")) ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleDirectInputChange}
                                style={
                                    (showFieldErrors && missingFields.includes("email")) || emailError
                                        ? { borderColor: '#b91c1c' }
                                        : {}
                                }

                                placeholder="esempio@email.com"
                            />
                            <span id="emailHelpInline" className="form-text">Inserisci un indirizzo email con un dominio valido: esempio@email.com
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Telefono <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleDirectInputChange}
                                placeholder="+39 1234567890"
                                style={
                                    (showFieldErrors && missingFields.includes("phone")) || phoneError
                                        ? { borderColor: '#b91c1c' }
                                        : {}
                                }

                            />
                            <span id="phoneHelpInline" className="form-text">Inserisci un numero di telefono valido: +39 1234567890
                            </span>
                        </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem', textAlign: 'center', color: '#b91c1c', fontSize: '0.95rem' }}>
                        I campi contrassegnati con <span style={{ color: 'red' }}>*</span> sono obbligatori
                    </div>

                    <h2 className="subtitle">Indirizzo di Fatturazione</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="billingAddress">Indirizzo <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="billingAddress"
                                name="address"
                                value={formData.billing.address}
                                onChange={(e) => handleInputChange(e, "billing")}
                                placeholder="Via Roma n.1"
                                style={showFieldErrors && missingFields.includes("billing.address") ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="billingAddress2">
                                Piano, appartamento o scala
                            </label>
                            <input
                                type="text"
                                id="billingAddress2"
                                name="address2"
                                value={formData.billing.address2}
                                onChange={(e) => handleInputChange(e, "billing")}
                                placeholder="Es. Piano 2, Scala A"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="billingZip">CAP <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="billingZip"
                                name="zip"
                                value={formData.billing.zip}
                                onChange={(e) => handleInputChange(e, "billing")}
                                placeholder="00100"
                                style={showFieldErrors && missingFields.includes("billing.zip") ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="billingCity">Città <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="billingCity"
                                name="city"
                                value={formData.billing.city}
                                onChange={(e) => handleInputChange(e, "billing")}
                                placeholder="Roma"
                                style={showFieldErrors && missingFields.includes("billing.city") ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="billingProvince">Provincia <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="billingProvince"
                                name="province"
                                value={formData.billing.province}
                                onChange={(e) => handleInputChange(e, "billing")}
                                placeholder="RM"
                                style={showFieldErrors && missingFields.includes("billing.province") ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="billingCountry">Nazione <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                id="billingCountry"
                                name="country"
                                value={formData.billing.country}
                                onChange={(e) => handleInputChange(e, "billing")}
                                placeholder="Italia"
                                style={showFieldErrors && missingFields.includes("billing.country") ? { borderColor: '#b91c1c' } : {}}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem', textAlign: 'center', color: '#b91c1c', fontSize: '0.95rem' }}>
                        I campi contrassegnati con <span style={{ color: 'red' }}>*</span> sono obbligatori
                    </div>

                    <h2 className="subtitle">Indirizzo di Consegna</h2>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="checkChecked"
                            checked={showDeliveryAddress}
                            onChange={() => setShowDeliveryAddress(!showDeliveryAddress)}
                        />
                        <label htmlFor="checkChecked">
                            Indirizzo di consegna diverso da quello di fatturazione
                        </label>
                    </div>
                    {showDeliveryAddress && (
                        <>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="deliveryAddress">Indirizzo <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        id="deliveryAddress"
                                        name="address"
                                        value={formData.delivery.address}
                                        onChange={(e) => handleInputChange(e, "delivery")}
                                        placeholder="Via Roma n.1"
                                        style={showFieldErrors && missingFields.includes("delivery.address") ? { borderColor: '#b91c1c' } : {}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deliveryAddress2">
                                        Piano, appartamento o scala
                                    </label>
                                    <input
                                        type="text"
                                        id="deliveryAddress2"
                                        name="address2"
                                        value={formData.delivery.address2}
                                        onChange={(e) => handleInputChange(e, "delivery")}
                                        placeholder="Es. Piano 2, Scala A"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deliveryZip">CAP <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        id="deliveryZip"
                                        name="zip"
                                        value={formData.delivery.zip}
                                        onChange={(e) => handleInputChange(e, "delivery")}
                                        placeholder="00100"
                                        style={showFieldErrors && missingFields.includes("delivery.zip") ? { borderColor: '#b91c1c' } : {}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deliveryCity">Città <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        id="deliveryCity"
                                        name="city"
                                        value={formData.delivery.city}
                                        onChange={(e) => handleInputChange(e, "delivery")}
                                        placeholder="Roma"
                                        style={showFieldErrors && missingFields.includes("delivery.city") ? { borderColor: '#b91c1c' } : {}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deliveryProvince">Provincia <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        id="deliveryProvince"
                                        name="province"
                                        value={formData.delivery.province}
                                        onChange={(e) => handleInputChange(e, "delivery")}
                                        placeholder="RM"
                                        style={showFieldErrors && missingFields.includes("delivery.province") ? { borderColor: '#b91c1c' } : {}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deliveryCountry">Nazione <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        id="deliveryCountry"
                                        name="country"
                                        value={formData.delivery.country}
                                        onChange={(e) => handleInputChange(e, "delivery")}
                                        placeholder="Italia"
                                        style={showFieldErrors && missingFields.includes("delivery.country") ? { borderColor: '#b91c1c' } : {}}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', marginBottom: '1rem', textAlign: 'center', color: '#b91c1c', fontSize: '0.95rem' }}>
                                I campi contrassegnati con <span style={{ color: 'red' }}>*</span> sono obbligatori
                            </div>
                        </>
                    )}

                    <div className="accordion-container">
                        <div
                            className="accordion-header"
                            onClick={handleAccordionToggle}
                        >
                            <h2>Aggiungi una carta per il pagamento</h2>
                            <span>{isAccordionOpen ? "▲" : "▼"}</span>
                        </div>
                        {isAccordionOpen && (
                            <div className="accordion-body">
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Numero carta</label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        value={formData.payment.cardNumber}
                                        onChange={(e) => handleInputChange(e, "payment")}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength="19"
                                        style={paymentErrors.cardNumber ? { borderColor: '#b91c1c' } : {}}
                                    />
                                    {paymentErrors.cardNumber && (
                                        <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                                            {paymentErrors.cardNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="expireDate">Data di scadenza</label>
                                        <input
                                            type="text"
                                            id="expireDate"
                                            name="expireDate"
                                            value={formData.payment.expireDate}
                                            onChange={(e) => handleInputChange(e, "payment")}
                                            placeholder="MM/YY"
                                            maxLength="5"
                                            style={paymentErrors.expireDate ? { borderColor: '#b91c1c' } : {}}
                                        />
                                        {paymentErrors.expireDate && (
                                            <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                                                {paymentErrors.expireDate}
                                            </p>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="securityCode">
                                            Codice di sicurezza
                                        </label>
                                        <input
                                            type="text"
                                            id="securityCode"
                                            name="securityCode"
                                            value={formData.payment.securityCode}
                                            onChange={(e) => handleInputChange(e, "payment")}
                                            placeholder="3 cifre sul retro"
                                            maxLength="3"
                                            style={paymentErrors.securityCode ? { borderColor: '#b91c1c' } : {}}
                                        />
                                        {paymentErrors.securityCode && (
                                            <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                                                {paymentErrors.securityCode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cardOwner">
                                        Nome del proprietario della carta
                                    </label>
                                    <input
                                        type="text"
                                        id="cardOwner"
                                        name="cardOwner"
                                        value={formData.payment.cardOwner}
                                        onChange={(e) => handleInputChange(e, "payment")}
                                        placeholder="Mario Rossi"
                                        style={paymentErrors.cardOwner ? { borderColor: '#b91c1c' } : {}}
                                    />
                                    {paymentErrors.cardOwner && (
                                        <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                                            {paymentErrors.cardOwner}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {cartProducts.length > 0 && (
                        <div style={{ marginTop: "2rem", textAlign: "center" }}>
                            {showFieldErrors && missingFields.length > 0 && (
                                <div style={{ color: '#b91c1c', marginBottom: '1rem', fontWeight: 500 }}>
                                    Compila tutti i campi obbligatori per procedere con l'ordine.
                                </div>
                            )}
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: isSubmitting
                                        ? '#6b7280'
                                        : missingFields.length > 0 ? '#9ca3af' : '#10b981',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.6rem',
                                }}
                            >
                                {isSubmitting && (
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            width: '1rem',
                                            height: '1rem',
                                            border: '2px solid rgba(255,255,255,0.4)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            animation: 'spin-btn 0.7s linear infinite',
                                        }}
                                    />
                                )}
                                {isSubmitting ? 'Stiamo elaborando il tuo ordine…' : 'Ordina e Paga'}
                            </button>
                            <style>{`
                                @keyframes spin-btn { to { transform: rotate(360deg); } }
                            `}</style>
                        </div>
                    )}
                </form>
            </div>

            <div className="summary-section">
                <h2 className="title">Il tuo Ordine</h2>
                <div className="product-list">
                    {cartProducts.length > 0 ? (
                        cartProducts.map((product) => (
                            <div key={product.id} className="product-item">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) =>
                                    (e.target.src =
                                        "https://placehold.co/100x100?text=Immagine")
                                    }
                                />
                                <div>
                                    <h3>{product.name}</h3>
                                    <p>Quantità: {product.currentQuantity}</p>
                                </div>
                                <span>
                                    €{(product.price * product.currentQuantity).toFixed(2)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "#6b7280" }}>
                            Il carrello è vuoto.
                        </p>
                    )}
                </div>
                {cartProducts.length > 0 && (
                    <div className="summary-totals">
                        <div className="summary-line">
                            <span>Subtotale</span>
                            <span>
                                €
                                {cartProducts
                                    .reduce((sum, p) => sum + p.price * p.currentQuantity, 0)
                                    .toFixed(2)}
                            </span>
                        </div>
                        <div className="summary-line">
                            <span>Spedizione</span>
                            <span>
                                {(() => {
                                    const shipping = totalPrice - cartProducts.reduce(
                                        (sum, p) => sum + p.price * p.currentQuantity,
                                        0
                                    );
                                    return shipping === 0
                                        ? 'Gratis'
                                        : `€${shipping.toFixed(2)}`;
                                })()}
                            </span>
                        </div>
                        <div className="summary-line summary-total-line">
                            <span>Totale</span>
                            <span>€{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}