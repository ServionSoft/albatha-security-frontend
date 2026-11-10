import * as React from "react";
import {
  Bell,
  CalendarDays,
  ChartLine,
  Coins,
  Layers,
  Lock,
  MapPin,
  Shield,
  Trophy,
  User,
  Users,
  LayoutDashboard,
  UsersRound,
  HandCoins,
} from "lucide-react";

export type IconName =
  | "dashboard"
  | "users"
  | "team"
  | "pin"
  | "calendar"
  | "layers"
  | "shield"
  | "coins"
  | "chart"
  | "trophy"
  | "bell"
  | "lock"
  | "user"
  | "help";

const map: Record<IconName, React.ComponentType<{ size?: number } & React.SVGProps<SVGSVGElement>>> = {
  dashboard: LayoutDashboard,
  users: Users,
  team: UsersRound,
  pin: MapPin,
  calendar: CalendarDays,
  layers: Layers,
  shield: Shield,
  coins: Coins,
  chart: ChartLine,
  trophy: Trophy,
  bell: Bell,
  lock: Lock,
  user: User,
  help: HandCoins,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const Comp = map[name];
  return <Comp size={size} className="text-inherit" />;
}

