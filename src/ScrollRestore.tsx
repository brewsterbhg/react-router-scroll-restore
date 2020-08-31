import { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import PathMap from "./PathMap";
import { HISTORY_POP, DEFAULT_MAX_SIZE } from "./constants";

interface ScrollRestoreProps {
  maxHistory: number
  throttleTime: number
}

export const ScrollRestore: React.FC<ScrollRestoreProps> = ({ maxHistory: DEFAULT_MAX_SIZE, throttleTime }: ScrollRestoreProps) => {
  const { pathname } = useLocation();
  const { action } = useHistory();

  let throttleTimeout = null

  const callBack = () => {
    throttleTimeout = null
  }

  const scrollListener = () => {
    if (throttleTime) {
      if (throttleTimeout === null) {
        throttleTimeout = setTimeout(callBack, throttleTime);
      }
    } else {
      setPageScrollPosition(pathname);
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', scrollListener);

    return () => window.removeEventListener('scroll', scrollListener);
  }, [pathname]);

  useEffect(() => {
    if (action === HISTORY_POP) {
      const scrollAmount = PathMap.get(pathname);

      if (scrollAmount) {
        scrollTo(scrollAmount);
        PathMap.delete(pathname);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, action])

  return null;
};

/**
 * This function sets the last recorded scroll position on a page before navigating
 *
 * @param {string} path
 * @returns {void}
 */
export const setPageScrollPosition = (path: string): void => {
  dequeuePaths();

  const amount = getScrollPosition();

  PathMap.set(path, amount);
};

/**
 * This function handles cleaning up paths once the map has exceeded the determined max size
 *
 * @returns {void}
 */
export const dequeuePaths = (): void => {
  if (PathMap.size > DEFAULT_MAX_SIZE) {
    const [key] = PathMap.entries().next().value;

    PathMap.delete(key);
  }
};

/**
 * This function grabs the current page Y offset position
 *
 * @returns {number} the current scroll position
 */
export const getScrollPosition = (): number | undefined => {
  if (!isBrowser()) {
    return;
  }

  return window.pageYOffset;
};

/**
 * This function scrolls to the specified offet
 *
 * @param {number} [offset=0] the page Y offset to scroll to
 * @returns {void}
 */
export const scrollTo = (offset = 0): void | undefined => {
  if (!isBrowser()) {
    return;
  }

  // Right now we need to wait for content so we offset with a timeout
  setTimeout(() => {
    window.scrollTo(0, offset);
  }, 1000);
};

/**
 * This function checks checks to make sure the window context exists (in the case of SSR)
 * 
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined";
};
