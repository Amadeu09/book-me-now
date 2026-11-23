import type { IconName } from '@/components/ui/icon';

export const CATEGORIES: { label: string; value: string | null; icon: IconName }[] = [
  { label: 'Todos', value: null, icon: 'grid' },
  { label: 'Peluquería', value: 'PERRUQUERIA', icon: 'scissors' },
  { label: 'Barbería', value: 'BARBERIA', icon: 'scissors' },
  { label: 'Estética', value: 'ESTETICA', icon: 'sparkle' },
  { label: 'Spa', value: 'SPA', icon: 'leaf' },
  { label: 'Masajes', value: 'MASSATGES', icon: 'heart' },
  { label: 'Fisioterapia', value: 'FISIOTERAPIA', icon: 'team' },
  { label: 'Dental', value: 'DENTAL', icon: 'tooth' },
];

export const TIPO_LABELS: Record<string, string> = {
  PERRUQUERIA: 'Peluquería',
  BARBERIA: 'Barbería',
  ESTETICA: 'Estética',
  SPA: 'Spa',
  MASSATGES: 'Masajes',
  FITNESS: 'Fitness',
  PILATES: 'Pilates',
  IOGA: 'Yoga',
  NUTRICIONISTA: 'Nutricionista',
  FISIOTERAPIA: 'Fisioterapia',
  DENTAL: 'Dental',
  VETERINARIA: 'Veterinaria',
  ALTRES: 'Otros',
  OTROS: 'Otros',
};
