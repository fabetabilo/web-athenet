import styles from './Footer.module.css';
import Button from '../ui/Button/Button';
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from '../ui/icons';
import brandIcon from '../../assets/icon/brand.png';

const ORGANIZATION = [
  { label: 'Portal de Athenet', href: '#' },
  { label: 'Quiénes somos', href: '#' },
  { label: 'Nuestro equipo', href: '#' },
];

const CALENDAR = [
  { label: 'Eventos próximos', href: '#' },
  { label: 'Calendario', href: '#' },
];

const INSTITUTION = [
  { label: 'Portal de Instituciones y Deportistas', href: '#' },
  { label: 'Inscripciones', href: '#' },
  { label: 'Certificaciones', href: '#' },
  { label: 'FAQ', href: '#' },
];

const SOCIAL_LINKS = [
  { icon: <Instagram />, href: '#', label: 'Instagram' },
  { icon: <Facebook />, href: '#', label: 'Facebook' },
  { icon: <Twitter />, href: '#', label: 'Twitter' },
  { icon: <Youtube />, href: '#', label: 'Youtube' },
  { icon: <Linkedin />, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <div className={styles.logoContainer}>
            <img src={brandIcon} alt="Athenet logo" className={styles.logoImage} />
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>DIRECCIÓN</span>
              <p>Av. Chorrillos 123, Viña del Mar<br />Chile</p>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>TELÉFONO</span>
              <p>+56 2 789 321</p>
            </div>
          </div>

          <Button variant="accent" showArrow>CONTÁCTANOS</Button>
        </div>

        <div className={styles.linksCol}>
          <div className={styles.subCol}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>CALENDARIO</h4>
              <ul>
                {CALENDAR.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>ORGANIZACIÓN</h4>
              <ul>
                {ORGANIZATION.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.subCol}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>INSTITUCIONES</h4>
              <ul>
                {INSTITUTION.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>MANTENTE CONECTADO</h4>
              <div className={styles.socialIcons}>
                {SOCIAL_LINKS.map((social, i) => (
                  <a key={i} href={social.href} aria-label={social.label} className={styles.socialBtn}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
