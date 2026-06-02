import ThemeLogo from "./ThemeLogo.js";
import "./portfolioLogo.css";

function PortfolioLogoLink({
  href = "/MyPortfolio/",
  ariaLabel = "John Fuller portfolio home",
  logoAlt = "John Fuller logo",
  className = "",
  logoClassName = "",
  logoMode = "auto",
  target,
  rel,
  title,
}) {
  const classes = ["portfolio-logo-link", className].filter(Boolean).join(" ");

  return (
    <a
      href={href}
      className={classes}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      title={title}
    >
      <ThemeLogo alt={logoAlt} className={logoClassName} mode={logoMode} />
    </a>
  );
}

export default PortfolioLogoLink;
