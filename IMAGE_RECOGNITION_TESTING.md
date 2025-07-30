# 📸 Testowanie Rozpoznawania Produktów - Instrukcja

## 🚀 Uruchomienie Demo

### **1. Uruchom aplikację**
```bash
npm run dev
```

### **2. Przejdź do strony demo**
1. Zaloguj się do aplikacji
2. Przejdź do URL: `http://localhost:5173/demo-rozpoznawanie`
3. Lub dodaj link w nawigacji aplikacji

---

## 🧪 Scenariusze Testów

### **Test 1: Rozpoznawanie Produktu 🍎**
1. **Wybierz tryb:** "🍎 Produkt"
2. **Zrób zdjęcie:** Opakowania produktu z widoczną:
   - Nazwą produktu
   - Marką
   - Datą ważności
3. **Sprawdź wyniki:**
   - Nazwa produktu rozpoznana?
   - Kategoria przypisana automatycznie?
   - Marka wykryta?
   - Data ważności wyciągnięta?

**Dobre produkty do testów:**
- Kartony mleka z dużymi napisami
- Puszki napojów z wyraźnymi etykietami
- Opakowania z prostymi, kontrastowymi napisami

### **Test 2: Skanowanie Paragonu 🧾**
1. **Wybierz tryb:** "🧾 Paragon"
2. **Zrób zdjęcie:** Całego paragonu z:
   - Nazwą sklepu na górze
   - Listą produktów z cenami
   - Sumą na dole
3. **Sprawdź wyniki:**
   - Nazwa sklepu rozpoznana?
   - Produkty wyciągnięte z cenami?
   - Suma obliczona poprawnie?

### **Test 3: Data Ważności 📅**
1. **Wybierz tryb:** "📅 Data ważności"
2. **Zrób zdjęcie:** Etykiety z datą w formacie:
   - DD.MM.YYYY
   - DD/MM/YYYY
   - "ważny do DD.MM.YYYY"
3. **Sprawdź wyniki:**
   - Data poprawnie rozpoznana?
   - Format daty prawidłowy?

---

## 📊 Mock Dane vs Prawdziwe API

### **Bez Google Vision API (Mock):**
```typescript
// Przykładowe mock dane:
{
  productName: "MLEKO UHT 3.2%",
  category: "Nabiał",
  brand: "MLEKPOL", 
  expiryDate: "15.08.2025",
  confidence: 0.95
}
```

### **Z Google Vision API:**
1. Skonfiguruj API Key (patrz: `GOOGLE_VISION_SETUP.md`)
2. Prawdziwe rozpoznawanie z obrazów
3. Wyższe accuracy dla dobrych zdjęć

---

## 🔧 Debugging

### **Sprawdź Console Logger:**
```javascript
// W Developer Tools (F12):
console.log('Vision API Key:', process.env.VITE_GOOGLE_VISION_API_KEY);
```

### **Mock vs Real API:**
```typescript
// W ImageRecognitionService.ts:
if (!this.GOOGLE_VISION_API_KEY) {
  console.warn('Brak klucza Google Vision API - używam mock danych');
  return this.getMockOCRResults();
}
```

### **Network Tab:**
- Zobacz żądania do `vision.googleapis.com`
- Sprawdź czy API Key jest poprawny
- Sprawdź response codes (200 = OK, 403 = Auth error)

---

## 🎯 Kryteria Sukcesu

### **Podstawowe funkcje:**
- [ ] Upload zdjęć działa (aparat + galeria)
- [ ] Podgląd obrazu wyświetla się
- [ ] Mock dane działają bez API
- [ ] Dialog edycji produktu otwiera się
- [ ] Dane można zapisać
- [ ] Lista rozpoznanych produktów aktualizuje się

### **Z Google Vision API:**
- [ ] OCR rozpoznaje tekst z obrazów
- [ ] Algorytmy parsowania wyciągają produkty
- [ ] Daty ważności są poprawnie wykrywane
- [ ] Paragony są prawidłowo parsowane

### **UX/UI:**
- [ ] Responsive design na mobile
- [ ] Loading states podczas przetwarzania
- [ ] Error handling dla błędów API
- [ ] Intuicyjne przełączanie trybów

---

## 🚀 Następne Kroki

### **Po udanych testach:**
1. **Integracja z AddProductPage:**
   ```typescript
   // Dodaj komponent ProductFromImage do formularza
   <ProductFromImage 
     onProductRecognized={handleAutoFill}
   />
   ```

2. **Dodaj do nawigacji:**
   ```typescript
   // W AppBottomNavigation lub SettingsPage
   <ListItem onClick={() => navigate('/demo-rozpoznawanie')}>
     <ListItemIcon><CameraAlt /></ListItemIcon>
     <ListItemText primary="Rozpoznawanie obrazów" />
   </ListItem>
   ```

3. **Optymalizacja:**
   - Kompresja obrazów przed upload
   - Cache wyników rozpoznawania
   - Offline fallback

### **Problemy do rozwiązania:**
- **CORS Issues:** Google Vision API może wymagać backend proxy
- **Performance:** Duże obrazy mogą być wolne
- **Accuracy:** Dostrojenie algorytmów parsowania

---

## 📱 Mobile Testing

### **Na urządzeniu mobilnym:**
1. Otwórz `http://your-ip:5173/demo-rozpoznawanie`
2. Sprawdź funkcję aparatu
3. Test responsive UI
4. Sprawdź performance na wolniejszych urządzeniach

### **PWA Testing:**
1. Zainstaluj aplikację jako PWA
2. Sprawdź czy działa offline (mock dane)
3. Test notyfikacji i permissji aparatu

---

*Instrukcja utworzona: 30 lipca 2025*
*Dla wersji: Storeroom App v1.2.0*
