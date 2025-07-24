# 🏗️ Architektura Bazy Danych - Storeroom App

## 📊 Struktura Firestore

### 🔑 Kluczowe założenia:
- **Jeden użytkownik może mieć wiele spiżarni** (Dom, Praca, Domek letniskowy)
- **Spiżarnie mogą być współdzielone** między użytkownikami (rodzina)
- **Produkty należą do konkretnej spiżarni**
- **Kontrola dostępu** na poziomie spiżarni

### 📁 Struktura kolekcji:

```
firestore/
├── users/{userId}
│   ├── profile
│   │   ├── email: string
│   │   ├── displayName: string
│   │   ├── createdAt: timestamp
│   │   └── lastLoginAt: timestamp
│   │
│   └── spiżarnie/{spiżarniaId} -> ODNIESIENIE
│       ├── role: "owner" | "member" | "viewer"
│       └── joinedAt: timestamp
│
├── spiżarnie/{spiżarniaId}
│   ├── metadata
│   │   ├── nazwa: string ("Domowa spiżarnia", "Spiżarnia w pracy")
│   │   ├── opis?: string
│   │   ├── typ: "osobista" | "wspólna"
│   │   ├── właściciel: userId
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   ├── ikona?: string (emoji lub URL)
│   │   └── ustawienia
│   │       ├── powiadomieniaOWażności: boolean
│   │       ├── dziPrzedWażnością: number (default: 3)
│   │       └── publicznaWidoczność: boolean
│   │
│   ├── członkowie/{userId}
│   │   ├── role: "owner" | "admin" | "member" | "viewer"
│   │   ├── joinedAt: timestamp
│   │   ├── invitedBy: userId
│   │   └── permissions
│   │       ├── canAdd: boolean
│   │       ├── canEdit: boolean
│   │       ├── canDelete: boolean
│   │       └── canInvite: boolean
│   │
│   └── produkty/{produktId}
│       ├── nazwa: string
│       ├── kategoria: string
│       ├── podkategoria?: string
│       ├── ilość: number
│       ├── jednostka: string ("szt", "kg", "l", "g", "ml")
│       ├── dataWażności?: timestamp
│       ├── dataDodania: timestamp
│       ├── dataModyfikacji: timestamp
│       ├── dodanePrzez: userId
│       ├── zmodyfikowanePrzez?: userId
│       ├── lokalizacja?: string ("lodówka", "zamrażarka", "szafka")
│       ├── obrazek?: string (URL)
│       ├── kodKreskowy?: string
│       ├── notatki?: string
│       ├── cena?: number
│       ├── sklep?: string
│       └── status: "dostępny" | "wykorzystany" | "przeterminowany"

└── zaproszenia/{zaproszenieId}
    ├── spiżarniaId: string
    ├── zapraszający: userId
    ├── email: string
    ├── role: string
    ├── status: "pending" | "accepted" | "rejected" | "expired"
    ├── createdAt: timestamp
    ├── expiresAt: timestamp
    └── token: string (do weryfikacji)
```

## 🎯 Przykłady użycia:

### 📱 Pobieranie spiżarni użytkownika:
```typescript
// 1. Pobranie listy spiżarni użytkownika
const userSpizarnie = await getDocs(
  collection(db, 'users', userId, 'spiżarnie')
);

// 2. Dla każdej spiżarni pobranie metadanych
const spizarniaRef = doc(db, 'spiżarnie', spizarniaId);
const spizarniaData = await getDoc(spizarniaRef);
```

### 🛒 Pobieranie produktów z konkretnej spiżarni:
```typescript
const produktyRef = collection(db, 'spiżarnie', spizarniaId, 'produkty');
const produktySnapshot = await getDocs(
  query(produktyRef, 
    where('status', '==', 'dostępny'),
    orderBy('dataWażności', 'asc')
  )
);
```

### 👥 Udostępnianie spiżarni:
```typescript
// 1. Tworzenie zaproszenia
await addDoc(collection(db, 'zaproszenia'), {
  spiżarniaId,
  zapraszający: currentUserId,
  email: inviteEmail,
  role: 'member',
  status: 'pending',
  createdAt: serverTimestamp(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dni
  token: generateSecureToken()
});
```

## 🔒 Zasady bezpieczeństwa (Firestore Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Użytkownicy mogą czytać/pisać tylko swoje dane
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Spiżarnie - tylko członkowie mogą je widzieć
    match /spiżarnie/{spizarniaId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)/spiżarnie/$(spizarniaId));
      
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/spiżarnie/$(spizarniaId)/członkowie/$(request.auth.uid)).data.role in ['owner', 'admin'];
      
      // Produkty w spiżarni
      match /produkty/{produktId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/users/$(request.auth.uid)/spiżarnie/$(spizarniaId));
        
        allow create: if request.auth != null && 
          get(/databases/$(database)/documents/spiżarnie/$(spizarniaId)/członkowie/$(request.auth.uid)).data.permissions.canAdd == true;
        
        allow update, delete: if request.auth != null && 
          (resource.data.dodanePrzez == request.auth.uid || 
           get(/databases/$(database)/documents/spiżarnie/$(spizarniaId)/członkowie/$(request.auth.uid)).data.permissions.canEdit == true);
      }
      
      // Członkowie spiżarni
      match /członkowie/{userId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/users/$(request.auth.uid)/spiżarnie/$(spizarniaId));
        
        allow write: if request.auth != null && 
          get(/databases/$(database)/documents/spiżarnie/$(spizarniaId)/członkowie/$(request.auth.uid)).data.role in ['owner', 'admin'];
      }
    }
  }
}
```

## 📋 Kategorie produktów:

```typescript
export const KATEGORIE = {
  NABIAŁ: {
    nazwa: 'Nabiał',
    ikona: '🥛',
    podkategorie: ['Mleko', 'Ser', 'Jogurt', 'Masło', 'Śmietana']
  },
  MIĘSO: {
    nazwa: 'Mięso i ryby',
    ikona: '🥩',
    podkategorie: ['Wołowina', 'Wieprzowina', 'Drób', 'Ryby', 'Wędliny']
  },
  WARZYWA: {
    nazwa: 'Warzywa',
    ikona: '🥕',
    podkategorie: ['Warzywa świeże', 'Warzywa mrożone', 'Warzywa konserwowe']
  },
  OWOCE: {
    nazwa: 'Owoce',
    ikona: '🍎',
    podkategorie: ['Owoce świeże', 'Owoce mrożone', 'Owoce suszone']
  },
  NAPOJE: {
    nazwa: 'Napoje',
    ikona: '🥤',
    podkategorie: ['Woda', 'Soki', 'Napoje gazowane', 'Alkohol']
  },
  INNE: {
    nazwa: 'Inne',
    ikona: '📦',
    podkategorie: ['Przyprawy', 'Sosy', 'Produkty sypkie', 'Słodycze']
  }
};
```

## 🚀 Korzyści tej architektury:

1. **Skalowalność** - łatwe dodawanie nowych spiżarni
2. **Współdzielenie** - rodzina może zarządzać wspólną spiżarnią
3. **Bezpieczeństwo** - tylko autoryzowane osoby mają dostęp
4. **Elastyczność** - różne role i uprawnienia
5. **Auditowanie** - śledzenie kto co dodał/zmienił
6. **Funkcjonalność** - powiadomienia, kategorie, lokalizacje
