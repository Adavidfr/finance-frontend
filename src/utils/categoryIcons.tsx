import {
  Banknote,
  Laptop,
  PlusCircle,
  Utensils,
  Car,
  Home,
  Zap,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Package,
  Tag,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  banknote: Banknote,
  laptop: Laptop,
  'plus-circle': PlusCircle,
  utensils: Utensils,
  car: Car,
  home: Home,
  zap: Zap,
  clapperboard: Clapperboard,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'shopping-bag': ShoppingBag,
  package: Package,
}

export function CategoryIcon({
  iconName,
  size = 16,
  className = '',
  color,
}: {
  iconName: string
  size?: number
  className?: string
  color?: string
}) {
  const IconComponent = ICON_MAP[iconName] ?? Tag
  return <IconComponent size={size} className={className} color={color} />
}