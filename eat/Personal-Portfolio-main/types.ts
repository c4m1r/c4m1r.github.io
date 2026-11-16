import { LucideIcon } from 'lucide-react';

export enum PageType {
  Me = 'me',
  Projects = 'projects',
  Skills = 'skills',
  Fun = 'fun',
  Contact = 'contact'
}

export interface NavItem {
  id: PageType;
  label: string;
  icon: LucideIcon;
  color: string;
  path: string;
  description: string;
}
