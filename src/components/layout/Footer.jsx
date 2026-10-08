import styles from './Footer.module.css';
import Button from '../ui/Button/Button';
import { Instagram, Facebook, XTwitter, Youtube, Linkedin } from '../icons';
import brandIcon from '../../assets/icon/brand2.png';

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
  { icon: <XTwitter />, href: '#', label: 'X' },
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
            <p className={styles.description}>
              La plataforma que conecta la comunidad deportiva estudiantil, competencias e instituciones
              de Chile.
            </p>
          </div>

          <Button variant="solid" showArrow>CONTÁCTANOS</Button>

          <div className={styles.infoRow}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Dirección</span>
              <p>Av. Chorrillos 123, Viña del Mar<br />Chile</p>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Teléfono</span>
              <p>+56 2 7898 3214</p>
            </div>
          </div>
        </div>

        <div className={styles.linksCol}>
          <div className={styles.subCol}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Calendario</h4>
              <ul>
                {CALENDAR.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Organización</h4>
              <ul>
                {ORGANIZATION.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.subCol}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Instituciones</h4>
              <ul>
                {INSTITUTION.map((link, i) => (
                  <li key={i}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>Mantente Conectado</h4>
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

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Athenet. Proyecto Cloud Native I
        </p>
      </div>
    </footer>
  );
}
