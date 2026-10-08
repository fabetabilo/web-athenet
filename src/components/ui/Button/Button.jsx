import styles from './Button.module.css';
import { ArrowRight } from '../../icons';
import { TransitionLink } from '../../transition';

/**
 * Componente Button reutilizable para la interfaz de usuario.
 * Renderiza dinámicamente una etiqueta `<a>` si se recibe la prop `href`, 
 * o una etiqueta `<button>` en caso contrario.
 * Soporta la propagación de todas las propiedades HTML estándar mediante `...props`.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido interno del botón.
 * @param {'light'|'dark'|'accent'} [props.variant='light'] - Define la paleta de colores del botón. 
 *   - 'light': Diseñado para usarse sobre fondos claros (renderiza bordes y texto oscuros).
 *   - 'dark': Diseñado para usarse sobre fondos oscuros (renderiza bordes y texto claros).
 *   - 'accent': Variante llamativa que usa --color-cyan de fondo y texto negro, cambiando a fondo blanco en hover.
 * @param {boolean} [props.showArrow=false] - Determina si se debe mostrar el ícono `ArrowRight` a la derecha del contenido.
 * @param {string} [props.to] - Ruta interna. Su presencia cambia el elemento raíz al link del router,
 *   que respeta el `basename` y pasa por la pantalla de transición. Usar siempre esto para rutas propias.
 * @param {string} [props.href] - URL EXTERNA. Renderiza un `<a>` crudo, así que recarga el documento:
 *   no usarlo para rutas internas.
 * @param {string} [props.className] - Clases CSS adicionales para sobrescribir o extender estilos.
 */
export default function Button({ children, variant = 'light', showArrow = false, to, href, className = '', ...props }) {
  const variantClass = variant === 'accent' ? styles.accent : (variant === 'dark' ? styles.dark : styles.light);
  // combina clases 
  const combinedClasses = `${styles.base} ${variantClass} ${className}`.trim();

  const content = (
    <>
      {children}
      {showArrow && <ArrowRight className={styles.arrow} style={{ width: '1rem', height: '1rem' }} />}
    </>
  );

  if (to) {
    return (
      <TransitionLink to={to} className={combinedClasses} {...props}>
        {content}
      </TransitionLink>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
}
