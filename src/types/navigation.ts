export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: NavItem[];
  starred?: boolean;
}

export interface NavCategory {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}