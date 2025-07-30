# 📸 Konfiguracja Google Vision API dla Rozpoznawania Produktów

## 🚀 Szybki Start

### 1. **Utworzenie projektu w Google Cloud**
1. Idź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Google Cloud Vision API:
   - Idź do "APIs & Services" > "Library"
   - Znajdź "Cloud Vision API" 
   - Kliknij "Enable"

### 2. **Utworzenie klucza API**
1. Idź do "APIs & Services" > "Credentials"
2. Kliknij "Create Credentials" > "API Key"
3. Skopiuj wygenerowany klucz
4. **Opcjonalnie:** Ogranicz klucz do Cloud Vision API dla bezpieczeństwa

### 3. **Konfiguracja w aplikacji**
1. Utwórz plik `.env.local` w katalogu głównym projektu:
```bash
VITE_GOOGLE_VISION_API_KEY=your_api_key_here
```

2. Dodaj plik `.env.local` do `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

### 4. **Restart serwera deweloperskiego**
```bash
npm run dev
```

---

## 🔧 Aktualna Implementacja

### **Funkcje rozpoznawania:**
- ✅ **OCR (Optical Character Recognition)** - rozpoznawanie tekstu
- ✅ **Object Detection** - rozpoznawanie obiektów na obrazie
- ✅ **Label Detection** - identyfikacja elementów
- ✅ **Rozpoznawanie dat ważności** - wyciąganie dat z tekstu
- ✅ **Skanowanie paragonów** - parsowanie struktur paragonów
- ✅ **Mock dane** - symulowane wyniki podczas testów

### **Pliki implementacji:**
```
src/
  services/
    ImageRecognitionService.ts     # Główny serwis rozpoznawania
  components/
    ProductFromImage.tsx           # Komponent UI
  pages/
    ImageRecognitionDemo.tsx       # Strona demonstracyjna
```

---

## 🔍 API Endpoints Używane

### **1. Text Detection (OCR)**
```javascript
POST https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}

// Request body:
{
  "requests": [{
    "image": { "content": "base64_image_data" },
    "features": [
      { "type": "TEXT_DETECTION", "maxResults": 50 },
      { "type": "DOCUMENT_TEXT_DETECTION", "maxResults": 50 }
    ]
  }]
}
```

### **2. Object & Label Detection**
```javascript
POST https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}

// Request body:
{
  "requests": [{
    "image": { "content": "base64_image_data" },
    "features": [
      { "type": "OBJECT_LOCALIZATION", "maxResults": 20 },
      { "type": "LABEL_DETECTION", "maxResults": 20 }
    ]
  }]
}
```

---

## 📊 Cennik Google Vision API

### **Miesięczne limity bezpłatne:**
- **TEXT_DETECTION**: 1,000 żądań
- **OBJECT_LOCALIZATION**: 1,000 żądań  
- **LABEL_DETECTION**: 1,000 żądań

### **Ceny ponad limit:**
- **TEXT_DETECTION**: $1.50 za 1,000 żądań
- **OBJECT_LOCALIZATION**: $1.50 za 1,000 żądań
- **LABEL_DETECTION**: $1.50 za 1,000 żądań

💡 **Dla małej aplikacji bezpłatny limit powinien wystarczyć na długo!**

---

## 🧪 Testowanie bez API

Aplikacja zawiera **mock dane** które pozwalają na testowanie funkcjonalności bez klucza API:

```typescript
// W ImageRecognitionService.ts
if (!this.GOOGLE_VISION_API_KEY) {
  console.warn('Brak klucza Google Vision API - używam mock danych');
  return this.getMockOCRResults();
}
```

### **Mock dane zawierają:**
- Przykładowy tekst produktu: "MLEKO UHT 3.2%"
- Datę ważności: "15.08.2025"  
- Markę: "MLEKPOL"
- Kategorię: automatycznie przypisaną na podstawie nazwy

---

## 🔒 Bezpieczeństwo

### **1. Ograniczenie klucza API:**
W Google Cloud Console > Credentials > twój klucz API:
- **Application restrictions**: HTTP referrers
- **Website restrictions**: `https://yourdomain.com/*`
- **API restrictions**: Cloud Vision API

### **2. Zmienne środowiskowe:**
```bash
# .env.local (NIE commituj tego pliku!)
VITE_GOOGLE_VISION_API_KEY=your_secret_key

# .env.example (można commitować)
VITE_GOOGLE_VISION_API_KEY=your_api_key_here
```

### **3. Monitoring użycia:**
- Ustaw alerty w Google Cloud Console
- Monitoruj zużycie API w "APIs & Services" > "Dashboard"

---

## 🛠️ Rozwiązywanie problemów

### **Problem: "API Key not valid"**
```bash
# Sprawdź czy klucz jest poprawnie ustawiony
echo $VITE_GOOGLE_VISION_API_KEY

# Sprawdź czy Vision API jest włączone
# Google Cloud Console > APIs & Services > Library
```

### **Problem: CORS Error**
- Google Vision API nie obsługuje bezpośrednich żądań z przeglądarki
- Trzeba by stworzyć backend proxy lub użyć Firebase Functions
- **Obecnie używamy bezpośrednich żądań co może wymagać proxy w produkcji**

### **Problem: Słabe wyniki rozpoznawania**
```typescript
// Porady dla lepszych wyników:
// 1. Dobrej jakości zdjęcia (min 800x600px)
// 2. Dobra oświetlenie i kontrast
// 3. Tekst równolegle do krawędzi zdjęcia
// 4. Brak rozmycia i odbić
```

---

## 🚀 Następne kroki

### **Priorytet 1: Podstawowa integracja**
- [ ] Skonfigurować Google Vision API
- [ ] Przetestować rozpoznawanie na prawdziwych zdjęciach
- [ ] Dostroić algorytmy parsowania

### **Priorytet 2: UI i UX**
- [ ] Dodać rozpoznawanie do AddProductPage
- [ ] Ulepszyć feedback dla użytkownika
- [ ] Dodać opcje korekcji wyników

### **Priorytet 3: Optymalizacja**
- [ ] Cache wyników rozpoznawania
- [ ] Kompresja obrazów przed wysłaniem
- [ ] Offline fallback z lokalnymi algorytmami

### **Priorytet 4: Produkcja**
- [ ] Backend proxy dla Google Vision API
- [ ] Rate limiting i error handling
- [ ] Metrics i monitoring

---

## 📝 Przykłady użycia

### **1. Rozpoznawanie produktu mleka:**
```
Input: Zdjęcie kartonu mleka
Output: {
  productName: "Mleko UHT 3.2%",
  category: "Nabiał", 
  brand: "Mlekpol",
  expiryDate: "2025-08-15",
  confidence: 0.89
}
```

### **2. Skanowanie paragonu:**
```
Input: Zdjęcie paragonu z Biedronki
Output: {
  storeName: "Biedronka",
  date: "2025-07-30",
  items: [
    { name: "Chleb", price: 3.49, category: "Pieczywo" },
    { name: "Mleko", price: 4.99, category: "Nabiał" }
  ],
  total: 8.48
}
```

---

*Dokument utworzony: 30 lipca 2025*
*Ostatnia aktualizacja: 30 lipca 2025*
