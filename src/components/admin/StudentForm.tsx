import React, { useState, useRef } from 'react';
import type { Aluno, Polo, TipoDocumento } from '../../types/database';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Calendar,
  FileText,
  Save,
  X,
  Users,
  Plus,
  Trash2,
  Heart
} from 'lucide-react';

interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Saude {
  alergias: string;
  medicamentos: string;
  doencas_cronicas: string;
  plano_saude: string;
  hospital_preferencia: string;
  autorizacao_medica: boolean;
}

interface StudentFormProps {
  student?: Aluno | null;
  polos: Polo[];
  onSave: (studentData: Partial<Aluno> & {
    endereco: Endereco;
    saude: Saude;
    foto?: string | null;
    documentos: { url: string; name: string; tipo: TipoDocumento }[];
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  polos,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: student?.nome || '',
    data_nascimento: student?.data_nascimento || '',
    sexo: student?.sexo || 'M' as 'M' | 'F',
    cpf: student?.cpf || '',
    rg: student?.rg || '',
    naturalidade: student?.naturalidade || '',
    nacionalidade: student?.nacionalidade || 'Brasileira',
    
    // Endereço
    cep: student?.endereco?.cep || '',
    rua: student?.endereco?.rua || '',
    numero: student?.endereco?.numero || '',
    complemento: student?.endereco?.complemento || '',
    bairro: student?.endereco?.bairro || '',
    cidade: student?.endereco?.cidade || '',
    estado: student?.endereco?.estado || 'TO',
    
    // Contato
    telefone: student?.telefone || '',
    celular: student?.celular || '',
    email: student?.email || '',
    
    // Dados Acadêmicos
    polo_id: student?.polo_id || '',
    nivel_id: student?.nivel_id || '',
    turma_id: student?.turma_id || '',
    data_matricula: student?.data_matricula || new Date().toISOString().split('T')[0],
    status: student?.status || 'ativo',
    
    // Responsáveis
    responsaveis: student?.responsaveis || [
      {
        nome: '',
        tipo_parentesco: 'pai' as 'pai' | 'mae' | 'tutor' | 'outro',
        cpf: '',
        rg: '',
        telefone: '',
        celular: '',
        email: '',
        profissao: '',
        empresa: '',
        telefone_empresa: ''
      }
    ],
    
    // Saúde
    alergias: student?.saude?.alergias || '',
    medicamentos: student?.saude?.medicamentos || '',
    doencas_cronicas: student?.saude?.doencas_cronicas || '',
    plano_saude: student?.saude?.plano_saude || '',
    hospital_preferencia: student?.saude?.hospital_preferencia || '',
    autorizacao_medica: student?.saude?.autorizacao_medica || false,
    
    // Observações
    observacoes: student?.observacoes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; tipo: TipoDocumento }[]>([]);
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleResponsavelChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      responsaveis: prev.responsaveis.map((resp, i) => 
        i === index ? { ...resp, [field]: value } : resp
      )
    }));
  };

  const addResponsavel = () => {
    setFormData(prev => ({
      ...prev,
      responsaveis: [...prev.responsaveis, {
        nome: '',
        tipo_parentesco: 'pai' as 'pai' | 'mae' | 'tutor' | 'outro',
        cpf: '',
        rg: '',
        telefone: '',
        celular: '',
        email: '',
        profissao: '',
        empresa: '',
        telefone_empresa: ''
      }]
    }));
  };

  const removeResponsavel = (index: number) => {
    if (formData.responsaveis.length > 1) {
      setFormData(prev => ({
        ...prev,
        responsaveis: prev.responsaveis.filter((_, i) => i !== index)
      }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aqui você faria o upload da foto
      // Por agora, vamos apenas criar uma preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setStudentPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (files: { url: string; name: string; tipo: TipoDocumento }[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.data_nascimento) newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
    if (!formData.rua.trim()) newErrors.rua = 'Rua é obrigatória';
    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.polo_id) newErrors.polo_id = 'Polo é obrigatório';

    // Validar responsáveis
    formData.responsaveis.forEach((resp, index) => {
      if (!resp.nome.trim()) newErrors[`responsavel_${index}_nome`] = 'Nome do responsável é obrigatório';
      if (!resp.cpf.trim()) newErrors[`responsavel_${index}_cpf`] = 'CPF do responsável é obrigatório';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const studentData = {
      ...formData,
      foto: studentPhoto,
      documentos: uploadedFiles,
      endereco: {
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado
      },
      saude: {
        alergias: formData.alergias,
        medicamentos: formData.medicamentos,
        doencas_cronicas: formData.doencas_cronicas,
        plano_saude: formData.plano_saude,
        hospital_preferencia: formData.hospital_preferencia,
        autorizacao_medica: formData.autorizacao_medica
      }
    };

    onSave(studentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {student ? 'Editar Aluno' : 'Nova Ficha de Aluno'}
                </h2>
                <p className="text-red-100">
                  {student ? 'Atualize os dados do aluno' : 'Preencha todos os dados do novo aluno'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-white hover:bg-red-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Foto do Aluno */}
          <Card className="border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <Camera className="h-5 w-5 mr-2 text-red-600" />
                Foto do Aluno
              </h3>
            </div>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-300">
                  {studentPhoto ? (
                    <img 
                      src={studentPhoto} 
                      alt="Foto do aluno" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-red-600 text-white hover:bg-red-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Formatos aceitos: JPG, PNG</p>
                <p>Tamanho máximo: 5MB</p>
                <p>A foto será exibida na ficha do aluno</p>
              </div>
            </div>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-red-600" />
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Nome Completo *"
                value={formData.nome}
                onChange={(value) => handleInputChange('nome', value)}
                error={errors.nome}
                placeholder="Nome completo do aluno"
              />
              <Input
                label="Data de Nascimento *"
                type="date"
                value={formData.data_nascimento}
                onChange={(value) => handleInputChange('data_nascimento', value)}
                error={errors.data_nascimento}
              />
              <Select
                label="Sexo *"
                value={formData.sexo}
                onChange={(value) => handleInputChange('sexo', value)}
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' },
                ]}
              />
              <Input
                label="CPF *"
                value={formData.cpf}
                onChange={(value) => handleInputChange('cpf', value)}
                error={errors.cpf}
                placeholder="000.000.000-00"
              />
              <Input
                label="RG"
                value={formData.rg}
                onChange={(value) => handleInputChange('rg', value)}
                placeholder="RG sem dígitos"
              />
              <Input
                label="Naturalidade"
                value={formData.naturalidade}
                onChange={(value) => handleInputChange('naturalidade', value)}
                placeholder="Cidade de nascimento"
              />
              <Input
                label="Nacionalidade"
                value={formData.nacionalidade}
                onChange={(value) => handleInputChange('nacionalidade', value)}
              />
            </div>
          </Card>

          {/* Endereço */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="CEP *"
                value={formData.cep}
                onChange={(value) => handleInputChange('cep', value)}
                error={errors.cep}
                placeholder="00000-000"
              />
              <Input
                label="Rua *"
                value={formData.rua}
                onChange={(value) => handleInputChange('rua', value)}
                error={errors.rua}
                placeholder="Nome da rua"
              />
              <Input
                label="Número *"
                value={formData.numero}
                onChange={(value) => handleInputChange('numero', value)}
                error={errors.numero}
                placeholder="Nº"
              />
              <Input
                label="Complemento"
                value={formData.complemento}
                onChange={(value) => handleInputChange('complemento', value)}
                placeholder="Apto, Casa, etc."
              />
              <Input
                label="Bairro *"
                value={formData.bairro}
                onChange={(value) => handleInputChange('bairro', value)}
                error={errors.bairro}
              />
              <Input
                label="Cidade *"
                value={formData.cidade}
                onChange={(value) => handleInputChange('cidade', value)}
                error={errors.cidade}
              />
              <Select
                label="Estado *"
                value={formData.estado}
                onChange={(value) => handleInputChange('estado', value)}
                options={[
                  { value: 'TO', label: 'Tocantins' },
                  { value: 'AC', label: 'Acre' },
                  { value: 'AL', label: 'Alagoas' },
                  { value: 'AP', label: 'Amapá' },
                  { value: 'AM', label: 'Amazonas' },
                  { value: 'BA', label: 'Bahia' },
                  { value: 'CE', label: 'Ceará' },
                  { value: 'DF', label: 'Distrito Federal' },
                  { value: 'ES', label: 'Espírito Santo' },
                  { value: 'GO', label: 'Goiás' },
                  { value: 'MA', label: 'Maranhão' },
                  { value: 'MT', label: 'Mato Grosso' },
                  { value: 'MS', label: 'Mato Grosso do Sul' },
                  { value: 'MG', label: 'Minas Gerais' },
                  { value: 'PA', label: 'Pará' },
                  { value: 'PB', label: 'Paraíba' },
                  { value: 'PR', label: 'Paraná' },
                  { value: 'PE', label: 'Pernambuco' },
                  { value: 'PI', label: 'Piauí' },
                  { value: 'RJ', label: 'Rio de Janeiro' },
                  { value: 'RN', label: 'Rio Grande do Norte' },
                  { value: 'RS', label: 'Rio Grande do Sul' },
                  { value: 'RO', label: 'Rondônia' },
                  { value: 'RR', label: 'Roraima' },
                  { value: 'SC', label: 'Santa Catarina' },
                  { value: 'SP', label: 'São Paulo' },
                  { value: 'SE', label: 'Sergipe' }
                ]}
              />
            </div>
          </Card>

          {/* Contato */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-red-600" />
              Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Telefone *"
                value={formData.telefone}
                onChange={(value) => handleInputChange('telefone', value)}
                error={errors.telefone}
                placeholder="(63) 0000-0000"
              />
              <Input
                label="Celular"
                value={formData.celular}
                onChange={(value) => handleInputChange('celular', value)}
                placeholder="(63) 90000-0000"
              />
              <Input
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </Card>

          {/* Dados Acadêmicos */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              Dados Acadêmicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Polo *"
                value={formData.polo_id}
                onChange={(value) => handleInputChange('polo_id', value)}
                error={errors.polo_id}
                options={polos.map(polo => ({ value: polo.id, label: polo.nome }))}
              />
              <Input
                label="Data da Matrícula"
                type="date"
                value={formData.data_matricula}
                onChange={(value) => handleInputChange('data_matricula', value)}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'ativo', label: 'Ativo' },
                  { value: 'inativo', label: 'Inativo' },
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'concluido', label: 'Concluído' }
                ]}
              />
            </div>
          </Card>

          {/* Responsáveis */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-red-600" />
                Responsáveis
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResponsavel}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Responsável
              </Button>
            </div>
            
            {formData.responsaveis.map((responsavel, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Responsável {index + 1}</h4>
                  {formData.responsaveis.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsavel(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Nome Completo *"
                    value={responsavel.nome}
                    onChange={(value) => handleResponsavelChange(index, 'nome', value)}
                    error={errors[`responsavel_${index}_nome`]}
                    placeholder="Nome do responsável"
                  />
                  <Select
                    label="Parentesco *"
                    value={responsavel.tipo_parentesco}
                    onChange={(value) => handleResponsavelChange(index, 'tipo_parentesco', value)}
                    options={[
                      { value: 'pai', label: 'Pai' },
                      { value: 'mae', label: 'Mãe' },
                      { value: 'tutor', label: 'Tutor' },
                      { value: 'outro', label: 'Outro' }
                    ]}
                  />
                  <Input
                    label="CPF *"
                    value={responsavel.cpf}
                    onChange={(value) => handleResponsavelChange(index, 'cpf', value)}
                    error={errors[`responsavel_${index}_cpf`]}
                    placeholder="000.000.000-00"
                  />
                  <Input
                    label="RG"
                    value={responsavel.rg}
                    onChange={(value) => handleResponsavelChange(index, 'rg', value)}
                    placeholder="RG sem dígitos"
                  />
                  <Input
                    label="Telefone"
                    value={responsavel.telefone}
                    onChange={(value) => handleResponsavelChange(index, 'telefone', value)}
                    placeholder="(63) 0000-0000"
                  />
                  <Input
                    label="Celular"
                    value={responsavel.celular}
                    onChange={(value) => handleResponsavelChange(index, 'celular', value)}
                    placeholder="(63) 90000-0000"
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    value={responsavel.email}
                    onChange={(value) => handleResponsavelChange(index, 'email', value)}
                    placeholder="email@exemplo.com"
                  />
                  <Input
                    label="Profissão"
                    value={responsavel.profissao}
                    onChange={(value) => handleResponsavelChange(index, 'profissao', value)}
                    placeholder="Profissão"
                  />
                  <Input
                    label="Empresa"
                    value={responsavel.empresa}
                    onChange={(value) => handleResponsavelChange(index, 'empresa', value)}
                    placeholder="Nome da empresa"
                  />
                  <Input
                    label="Telefone Empresa"
                    value={responsavel.telefone_empresa}
                    onChange={(value) => handleResponsavelChange(index, 'telefone_empresa', value)}
                    placeholder="(63) 0000-0000"
                  />
                </div>
              </div>
            ))}
          </Card>

          {/* Saúde */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Informações de Saúde
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Alergias"
                value={formData.alergias}
                onChange={(value) => handleInputChange('alergias', value)}
                placeholder="Descreva as alergias"
                multiline
              />
              <Input
                label="Medicamentos em uso"
                value={formData.medicamentos}
                onChange={(value) => handleInputChange('medicamentos', value)}
                placeholder="Medicamentos que o aluno toma regularmente"
                multiline
              />
              <Input
                label="Doenças crônicas"
                value={formData.doencas_cronicas}
                onChange={(value) => handleInputChange('doencas_cronicas', value)}
                placeholder="Doenças crônicas ou condições especiais"
                multiline
              />
              <Input
                label="Plano de saúde"
                value={formData.plano_saude}
                onChange={(value) => handleInputChange('plano_saude', value)}
                placeholder="Nome do plano e número da carteirinha"
              />
              <Input
                label="Hospital de preferência"
                value={formData.hospital_preferencia}
                onChange={(value) => handleInputChange('hospital_preferencia', value)}
                placeholder="Hospital em caso de emergência"
              />
            </div>
          </Card>

          {/* Documentos */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              Documentos
            </h3>
            <FileUpload
              onFilesUploaded={handleFileUpload}
              acceptedTypes={['pdf', 'jpg', 'jpeg', 'png']}
              maxFiles={10}
              maxSize={5}
              label="Upload de Documentos"
              description="Envie os documentos do aluno (certidão de nascimento, comprovante de residência, etc.)"
              folder={`alunos/${formData.cpf || 'sem-cpf'}`}
            />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Documentos enviados:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">{file.tipo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Observações */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              Observações
            </h3>
            <Input
              label="Observações gerais"
              value={formData.observacoes}
              onChange={(value) => handleInputChange('observacoes', value)}
              placeholder="Informações adicionais sobre o aluno"
              multiline
              rows={4}
            />
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="min-w-[150px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {student ? 'Salvar Alterações' : 'Cadastrar Aluno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
