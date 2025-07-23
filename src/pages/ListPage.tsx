import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { User } from 'firebase/auth';

// Zaktualizowany interfejs Product, aby pasował do nazw pól w Firestore
interface Product {
  id: string; // Id dokumentu produktu
  Nazwa: string; // Pole Nazwa z dużej litery
  Kategoria: string; // Pole Kategoria z dużej litery
  DataWaznosci?: any; // Zakładamy, że DataWaznosci jest opcjonalne i może mieć różną nazwę/typ
  Ilość?: number; // Pole Ilość z dużej litery (opcjonalne)
  ilosc?: number; // Pole ilosc z małej litery (opcjonalne)
  notatki?: string;
}

const ListPage: React.FC = () => {
  console.log('ListPage: Komponent załadowany');

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ListPage: useEffect uruchomiony');
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log('ListPage: Zmiana stanu uwierzytelnienia. Aktualny użytkownik:', currentUser);
      setUser(currentUser);
      if (currentUser) {
        console.log('ListPage: Użytkownik zalogowany. UID:', currentUser.uid);
        fetchProducts();
      } else {
        console.log('ListPage: Użytkownik wylogowany.');
        setProducts([]); // Czyścimy produkty przy wylogowaniu
        setLoading(false); // Zakończ ładowanie przy wylogowaniu (jeśli było aktywne)
      }
    });

    // Czyszczenie subskrypcji przy odmontowaniu komponentu
    return () => {
        console.log('ListPage: Czyszczenie subskrypcji onAuthStateChanged');
        unsubscribe();
    };
  }, []); // Pusta tablica zależności oznacza, że ten efekt uruchomi się tylko raz po zamontowaniu

  // Funkcja pobierająca produkty z Firestore
  const fetchProducts = async () => {
    console.log('ListPage: fetchProducts uruchomiona');
    setLoading(true);
    setError(null);

    try {
      // Tworzymy odniesienie do podkolekcji Produkty w dokumencie TRTsaE927TmGu0ZmQw6dt w kolekcji store
      const productsCollectionRef = collection(db, 'store', 'TRTsaE927TmGu0ZmQw6dt', 'Produkty'); // Sprawdź ID dokumentu i nazwę podkolekcji w konsoli!
      console.log('ListPage: Odniesienie do kolekcji Produkty utworzone:', productsCollectionRef);

      const productsSnapshot = await getDocs(productsCollectionRef);
      console.log('ListPage: Zrzut danych z Firestore pobrany:', productsSnapshot);

      const productsList = productsSnapshot.docs.map(doc => {
        const data = doc.data(); // Pobieramy wszystkie dane dokumentu
        console.log('ListPage: Dane dokumentu:', data); // Logujemy dane dokumentu
        return ({
          id: doc.id,
          // Mapujemy pola z dokładnymi nazwami z Firestore (z dużej litery)
          Nazwa: data.Nazwa, // Używamy Nazwa
          Kategoria: data.Kategoria, // Używamy Kategoria
          Ilość: data.Ilość, // Spróbujemy Ilość z dużej
          ilosc: data.ilosc, // Spróbujemy ilosc z małej
          DataWaznosci: data.DataWaznosci, // Dodajemy DataWaznosci
          notatki: data.notatki, // Dodajemy notatki
        }) as Product; // Rzutowanie na zaktualizowany typ Product
      });

      console.log('ListPage: Dane produktów przetworzone:', productsList);

      setProducts(productsList);
      console.log('ListPage: Stan productsList po setProducts:', productsList); // Logujemy productsList po setProducts

      setLoading(false);
      console.log('ListPage: Stan produktów zaktualizowany, ładowanie zakończone.');

    } catch (err: any) {
      console.error('ListPage: Błąd podczas pobierania produktów:', err);
      setError('Wystąpił błąd podczas ładowania produktów.');
      setLoading(false);
    }
  };

  // Renderowanie warunkowe w zależności od stanu
  if (loading) {
    console.log('ListPage: Renderowanie - Ładowanie...');
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Ładowanie produktów...</Typography>
      </Container>
    );
  }

  if (error) {
    console.log('ListPage: Renderowanie - Błąd:', error);
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

   if (!user) { // Sprawdzamy czy użytkownik jest zalogowany przed wyświetleniem danych
     console.log('ListPage: Renderowanie - Użytkownik niezalogowany.');
     return (
         <Container sx={{ mt: 4 }}>
           <Alert severity="warning">Musisz być zalogowany, aby zobaczyć tę stronę.</Alert>
         </Container>
       );
   }

  console.log('ListPage: Renderowanie - Lista produktów. Stan products:', products); // Logowanie stanu products przed renderowaniem listy
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Twoja Spiżarnia
      </Typography>
      {
        products.length === 0 ? (
          <Typography>Brak produktów w spiżarni.</Typography>
        ) : (
          <Box>
            {/* Mapujemy i wyświetlamy listę produktów */}
            {products.map(product => (
              <Box key={product.id} sx={{ border: '1px solid #ccc', p: 2, mb: 2 }}>
                <Typography variant="h6">{product.Nazwa}</Typography>
                {/* Poprawione wyświetlanie ilości: sprawdzamy oba warianty nazwy pola */}
                {product.Ilość !== undefined && <Typography>Ilość: {product.Ilość}</Typography>}
                {product.ilosc !== undefined && <Typography>Ilość: {product.ilosc}</Typography>}
                <Typography>Kategoria: {product.Kategoria}</Typography>
                {/* Możemy dodać więcej szczegółów, np. data ważności */}
                {product.DataWaznosci && <Typography>Data ważności: {product.DataWaznosci.toDate ? product.DataWaznosci.toDate().toLocaleDateString() : 'N/A'}</Typography>}
                {product.notatki && <Typography>Notatki: {product.notatki}</Typography>}
              </Box>
            ))}
          </Box>
        )
      }
    </Container>
  );
};

export default ListPage;
