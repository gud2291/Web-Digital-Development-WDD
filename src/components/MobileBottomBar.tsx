import { Icon } from "./Icon";
import { siteConfig } from "@/config/site";

export function MobileBottomBar() {
  return (
    <div className="mobile-bottom-bar">
      <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className="mbb__btn mbb__btn--call">
        <Icon name="phone" size={16} />
        Call
      </a>
      <a
        href={`https://wa.me/${siteConfig.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mbb__btn mbb__btn--wa"
      >
        <Icon name="whatsapp" size={16} />
        WhatsApp
      </a>
      <a href={`mailto:${siteConfig.email}`} className="mbb__btn mbb__btn--mail">
        <Icon name="mail" size={16} />
        Email
      </a>
    </div>
  );
}
