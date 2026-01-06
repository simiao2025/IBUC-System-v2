import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { usePreMatriculaForm } from '../../hooks/usePreMatriculaForm';
import { REQUIRED_DOCUMENTS } from '../../constants/enrollment';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { User, Users, MapPin, Shield, Upload, FileText, Check, AlertCircle, Save } from 'lucide-react';

interface StudentRegistrationProps {
  isAdminView?: boolean;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ isAdminView }) => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  // Se isAdminView for true, forçamos o modo admin.
  const isAdmin = isAdminView || currentUser?.role === 'admin';

  const isPoloScoped = isAdmin && (currentUser as any)?.adminUser?.accessLevel === 'polo_especifico' && Boolean((currentUser as any)?.adminUser?.poloId);

  const {
    formData,
    loading,
    polos,
    niveis,
    turmas,
    errors,
    submitted,
    handleInputChange,
    handleHealthChange,
    handleCheckboxChange,
    handleFileSelected,
    handleSubmit,
    buscarCEP,
    uploadedFiles,
    setFormData,
    turmaOccupancy
  } = usePreMatriculaForm(isAdminView);

  const moduloOptions = Array.from({ length: 10 }).map((_, idx) => {
    const n = String(idx + 1).padStart(2, '0');
    return { value: `modulo_${n}`, label: `Módulo ${n}` };
  });

  // Opções de Gênero
  const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  // Opções de Parentesco
  const parentescoOptions = [
    { value: 'pai', label: 'Pai' },
    { value: 'mae', label: 'Mãe' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'outro', label: 'Outro' },
  ];

  // Opções de Estados
  const estados = [
    { value: 'TO', label: 'Tocantins' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
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
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SE', label: 'Sergipe' },
  ];

  // Se já foi enviado, mostra mensagem de sucesso ou redireciona
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isAdminView ? 'Matrícula Realizada!' : 'Pré-matrícula Realizada!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isAdminView
                ? 'O aluno foi cadastrado e ativado diretamente no sistema.'
                : 'Sua pré-matrícula foi enviada e está em análise. Em breve entraremos em contato.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate(isAdminView ? '/admin/alunos' : '/')} className="w-full sm:w-auto">
                {isAdminView ? 'Voltar para Listagem' : 'Voltar ao Início'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isAdminView ? 'Ficha de Matrícula (Presencial)' : 'Pré-Matrícula Online'}
          </h1>
          <p className="text-lg text-gray-600">
            {isAdminView
              ? 'Área da Secretaria: Preencha os dados abaixo para matricular o aluno diretamente como ATIVO no sistema.'
              : 'Bem-vindo ao portal de pré-matrícula. Preencha os dados abaixo para iniciar seu processo de admissão.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sessão: Dados do Aluno */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <User className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Dados do Aluno</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo *"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  error={errors.nome}
                  placeholder="Nome completo do aluno"
                  required
                />
              </div>

              <Input
                label="Data de Nascimento *"
                name="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={handleInputChange}
                error={errors.data_nascimento}
                required
              />

              <Select
                label="Sexo *"
                name="sexo"
                value={formData.sexo}
                onChange={(val) => setFormData(prev => ({ ...prev, sexo: val as 'M' | 'F' }))}
                options={sexoOptions}
                error={errors.sexo}
                required
              />

              <Input
                label="CPF *"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                error={errors.cpf}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />

              <Input
                label="RG"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
              />

              {isAdminView && (
                <>
                  <Input
                    label="Órgão Emissor (RG)"
                    name="rg_orgao"
                    value={formData.rg_orgao}
                    onChange={handleInputChange}
                    placeholder="Ex: SSP/TO"
                  />

                  <Input
                    label="Data de Expedição (RG)"
                    name="rg_data_expedicao"
                    type="date"
                    value={formData.rg_data_expedicao}
                    onChange={handleInputChange}
                  />
                </>
              )}

              <Input
                label="Naturalidade"
                name="naturalidade"
                value={formData.naturalidade}
                onChange={handleInputChange}
                placeholder="Ex: Palmas/TO"
              />

              <Input
                label="Nacionalidade"
                name="nacionalidade"
                value={formData.nacionalidade}
                onChange={handleInputChange}
              />
            </div>
          </Card>

          {/* Sessão: Endereço */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <MapPin className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Endereço</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="CEP *"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                onBlur={(e) => buscarCEP(e.target.value)}
                error={errors.cep}
                placeholder="00000-000"
                maxLength={9}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Rua *"
                  name="rua"
                  value={formData.rua}
                  onChange={handleInputChange}
                  error={errors.rua}
                  required
                />
              </div>

              <Input
                label="Número *"
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
              />

              <Input
                label="Bairro *"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                error={errors.bairro}
                required
              />

              <Input
                label="Cidade *"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                error={errors.cidade}
                required
              />

              <Select
                label="Estado *"
                name="estado"
                value={formData.estado}
                onChange={(val) => setFormData(prev => ({ ...prev, estado: val }))}
                options={estados}
                error={errors.estado}
                required
              />
            </div>
          </Card>

          {/* Sessão: Saúde e Segurança */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <Shield className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Saúde e Segurança</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Alergias *"
                  name="alergias"
                  value={formData.saude.alergias}
                  onChange={handleHealthChange}
                  error={errors.alergias}
                  placeholder="Liste as alergias ou escreva 'Nenhuma'"
                  required
                />
              </div>

              <Input
                label="Restrição Alimentar"
                name="restricao_alimentar"
                value={formData.saude.restricao_alimentar}
                onChange={handleHealthChange}
                placeholder="Ex: Lactose, Glúten"
              />

              <Input
                label="Medicação Contínua *"
                name="medicacao_continua"
                value={formData.saude.medicacao_continua}
                onChange={handleHealthChange}
                error={errors.medicacao_continua}
                placeholder="Ex: Escreva 'Nenhuma' se não houver"
                required
              />

              <Input
                label="Doenças Crônicas"
                name="doencas_cronicas"
                value={formData.saude.doencas_cronicas}
                onChange={handleHealthChange}
                placeholder="Ex: Asma, Diabetes"
              />

              <Input
                label="Contato de Emergência (Nome) *"
                name="contato_emergencia_nome"
                value={formData.saude.contato_emergencia_nome}
                onChange={handleHealthChange}
                error={errors.contato_emergencia_nome}
                required
              />

              <Input
                label="Contato de Emergência (Telefone) *"
                name="contato_emergencia_telefone"
                value={formData.saude.contato_emergencia_telefone}
                onChange={handleHealthChange}
                error={errors.contato_emergencia_telefone}
                placeholder="(00) 00000-0000"
                required
              />

              <Input
                label="Convênio Médico"
                name="convenio_medico"
                value={formData.saude.convenio_medico}
                onChange={handleHealthChange}
              />

              <Input
                label="Hospital de Preferência"
                name="hospital_preferencia"
                value={formData.saude.hospital_preferencia}
                onChange={handleHealthChange}
              />

              <div className="md:col-span-2 flex items-start mt-2">
                <input
                  type="checkbox"
                  id="autorizacao_medica"
                  name="autorizacao_medica"
                  checked={formData.saude.autorizacao_medica}
                  onChange={handleHealthChange}
                  className="mt-1 mr-3 h-4 w-4 text-red-600 rounded"
                />
                <label htmlFor="autorizacao_medica" className="text-sm text-gray-700">
                  Autorizo o IBUC a prestar primeiros socorros e encaminhar ao hospital em caso de emergência médica.
                </label>
              </div>
            </div>
          </Card>

          {/* Sessão: Responsáveis */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <Users className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Dados dos Responsáveis</h2>
            </div>

            <div className="space-y-8">
              {/* Responsável Principal */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mr-2 text-sm">1</span>
                  Responsável Principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo *"
                      name="nome_responsavel"
                      value={formData.nome_responsavel}
                      onChange={handleInputChange}
                      error={errors.nome_responsavel}
                      required
                    />
                  </div>
                  <Select
                    label="Parentesco *"
                    name="tipo_parentesco"
                    value={formData.tipo_parentesco}
                    onChange={(val) => setFormData(prev => ({ ...prev, tipo_parentesco: val as any }))}
                    options={parentescoOptions}
                    required
                  />
                  <Input
                    label="CPF *"
                    name="cpf_responsavel"
                    value={formData.cpf_responsavel}
                    onChange={handleInputChange}
                    error={errors.cpf_responsavel}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                  <Input
                    label="Telefone/WhatsApp *"
                    name="telefone_responsavel"
                    value={formData.telefone_responsavel}
                    onChange={handleInputChange}
                    error={errors.telefone_responsavel}
                    placeholder="(00) 00000-0000"
                    required
                  />
                  <Input
                    label="E-mail *"
                    name="email_responsavel"
                    type="email"
                    value={formData.email_responsavel}
                    onChange={handleInputChange}
                    error={errors.email_responsavel}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Segundo Responsável */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center mr-2 text-sm">2</span>
                  Segundo Responsável (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo"
                      name="nome_responsavel_2"
                      value={formData.nome_responsavel_2}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Input
                    label="Parentesco"
                    name="tipo_parentesco_2"
                    value={formData.tipo_parentesco_2}
                    onChange={handleInputChange}
                    placeholder="Ex: Pai, Mãe, Avô"
                  />
                  <Input
                    label="CPF"
                    name="cpf_responsavel_2"
                    value={formData.cpf_responsavel_2}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  <Input
                    label="Telefone"
                    name="telefone_responsavel_2"
                    value={formData.telefone_responsavel_2}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                  <Input
                    label="E-mail"
                    name="email_responsavel_2"
                    type="email"
                    value={formData.email_responsavel_2}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Sessão: Informações Institucionais */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <FileText className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Informações da Matrícula</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isAdminView || !isPoloScoped ? (
                <Select
                  label="Polo de Estudo *"
                  name="polo_id"
                  value={formData.polo_id}
                  onChange={(val) => setFormData(prev => ({ ...prev, polo_id: val, turma_id: '' }))}
                  options={polos.map(p => ({ value: p.id, label: p.nome }))}
                  error={errors.polo_id}
                  required
                />
              ) : (
                <div className="md:col-span-2" />
              )}

              {/* Nível/Módulo Select removido pois será inferido da Turma */}

              {isAdminView && (
                <>
                  {/* Campos de Nível e Módulo removidos conforme solicitação. 
                      Agora são inferidos a partir da Turma selecionada. 
                  */}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações Adicionais</label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px]"
                      placeholder="Informações relevantes para a secretaria ou polo"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Sessão: Termos */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <Shield className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Termos e Autorizações</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded border mb-6 max-h-48 overflow-y-auto text-sm text-gray-600 space-y-4">
              <p><strong>TERMO DE RESPONSABILIDADE:</strong> Declaro que todas as informações aqui prestadas são verdadeiras e estou ciente de que a matrícula definitiva está sujeita à validação presencial no polo e entrega da documentação física, se solicitado.</p>
              <p><strong>AUTORIZAÇÃO DE IMAGEM:</strong> Autorizo o uso da imagem do aluno em atividades institucionais e pedagógicas do IBUC, sem fins lucrativos.</p>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="aceite_termo"
                name="aceite_termo"
                checked={formData.aceite_termo}
                onChange={handleCheckboxChange}
                className="mt-1 mr-3 h-4 w-4 text-red-600 rounded"
              />
              <label htmlFor="aceite_termo" className="text-sm text-gray-700">
                Li e aceito os termos de responsabilidade e autorizo o cadastro do aluno no sistema IBUC. *
              </label>
            </div>
            {errors.aceite_termo && <p className="text-sm text-red-600 mt-2">{errors.aceite_termo}</p>}
          </Card>

          {/* Sessão: Upload de Documentos - Ambos os fluxos */}
          <Card>
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
              <Upload className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 uppercase">Documentos Obrigatórios</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <div key={doc.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.label}</h4>
                      <p className="text-sm text-gray-500">Envie o documento em formato PDF ou imagem</p>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelected(doc.value, e.target.files?.[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {uploadedFiles.find(f => f.tipo === doc.value) && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                        <span className="text-green-700">
                          {uploadedFiles.find(f => f.tipo === doc.value)?.name}
                        </span>
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {isAdminView && (
            <Card>
              <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 uppercase">Opções de Cadastro Direto</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Turma (Obrigatório para Matrícula Direta) *"
                  name="turma_id"
                  value={formData.turma_id}
                  onChange={(val) => {
                    const selectedTurma = turmas.find((t: any) => t.id === val);
                    setFormData(prev => ({
                      ...prev,
                      turma_id: val,
                      // Auto-seleciona o nível com base na turma
                      nivel_id: selectedTurma?.nivel_id || prev.nivel_id
                    }));
                  }}
                  options={turmas.map((t: any) => {
                    const nivel = niveis.find(n => n.id === t.nivel_id)?.nome;
                    const modulo = t.modulo?.titulo || ((t as any).modulo_numero ? `Módulo ${(t as any).modulo_numero}` : undefined);

                    let label = t.nome;
                    // Simplificar label pois o filtro de idade já garante o nível
                    // mas ainda é útil mostrar para confirmação
                    if (nivel) label += ` - ${nivel}`;
                    if (modulo) label += ` [${modulo}]`;

                    return {
                      value: t.id,
                      label: label
                    };
                  })}
                  error={errors.turma_id}
                  disabled={!formData.data_nascimento || turmas.length === 0}
                  required={isAdminView}
                  helperText={
                    !formData.data_nascimento
                      ? "Informe a Data de Nascimento para ver as turmas disponíveis para a idade."
                      : turmas.length === 0
                        ? "Nenhuma turma disponível para a idade do aluno neste Polo."
                        : "A turma selecionada define automaticamente o Nível e Módulo."
                  }
                />
                {turmaOccupancy && (
                  <div className={`mt-2 p-3 rounded-lg border flex items-center gap-3 ${turmaOccupancy.count >= turmaOccupancy.capacity
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : (turmaOccupancy.count / turmaOccupancy.capacity) >= 0.8
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                    {turmaOccupancy.count >= turmaOccupancy.capacity ? (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Users className="h-5 w-5 flex-shrink-0" />
                    )}
                    <div className="text-xs">
                      <p className="font-bold">
                        Ocupação: {turmaOccupancy.count} / {turmaOccupancy.capacity} alunos
                      </p>
                      {turmaOccupancy.count >= turmaOccupancy.capacity ? (
                        <p>Esta turma está lotada. Selecione outra ou solicite expansão.</p>
                      ) : (turmaOccupancy.count / turmaOccupancy.capacity) >= 0.8 ? (
                        <p>Atenção: Turma próxima da capacidade máxima.</p>
                      ) : (
                        <p>Turma com vagas disponíveis.</p>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Ao selecionar uma turma nesta tela administrativa, o aluno será cadastrado diretamente como <strong>ATIVO</strong>.
                </p>
              </div>
            </Card>
          )}

          <div className="flex justify-center pt-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loading}
                className="min-w-[250px] py-4 text-xl"
                onClick={() => navigate(isAdminView ? '/admin/alunos' : '/')}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={!formData.aceite_termo}
                className="min-w-[250px] bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 text-xl shadow-lg"
              >
                {isAdmin && formData.turma_id ? (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Cadastrar e Ativar Aluno
                  </>
                ) : isAdmin ? (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar Matrícula
                  </>
                ) : (
                  'Enviar Pré-matrícula'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;