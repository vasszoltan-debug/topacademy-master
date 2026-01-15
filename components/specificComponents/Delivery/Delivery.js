import { storyblokEditable } from "@storyblok/react";
// Mivel a .scss fájl közvetlenül a .js mellett van, elég a "./" jelölés
import styles from "./Delivery.module.scss";

const Delivery = ({ blok }) => {
  return (
    <div {...storyblokEditable(blok)} className={styles.container}>
      <div className={styles.card}>
        {/* Cím */}
        <h2 className={styles.title}>{blok.title}</h2>
        
        {/* Szöveg */}
        <p className={styles.text}>{blok.text}</p>
        
        {/* Gomb (csak ha van link) */}
        {blok.link && blok.link.url && (
          <a 
            href={blok.link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.button}
          >
            ORDER NOW 
            <span className={styles.arrow}>→</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default Delivery;