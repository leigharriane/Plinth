import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";
import { socialPlatforms } from "@/lib/social-icons";
import { Roll } from "./Roll";
import siteConfig from "@/site.config";

/** Icon links for every entry in `socials`, with 44px hit areas around 20px brand marks. */
export function SocialLinks({ className }: { className?: string }) {
  if (siteConfig.socials.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {siteConfig.socials.map(({ platform, url: rawUrl, label }, index) => {
        const { name, Icon, iconClassName } = socialPlatforms[platform];
        // Accept a bare address for email, e.g. "me@example.com".
        const url =
          platform === "email" && !rawUrl.startsWith("mailto:")
            ? `mailto:${rawUrl}`
            : rawUrl;
        const external = !url.startsWith("mailto:");
        return (
          <li key={index}>
            <a
              href={url}
              {...(external && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
              className="group relative inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-fg/10"
            >
              <Roll>
                <Icon aria-hidden className={iconClassName ?? iconSize.brand} />
              </Roll>
              <span className="sr-only">
                {label ?? name}
                {external && " (opens in a new tab)"}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
