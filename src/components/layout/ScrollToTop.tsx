import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop component handles scroll positioning on route transitions.
 * - On POP (browser Back/Forward), it allows browser restoration.
 * - On PUSH/REPLACE (new navigation), it immediately scrolls window & main scroll containers to top.
 * - Ignores search param changes or hash scroll links.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  const navType = useNavigationType();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only reset scroll if pathname actually changed (ignore query param updates on the same page)
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;

      // If user clicked a hash link, let browser handle anchor scroll
      if (hash) return;

      // If user navigated via Back/Forward (POP), preserve scroll position
      if (navType === 'POP') return;

      // Reset window scroll
      window.scrollTo(0, 0);

      // Reset scroll for any layout main overflow containers (e.g. StudentPortalLayout main)
      const scrollableContainers = document.querySelectorAll('main, [data-scroll-container]');
      scrollableContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    }
  }, [pathname, search, hash, navType]);

  return null;
};
