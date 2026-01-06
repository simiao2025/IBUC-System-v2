import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNavigationConfirm } from '../hooks/useNavigationConfirm';
import { StudentData } from '../types';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { User, Users, MapPin, Phone, Mail } from 'lucide-react';

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addStudent, hasUnsavedChanges, setHasUnsavedChanges } = useApp();
  const [formData, setFormData] = useState({
    // Student data
    name: '',
    birthDate: '',
    cpf: '',
    gender: '',
    phone: '',
    email: '',
    // Address
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    // Parents data
    fatherName: '',
    motherName: '',
    parentsPhone: '',
    parentsEmail: '',
    fatherCpf: '',
    motherCpf: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { showConfirm, dialogProps } = useNavigationConfirm({
    title: "Dados não salvos",
    message: "Você tem alterações não salvas. Deseja realmente sair sem salvar?",
    confirmText: "Sair sem salvar",
    cancelText: "Continuar editando",
    shouldConfirm: hasUnsavedChanges
  });

  // Detectar mudanças no formulário
  useEffect(() => {
    const hasData = Object.values(formData).some(value => value.trim() !== '');
    setHasUnsavedChanges(hasData);
  }, [formData, setHasUnsavedChanges]);

  // Interceptar navegação do browser (botão voltar, fechar aba, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedCPF = formatCPF(value);
    setFormData(prev => ({ ...prev, [name]: formattedCPF }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name) newErrors.name = 'Nome completo é obrigatório';
    if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.gender) newErrors.gender = 'Gênero é obrigatório';
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.email) newErrors.email = 'E-mail é obrigatório';
    if (!formData.cep) newErrors.cep = 'CEP é obrigatório';
    if (!formData.street) newErrors.street = 'Rua é obrigatória';
    if (!formData.number) newErrors.number = 'Número é obrigatório';
    if (!formData.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'Estado é obrigatório';
    if (!formData.fatherName) newErrors.fatherName = 'Nome do pai é obrigatório';
    if (!formData.motherName) newErrors.motherName = 'Nome da mãe é obrigatório';
    if (!formData.parentsPhone) newErrors.parentsPhone = 'Telefone dos responsáveis é obrigatório';
    if (!formData.parentsEmail) newErrors.parentsEmail = 'E-mail dos responsáveis é obrigatório';
    if (!formData.fatherCpf) newErrors.fatherCpf = 'CPF do pai é obrigatório';
    if (!formData.motherCpf) newErrors.motherCpf = 'CPF da mãe é obrigatório';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (formData.parentsEmail && !emailRegex.test(formData.parentsEmail)) {
      newErrors.parentsEmail = 'E-mail dos responsáveis inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const studentData: Partial<StudentData> = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      birthDate: formData.birthDate,
      cpf: formData.cpf,
      gender: formData.gender as 'male' | 'female' | 'other',
      phone: formData.phone,
      email: formData.email,
      address: {
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
      },
      parents: {
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        phone: formData.parentsPhone,
        email: formData.parentsEmail,
        fatherCpf: formData.fatherCpf,
        motherCpf: formData.motherCpf,
      }
    };

    addStudent(studentData);
    setHasUnsavedChanges(false);
    
    alert("Aluno cadastrado com sucesso!");
    
    setLoading(false);
    navigate('/matricula');
  };

  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' }
  ];

  const stateOptions = [
    { value: 'TO', label: 'Tocantins' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    // Add more states as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cadastro de Aluno
          </h1>
          <p className="text-lg text-gray-600">
            Preencha os dados do aluno e dos responsáveis para iniciar o processo de matrícula
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Data */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Dados do Aluno</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                />
              </div>
              
              <Input
                label="Data de Nascimento"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                error={errors.birthDate}
                required
              />
              
              <Input
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                error={errors.cpf}
                maxLength={14}
                required
              />
              
              <Select
                label="Gênero"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={genderOptions}
                error={errors.gender}
                required
              />
              
              <Input
                label="Telefone/WhatsApp"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                required
              />
              
              <div className="md:col-span-2">
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                error={errors.cep}
                required
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Rua"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  error={errors.street}
                  required
                />
              </div>
              
              <Input
                label="Número"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                error={errors.number}
                required
              />
              
              <Input
                label="Complemento"
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                error={errors.complement}
              />
              
              <Input
                label="Bairro"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                error={errors.neighborhood}
                required
              />
              
              <Input
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
                required
              />
              
              <Select
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                options={stateOptions}
                error={errors.state}
                required
              />
            </div>
          </Card>

          {/* Parents Data */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Dados dos Responsáveis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome do Pai"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                error={errors.fatherName}
                required
              />
              
              <Input
                label="Nome da Mãe"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                error={errors.motherName}
                required
              />
              
              <Input
                label="CPF do Pai"
                name="fatherCpf"
                value={formData.fatherCpf}
                onChange={handleCPFChange}
                error={errors.fatherCpf}
                maxLength={14}
                required
              />
              
              <Input
                label="CPF da Mãe"
                name="motherCpf"
                value={formData.motherCpf}
                onChange={handleCPFChange}
                error={errors.motherCpf}
                maxLength={14}
                required
              />
              
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <Input
                  label="Telefone/WhatsApp dos Responsáveis"
                  name="parentsPhone"
                  type="tel"
                  value={formData.parentsPhone}
                  onChange={handleInputChange}
                  error={errors.parentsPhone}
                  className="flex-1"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <Input
                  label="E-mail dos Responsáveis"
                  name="parentsEmail"
                  type="email"
                  value={formData.parentsEmail}
                  onChange={handleInputChange}
                  error={errors.parentsEmail}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="min-w-[200px]"
            >
              Avançar para Matrícula
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default StudentRegistration;