export interface AppItem {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null; // 可选的图标URL
}

export type AppList = AppItem[];