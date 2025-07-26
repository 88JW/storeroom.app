// 📝 Wspólne typy dla formularzy

export interface FormFieldConfig {
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: (value: unknown) => string | undefined;
}

export interface FormConfig<T> {
  fields: Record<keyof T, FormFieldConfig>;
  submitLabel: string;
  loadingLabel?: string;
}

// Formularz produktu
export interface ProductFormData {
  nazwa: string;
  kategoria: string;
  ilość: number;
  jednostka: 'szt' | 'kg' | 'l' | 'g' | 'ml';
  dataWażności: string;
  lokalizacja: 'lodówka' | 'zamrażarka' | 'szafka';
  opis: string;
}

// Formularz spiżarni
export interface SpizarniaFormData {
  nazwa: string;
  opis: string;
  typ: 'osobista' | 'wspólna';
  powiadomieniaOWażności: boolean;
  dziPrzedWażnością: number;
}

// Formularz logowania
export interface LoginFormData {
  email: string;
  password: string;
}

// Formularz rejestracji
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}
