import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TransitionLink, useTransitionHold } from '../../components/transition';
import { MapPin, Clock, ChevronLeft, OfficialIconH, ArrowRight } from '../../components/icons';
import { getEventById } from '../../service/eventsApi';
import { getCompetitionMatch } from '../../service/competitionsApi';
import EventsBoard from '../../components/ui/EventsBoard/EventsBoard'
import GalleryCarousel from '../../components/ui/Carousel/GalleryCarousel';
import Pill from '../../components/ui/Pill/Pill';
import Countdown from '../../components/ui/Countdown/Countdown';
import TeamsVersus from '../../components/ui/TeamsVersus/TeamsVersus';
import TeamChipList from '../../components/ui/TeamChip/TeamChipList';
import { formatDateRange } from '../../utils/dateTime';
import styles from './EventDetail.module.css';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useTransitionHold(isLoading);

  useEffect(() => {
    let isMounted = true;

    getEventById(id)
      .then(async (data) => {
        const eventMatch = data?.competitionId && data?.competitionMatchId
          ? await getCompetitionMatch(data.competitionId, data.competitionMatchId).catch(() => null)
          : null;
        if (isMounted) {
          setEvent(data);
          setMatch(eventMatch);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadFailed(true);
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
          <h2>{loadFailed ? 'No se pudo cargar el evento.' : 'Evento no encontrado'}</h2>
          <TransitionLink to="/events" className={styles.notFoundLink}>
            Volver a eventos
          </TransitionLink>
        </div>
      </div>
    );
  }

  const dateLabel = formatDateRange(event.eventDate, event.endDate || event.eventDate);

  return (
    <div className={styles.page}>
      <div className={styles.bannerContainer} style={{ backgroundImage: `url(${event.image})` }}>
        <div className={styles.overlay}></div>
        <div className={styles.contentWrapper}>
          <div className={styles.titleWrapper}>
            <div className={styles.bannerText}>
              <TransitionLink to="/events" className={styles.backLink}>
                <ChevronLeft className={styles.backLinkIcon} />
                Todos los eventos
              </TransitionLink>

              <div className={styles.bannerTop}>
                {event.sportLabel && <Pill>{event.sportLabel}</Pill>}
                {event.isOfficial && (
                  <OfficialIconH className={styles.officialBadgeImg} aria-label="Evento oficial verificado" />
                )}
              </div>

              <h1 className={styles.title}>{event.title}</h1>

              <p className={styles.bannerLocation}>
                {event.location && (
                  <>
                    <MapPin size={24} strokeWidth={1} aria-hidden="true" />
                    {event.location}
                    <span className={styles.dateSep} aria-hidden="true">|</span>
                  </>
                )}
                <span className={styles.bannerDate}>{dateLabel}</span>
              </p>

              <TeamChipList event={event} />
            </div>

            <div className={styles.countdownSlot}>
              {event.isFinished ? (
                <Pill size="lg" variant="neutral">Finalizado</Pill>
              ) : event.hasStarted ? (
                <Pill size="lg" variant="red">En curso</Pill>
              ) : (
                <Countdown date={event.startsAt} size="sm" />
              )}
            </div>
          </div>

          {(event.startTime || event.endTime) && (
            <div className={styles.bannerFooter}>
              {event.startTime && (
                <div className={styles.footerItem}>
                  <Clock className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Inicio</span>
                  <span className={styles.itemText}>{event.startTime}</span>
                </div>
              )}
              {event.endTime && (
                <div className={styles.footerItem}>
                  <Clock className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Término</span>
                  <span className={styles.itemText}>{event.endTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TeamsVersus event={event} match={match} />

      <div className={styles.eventContentLayout}>
        <div>
          <p className={styles.lead}>{event.description}</p>
          {event.descriptionOpt && (
            <p className={styles.body}>{event.descriptionOpt}</p>
          )}
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
      <GalleryCarousel key={event.id} images={event.photos} />
      <EventsBoard />
    </div>
  );
}
