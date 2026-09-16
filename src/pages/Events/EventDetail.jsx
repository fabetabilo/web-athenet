import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronLeft, OfficialIconH, ArrowRight } from '../../components/ui/icons';
import { getEventById } from '../../service/eventsApi';
import TeamsVersus from '../../components/ui/TeamsVersus/TeamsVersus';
import styles from './EventDetail.module.css';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getEventById(id)
      .then((data) => {
        if (isMounted) {
          setEvent(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEvent(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Cargando evento...</h2>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Evento no encontrado</h2>
          <Link to="/events" style={{ color: 'var(--color-cyan)', marginTop: '1rem', display: 'inline-block' }}>
            Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.bannerContainer} style={{ backgroundImage: `url(${event.image})` }}>
        <div className={styles.overlay}></div>
        <div className={styles.contentWrapper}>
          <div className={styles.titleWrapper}>
            <div>
              <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ChevronLeft style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                Todos los eventos
              </Link>
              <h1 className={styles.title}>
                {event.title}
              </h1>
            </div>
          </div>

          <div className={styles.bannerFooter}>
            {event.isOfficial && (
              <div className={styles.footerItem} style={{ padding: 0 }}>
                <OfficialIconH className={styles.officialItemIcon} aria-label="Evento oficial" />
              </div>
            )}
            <div className={styles.footerItem}>
              <MapPin className={styles.itemIcon} />
              <span className={styles.itemText}>{event.location}</span>
            </div>
            <div className={styles.footerItem}>
              <Calendar className={styles.itemIcon} />
              {/* Fecha: migrada a formattedDate (ISO normalizado, timezone-safe) */}
              <span className={styles.itemText}>{event.formattedDate}</span>
            </div>
            <div className={styles.footerItem}>
              
              <div className={styles.pill}>{event.categoryLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <TeamsVersus event={event} />

      <div className={styles.eventContentLayout}>
        <div>
          <p className={styles.boldDescription}>
            <strong>{event.descriptionOpt}</strong></p>
          <p className={styles.loremText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore 
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
            voluptate velit esse cillum dolore.
          </p>
        </div>

        <div className={styles.sidebarContent}>
          <div className={styles.addressCard}>
            <MapPin className={styles.addressIcon} />
            <h3 className={styles.addressTitle}>Dirección</h3>
            <p className={styles.addressText}>{event.address || event.location}
              <br />
              Ingreso gratuito
            </p>
            <a href="#" className={styles.addressLink}>
              Cómo llegar <ArrowRight className={styles.addressLinkIcon} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
