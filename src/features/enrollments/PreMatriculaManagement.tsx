import React from 'react';
import { FileUpload } from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import { usePreMatriculaManagement } from '../../hooks/usePreMatriculaManagement';
import { REQUIRED_DOCUMENTS, PRE_MATRICULA_STATUS_OPTIONS as STATUS_OPTIONS } from '../../constants/enrollment';
import type { StatusPreMatricula, TipoDocumento } from '../../types/database';
import { RegistrationCard } from '../../components/RegistrationCard';
import { Printer, User as UserIcon, Edit, Save, X, Trash2 } from 'lucide-react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { formatLocalDate } from '../../shared/utils/dateUtils';

export const PreMatriculaManagement: React.FC = () => {
  const {
    preMatriculasEmAnalise,
    preMatriculasAtivas,
    selectedPreMatricula,
    setSelectedPreMatricula,
    documentos,
    isLoading,
    isUploading,
    isConcluding,
    selectedDocumentType,
    setSelectedDocumentType,
    validadeDocumento,
    setValidadeDocumento,
    selectedFile,
    selectedPoloId,
    setSelectedPoloId,
    turmas,
    selectedTurmaId,
    setSelectedTurmaId,
    handleFileSelected,
    handleUploadSelectedFile,
    handleConcluir,
    handleUpdateStatus,
    allRequiredDocumentsUploaded,
    isDocumentMissing,
    polos,
    niveis,
    hasAccessToAllPolos,
    photoUrl,
    selectedData,
    isEditing,
    editFormData,
    handleEditToggle,
    handleEditChange,
    handleUpdateData,
    handleDelete,
  } = usePreMatriculaManagement();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && !selectedPreMatricula) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Gerenciamento de Pré-matrículas"
        subtitle="Analise documentos e oficialize a matrícula dos alunos"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasAccessToAllPolos() && polos && polos.length > 0 && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Filtrar por Polo:</span>
              <select
                className="block w-full md:w-64 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedPoloId}
                onChange={(e) => setSelectedPoloId(e.target.value)}
              >
                <option value="all">Todos os Polos</option>
                {polos.map((polo) => (
                  <option key={polo.id} value={polo.id}>
                    {polo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      {/* Indicação da visão atual: geral x polo específico */}
      <div className="mb-4">
        {hasAccessToAllPolos() ? (
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Visão:</span>{' '}
            {selectedPoloId === 'all'
              ? 'Visão geral de todos os polos.'
              : `Visão filtrada do polo "${polos.find(p => p.id === selectedPoloId)?.name || 'Polo selecionado'}".`}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Visão:</span>{' '}
            Visão restrita ao seu polo de atuação. As matrículas listadas abaixo pertencem apenas ao seu polo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de pré-matrículas em análise e ativas */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pré-matrículas em análise</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {preMatriculasEmAnalise.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma pré-matrícula em análise
                </div>
              ) : (
                preMatriculasEmAnalise.map((preMatricula) => (
                  <button
                    key={preMatricula.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedPreMatricula === preMatricula.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedPreMatricula(preMatricula.id)}
                  >
                    <div className="font-medium text-gray-900">
                      {preMatricula.nome_completo}
                    </div>
                    <div className="text-sm text-gray-500">
                      CPF: {preMatricula.cpf}
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Em análise
                      </span>
                      {(preMatricula as any).tipo === 'transferencia' && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Transferência
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pré-matrículas ativas</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {preMatriculasAtivas.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma pré-matrícula ativa para o filtro selecionado
                </div>
              ) : (
                preMatriculasAtivas.map((preMatricula) => (
                  <button
                    key={preMatricula.id}
                    className={`w-full text-left p-4 border-l-4 border-green-500 bg-green-50/40 hover:bg-green-100 transition-colors ${
                      selectedPreMatricula === preMatricula.id ? 'bg-green-100' : ''
                    }`}
                    onClick={() => setSelectedPreMatricula(preMatricula.id)}
                  >
                    <div className="font-medium text-gray-900">
                      {preMatricula.nome_completo}
                    </div>
                    <div className="text-sm text-gray-500">
                      CPF: {preMatricula.cpf}
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativa
                      </span>
                      {(preMatricula as any).tipo === 'transferencia' && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Transferência
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Área de documentos */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPreMatricula ? (
            <>
              {/* Informações da pré-matrícula */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dados da Pré-matrícula
                  </h3>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditToggle}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Editar Dados
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDelete()}
                          className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancelar Matrícula
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditToggle}
                          className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => void handleUpdateData()}
                          className="flex items-center gap-1"
                        >
                          <Save className="h-4 w-4" />
                          Salvar Alterações
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {!selectedData ? (
                    <p className="text-sm text-gray-500">Carregando informações...</p>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Foto 3x4 em Destaque */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                            {photoUrl ? (
                              <img src={photoUrl} alt="Foto 3x4" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center text-gray-400">
                                <UserIcon className="h-10 w-10 mx-auto mb-1" />
                                <span className="text-[10px] uppercase font-bold">Sem Foto</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => setSelectedDocumentType('foto')}
                          >
                            Trocar Foto
                          </Button>
                        </div>

                        <div className="flex-1 space-y-8">
                          {/* Seção: Dados Pessoais */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Dados Pessoais</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-500">Nome Completo</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.nome_completo || ''}
                                    onChange={(e) => handleEditChange('nome_completo', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900 font-medium">{selectedData.nome_completo}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">CPF</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.cpf || ''}
                                    onChange={(e) => handleEditChange('cpf', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData.cpf || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Data de Nascimento</label>
                                {isEditing ? (
                                  <Input
                                    type="date"
                                    value={editFormData?.data_nascimento || ''}
                                    onChange={(e) => handleEditChange('data_nascimento', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">
                                    {selectedData.data_nascimento ? formatLocalDate(selectedData.data_nascimento, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Sexo</label>
                                {isEditing ? (
                                  <Select
                                    value={editFormData?.sexo || ''}
                                    onChange={(val) => handleEditChange('sexo', val)}
                                    options={[
                                      { value: 'M', label: 'Masculino' },
                                      { value: 'F', label: 'Feminino' },
                                      { value: 'Outro', label: 'Outro' }
                                    ]}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.sexo === 'M' ? 'Masculino' : selectedData?.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Naturalidade</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.naturalidade || ''}
                                    onChange={(e) => handleEditChange('naturalidade', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.naturalidade || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Nacionalidade</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.nacionalidade || ''}
                                    onChange={(e) => handleEditChange('nacionalidade', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.nacionalidade || 'N/A'}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Seção: Identidade */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Identidade (RG)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-500">Número do RG</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.rg || ''}
                                    onChange={(e) => handleEditChange('rg', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.rg || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Órgão Emissor</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.rg_orgao || ''}
                                    onChange={(e) => handleEditChange('rg_orgao', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.rg_orgao || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Data de Expedição</label>
                                {isEditing ? (
                                  <Input
                                    type="date"
                                    value={editFormData?.rg_data_expedicao || ''}
                                    onChange={(e) => handleEditChange('rg_data_expedicao', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">
                                    {selectedData?.rg_data_expedicao ? formatLocalDate(selectedData.rg_data_expedicao, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Seção: Institucional / Escolar */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Escolaridade e Nível</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-500">Nível Desejado</label>
                                {isEditing ? (
                                  <Select
                                    value={editFormData?.nivel_id || ''}
                                    onChange={(val) => handleEditChange('nivel_id', val)}
                                    options={niveis.map(n => ({ value: n.id, label: n.nome }))}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900 font-bold">
                                    {niveis.find(n => n.id === (selectedData?.nivel_id || (selectedData as any)?.nivel_atual_id))?.nome || 'N/A'}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Escola de Origem</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.escola_origem || ''}
                                    onChange={(e) => handleEditChange('escola_origem', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.escola_origem || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Ano Escolar</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.ano_escolar || ''}
                                    onChange={(e) => handleEditChange('ano_escolar', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.ano_escolar || 'N/A'}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-gray-200 pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Endereço */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Endereço</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500">CEP</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.endereco?.cep || ''}
                                    onChange={(e) => handleEditChange('endereco.cep', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.endereco?.cep || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Logradouro</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.endereco?.rua || ''}
                                    onChange={(e) => handleEditChange('endereco.rua', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.endereco?.rua || 'N/A'}, {selectedData?.endereco?.numero || 'S/N'}</p>
                                )}
                              </div>
                              {isEditing && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Número</label>
                                  <Input
                                    value={editFormData?.endereco?.numero || ''}
                                    onChange={(e) => handleEditChange('endereco.numero', e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="text-xs font-medium text-gray-500">Bairro</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData?.endereco?.bairro || ''}
                                    onChange={(e) => handleEditChange('endereco.bairro', e.target.value)}
                                    className="mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData?.endereco?.bairro || 'N/A'}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500">Cidade/UF</label>
                                {isEditing ? (
                                  <div className="flex gap-2 mt-1">
                                    <Input
                                      value={editFormData?.endereco?.cidade || ''}
                                      onChange={(e) => handleEditChange('endereco.cidade', e.target.value)}
                                      placeholder="Cidade"
                                    />
                                    <Input
                                      value={editFormData?.endereco?.estado || ''}
                                      onChange={(e) => handleEditChange('endereco.estado', e.target.value)}
                                      placeholder="UF"
                                      className="w-20"
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-900">{selectedData.endereco?.cidade || 'N/A'} - {selectedData.endereco?.estado || 'N/A'}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Responsável */}
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Responsável Principal</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Nome</label>
                                  {isEditing ? (
                                    <Input
                                      value={editFormData?.nome_responsavel || ''}
                                      onChange={(e) => handleEditChange('nome_responsavel', e.target.value)}
                                      className="mt-1"
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-900 font-medium">{selectedData?.nome_responsavel || 'N/A'}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Parentesco / CPF</label>
                                  {isEditing ? (
                                    <div className="flex gap-2 mt-1">
                                      <Select
                                        value={editFormData?.tipo_parentesco || ''}
                                        onChange={(val) => handleEditChange('tipo_parentesco', val)}
                                        options={[
                                          { value: 'pai', label: 'Pai' },
                                          { value: 'mae', label: 'Mãe' },
                                          { value: 'tutor', label: 'Tutor' },
                                          { value: 'outro', label: 'Outro' }
                                        ]}
                                      />
                                      <Input
                                        value={editFormData?.cpf_responsavel || ''}
                                        onChange={(e) => handleEditChange('cpf_responsavel', e.target.value)}
                                        placeholder="CPF"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-900">{selectedData?.tipo_parentesco || 'N/A'} | CPF: {selectedData?.cpf_responsavel || 'N/A'}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Contato</label>
                                  {isEditing ? (
                                    <div className="space-y-2 mt-1">
                                      <Input
                                        value={editFormData?.email_responsavel || ''}
                                        onChange={(e) => handleEditChange('email_responsavel', e.target.value)}
                                        placeholder="Email"
                                      />
                                      <Input
                                        value={editFormData?.telefone_responsavel || ''}
                                        onChange={(e) => handleEditChange('telefone_responsavel', e.target.value)}
                                        placeholder="Telefone"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-sm text-gray-900">{selectedData?.email_responsavel || 'N/A'}</p>
                                      <p className="text-sm text-gray-900">{selectedData?.telefone_responsavel || 'N/A'}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Responsável 2 */}
                            {(isEditing || selectedData?.nome_responsavel_2) && (
                              <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Segundo Responsável</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-medium text-gray-500">Nome</label>
                                    {isEditing ? (
                                      <Input
                                        value={editFormData?.nome_responsavel_2 || ''}
                                        onChange={(e) => handleEditChange('nome_responsavel_2', e.target.value)}
                                        className="mt-1"
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900">{selectedData?.nome_responsavel_2}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500">Parentesco / Contato</label>
                                    {isEditing ? (
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <Input
                                          value={editFormData?.tipo_parentesco_2 || ''}
                                          onChange={(e) => handleEditChange('tipo_parentesco_2', e.target.value)}
                                          placeholder="Parentesco"
                                        />
                                        <Input
                                          value={editFormData?.telefone_responsavel_2 || ''}
                                          onChange={(e) => handleEditChange('telefone_responsavel_2', e.target.value)}
                                          placeholder="Telefone"
                                        />
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-900">{selectedData?.tipo_parentesco_2} | Tel: {selectedData?.telefone_responsavel_2 || 'N/A'}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Saúde / Observações */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Saúde e Segurança</h4>
                            <div className="space-y-4">
                              <div className={!isEditing && (selectedData?.alergias || selectedData?.restricao_alimentar) ? "bg-red-50 p-3 rounded-md" : ""}>
                                <label className="text-xs font-medium text-gray-500">Alergias e Restrições</label>
                                {isEditing ? (
                                  <div className="space-y-2 mt-1">
                                    <Input
                                      value={editFormData?.alergias || ''}
                                      onChange={(e) => handleEditChange('alergias', e.target.value)}
                                      placeholder="Alergias"
                                    />
                                    <Input
                                      value={editFormData?.restricao_alimentar || ''}
                                      onChange={(e) => handleEditChange('restricao_alimentar', e.target.value)}
                                      placeholder="Restrições Alimentares"
                                    />
                                    <Input
                                      value={editFormData?.medicacao_continua || ''}
                                      onChange={(e) => handleEditChange('medicacao_continua', e.target.value)}
                                      placeholder="Medicação Contínua"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-900 space-y-1 mt-1">
                                    {selectedData?.alergias && <p><span className="font-semibold text-red-600">Alergias:</span> {selectedData.alergias}</p>}
                                    {selectedData?.restricao_alimentar && <p><span className="font-semibold text-red-600">Restrições:</span> {selectedData.restricao_alimentar}</p>}
                                    {selectedData?.medicacao_continua && <p><span className="font-semibold">Medicação:</span> {selectedData.medicacao_continua}</p>}
                                    {!selectedData?.alergias && !selectedData?.restricao_alimentar && !selectedData?.medicacao_continua && <p>Nenhuma informada</p>}
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium text-gray-500">Contato de Emergência</label>
                                {isEditing ? (
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Input
                                      value={editFormData?.contato_emergencia_nome || ''}
                                      onChange={(e) => handleEditChange('contato_emergencia_nome', e.target.value)}
                                      placeholder="Nome"
                                    />
                                    <Input
                                      value={editFormData?.contato_emergencia_telefone || ''}
                                      onChange={(e) => handleEditChange('contato_emergencia_telefone', e.target.value)}
                                      placeholder="Telefone"
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-900 mt-1">{selectedData?.contato_emergencia_nome} ({selectedData?.contato_emergencia_telefone || 'N/A'})</p>
                                )}
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500">Observações Gerais</label>
                                {isEditing ? (
                                  <textarea
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 bg-white border"
                                    rows={3}
                                    value={editFormData?.observacoes || ''}
                                    onChange={(e) => handleEditChange('observacoes', e.target.value)}
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900 italic mt-1">{selectedData?.observacoes || (selectedData as any)?.metadata?.observacoes || 'Sem observações'}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload de documentos */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Envio de Documentos
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        id="documentType"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={selectedDocumentType}
                        onChange={(e) => setSelectedDocumentType(e.target.value as TipoDocumento)}
                      >
                        {REQUIRED_DOCUMENTS.map((doc) => (
                          <option key={doc.value} value={doc.value}>
                            {doc.label}
                          </option>
                        ))}
                        <option value="outro">Outro Documento</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="documentValidity" className="block text-sm font-medium text-gray-700 mb-1">
                        Validade do Documento (opcional)
                      </label>
                      <input
                        type="date"
                        id="documentValidity"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={validadeDocumento}
                        onChange={(e) => setValidadeDocumento(e.target.value)}
                      />
                    </div>

                    <FileUpload
                      folder={`pre-matriculas/${selectedPreMatricula}`}
                      onUploadComplete={() => undefined}
                      onFileSelected={handleFileSelected}
                      autoUpload={false}
                      accept="image/*,.pdf,.doc,.docx"
                      maxSizeMB={10}
                      label={`Arraste e solte o arquivo do ${REQUIRED_DOCUMENTS.find(d => d.value === selectedDocumentType)?.label || 'documento'} aqui ou clique para selecionar`}
                    />

                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={() => void handleUploadSelectedFile()}
                        disabled={isUploading || !selectedFile}
                      >
                        Enviar documento
                      </Button>
                    </div>
                  </div>

                  {/* Lista de documentos obrigatórios */}
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos Obrigatórios</h4>
                    <ul className="space-y-2">
                      {REQUIRED_DOCUMENTS.map((doc) => {
                        const isMissing = isDocumentMissing(doc.value);
                        return (
                          <li key={doc.value} className="flex items-center">
                            {isMissing ? (
                              <svg
                                className="h-5 w-5 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5 text-green-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <span
                              className={`ml-2 text-sm ${
                                isMissing ? 'text-red-600' : 'text-gray-700'
                              }`}
                            >
                              {doc.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lista de documentos enviados */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Documentos Enviados
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documentos.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Nenhum documento enviado.</div>
                      ) : (
                        documentos.map((doc) => (
                          <div key={doc.path} className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                              <div className="text-xs text-gray-500 truncate">{doc.path}</div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              Visualizar
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Ações</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-end gap-3">
                  <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                    <select
                      className="block w-full md:w-80 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedTurmaId}
                      onChange={(e) => setSelectedTurmaId(e.target.value)}
                    >
                      <option value="">Selecione uma turma...</option>
                      {(() => {
                        const poloId = selectedData?.polo_id;
                        const turmasFiltradas = poloId
                          ? turmas.filter((t) => t.polo_id === poloId)
                          : turmas;

                        return turmasFiltradas.map((turma) => {
                          const nivel = niveis.find(n => n.id === (turma as any).nivel_id)?.nome;
                          const modulo = (turma as any).modulo_titulo || 'Módulo ?';
                          return (
                            <option key={turma.id} value={turma.id}>
                              {turma.nome} [{nivel} - {modulo}]
                            </option>
                          );
                        });
                      })()}
                    </select>
                    {selectedTurmaId && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-[10px] text-green-700">
                        <p className="font-bold">O aluno será vinculado a:</p>
                        <p>
                          Nível: {niveis.find(n => n.id === (turmas.find(t => t.id === selectedTurmaId) as any)?.nivel_id)?.nome || '—'} | 
                          Módulo: {(turmas.find(t => t.id === selectedTurmaId) as any)?.modulo_titulo || '—'}
                        </p>
                      </div>
                    )}
                  </div>

                  <select
                    className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                    onChange={(e) => {
                      const status = e.target.value as StatusPreMatricula;
                      if (status) {
                        void handleUpdateStatus(status);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>
                      Alterar status...
                    </option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Ficha
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => void handleConcluir()}
                    disabled={isUploading || isConcluding || !allRequiredDocumentsUploaded || !selectedTurmaId}
                    title={
                      !allRequiredDocumentsUploaded
                        ? 'Todos os documentos obrigatórios devem ser enviados antes de aprovar.'
                        : !selectedTurmaId
                          ? 'Selecione uma turma antes de concluir.'
                        : ''
                    }
                  >
                    Concluir matrícula
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white shadow sm:rounded-lg border border-gray-100">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma pré-matrícula selecionada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecione uma pré-matrícula da lista ao lado para visualizar os detalhes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Componente Invisível para Impressão */}
      <div className="hidden print:block">
        {selectedData && (
          <RegistrationCard data={selectedData} photoUrl={photoUrl} />
        )}
      </div>
    </div>
  </div>
  );
};

export default PreMatriculaManagement;
