# 🧪 Przewodnik Testowania - Rozpoznawanie Produktów z Obrazów

## 🎯 **Cel testowania:**
Przetestuj nową funkcjonalność rozpoznawania produktów z zdjęć i integrację z formularzem dodawania produktów.

---

## 🚀 **Aplikacja uruchomiona na:** 
**http://localhost:5177/**

---

## 📋 **SCENARIUSZE TESTOWE:**

### **🔐 1. Test Autoryzacji i Dostępu**
#### **Krok 1:** Sprawdź stronę powitalną
- [ ] Otwórz http://localhost:5177/
- [ ] Powinieneś zobaczyć stronę powitalną z przyciskiem "Zaloguj się"
- [ ] Kliknij "Zaloguj się"

#### **Krok 2:** Zaloguj się do aplikacji
- [ ] Wpisz email: `test@example.com`
- [ ] Wpisz hasło: `password123`
- [ ] Kliknij "Zaloguj" 
- [ ] Powinieneś zostać przekierowany do `/spiżarnie`

#### **Krok 3:** Sprawdź listę spiżarni
- [ ] Powinieneś zobaczyć co najmniej jedną spiżarnię (automatycznie utworzoną)
- [ ] Kliknij na spiżarnię aby przejść do listy produktów

---

### **📦 2. Test Głównej Funkcjonalności - Dodawanie Produktu**
#### **Krok 1:** Przejdź do formularza dodawania
- [ ] Z listy produktów kliknij przycisk **"+"** (dodaj produkt)
- [ ] Powinieneś być na stronie `/dodaj-produkt`
- [ ] Zobaczysz formularz z polami: nazwa, ilość, kategoria, etc.

#### **Krok 2:** Znajdź komponent rozpoznawania obrazów
- [ ] Przewiń w dół formularza
- [ ] Powinieneś zobaczyć sekcję **"📸 Rozpoznawanie z obrazu"**
- [ ] Zobaczysz 3 przyciski trybu:
  - **📦 Produkt** - rozpoznawanie pojedynczego produktu
  - **🧾 Paragon** - skanowanie paragonu
  - **📅 Data ważności** - wyciąganie dat ważności

---

### **🧪 3. Test Rozpoznawania Produktu**
#### **Krok 1:** Wybierz tryb "Produkt"
- [ ] Kliknij przycisk **"📦 Produkt"**
- [ ] Powinieneś zobaczyć opcje: "📷 Aparat" i "🖼️ Galeria"

#### **Krok 2:** Wybierz zdjęcie (testuj z galerią)
- [ ] Kliknij **"🖼️ Galeria"** 
- [ ] Wybierz dowolne zdjęcie z komputera (może być screenshot produktu)
- [ ] Zobaczysz podgląd wybranego obrazu

#### **Krok 3:** Rozpocznij rozpoznawanie
- [ ] Kliknij **"🔍 Rozpoznaj"**
- [ ] Zobaczysz loading spinner "Rozpoznawanie..."
- [ ] Po chwili zobaczysz rezultat (używane są mock dane):

**Przykładowe rezultaty mock:**
```
📦 Rozpoznany produkt:
Nazwa: Mleko UHT 3.2%
Kategoria: NABIAŁ  
Marka: Łaciate
Data ważności: 15.08.2025
```

#### **Krok 4:** Edytuj dane (opcjonalnie)
- [ ] Zobaczysz przycisk **"✏️ Edytuj"**
- [ ] Kliknij aby otworzyć dialog edycji
- [ ] Możesz zmienić nazwę, kategorię, markę
- [ ] Kliknij **"Zapisz"** aby zaakceptować zmiany

#### **Krok 5:** Zastosuj do formularza
- [ ] Kliknij **"✅ Użyj tych danych"**
- [ ] **MAGIA!** - formularz powyżej powinien się automatycznie wypełnić:
  - **Nazwa produktu:** "Mleko UHT 3.2%"
  - **Kategoria:** "🥛 NABIAŁ"
  - **Marka:** "Łaciate"
  - **Data ważności:** "2025-08-15"

---

### **🧾 4. Test Skanowania Paragonu**
#### **Krok 1:** Wyczyść formularz i wybierz tryb "Paragon"
- [ ] Odśwież stronę (aby wyczyścić formularz)
- [ ] Kliknij **"🧾 Paragon"**
- [ ] Wybierz dowolne zdjęcie jako paragon

#### **Krok 2:** Zobacz rezultaty skanowania
Mock dane pokaże coś takiego:
```
🧾 Zeskanowany paragon:
Sklep: Żabka Polska
📦 Produkty:
• Mleko Łaciate 2L - 4.99 zł
• Chleb żytni - 3.50 zł  
• Masło ekstra - 6.20 zł
💰 Suma: 14.69 zł
```

#### **Krok 3:** Wybierz produkty
- [ ] Zobaczysz listę produktów z checkboxami
- [ ] Zaznacz które produkty chcesz dodać do spiżarni
- [ ] Kliknij **"➕ Dodaj wybrane"**

---

### **📅 5. Test Rozpoznawania Daty Ważności**
#### **Krok 1:** Wybierz tryb "Data ważności"
- [ ] Kliknij **"📅 Data ważności"**
- [ ] Wybierz zdjęcie z datą (może być screenshot)

