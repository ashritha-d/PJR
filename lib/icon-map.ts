import {
  Leaf,
  ShieldCheck,
  Award,
  Sprout,
  Calendar,
  Home,
  Heart,
  Smile,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  ShieldCheck,
  Award,
  Sprout,
  Calendar,
  Home,
  Heart,
  Smile,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Leaf;
}
