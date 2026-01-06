import React, { useEffect, useState, useRef } from 'react';
import type { Aluno, Polo, TipoDocumento } from '../../types/database';
import type { Nivel, Turma } from '../../types/database';
import { TurmaService } from '../../services/turma.service';
import { DocumentosAPI } from '../../services/documento.service';
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
  restricao_alimentar: string;
  medicacao_continua: string;
  doencas_cronicas: string;
  contato_emergencia_nome: string;
  contato_emergencia_telefone: string;
  convenio_medico: string;
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
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: student?.nome || '',
    data_nascimento: student?.data_nascimento || '',
    sexo: student?.sexo || 'M' as 'M' | 'F',
    cpf: student?.cpf || '',
    rg: student?.rg || '',
    rg_orgao: (student as any)?.rg_orgao || '',
    rg_data_expedicao: (student as any)?.rg_data_expedicao || '',
    naturalidade: student?.naturalidade || '',
    nacionalidade: student?.nacionalidade || 'Brasileira',
    nome_responsavel: (student as any)?.nome_responsavel || '',
    cpf_responsavel: (student as any)?.cpf_responsavel || '',
    telefone_responsavel: (student as any)?.telefone_responsavel || '',
    email_responsavel: (student as any)?.email_responsavel || '',
    tipo_parentesco: ((student as any)?.tipo_parentesco || 'pai') as 'pai' | 'mae' | 'tutor' | 'outro',
    nome_responsavel_2: (student as any)?.nome_responsavel_2 || '',
    cpf_responsavel_2: (student as any)?.cpf_responsavel_2 || '',
    telefone_responsavel_2: (student as any)?.telefone_responsavel_2 || '',
    email_responsavel_2: (student as any)?.email_responsavel_2 || '',
    tipo_parentesco_2: (student as any)?.tipo_parentesco_2 || '',
    
    // Endereço
    cep: student?.endereco?.cep || '',
    rua: student?.endereco?.rua || '',
    numero: student?.endereco?.numero || '',
    complemento: student?.endereco?.complemento || '',
    bairro: student?.endereco?.bairro || '',
    cidade: student?.endereco?.cidade || '',
    estado: student?.endereco?.estado || 'TO',
    
    // Contato
    telefone: (student as any)?.telefone_responsavel || '',
    celular: '',
    email: (student as any)?.email_responsavel || '',
    
    // Dados Acadêmicos
    polo_id: student?.polo_id || '',
    nivel_id: (student as any)?.nivel_atual_id || (student as any)?.nivel_id || '',
    turma_id: student?.turma_id || '',
    status: student?.status || 'ativo',

    escola_origem: (student as any)?.escola_origem || (student as any)?.escola_atual || '',
    ano_escolar: (student as any)?.ano_escolar || (student as any)?.serie || '',
    
    // Saúde (Try both flat and nested as backend varies)
    alergias: (student as any)?.alergias || student?.saude?.alergias || '',
    restricao_alimentar: (student as any)?.restricao_alimentar || student?.saude?.restricao_alimentar || '',
    medicacao_continua: (student as any)?.medicacao_continua || student?.saude?.medicacao_continua || '',
    doencas_cronicas: (student as any)?.doencas_cronicas || student?.saude?.doencas_cronicas || '',
    contato_emergencia_nome: (student as any)?.contato_emergencia_nome || student?.saude?.contato_emergencia_nome || '',
    contato_emergencia_telefone: (student as any)?.contato_emergencia_telefone || student?.saude?.contato_emergencia_telefone || '',
    convenio_medico: (student as any)?.convenio_medico || student?.saude?.convenio_medico || '',
    hospital_preferencia: (student as any)?.hospital_preferencia || student?.saude?.hospital_preferencia || '',
    autorizacao_medica: (student as any)?.autorizacao_medica || student?.saude?.autorizacao_medica || false,
    
    // Observações
    observacoes: student?.observacoes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; tipo: TipoDocumento }[]>([]);
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const carregarNiveis = async () => {
      try {
        const resp = await TurmaService.listarNiveis();
        setNiveis((resp as any) as Nivel[]);
      } catch (error) {
        console.error('Erro ao carregar níveis:', error);
        setNiveis([]);
      }
    };

    carregarNiveis();
  }, []);

  useEffect(() => {
    const carregarTurmas = async () => {
      if (!formData.polo_id) {
        setTurmas([]);
        return;
      }

      try {
        const normalize = (resp: any): Turma[] => {
          const lista = Array.isArray(resp) ? resp : resp?.data;
          return (Array.isArray(lista) ? lista : []) as Turma[];
        };

        const tryFetch = async (params: any): Promise<Turma[]> => {
          const resp = await TurmaService.listarTurmas(params);
          return normalize(resp);
        };

        const attempts: any[] = formData.nivel_id
          ? [
              { polo_id: formData.polo_id, nivel_id: formData.nivel_id, status: 'ativa' },
              { polo_id: formData.polo_id, nivel_id: formData.nivel_id },
              { polo_id: formData.polo_id, status: 'ativa' },
              { polo_id: formData.polo_id },
            ]
          : [
              { polo_id: formData.polo_id, status: 'ativa' },
              { polo_id: formData.polo_id },
            ];

        for (const params of attempts) {
          const list = await tryFetch(params);
          if (list.length > 0) {
            setTurmas(list);
            return;
          }
        }

        setTurmas([]);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        setTurmas([]);
      }
    };

    carregarTurmas();
  }, [formData.polo_id, formData.nivel_id]);

  // Carregar documentos existentes do aluno (apenas ao editar)
  useEffect(() => {
    if (student?.id) {
      const carregarDocumentos = async () => {
        try {
          const response = await DocumentosAPI.listarPorAluno(student.id) as any;
          if (response && response.arquivos && Array.isArray(response.arquivos)) {
            setUploadedFiles(response.arquivos);
            
            // Tentar encontrar a foto do aluno nos documentos
            if (!studentPhoto) {
              const fotoDoc = response.arquivos.find((doc: any) => 
                doc.tipo === 'foto' || 
                doc.name.toLowerCase().includes('foto') ||
                doc.path.toLowerCase().includes('/foto/')
              );
              if (fotoDoc) {
                setStudentPhoto(fotoDoc.url);
              }
            }
          } else if (Array.isArray(response)) {
            setUploadedFiles(response);
          }
        } catch (error) {
          console.error('Erro ao carregar documentos do aluno:', error);
        }
      };
      
      carregarDocumentos();

    }
  }, [student?.id]);

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

  const handleFileUpload = async (files: { url: string; name: string; tipo: TipoDocumento }[]) => {
    if (student?.id) {
      try {
        // Enviar cada arquivo para o backend vincular ao aluno
        for (const file of files) {
          const formData = new FormData();
          // Se o arquivo veio do FileUpload, ele já foi enviado para o storage
          // Aqui apenas registramos no banco
          await DocumentosAPI.uploadPorAluno(student.id, formData, file.tipo);
        }
        setUploadedFiles(prev => [...prev, ...files]);
      } catch (error) {
        console.error('Erro ao vincular documentos ao aluno:', error);
      }
    } else {
      // Modo de criação: apenas mantém em estado local
      setUploadedFiles(prev => [...prev, ...files]);
    }
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
    if (!formData.polo_id) newErrors.polo_id = 'Polo é obrigatório';
    if (!formData.nivel_id) newErrors.nivel_id = 'Nível é obrigatório';

    if (!formData.nome_responsavel.trim()) newErrors.nome_responsavel = 'Nome do responsável é obrigatório';
    if (!formData.cpf_responsavel.trim()) newErrors.cpf_responsavel = 'CPF do responsável é obrigatório';
    if (!formData.telefone_responsavel.trim()) newErrors.telefone_responsavel = 'Telefone do responsável é obrigatório';
    if (!formData.email_responsavel.trim()) newErrors.email_responsavel = 'E-mail do responsável é obrigatório';

    if (!formData.alergias.trim()) newErrors.alergias = 'Alergias é obrigatório';
    if (!formData.medicacao_continua.trim()) newErrors.medicacao_continua = 'Medicação contínua é obrigatório';
    if (!formData.contato_emergencia_nome.trim()) newErrors.contato_emergencia_nome = 'Contato de emergência (nome) é obrigatório';
    if (!formData.contato_emergencia_telefone.trim()) newErrors.contato_emergencia_telefone = 'Contato de emergência (telefone) é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const sanitize = (v: string) => (v || '').replace(/\D/g, '');
    const studentData = {
      nome: formData.nome,
      data_nascimento: formData.data_nascimento,
      sexo: formData.sexo,
      cpf: sanitize(formData.cpf),
      rg: formData.rg,
      rg_orgao: formData.rg_orgao,
      rg_data_expedicao: formData.rg_data_expedicao,
      naturalidade: formData.naturalidade,
      nacionalidade: formData.nacionalidade,
      polo_id: formData.polo_id,
      turma_id: formData.turma_id,
      nivel_atual_id: formData.nivel_id,
      status: formData.status,
      observacoes: formData.observacoes,
      // Responsável 1
      nome_responsavel: formData.nome_responsavel,
      cpf_responsavel: sanitize(formData.cpf_responsavel),
      telefone_responsavel: formData.telefone_responsavel,
      email_responsavel: formData.email_responsavel,
      tipo_parentesco: formData.tipo_parentesco,
      // Responsável 2
      nome_responsavel_2: formData.nome_responsavel_2,
      cpf_responsavel_2: formData.cpf_responsavel_2 ? sanitize(formData.cpf_responsavel_2) : undefined,
      telefone_responsavel_2: formData.telefone_responsavel_2,
      email_responsavel_2: formData.email_responsavel_2,
      tipo_parentesco_2: formData.tipo_parentesco_2,
      // Dados escolares
      escola_origem: formData.escola_origem,
      ano_escolar: formData.ano_escolar,
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
      // Flatten health fields for backend compatibility
      alergias: formData.alergias,
      restricao_alimentar: formData.restricao_alimentar,
      medicacao_continua: formData.medicacao_continua,
      doencas_cronicas: formData.doencas_cronicas,
      contato_emergencia_nome: formData.contato_emergencia_nome,
      contato_emergencia_telefone: formData.contato_emergencia_telefone,
      convenio_medico: formData.convenio_medico,
      hospital_preferencia: formData.hospital_preferencia,
      autorizacao_medica: formData.autorizacao_medica,
      // Keep nested saude if some parts of the backend still use it
      saude: {
        alergias: formData.alergias,
        restricao_alimentar: formData.restricao_alimentar,
        medicacao_continua: formData.medicacao_continua,
        doencas_cronicas: formData.doencas_cronicas,
        contato_emergencia_nome: formData.contato_emergencia_nome,
        contato_emergencia_telefone: formData.contato_emergencia_telefone,
        convenio_medico: formData.convenio_medico,
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
                label="Órgão Emissor (RG)"
                value={formData.rg_orgao}
                onChange={(value) => handleInputChange('rg_orgao', value)}
                placeholder="Ex: SSP/TO"
              />
              <Input
                label="Data de Expedição (RG)"
                type="date"
                value={formData.rg_data_expedicao}
                onChange={(value) => handleInputChange('rg_data_expedicao', value)}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Dados Acadêmicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Polo *"
                value={formData.polo_id}
                onChange={(value) => handleInputChange('polo_id', value)}
                error={errors.polo_id}
                options={polos.map((polo: any) => ({
                  value: polo.id,
                  label: polo.nome || polo.name || '—',
                }))}
              />
              <Select
                label="Nível / Módulo *"
                value={formData.nivel_id}
                onChange={(value) => handleInputChange('nivel_id', value)}
                error={errors.nivel_id}
                options={niveis.map((n: any) => ({ value: n.id, label: n.nome }))}
              />
              <Select
                label="Turma"
                value={formData.turma_id}
                onChange={(value) => handleInputChange('turma_id', value)}
                options={turmas.map((t: any) => {
                  const nivelLabel = niveis.find(n => n.id === t.nivel_id)?.nome || 'Nível';
                  const moduloLabel = t.modulo?.titulo || 'Módulo';
                  return {
                    value: t.id,
                    label: `${t.nome} [${nivelLabel} - ${moduloLabel}]`
                  };
                })}
                helperText="A turma selecionada define o Nível e Módulo do aluno."
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
              <Input
                label="Escola de Origem (EBM)"
                value={formData.escola_origem}
                onChange={(value) => handleInputChange('escola_origem', value)}
              />
              <Input
                label="Ano Escolar / Módulo"
                value={formData.ano_escolar}
                onChange={(value) => handleInputChange('ano_escolar', value)}
                placeholder="Ex: Módulo 01"
              />
            </div>
          </Card>

          {/* Responsáveis */}
          <Card>
            <h3 className="text-lg font-semibold flex items-center mb-6">
              <Users className="h-5 w-5 mr-2 text-red-600" />
              Responsáveis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Nome do Responsável *"
                value={formData.nome_responsavel}
                onChange={(value) => handleInputChange('nome_responsavel', value)}
                error={errors.nome_responsavel}
              />
              <Select
                label="Parentesco *"
                value={formData.tipo_parentesco}
                onChange={(value) => handleInputChange('tipo_parentesco', value)}
                options={[
                  { value: 'pai', label: 'Pai' },
                  { value: 'mae', label: 'Mãe' },
                  { value: 'tutor', label: 'Tutor' },
                  { value: 'outro', label: 'Outro' }
                ]}
              />
              <Input
                label="CPF do Responsável *"
                value={formData.cpf_responsavel}
                onChange={(value) => handleInputChange('cpf_responsavel', value)}
                error={errors.cpf_responsavel}
                placeholder="000.000.000-00"
              />
              <Input
                label="Telefone/WhatsApp"
                value={formData.telefone_responsavel}
                onChange={(value) => handleInputChange('telefone_responsavel', value)}
                placeholder="(00) 00000-0000"
              />
              <Input
                label="E-mail"
                type="email"
                value={formData.email_responsavel}
                onChange={(value) => handleInputChange('email_responsavel', value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-4">Segundo Responsável (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Nome"
                  value={formData.nome_responsavel_2}
                  onChange={(value) => handleInputChange('nome_responsavel_2', value)}
                />
                <Input
                  label="Parentesco"
                  value={formData.tipo_parentesco_2}
                  onChange={(value) => handleInputChange('tipo_parentesco_2', value)}
                  placeholder="Ex: Pai, Mãe, Avô"
                />
                <Input
                  label="CPF"
                  value={formData.cpf_responsavel_2}
                  onChange={(value) => handleInputChange('cpf_responsavel_2', value)}
                  placeholder="000.000.000-00"
                />
                <Input
                  label="Telefone"
                  value={formData.telefone_responsavel_2}
                  onChange={(value) => handleInputChange('telefone_responsavel_2', value)}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={formData.email_responsavel_2}
                  onChange={(value) => handleInputChange('email_responsavel_2', value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </Card>

          {/* Saúde */}
          <Card>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Informações de Saúde
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Alergias
                </label>
                <textarea
                  value={formData.alergias}
                  onChange={(e) => handleInputChange('alergias', e.target.value)}
                  placeholder="Descreva as alergias"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                  rows={3}
                />
              </div>
              <Input
                label="Restrição Alimentar"
                value={formData.restricao_alimentar}
                onChange={(value) => handleInputChange('restricao_alimentar', value)}
                placeholder="Ex: Lactose, Glúten"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Doenças Crônicas
                </label>
                <textarea
                  value={formData.doencas_cronicas}
                  onChange={(e) => handleInputChange('doencas_cronicas', e.target.value)}
                  placeholder="Doenças crônicas ou condições especiais"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                  rows={3}
                />
              </div>
              <Input
                label="Contato de Emergência (Nome)"
                value={formData.contato_emergencia_nome}
                onChange={(value) => handleInputChange('contato_emergencia_nome', value)}
              />
              <Input
                label="Contato de Emergência (Telefone)"
                value={formData.contato_emergencia_telefone}
                onChange={(value) => handleInputChange('contato_emergencia_telefone', value)}
                placeholder="(00) 00000-0000"
              />
              <Input
                label="Convênio Médico"
                value={formData.convenio_medico}
                onChange={(value) => handleInputChange('convenio_medico', value)}
              />
              <Input
                label="Hospital de preferência"
                value={formData.hospital_preferencia}
                onChange={(value) => handleInputChange('hospital_preferencia', value)}
                placeholder="Hospital em caso de emergência"
              />
              <div className="md:col-span-2 flex items-start mt-2">
                <input
                  type="checkbox"
                  id="autorizacao_medica"
                  name="autorizacao_medica"
                  checked={Boolean(formData.autorizacao_medica)}
                  onChange={(e) => handleInputChange('autorizacao_medica', e.target.checked)}
                  className="mt-1 mr-3 h-4 w-4 text-red-600 rounded"
                />
                <label htmlFor="autorizacao_medica" className="text-sm text-gray-700">
                  Autorizo o IBUC a prestar primeiros socorros e encaminhar ao hospital em caso de emergência médica.
                </label>
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o aluno"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                rows={4}
              />
            </div>
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
