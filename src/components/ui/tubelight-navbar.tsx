import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TubelightNavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  nav: string;
}

interface TubelightNavProps {
  items: TubelightNavItem[];
  activeNav: string;
  className?: string;
  onItemClick?: () => void;
}

export function TubelightNav({
  items,
  activeNav,
  className,
  onItemClick,
}: TubelightNavProps) {
  const [activeTab, setActiveTab] = useState(activeNav);

  useEffect(() => {
    setActiveTab(activeNav);
  }, [activeNav]);

  return (
    <div className={cn('tubelight-nav-track w-full', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.nav;

        return (
          <a
            key={item.nav}
            href={item.url}
            className={cn(
              'nav-link tubelight-nav-item',
              isActive && 'active',
            )}
            data-nav={item.nav}
            onClick={() => {
              setActiveTab(item.nav);
              onItemClick?.();
            }}
          >
            <span className="tubelight-nav-label">{item.name}</span>
            <span className="tubelight-nav-icon" aria-hidden="true">
              <Icon size={18} strokeWidth={2.25} />
            </span>

            {isActive && (
              <motion.div
                layoutId="rbh-tubelight-lamp"
                className="tubelight-lamp"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="tubelight-lamp-bar" />
                <div className="tubelight-lamp-glow tubelight-lamp-glow--wide" />
                <div className="tubelight-lamp-glow tubelight-lamp-glow--mid" />
                <div className="tubelight-lamp-glow tubelight-lamp-glow--core" />
              </motion.div>
            )}
          </a>
        );
      })}
    </div>
  );
}
