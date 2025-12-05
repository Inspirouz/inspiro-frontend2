import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import MainLogo from '@/assets/MainLogo.svg';
import PasswordInput from '@/components/PasswordInput';
import '@/styles/create-password.css';

interface CreatePasswordProps {
  onComplete: (password: string) => void;
}

const CreatePassword = ({ onComplete }: CreatePasswordProps) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Повторите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Add API call to set password
      console.log('Creating password:', formData.password);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete(formData.password);
    } catch (error) {
      setErrors({ password: 'Ошибка при создании пароля. Попробуйте снова.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-password">
      <img src={MainLogo} alt="MainLogo" className="create-password__logo" />
      <h2 className="create-password__title">Создайте новый пароль</h2>

      <form className="create-password__form" onSubmit={handleSubmit}>
        <PasswordInput
          label="Пароль"
          placeholder="Введите пароль"
          value={formData.password}
          onChange={(value) => {
            setFormData({ ...formData, password: value });
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          required
          error={errors.password}
        />

        <PasswordInput
          label="Повторите пароль"
          placeholder="Введите пароль повторно"
          value={formData.confirmPassword}
          onChange={(value) => {
            setFormData({ ...formData, confirmPassword: value });
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          required
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="create-password__button"
        >
          {isSubmitting ? 'Создание...' : 'Создать'}
        </button>
      </form>

      <p className="create-password__agreements">
        Нажимая кнопку, вы соглашаетесь с{' '}
        <Link to="/privacy">Политикой конфиденциальности</Link> и{' '}
        <Link to="/terms">Условиями использования</Link>
      </p>
    </div>
  );
};

export default CreatePassword;




