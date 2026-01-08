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
  // 🔍 DEBUG: Log the complete student object received
  useEffect(() => {
    if (student) {
      console.log('🔍 StudentForm - student object received:', JSON.stringify(student, null, 2));
      console.log('🔍 StudentForm - endereco type:', typeof student?.endereco, student?.endereco);
      console.log('🔍 StudentForm - telefone_responsavel:', (student as any)?.telefone_responsavel);
    }
  }, [student]);

  // Helper para garantir que sempre retornamos uma string limpa
  const safeString = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) {
      console.warn(`⚠️ safeString received array for ${fieldName}:`, value);
      return '';
    }
    if (typeof value === 'object') {
      console.warn(`⚠️ safeString received object for ${fieldName}:`, value);
      // Se for um objeto, tentar extrair valores comuns
      if (value.telefone) return safeString(value.telefone, fieldName);
      if (value.numero) return safeString(value.numero, fieldName);
      if (value.value) return safeString(value.value, fieldName);
      if (value.nome) return safeString(value.nome, fieldName); // Para JOINs como turma/nivel
      // Se tiver apenas uma chave, usar seu valor
      const keys = Object.keys(value);
      if (keys.length === 1) return safeString(value[keys[0]], fieldName);
      return '';
    }
    return '';
  };


  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: safeString(student?.nome),
    data_nascimento: safeString(student?.data_nascimento),
    sexo: student?.sexo || 'M' as 'M' | 'F',
    cpf: safeString(student?.cpf),
    rg: safeString(student?.rg),
    rg_orgao: safeString((student as any)?.rg_orgao),
    rg_data_expedicao: safeString((student as any)?.rg_data_expedicao),
    naturalidade: safeString(student?.naturalidade),
    nacionalidade: safeString(student?.nacionalidade) || 'Brasileira',
    nome_responsavel: safeString((student as any)?.nome_responsavel),
    cpf_responsavel: safeString((student as any)?.cpf_responsavel),
    telefone_responsavel: safeString((student as any)?.telefone_responsavel),
    email_responsavel: safeString((student as any)?.email_responsavel),
    tipo_parentesco: ((student as any)?.tipo_parentesco || 'pai') as 'pai' | 'mae' | 'tutor' | 'outro',
    nome_responsavel_2: safeString((student as any)?.nome_responsavel_2),
    cpf_responsavel_2: safeString((student as any)?.cpf_responsavel_2),
    telefone_responsavel_2: safeString((student as any)?.telefone_responsavel_2),
    email_responsavel_2: safeString((student as any)?.email_responsavel_2),
    tipo_parentesco_2: safeString((student as any)?.tipo_parentesco_2),

    // Endereço
    cep: safeString(student?.endereco?.cep),
    rua: safeString(student?.endereco?.rua),
    numero: safeString(student?.endereco?.numero),
    complemento: safeString(student?.endereco?.complemento),
    bairro: safeString(student?.endereco?.bairro),
    cidade: safeString(student?.endereco?.cidade),
    estado: safeString(student?.endereco?.estado) || 'TO',

    // Contato
    telefone: safeString((student as any)?.telefone_responsavel),
    celular: safeString((student as any)?.celular),
    email: safeString((student as any)?.email_responsavel),

    // Dados Acadêmicos
    polo_id: safeString(student?.polo_id),
    nivel_id: safeString((student as any)?.nivel_atual_id || (student as any)?.nivel_id),
    turma_id: safeString(student?.turma_id),
    status: student?.status || 'ativo',

    escola_origem: safeString((student as any)?.escola_origem || (student as any)?.escola_atual),
    ano_escolar: safeString((student as any)?.ano_escolar || (student as any)?.serie),

    // Saúde (Try both flat and nested as backend varies)
    alergias: safeString((student as any)?.alergias || student?.saude?.alergias),
    restricao_alimentar: safeString((student as any)?.restricao_alimentar || student?.saude?.restricao_alimentar),
    medicacao_continua: safeString((student as any)?.medicacao_continua || student?.saude?.medicacao_continua),
    doencas_cronicas: safeString((student as any)?.doencas_cronicas || student?.saude?.doencas_cronicas),
    contato_emergencia_nome: safeString((student as any)?.contato_emergencia_nome || student?.saude?.contato_emergencia_nome),
    contato_emergencia_telefone: safeString((student as any)?.contato_emergencia_telefone || student?.saude?.contato_emergencia_telefone),
    convenio_medico: safeString((student as any)?.convenio_medico || student?.saude?.convenio_medico),
    hospital_preferencia: safeString((student as any)?.hospital_preferencia || student?.saude?.hospital_preferencia),
    autorizacao_medica: (student as any)?.autorizacao_medica || student?.saude?.autorizacao_medica || false,

    // Observações
    observacoes: safeString(student?.observacoes)
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

  // Inicializar foto do aluno a partir do campo foto_url do student
  useEffect(() => {
    if (student?.foto_url) {
      console.log('📷 Foto do aluno carregada de foto_url:', student.foto_url);
      setStudentPhoto(student.foto_url);
    }
  }, [student?.foto_url]);

  // Carregar documentos existentes do aluno (apenas ao editar)
  useEffect(() => {
    if (student?.id) {
      const carregarDocumentos = async () => {
        try {
          const response = await DocumentosAPI.listarPorAluno(student.id) as any;
          console.log('📄 Resposta da API de documentos:', response);

          // Backend retorna { aluno_id, arquivos: [] }
          const documentos = response?.arquivos || [];

          // Mapear documentos para o formato esperado pelo componente
          const docsFormatados = documentos.map((doc: any) => {
            // Extrair tipo do path se não estiver definido
            let tipo = doc.tipo || 'outro';
            if (tipo === 'outros' && doc.path) {
              // Tentar extrair tipo do path (ex: pre-matriculas/id/foto/arquivo.jpg)
              const pathParts = doc.path.split('/');
              if (pathParts.length >= 3) {
                const possibleTipo = pathParts[pathParts.length - 2];
                if (['foto', 'certidao', 'rg', 'cpf', 'comprovante_residencia', 'laudo'].includes(possibleTipo)) {
                  tipo = possibleTipo;
                }
              }
            }

            return {
              url: doc.url,
              name: doc.name,
              tipo: tipo as TipoDocumento,
              path: doc.path,
              size: doc.size,
              created_at: doc.created_at
            };
          });

          setUploadedFiles(docsFormatados);
          console.log('📁 Total de documentos carregados:', docsFormatados.length);

          // Se não temos foto_url definida, tentar encontrar nos documentos
          if (!student.foto_url) {
            const fotoDoc = docsFormatados.find((doc: any) =>
              doc.tipo === 'foto' ||
              (doc.name && doc.name.toLowerCase().includes('foto')) ||
              (doc.path && doc.path.toLowerCase().includes('/foto/'))
            );

            if (fotoDoc && fotoDoc.url) {
              console.log('📷 Foto encontrada nos documentos:', fotoDoc.url);
              setStudentPhoto(fotoDoc.url);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao carregar documentos do aluno:', error);
        }
      };

      carregarDocumentos();
    }
  }, [student?.id, student?.foto_url]);

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
              variant="outline"
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
                name="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                error={errors.nome}
                placeholder="Nome completo do aluno"
              />
              <Input
                label="Data de Nascimento *"
                name="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
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
                name="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                error={errors.cpf}
                placeholder="000.000.000-00"
              />
              <Input
                label="RG"
                name="rg"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                placeholder="RG sem dígitos"
              />
              <Input
                label="Órgão Emissor (RG)"
                name="rg_orgao"
                value={formData.rg_orgao}
                onChange={(e) => handleInputChange('rg_orgao', e.target.value)}
                placeholder="Ex: SSP/TO"
              />
              <Input
                label="Data de Expedição (RG)"
                name="rg_data_expedicao"
                type="date"
                value={formData.rg_data_expedicao}
                onChange={(e) => handleInputChange('rg_data_expedicao', e.target.value)}
              />
              <Input
                label="Naturalidade"
                name="naturalidade"
                value={formData.naturalidade}
                onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                placeholder="Cidade de nascimento"
              />
              <Input
                label="Nacionalidade"
                name="nacionalidade"
                value={formData.nacionalidade}
                onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
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
                name="cep"
                value={formData.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                error={errors.cep}
                placeholder="00000-000"
              />
              <Input
                label="Rua *"
                name="rua"
                value={formData.rua}
                onChange={(e) => handleInputChange('rua', e.target.value)}
                error={errors.rua}
                placeholder="Nome da rua"
              />
              <Input
                label="Número *"
                name="numero"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                error={errors.numero}
                placeholder="Nº"
              />
              <Input
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
                placeholder="Apto, Casa, etc."
              />
              <Input
                label="Bairro *"
                name="bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                error={errors.bairro}
              />
              <Input
                label="Cidade *"
                name="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
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
                name="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                error={errors.telefone}
                placeholder="(63) 0000-0000"
              />
              <Input
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={(e) => handleInputChange('celular', e.target.value)}
                placeholder="(63) 90000-0000"
              />
              <Input
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                name="escola_origem"
                value={formData.escola_origem}
                onChange={(e) => handleInputChange('escola_origem', e.target.value)}
              />
              <Input
                label="Ano Escolar / Módulo"
                name="ano_escolar"
                value={formData.ano_escolar}
                onChange={(e) => handleInputChange('ano_escolar', e.target.value)}
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
                name="cpf_responsavel"
                value={formData.cpf_responsavel}
                onChange={(e) => handleInputChange('cpf_responsavel', e.target.value)}
                error={errors.cpf_responsavel}
                placeholder="000.000.000-00"
              />
              <Input
                label="Telefone/WhatsApp"
                name="telefone_responsavel"
                value={formData.telefone_responsavel}
                onChange={(e) => handleInputChange('telefone_responsavel', e.target.value)}
                placeholder="(00) 00000-0000"
              />
              <Input
                label="E-mail"
                name="email_responsavel"
                type="email"
                value={formData.email_responsavel}
                onChange={(e) => handleInputChange('email_responsavel', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-4">Segundo Responsável (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Nome"
                  name="nome_responsavel_2"
                  value={formData.nome_responsavel_2}
                  onChange={(e) => handleInputChange('nome_responsavel_2', e.target.value)}
                />
                <Input
                  label="Parentesco"
                  name="tipo_parentesco_2"
                  value={formData.tipo_parentesco_2}
                  onChange={(e) => handleInputChange('tipo_parentesco_2', e.target.value)}
                  placeholder="Ex: Pai, Mãe, Avô"
                />
                <Input
                  label="CPF"
                  name="cpf_responsavel_2"
                  value={formData.cpf_responsavel_2}
                  onChange={(e) => handleInputChange('cpf_responsavel_2', e.target.value)}
                  placeholder="000.000.000-00"
                />
                <Input
                  label="Telefone"
                  name="telefone_responsavel_2"
                  value={formData.telefone_responsavel_2}
                  onChange={(e) => handleInputChange('telefone_responsavel_2', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  label="E-mail"
                  name="email_responsavel_2"
                  type="email"
                  value={formData.email_responsavel_2}
                  onChange={(e) => handleInputChange('email_responsavel_2', e.target.value)}
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
                name="restricao_alimentar"
                value={formData.restricao_alimentar}
                onChange={(e) => handleInputChange('restricao_alimentar', e.target.value)}
                placeholder="Ex: Lactose, Glúten"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Doenças Crônicas
                </label>
                <textarea
                  name="doencas_cronicas"
                  value={formData.doencas_cronicas}
                  onChange={(e) => handleInputChange('doencas_cronicas', e.target.value)}
                  placeholder="Doenças crônicas ou condições especiais"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                  rows={3}
                />
              </div>
              <Input
                label="Contato de Emergência (Nome)"
                name="contato_emergencia_nome"
                value={formData.contato_emergencia_nome}
                onChange={(e) => handleInputChange('contato_emergencia_nome', e.target.value)}
              />
              <Input
                label="Contato de Emergência (Telefone)"
                name="contato_emergencia_telefone"
                value={formData.contato_emergencia_telefone}
                onChange={(e) => handleInputChange('contato_emergencia_telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
              <Input
                label="Convênio Médico"
                name="convenio_medico"
                value={formData.convenio_medico}
                onChange={(e) => handleInputChange('convenio_medico', e.target.value)}
              />
              <Input
                label="Hospital de preferência"
                name="hospital_preferencia"
                value={formData.hospital_preferencia}
                onChange={(e) => handleInputChange('hospital_preferencia', e.target.value)}
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
              <div className="mt-6 border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Documentos Enviados ({uploadedFiles.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            {file.tipo || 'documento'}
                          </span>
                        </div>
                      </div>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium flex-shrink-0"
                        >
                          Visualizar
                        </a>
                      )}
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
