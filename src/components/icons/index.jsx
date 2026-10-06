import {
  LuChevronRight,
  LuChevronLeft,
  LuArrowRight,
  LuMapPin,
  LuCalendar,
  LuBuilding2,
  LuUsers,
  LuSearch
} from 'react-icons/lu';

import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
  FaLinkedinIn
} from 'react-icons/fa6';

import {
  RiMenu2Line,
  RiCloseLine
} from 'react-icons/ri';

// EVENTO_OFICIAL_BADGE: icono personalizado
export const OfficialIcon = ({ className, ...props }) => (
  <img src={`${import.meta.env.BASE_URL}icon/oficial.png`} alt="Oficial" className={className} {...props} />
);

export const OfficialIconH = ({ className, ...props }) => (
  <img src={`${import.meta.env.BASE_URL}icon/oficial_h.png`} alt="Oficial" className={className} {...props} />
);

// Iconos de interfaz (set Lucide)
export {
  LuChevronRight as ChevronRight,
  LuChevronLeft as ChevronLeft,
  LuArrowRight as ArrowRight,
  LuMapPin as MapPin,
  LuCalendar as Calendar,
  LuBuilding2 as Building2,
  LuUsers as Users,
  LuSearch as Search
};

// Menu hamburguesa (set Remix Icon)
export {
  RiMenu2Line as Menu,
  RiCloseLine as Close
};

// Logos de redes sociales (set Font Awesome 6)
export {
  FaInstagram as Instagram,
  FaFacebookF as Facebook,
  FaXTwitter as XTwitter,
  FaYoutube as Youtube,
  FaLinkedinIn as Linkedin
};
