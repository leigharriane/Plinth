import { Mail, type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import {
  SiBehance,
  SiBluesky,
  SiDevdotto,
  SiDiscord,
  SiDribbble,
  SiGithub,
  SiGitlab,
  SiInstagram,
  SiMastodon,
  SiMedium,
  SiStackoverflow,
  SiThreads,
  SiTwitch,
  SiX,
  SiYoutube,
} from "react-icons/si";
import type { SocialPlatform } from "@/lib/config";
import { iconSize } from "@/lib/icons";

/**
 * Icon and default accessible name for each platform `site.config.ts` accepts. Brand marks
 * use the brand size; `iconClassName` overrides it where a mark needs a different box.
 */
export const socialPlatforms: Record<
  SocialPlatform,
  { name: string; Icon: IconType | LucideIcon; iconClassName?: string }
> = {
  github: { name: "GitHub", Icon: SiGithub },
  gitlab: { name: "GitLab", Icon: SiGitlab },
  // Figma uses the bare "in" and "f" marks rather than the boxed/circled logos.
  linkedin: { name: "LinkedIn", Icon: FaLinkedinIn },
  x: { name: "X", Icon: SiX },
  bluesky: { name: "Bluesky", Icon: SiBluesky },
  mastodon: { name: "Mastodon", Icon: SiMastodon },
  facebook: { name: "Facebook", Icon: FaFacebookF },
  instagram: { name: "Instagram", Icon: SiInstagram },
  threads: { name: "Threads", Icon: SiThreads },
  discord: { name: "Discord", Icon: SiDiscord },
  youtube: { name: "YouTube", Icon: SiYoutube },
  twitch: { name: "Twitch", Icon: SiTwitch },
  dribbble: { name: "Dribbble", Icon: SiDribbble },
  behance: { name: "Behance", Icon: SiBehance },
  medium: { name: "Medium", Icon: SiMedium },
  devto: { name: "DEV", Icon: SiDevdotto },
  stackoverflow: { name: "Stack Overflow", Icon: SiStackoverflow },
  // A lucide outline icon, so it takes the control size to match the brand marks' ink.
  email: { name: "Email", Icon: Mail, iconClassName: iconSize.control },
};
