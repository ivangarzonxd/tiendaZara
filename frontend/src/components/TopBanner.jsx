import { useState, useEffect } from "react";

/**
 * Banner superior con mensaje promocional rotativo.
 * Alterna entre el mensaje de envío y el de Víctor / Real Oviedo
 * cada 4 segundos con transición suave.
 * Metodología BEM: bloque .top-banner
 */

export default function TopBanner() {
  const [indice, setIndice] = useState(0);
  const [visible, setVisible] = useState(true);

  const mensajes = [
    <span key="promo">
      <strong>ENVÍO GRATIS</strong> en pedidos superiores a 50&nbsp;€&nbsp;&nbsp;|&nbsp;&nbsp;Devoluciones gratuitas en 30 días
    </span>,
    <span key="oviedo">
      Víctor ponme un 10 — ¡Vamos <strong>REAL OVIEDO</strong>! Pongan ganas, pongan huevos. Venimos desde el barro y vamos a tocar el cielo.&nbsp;💙
    </span>,
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setIndice((prev) => (prev + 1) % 2);
        setVisible(true);
      }, 400);
      return () => clearTimeout(t);
    }, 4000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="top-banner">
      <p
        className="top-banner__texto"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {mensajes[indice]}
      </p>
    </div>
  );
}
