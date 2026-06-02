function ThemeLogo({ alt = "John Fuller logo", className = "", mode = "auto" }) {
  const PUBLIC = process.env.PUBLIC_URL;
  const classes = [
    "theme-logo",
    className,
    mode === "dark" ? "theme-logo--dark" : "",
    mode === "light" ? "theme-logo--light" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <img
        src={`${PUBLIC}/JF-logo-black-cutout.svg`}
        alt={alt}
        className="theme-logo-image theme-logo-image--dark"
      />
      <img
        src={`${PUBLIC}/JF-logo-white-cutout.svg`}
        alt=""
        aria-hidden="true"
        className="theme-logo-image theme-logo-image--light"
      />
    </span>
  );
}

export default ThemeLogo;
