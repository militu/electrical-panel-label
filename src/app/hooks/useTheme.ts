import { useEffect } from "react";

function useTheme() {
  useEffect(() => {
    // immediately set the theme on the first client-side load
    const currentTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("theme", currentTheme);

    // apply a visibility class to the body to ensure there's no FOUC
    document.body.classList.add("body-visible");

    return () => {
      // clean up by removing the class if the component unmounts
      document.body.classList.remove("body-visible");
    };
  }, []);
}

export default useTheme;
