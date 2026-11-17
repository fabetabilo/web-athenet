import styles from './PageBanner.module.css';

/**
 * Con `posterImage` (imagen vertical, ej. afiche de copa) se muestra entera a la derecha sobre su version desenfocada.
 * Con `spacious` el subtitulo deja mas aire abajo.
 */
const PageBanner = ({ title, subtitle, backgroundImage, posterImage, spacious = false }) => {
  return (
    <div 
      className={`${styles.bannerContainer} ${posterImage ? styles.hasPoster : ''} ${spacious ? styles.spacious : ''}`}
      style={posterImage ? undefined : { backgroundImage: `url(${backgroundImage})` }}
    >
      {posterImage && (
        <>
          <div className={styles.backdrop} style={{ backgroundImage: `url(${posterImage})` }} />
          <img src={posterImage} alt="" className={styles.poster} />
        </>
      )}
      <div className={styles.overlay}></div>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageBanner;
