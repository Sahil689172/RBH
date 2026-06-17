import { Contact, Home, Info, LayoutGrid } from 'lucide-react';

import { TubelightNav, type TubelightNavItem } from '@/components/ui/tubelight-navbar';

export const SITE_TUBELIGHT_ITEMS: TubelightNavItem[] = [
  { name: 'Home', url: '/', icon: Home, nav: 'home' },
  { name: 'About', url: '/about/', icon: Info, nav: 'about' },
  { name: 'Collection', url: '/collection/', icon: LayoutGrid, nav: 'collection' },
  { name: 'Contact', url: '/contact/', icon: Contact, nav: 'contact' },
];

export { TubelightNav };
