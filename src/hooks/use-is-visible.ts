import React from "react";

function useIsVisible<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [isIntersecting, setIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}

export default useIsVisible;