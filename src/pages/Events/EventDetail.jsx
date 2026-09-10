import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ChevronLeft } from '../../components/ui/icons';
import { allEvents } from '../../data/allEvents';
import styles from './Event.module.css';

export default function EventDetail() {
  const { id } = useParams();
  
  // busca el evento correspondiente
  const event = allEvents.find(e => e.id === parseInt(id));

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

  // Formatear la fecha para que se vea como en la captura (ej. "15 - 16 September 2026")
  const formattedDate = `${event.days} ${event.month} ${event.year}`;

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
              <h1 className={styles.title}>{event.title}</h1>
            </div>
          </div>
          
          <div className={styles.bannerFooter}>
            <div className={styles.footerItem}>
              <MapPin className={styles.itemIcon} />
              <span className={styles.itemText}>{event.location}</span>
            </div>
            <div className={styles.footerItem}>
              <Calendar className={styles.itemIcon} />
              <span className={styles.itemText}>{formattedDate}</span>
            </div>
            <div className={styles.footerItem}>
              <Tag className={styles.itemIcon} />
              <span className={styles.itemText}>{event.category}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.eventContent}>
        <p>informacion en construccion</p>
      </div>
    </div>
  );
}
