// ============================================
// IBUC System - Página de Pré-matrícula (Pública)
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlunoService } from '../services/aluno.service';
import { DocumentoService } from '../services/documento.service';
import { PoloService } from '../services/polo.service';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import type { Aluno, Matricula, Polo, Nivel, TipoDocumento } from '../types/database';
import { FileUpload } from '../components/ui/FileUpload';

const PreMatricula: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; tipo: TipoDocumento }[]>([]);

  const [formData, setFormData] = useState({
    // Dados do Aluno
    nome: '',
    data_nascimento: '',
    sexo: 'M' as 'M' | 'F' | 'Outro',
    cpf: '',
    // Endereço
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'TO',
    // Dados do Responsável
    nome_responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',
    cpf_responsavel: '',
    tipo_parentesco: 'pai' as 'pai' | 'mae' | 'tutor' | 'outro',
    // Matrícula
    polo_id: '',
    nivel_id: '',
    observacoes: '',
    // Termos
    aceite_termo: false,
  });

  const [selectedDocType, setSelectedDocType] = useState<TipoDocumento>('cpf');

  const REQUIRED_DOCUMENTS: { type: TipoDocumento; label: string }[] = [
    { type: 'cpf', label: 'CPF do Responsável ou do Aluno' },
    { type: 'rg', label: 'Documento de Identidade (RG)' },
    { type: 'certidao', label: 'Certidão de Nascimento' },
    { type: 'comprovante_residencia', label: 'Comprovante de Residência' },
  ];

  React.useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [polosData, niveisData] = await Promise.all([
        PoloService.listarPolos(),
        // TODO: Implementar NivelService
        Promise.resolve([]),
      ]);
      setPolos(polosData);
      // setNiveis(niveisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf' || name === 'cpf_responsavel') {
      setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else if (name === 'cep') {
      setFormData(prev => ({ ...prev, [name]: formatCEP(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleUploadComplete = (fileUrl: string, originalName: string) => {
    setUploadedFiles(prev => [...prev, { url: fileUrl, name: originalName, tipo: selectedDocType }]);
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome) newErrors.nome = 'Nome do aluno é obrigatório';
    if (!formData.data_nascimento) newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    if (!formData.sexo) newErrors.sexo = 'Sexo é obrigatório';
    if (!formData.cep) newErrors.cep = 'CEP é obrigatório';
    if (!formData.rua) newErrors.rua = 'Rua é obrigatória';
    if (!formData.numero) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado) newErrors.estado = 'Estado é obrigatório';
    if (!formData.nome_responsavel) newErrors.nome_responsavel = 'Nome do responsável é obrigatório';
    if (!formData.telefone_responsavel) newErrors.telefone_responsavel = 'Telefone do responsável é obrigatório';
    if (!formData.email_responsavel) newErrors.email_responsavel = 'E-mail do responsável é obrigatório';
    if (!formData.polo_id) newErrors.polo_id = 'Polo é obrigatório';
    if (!formData.aceite_termo) newErrors.aceite_termo = 'É necessário aceitar os termos';

    // Validação de documentos obrigatórios
    REQUIRED_DOCUMENTS.forEach((doc) => {
      const hasDoc = uploadedFiles.some((file) => file.tipo === doc.type);
      if (!hasDoc) {
        newErrors.documentos = 'Envie todos os documentos obrigatórios: CPF, RG, Certidão e Comprovante de Residência.';
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email_responsavel && !emailRegex.test(formData.email_responsavel)) {
      newErrors.email_responsavel = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Criar aluno
      const aluno: Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'> = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        cpf: formData.cpf || undefined,
        endereco: {
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento || undefined,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
        },
        polo_id: formData.polo_id,
        nivel_atual_id: formData.nivel_id || '', // TODO: Calcular nível por idade
        status: 'pendente',
      };

      // Criar matrícula
      const matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'> = {
        aluno_id: '', // Será preenchido após criar aluno
        polo_id: formData.polo_id,
        tipo: 'online',
        status: 'pendente',
        origem: 'site',
        data_matricula: new Date().toISOString(),
      };

      // Criar pré-matrícula
      const resultado = await AlunoService.criarPreMatricula(aluno, matricula);

      // Registrar documentos enviados (se houver) vinculados ao aluno criado
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            await DocumentoService.registrarDocumentoExistente(
              file.url,
              'aluno',
              resultado.aluno.id,
              file.tipo,
              file.name
            );
          } catch (docError) {
            console.error('Erro ao registrar documento da pré-matrícula:', docError);
          }
        }
      }

      setProtocolo(resultado.matricula.protocolo);

      // TODO: Enviar notificação ao polo
      // TODO: Enviar e-mail de confirmação ao responsável

      alert(`Pré-matrícula realizada com sucesso! Protocolo: ${resultado.matricula.protocolo}`);
      
      // Redirecionar para página de acompanhamento
      navigate(`/acompanhar-matricula?protocolo=${resultado.matricula.protocolo}`);
    } catch (error) {
      console.error('Erro ao realizar pré-matrícula:', error);
      alert('Erro ao realizar pré-matrícula. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const estados = [
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
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ];

  const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
    { value: 'Outro', label: 'Outro' },
  ];

  const parentescoOptions = [
    { value: 'pai', label: 'Pai' },
    { value: 'mae', label: 'Mãe' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'outro', label: 'Outro' },
  ];

  if (protocolo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-ibuc-green rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pré-matrícula Realizada!</h2>
                <p className="text-gray-600 mb-4">
                  Sua pré-matrícula foi enviada com sucesso. Guarde o protocolo abaixo para acompanhar o status.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-1">Protocolo:</p>
                  <p className="text-2xl font-bold text-ibuc-blue">{protocolo}</p>
                </div>
                <div className="space-y-2 text-left bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Próximos passos:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>A secretária do polo entrará em contato para validar os documentos</li>
                    <li>Compareça ao polo com os documentos necessários</li>
                    <li>Acompanhe o status da sua matrícula usando o protocolo acima</li>
                  </ul>
                </div>
                <Button onClick={() => navigate('/')} className="w-full">
                  Voltar ao Início
                </Button>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload de Documentos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Envie cópias digitais dos documentos do aluno e do responsável (RG, CPF, certidão de nascimento,
              comprovante de residência, laudos médicos, se houver). Esses arquivos serão armazenados com
              segurança no Supabase e usados exclusivamente para análise e comprovação da matrícula.
            </p>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-ibuc-blue focus:border-ibuc-blue"
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as TipoDocumento)}
                >
                  {REQUIRED_DOCUMENTS.map((doc) => (
                    <option key={doc.type} value={doc.type}>{doc.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <FileUpload
                  folder={`pre-matriculas/${formData.cpf_responsavel || formData.cpf || 'sem-identificacao'}`}
                  onUploadComplete={handleUploadComplete}
                  accept="image/*,.pdf"
                  maxSizeMB={10}
                  label="Arraste e solte o arquivo aqui ou clique para selecionar (PDF, JPG, PNG)"
                />
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Checklist de documentos obrigatórios</h3>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {REQUIRED_DOCUMENTS.map((doc) => {
                      const hasDoc = uploadedFiles.some((file) => file.tipo === doc.type);
                      return (
                        <li key={doc.type} className="flex items-center">
                          <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full mr-2 text-[10px] ${hasDoc ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {hasDoc ? '✓' : '!'}
                          </span>
                          <span className={hasDoc ? 'text-green-700' : 'text-red-700'}>{doc.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Documentos enviados nesta sessão</h3>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <li key={file.url} className="truncate">
                        <span className="font-semibold mr-1">[{REQUIRED_DOCUMENTS.find(d => d.type === file.tipo)?.label || file.tipo}]</span>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-ibuc-blue hover:underline">
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {errors.documentos && (
              <p className="mt-2 text-sm text-red-600">{errors.documentos}</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pré-matrícula Online
          </h1>
          <p className="text-lg text-gray-600">
            Preencha os dados abaixo para iniciar sua pré-matrícula. A secretária do polo entrará em contato para finalizar o processo.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados do Aluno</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo do Aluno"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  error={errors.nome}
                  required
                />
              </div>

              <Input
                label="Data de Nascimento"
                name="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={handleInputChange}
                error={errors.data_nascimento}
                required
              />

              <Select
                label="Sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                options={sexoOptions}
                error={errors.sexo}
                required
              />

              <Input
                label="CPF (opcional)"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                error={errors.cpf}
                maxLength={14}
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Endereço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                onBlur={(e) => buscarCEP(e.target.value)}
                error={errors.cep}
                maxLength={9}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleInputChange}
                  error={errors.rua}
                  required
                />
              </div>

              <Input
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                error={errors.numero}
                required
              />

              <Input
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                error={errors.complemento}
              />

              <Input
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                error={errors.bairro}
                required
              />

              <Input
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                error={errors.cidade}
                required
              />

              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                options={estados}
                error={errors.estado}
                required
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados do Responsável</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo do Responsável"
                  name="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={handleInputChange}
                  error={errors.nome_responsavel}
                  required
                />
              </div>

              <Select
                label="Tipo de Parentesco"
                name="tipo_parentesco"
                value={formData.tipo_parentesco}
                onChange={handleInputChange}
                options={parentescoOptions}
                required
              />

              <Input
                label="CPF do Responsável"
                name="cpf_responsavel"
                value={formData.cpf_responsavel}
                onChange={handleInputChange}
                error={errors.cpf_responsavel}
                maxLength={14}
              />

              <Input
                label="Telefone/WhatsApp"
                name="telefone_responsavel"
                value={formData.telefone_responsavel}
                onChange={handleInputChange}
                error={errors.telefone_responsavel}
                required
              />

              <Input
                label="E-mail"
                name="email_responsavel"
                type="email"
                value={formData.email_responsavel}
                onChange={handleInputChange}
                error={errors.email_responsavel}
                required
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados da Matrícula</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Polo"
                name="polo_id"
                value={formData.polo_id}
                onChange={handleInputChange}
                options={polos.map(p => ({ value: p.id, label: p.nome }))}
                error={errors.polo_id}
                required
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ibuc-blue focus:border-ibuc-blue"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="aceite_termo"
                checked={formData.aceite_termo}
                onChange={handleCheckboxChange}
                className="mt-1 mr-3"
                required
              />
              <label className="text-sm text-gray-700">
                Declaro, na qualidade de responsável legal pelo menor, que li e concordo com os termos de uso e a
                política de privacidade da IBUC, autorizando o tratamento dos dados pessoais do aluno e dos
                responsáveis exclusivamente para fins de gestão da Escola Bíblica Dominical, em conformidade com a LGPD.
                {errors.aceite_termo && (
                  <span className="block text-red-600 mt-1">{errors.aceite_termo}</span>
                )}
              </label>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-ibuc-blue hover:bg-blue-600"
            >
              {loading ? 'Enviando...' : 'Enviar Pré-matrícula'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreMatricula;

