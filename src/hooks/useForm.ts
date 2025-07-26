import { useState } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export const useForm = <T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof T) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string | number } }
  ) => {
    const value = event.target.value;
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    // Validate if validator provided
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could set a general error here
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  const setValue = (field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setError = (field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValue,
    setError
  };
};
