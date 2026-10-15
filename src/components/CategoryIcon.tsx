// CategoryIcon.tsx — icona Lucide di una categoria, colorata come in OnlyVariants (15 px).

import { Camera, Compass, Gem, Lightbulb, Map, Music, Palette, Rocket, Telescope, Wrench } from "lucide-react";
import type { IconName } from "@/lib/categoryIcons";

const ICONS: Record<IconName, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string }>> = {
  Telescope, Palette, Wrench, Compass, Gem, Rocket, Map, Lightbulb, Camera, Music,
};

export function CategoryIcon({ name, color, size = 15 }: { name: string; color: string; size?: number }) {
  const Icon = ICONS[name as IconName] ?? Gem;
  return <Icon size={size} color={color} strokeWidth={1.8} className="shrink-0" />;
}
