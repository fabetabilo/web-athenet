import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight,
  MapPin,
  Camera as Instagram, 
  Globe as Facebook, 
  MessageSquare as Twitter, 
  Video as Youtube, 
  Briefcase as Linkedin,
  Calendar,
  Tag,
  BadgeCheck,
  Building2,
  Users
} from 'lucide-react';

// EVENTO_OFICIAL_BADGE: icono personalizado
export const OfficialIcon = ({ className, ...props }) => (
  <img src="/icon/oficial.png" alt="Oficial" className={className} {...props} />
);

export const OfficialIconH = ({ className, ...props }) => (
  <img src="/icon/oficial_h.png" alt="Oficial" className={className} {...props} />
);

export {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Calendar,
  Tag,
  BadgeCheck,
  Building2,
  Users
};
