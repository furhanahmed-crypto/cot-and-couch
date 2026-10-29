export type DashboardKpi = {
  label: string;
  value: string;
  hint: string;
  trend?: string;
  trendTone?: "up" | "warn" | "muted";
};

export type AttentionItem = {
  text: string;
  href: string;
  action: string;
};

export type TopProductRow = {
  id: string;
  name: string;
  category: string;
  image?: string;
  views: number;
  shortlists: number;
  enquiries: number;
  signal: string;
  signalTone: "ok" | "steady" | "warn" | "danger";
};

export type DeliveryRow = {
  id: string;
  customer: string;
  product: string;
  when: string;
  status: string;
};

export type CategoryInterest = {
  name: string;
  count: number;
  pct: number;
};

export type AdminDashboardProps = {
  greeting: string;
  subtitle: string;
  rangeDays: 7 | 30;
  kpis: DashboardKpi[];
  attention: AttentionItem[];
  topProducts: TopProductRow[];
  deliveries: DeliveryRow[];
  interest: CategoryInterest[];
  ctaSplit: { visit: number; call: number; whatsapp: number };
};
