import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProduktService } from '../services/ProduktService';
import { SpizarniaService } from '../services/SpizarniaService';
import { Timestamp, deleteField } from 'firebase/firestore';
import type { ProduktStatus, Produkt } from '../types';

interface EditProductFormData {
  nazwa: string;
  kategoria: string;
  ilość: number;
  jednostka: string;
  dataWażności: string;
  lokalizacja: string;
  opis: string;
  status: ProduktStatus;
}

const getInitialFormData = (): EditProductFormData => ({
  nazwa: '',
  kategoria: 'Inne',
  ilość: 1,
  jednostka: 'szt' as const,
  dataWażności: '',
  lokalizacja: 'lodówka' as const,
  opis: '',
  status: 'dostępny' as ProduktStatus
});

export const useEditProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<EditProductFormData>(getInitialFormData());
  const [originalProduct, setOriginalProduct] = useState<Produkt | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spizarniaId, setSpizarniaId] = useState<string | null>(null);
  const [produktId, setProduktId] = useState<string | null>(null);
  const [spizarniaNazwa, setSpizarniaNazwa] = useState<string>('');

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!user?.uid) return;

      try {
        setLoadingProduct(true);
        setError(null);

        const urlSpizarniaId = searchParams.get('spizarnia');
        const urlProduktId = searchParams.get('id');
        
        if (!urlSpizarniaId || !urlProduktId) {
          setError('Brak wymaganych parametrów URL');
          return;
        }

        setSpizarniaId(urlSpizarniaId);
        setProduktId(urlProduktId);

        // Pobierz informacje o spiżarni
        const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
        const spizarnia = userSpizarnie.find(s => s.id === urlSpizarniaId);
        if (spizarnia) {
          setSpizarniaNazwa(spizarnia.metadata.nazwa);
        }

        // Pobierz produkt
        const produkty = await ProduktService.getProdukty(urlSpizarniaId, user.uid);
        const produkt = produkty.find(p => p.id === urlProduktId);
        
        if (!produkt) {
          setError('Nie znaleziono produktu');
          return;
        }

        setOriginalProduct(produkt);

        // Wypełnij formularz danymi produktu
        const formatDateForInput = (timestamp?: Timestamp) => {
          if (!timestamp) return '';
          const date = timestamp.toDate();
          return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        };

        setFormData({
          nazwa: produkt.nazwa,
          kategoria: produkt.kategoria,
          ilość: produkt.ilość,
          jednostka: produkt.jednostka,
          dataWażności: formatDateForInput(produkt.dataWażności),
          lokalizacja: produkt.lokalizacja || 'lodówka',
          opis: produkt.notatki || '',
          status: produkt.status
        });

      } catch (err) {
        console.error('Błąd ładowania produktu:', err);
        setError('Błąd podczas ładowania produktu');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [searchParams, user]);

  const handleInputChange = (field: keyof EditProductFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string | number } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'ilość' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!spizarniaId || !produktId || !user?.uid) {
      setError('Brak wymaganych danych do aktualizacji');
      return;
    }

    if (!formData.nazwa.trim()) {
      setError('Nazwa produktu jest wymagana');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Przygotuj dane do aktualizacji
      const dataWażności = formData.dataWażności ? new Date(formData.dataWażności) : null;
      
      const updatedData: Record<string, any> = {
        nazwa: formData.nazwa.trim(),
        kategoria: formData.kategoria,
        ilość: formData.ilość,
        jednostka: formData.jednostka as 'szt' | 'kg' | 'l' | 'g' | 'ml',
        lokalizacja: formData.lokalizacja as 'lodówka' | 'zamrażarka' | 'szafka',
        status: formData.status
      };

      // Obsługa daty ważności - dodaj lub usuń
      if (dataWażności) {
        updatedData.dataWażności = Timestamp.fromDate(dataWażności);
      } else if (originalProduct?.dataWażności) {
        // Jeśli produkt miał datę ważności, a teraz jest pusta - usuń pole
        updatedData.dataWażności = deleteField();
      }
      
      // Obsługa notatek - dodaj lub usuń
      if (formData.opis.trim()) {
        updatedData.notatki = formData.opis.trim();
      } else if (originalProduct?.notatki) {
        // Jeśli produkt miał notatki, a teraz są puste - usuń pole
        updatedData.notatki = deleteField();
      }

      // Aktualizuj produkt w Firestore
      console.log('EditProduct: Aktualizacja produktu:', produktId);
      console.log('EditProduct: Nowe dane:', updatedData);
      
      await ProduktService.updateProdukt(spizarniaId, produktId, user.uid, updatedData);

      // Przekieruj z powrotem do listy produktów  
      navigate(`/lista?spizarnia=${spizarniaId}`);

    } catch (err) {
      console.error('Błąd aktualizacji produktu:', err);
      if (err instanceof Error) {
        setError(`Błąd podczas aktualizacji produktu: ${err.message}`);
      } else {
        setError('Błąd podczas aktualizacji produktu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (spizarniaId) {
      navigate(`/lista?spizarnia=${spizarniaId}`);
    } else {
      navigate('/spiżarnie');
    }
  };

  const handleDelete = async () => {
    if (!spizarniaId || !produktId || !user?.uid) {
      setError('Brak wymaganych danych do usunięcia');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('EditProduct: Usuwanie produktu:', produktId);
      await ProduktService.deleteProdukt(spizarniaId, produktId, user.uid);

      // Przekieruj z powrotem do listy produktów  
      navigate(`/lista?spizarnia=${spizarniaId}`);

    } catch (err) {
      console.error('Błąd usuwania produktu:', err);
      if (err instanceof Error) {
        setError(`Błąd podczas usuwania produktu: ${err.message}`);
      } else {
        setError('Błąd podczas usuwania produktu');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.nazwa.trim().length > 0;

  return {
    formData,
    originalProduct,
    loading,
    loadingProduct,
    error,
    spizarniaNazwa,
    isFormValid,
    handleInputChange,
    handleSubmit,
    handleGoBack,
    handleDelete
  };
};
