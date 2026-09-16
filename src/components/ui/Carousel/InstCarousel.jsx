import styles from './InstCarousel.module.css';
import { Link } from 'react-router-dom';

export default function InstCarousel({ institutions = [] }) {
  if (!institutions || institutions.length === 0) {
    return null;
  }

  // efecto de scroll infinito continuo
  const items = [...institutions, ...institutions];

  return (
    <div className={styles.carouselWrapper}>
      <section className={styles.carouselSection} style={{ '--carousel-speed': '40s' }}>
        <div className={styles.carouselContainer}>
          <div className={styles.carouselTrack}>
            {items.map((inst, index) => (
              <Link
                to={`/institutions/${inst.id}`}
                key={`inst-${inst.id}-${index}`} 
                className={styles.cardLink}
              >
                <div className={styles.card}>
                  <div className={styles.logoWrapper}>
                    <img src={inst.image} alt={`Logo de ${inst.name}`} className={styles.logo} />
                  </div>
                  <div className={styles.textContent}>
                    <h3 className={styles.instName}>{inst.name}</h3>
                    {inst.campus && <p className={styles.instCampus}>{inst.campus}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}