#### **Krok 2:** Zobacz wynik
Mock pokaże przykład:
```
📅 Znaleziona data ważności:
Data: 2025-09-15
Format: DD.MM.YYYY
Zaufanie: 85%
```

#### **Krok 3:** Zastosuj datę
- [ ] Kliknij **"✅ Użyj tej daty"**
- [ ] Pole "Data ważności" w formularzu powinno się wypełnić

---

### **💾 6. Test Zapisu Produktu**
#### **Krok 1:** Uzupełnij pozostałe pola
- [ ] Sprawdź czy formularz jest wypełniony danymi z rozpoznawania
- [ ] Uzupełnij brakujące pola (ilość, jednostka, lokalizacja)
- [ ] Sprawdź poprawność kategorii

#### **Krok 2:** Zapisz produkt
- [ ] Kliknij **"💾 Dodaj Produkt"** na dole strony
- [ ] Powinieneś zobaczyć komunikat sukcesu
- [ ] Zostaniesz przekierowany do listy produktów
- [ ] **Nowy produkt powinien pojawić się na liście!**

---

### **🎮 7. Test Strony Demo**
#### **Krok 1:** Otwórz stronę demo
- [ ] Przejdź do **Ustawienia** (dolna nawigacja)
- [ ] Znajdź sekcję "Narzędzia deweloperskie"  
- [ ] Kliknij **"📸 Demo rozpoznawania obrazów"**
- [ ] Zostaniesz przekierowany do `/demo-rozpoznawanie`

#### **Krok 2:** Przetestuj wszystkie tryby
- [ ] **Demo ma te same 3 tryby** ale z dodatkowymi informacjami:
  - Historia rozpoznanych produktów
  - Statystyki sukcesu/błędów
  - Debug informacje
- [ ] Przetestuj każdy tryb ponownie
- [ ] Sprawdź czy historia się zapisuje

---

## 🎯 **CO SPRAWDZAĆ:**

### ✅ **Funkcjonalności które POWINNY działać:**
- [x] **Auto-fill formularza** - dane z rozpoznawania wypełniają pola
- [x] **3 tryby rozpoznawania** - produkt, paragon, data ważności  
- [x] **Mock dane** - realistyczne przykłady produktów polskich
- [x] **Edycja przed zapisem** - możliwość poprawki danych AI
- [x] **Responsive design** - działa na mobile i desktop
- [x] **Loading states** - wskaźniki postępu podczas przetwarzania
- [x] **Error handling** - graceful degradation przy błędach

### ✅ **UX które POWINNO być intuicyjne:**
- [x] **Wyraźne przyciski** - łatwe rozpoznanie funkcji
- [x] **Visual feedback** - natychmiastowa reakcja na kliknięcia
- [x] **Ikony kategorii** - 🥛 dla nabiału, 🥩 dla mięsa, etc.
- [x] **Podgląd obrazu** - widzisz co wysyłasz do rozpoznawania
- [x] **Potwierdzenia** - możliwość sprawdzenia przed zastosowaniem

---

## 🐛 **PROBLEMY do zgłaszania:**

### **Jeśli coś NIE działa:**
1. **Sprawdź konsolę przeglądarki** (F12 → Console)
2. **Zrób screenshot** błędu
3. **Opisz kroki** które doprowadziły do błędu
4. **Sprawdź** czy serwer jeszcze działa (Terminal w VS Code)

### **Typowe problemy i rozwiązania:**
- **"Nie mogę się zalogować"** → Sprawdź czy używasz `test@example.com` / `password123`
- **"Formularz się nie wypełnia"** → Sprawdź konsolę, mogą być błędy JavaScript
- **"Zdjęcie się nie ładuje"** → Spróbuj mniejszy plik obrazu
- **"Serwer nie odpowiada"** → Sprawdź terminal, może trzeba restart `npm run dev`

---

## 🎉 **SUKCES = Udało się dodać produkt używając rozpoznawania obrazu!**

**Cel osiągnięty gdy:**
1. ✅ Wybrałeś zdjęcie produktu
2. ✅ System rozpoznał dane (mock)
3. ✅ Formularz się auto-wypełnił  
4. ✅ Zapisałeś produkt do spiżarni
5. ✅ Produkt pojawił się na liście

---

## 🚀 **NASTĘPNE KROKI (dla ciekawskich):**

### **A. Konfiguracja prawdziwego Google Vision API:**
- Przeczytaj `GOOGLE_VISION_SETUP.md`
- Uzyskaj klucze API od Google Cloud
- Zastąp mock dane prawdziwymi rezultatami OCR

### **B. Testowanie mobilne:**
- Otwórz aplikację na telefonie: `http://[TWÓJ-IP]:5177/`
- Przetestuj z prawdziwym aparatem telefonu
- Sprawdź responsywność na mniejszych ekranach

### **C. Optymalizacja performance:**
- Test z większymi obrazami
- Sprawdź czasy ładowania
- Przetestuj przy słabym internecie

---

*Miłego testowania! 🧪📱*  
*W razie problemów - sprawdź konsolę przeglądarki i terminal VS Code*
