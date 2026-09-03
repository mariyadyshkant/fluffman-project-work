import nodemailer from "nodemailer";

// Trasportatore creato una sola volta e riutilizzato tra le richieste,
// invece che ricreato ad ogni invio. Timeout espliciti evitano che una
// richiesta resti appesa a lungo se Gmail SMTP è lento a rispondere
// (es. dopo un cold start del servizio su Railway).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "login",
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
  connectionTimeout: 8000, // tempo max per stabilire la connessione TCP
  greetingTimeout: 8000,   // tempo max per il saluto SMTP dopo la connessione
  socketTimeout: 10000,    // tempo max di inattività sulla connessione aperta
});

// Funzione per inviare un'email
export async function sendEmail(req, res) {
  // Estrai i dati dal corpo della richiesta
  const { to, subject, body } = req.body;

  // Validazione dei dati in ingresso
  if (!to || !subject || !body) {
    return res.status(400).json({
      error: true,
      message: "Destinatario, oggetto e corpo del messaggio sono obbligatori.",
    });
  }

  try {
    // Opzioni dell'email
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: body,
    };

    // Invio dell'email
    await transporter.sendMail(mailOptions);

    // Risposta di successo
    res
      .status(200)
      .json({ success: true, message: "Email inviata con successo." });
  } catch (err) {
    // Gestione degli errori (inclusi i timeout impostati sopra)
    console.error("Errore nell'invio dell'email:", err);
    res.status(500).json({
      error: true,
      message: "Si è verificato un errore durante l'invio dell'email.",
    });
  }
}
