// 🔧 Typy TypeScript dla Storeroom App

import { Timestamp } from 'firebase/firestore';

// 👤 Użytkownik
export interface UserProfile {
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface UserSpizarnia {
  role: 'owner' | 'member' | 'viewer';
  joinedAt: Timestamp;
}

// 🏠 Spiżarnia
export interface SpizarniaMetadata {
  nazwa: string;
  opis?: string;
  typ: 'osobista' | 'wspólna';
  właściciel: string; // userId
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ikona?: string;
  ustawienia: SpizarniaUstawienia;
}

export interface SpizarniaUstawienia {
  powiadomieniaOWażności: boolean;
  dziPrzedWażnością: number;
  publicznaWidoczność: boolean;
}

export interface SpizarniaCzłonek {
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Timestamp;
  invitedBy: string; // userId
  permissions: CzłonekUprawnienia;
}

export interface CzłonekUprawnienia {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
}

// 🛒 Produkt
export interface Produkt {
  id: string;
  nazwa: string;
  kategoria: string;
  podkategoria?: string;
  ilość: number;
  jednostka: 'szt' | 'kg' | 'l' | 'g' | 'ml';
  dataWażności?: Timestamp;
  dataDodania: Timestamp;
  dataModyfikacji: Timestamp;
  dodanePrzez: string; // userId
  zmodyfikowanePrzez?: string; // userId
  lokalizacja?: 'lodówka' | 'zamrażarka' | 'szafka';
  obrazek?: string;
  kodKreskowy?: string;
  notatki?: string;
  cena?: number;
  sklep?: string;
  status: 'dostępny' | 'wykorzystany' | 'przeterminowany';
}

// 📩 Zaproszenie
export interface Zaproszenie {
  id: string;
  spiżarniaId: string;
  zapraszający: string; // userId
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  token: string;
}

// 📂 Kategorie
export interface Kategoria {
  nazwa: string;
  ikona: string;
  podkategorie: string[];
}

export const KATEGORIE: Record<string, Kategoria> = {
  NABIAŁ: {
    nazwa: 'Nabiał',
    ikona: '🥛',
    podkategorie: ['Mleko', 'Ser', 'Jogurt', 'Masło', 'Śmietana', 'Twaróg']
  },
  MIĘSO: {
    nazwa: 'Mięso i ryby',
    ikona: '🥩',
    podkategorie: ['Wołowina', 'Wieprzowina', 'Drób', 'Ryby', 'Wędliny', 'Owoce morza']
  },
  WARZYWA: {
    nazwa: 'Warzywa',
    ikona: '🥕',
    podkategorie: ['Warzywa świeże', 'Warzywa mrożone', 'Warzywa konserwowe', 'Ziemniaki']
  },
  OWOCE: {
    nazwa: 'Owoce',
    ikona: '🍎',
    podkategorie: ['Owoce świeże', 'Owoce mrożone', 'Owoce suszone', 'Owoce konserwowe']
  },
  NAPOJE: {
    nazwa: 'Napoje',
    ikona: '🥤',
    podkategorie: ['Woda', 'Soki', 'Napoje gazowane', 'Kawa', 'Herbata', 'Alkohol']
  },
  PRODUKTY_SUCHE: {
    nazwa: 'Produkty suche',
    ikona: '🌾',
    podkategorie: ['Mąka', 'Ryż', 'Makaron', 'Kasze', 'Płatki', 'Bakalie']
  },
  PRZYPRAWY: {
    nazwa: 'Przyprawy i dodatki',
    ikona: '🧂',
    podkategorie: ['Przyprawy', 'Sosy', 'Octy', 'Oleje', 'Miód', 'Cukier']
  },
  SŁODYCZE: {
    nazwa: 'Słodycze',
    ikona: '🍫',
    podkategorie: ['Czekolada', 'Ciastka', 'Lody', 'Cukierki', 'Desery']
  },
  PIECZYWO: {
    nazwa: 'Pieczywo',
    ikona: '🍞',
    podkategorie: ['Chleb', 'Bułki', 'Bagietki', 'Pieczywo mrożone']
  },
  INNE: {
    nazwa: 'Inne',
    ikona: '📦',
    podkategorie: ['Żywność dla niemowląt', 'Żywność dietetyczna', 'Suplementy', 'Różne']
  }
};

// 📍 Lokalizacje w spiżarni
export const LOKALIZACJE = {
  LODÓWKA: { nazwa: 'Lodówka', ikona: '❄️', kolor: '#3B82F6' },
  ZAMRAŻARKA: { nazwa: 'Zamrażarka', ikona: '🧊', kolor: '#1E40AF' },
  SZAFKA: { nazwa: 'Szafka', ikona: '🗄️', kolor: '#8B5CF6' },
  SPIŻARNIA: { nazwa: 'Spiżarnia', ikona: '🏠', kolor: '#F59E0B' },
  BALKON: { nazwa: 'Balkon', ikona: '🌿', kolor: '#10B981' }
};

// 📐 Jednostki miary
export const JEDNOSTKI = [
  { value: 'szt', label: 'sztuki' },
  { value: 'kg', label: 'kilogramy' },
  { value: 'g', label: 'gramy' },
  { value: 'l', label: 'litry' },
  { value: 'ml', label: 'mililitry' },
  { value: 'opak', label: 'opakowania' }
];

// 🎨 Status produktu z kolorami
export const STATUSY_PRODUKTU = {
  DOSTĘPNY: { nazwa: 'Dostępny', kolor: '#10B981', ikona: '✅' },
  WYKORZYSTANY: { nazwa: 'Wykorzystany', kolor: '#6B7280', ikona: '✅' },
  PRZETERMINOWANY: { nazwa: 'Przeterminowany', kolor: '#EF4444', ikona: '❌' }
};

// 🔄 Role użytkowników
export const ROLE = {
  OWNER: { nazwa: 'Właściciel', opis: 'Pełne uprawnienia do spiżarni' },
  ADMIN: { nazwa: 'Administrator', opis: 'Może zarządzać członkami i produktami' },
  MEMBER: { nazwa: 'Członek', opis: 'Może dodawać i edytować produkty' },
  VIEWER: { nazwa: 'Obserwator', opis: 'Może tylko przeglądać produkty' }
};

// 🛠️ Pomocnicze funkcje typu
export type SpiżarniaRole = keyof typeof ROLE;
export type ProduktStatus = keyof typeof STATUSY_PRODUKTU;
export type Lokalizacja = keyof typeof LOKALIZACJE;
export type Jednostka = typeof JEDNOSTKI[number]['value'];

// 🔍 Filtry i sortowanie
export interface ProduktFiltr {
  kategoria?: string;
  lokalizacja?: Lokalizacja;
  status?: ProduktStatus;
  wygasaWDniach?: number;
  szukaj?: string;
}

export interface ProduktSortowanie {
  pole: 'nazwa' | 'dataWażności' | 'dataDodania' | 'kategoria';
  kierunek: 'asc' | 'desc';
}

// 🎯 UI State interfaces
export interface SpizarniaListState {
  spiżarnie: SpizarniaMetadata[];
  loading: boolean;
  error: string | null;
  selectedSpizarniaId: string | null;
}

export interface ProduktListState {
  produkty: Produkt[];
  loading: boolean;
  error: string | null;
  filtr: ProduktFiltr;
  sortowanie: ProduktSortowanie;
}

// 📊 Statystyki spiżarni
export interface SpizarniaStatystyki {
  całkowitaLiczbaProduk: number;
  produktyWygasająceWTymTygodniu: number;
  produktyPrzeterminowane: number;
  wartośćSpiżarni?: number;
  najpopularniejszaKategoria: string;
  ostatniaAktywność: Timestamp;
}
