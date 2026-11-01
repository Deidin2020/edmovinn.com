import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Page links should open at the heading, like the original site's full navigations.
export function RouteScroll() {
  const { pathname } = useLocation();
  const navigation = useNavigationType();
  useLayoutEffect(() => {
    if (navigation !== "POP") window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigation]);
  return null;
}
