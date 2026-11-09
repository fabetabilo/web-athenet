import styles from './PageBanner.module.css';

const PageBanner = ({ title, subtitle, backgroundImage }) => {
  return (
    <div 
      className={styles.bannerContainer} 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.overlay}></div>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageBanner;
