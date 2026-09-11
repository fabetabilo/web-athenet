import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { MapPin, Calendar, Tag, ChevronLeft } from '../../components/ui/icons';
import { allEvents } from '../../data/allEvents';
import { normalizeEvent } from '../../utils/normalizeEvent';
import TeamsVersus from '../../components/ui/TeamsVersus/TeamsVersus';
import styles from './Event.module.css';

// Normalizar todos los eventos una vez al cargar el módulo.
// Cuando se integre el API real, este array vendrá del fetch en su lugar.
const normalizedEvents = allEvents.map(normalizeEvent)

export default function EventDetail() {
  const { id } = useParams();

  // Lookup por internalId (string). Ya no se usa parseInt — el id del back es string.
  const event = normalizedEvents.find((e) => e.id === id);

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
                {/* Ícono de evento oficial — posicionamiento/estilo visual pendiente */}
                {event.isOfficial && (
                  <BadgeCheck
                    className={styles.officialBadge}
                    aria-label="Evento oficial verificado"
                  />
                )}
              </h1>
            </div>
          </div>

          <div className={styles.bannerFooter}>
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
              <Tag className={styles.itemIcon} />
              <span className={styles.itemText}>{event.categoryLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de equipos: solo se renderiza si el evento tiene dos equipos.
          Decisión de negocio: type=MATCH garantiza hasTeams=true;
          otros tipos pueden también tener equipos (hasTeams=true). */}
      {event.hasTeams && (
        <TeamsVersus teamOneId={event.teamOneId} teamTwoId={event.teamTwoId} />
      )}

      <div className={styles.eventContent}>
        <p>{event.description}</p>
      </div>
    </div>
  );
}
