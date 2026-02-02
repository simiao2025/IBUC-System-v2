import React from 'react';
import { User, MapPin, Phone, Heart, Users, FileText } from 'lucide-react';

const BlankStudentForm: React.FC = () => {
    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto text-gray-900 print:p-0" id="blank-student-form">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <img src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png" alt="Logo IBUC" className="h-16 w-auto" />
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Ficha de Inscrição de Aluno</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase">Instituto Bíblico Único Caminho</p>
                    </div>
                </div>
                <div className="w-24 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 text-center p-2 uppercase font-bold">
                    Foto 3x4
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Dados Pessoais */}
                <section>
                    <h2 className="flex items-center text-sm font-black uppercase text-red-600 mb-2 border-b border-gray-100 pb-1">
                        <User className="h-4 w-4 mr-2" /> Dados Pessoais
                    </h2>
                    <div className="grid grid-cols-12 gap-y-4 gap-x-2">
                        <div className="col-span-8 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Nome Completo</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Data de Nascimento</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-3 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Sexo</span>
                            <div className="flex gap-4 mt-1">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-400"></div> M</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-400"></div> F</span>
                            </div>
                        </div>
                        <div className="col-span-3 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">CPF</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-3 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">RG</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-3 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Órgão Emissor</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-6 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Naturalidade</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-6 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Nacionalidade</span>
                            <div className="h-4"></div>
                        </div>
                    </div>
                </section>

                {/* Endereço */}
                <section>
                    <h2 className="flex items-center text-sm font-black uppercase text-red-600 mb-2 border-b border-gray-100 pb-1">
                        <MapPin className="h-4 w-4 mr-2" /> Endereço
                    </h2>
                    <div className="grid grid-cols-12 gap-y-4 gap-x-2">
                        <div className="col-span-10 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Rua/Logradouro</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-2 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Nº</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Complemento</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Bairro</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">CEP</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-8 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Cidade</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Estado</span>
                            <div className="h-4"></div>
                        </div>
                    </div>
                </section>

                {/* Contatos e Acadêmico */}
                <div className="grid grid-cols-2 gap-6">
                    <section>
                        <h2 className="flex items-center text-sm font-black uppercase text-red-600 mb-2 border-b border-gray-100 pb-1">
                            <Phone className="h-4 w-4 mr-2" /> Contato
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b border-gray-300 pb-1 text-xs">
                                <span className="font-bold uppercase text-[9px] text-gray-500 block">Telefone Responsável</span>
                                <div className="h-4"></div>
                            </div>
                            <div className="border-b border-gray-300 pb-1 text-xs">
                                <span className="font-bold uppercase text-[9px] text-gray-500 block">E-mail</span>
                                <div className="h-4"></div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="flex items-center text-sm font-black uppercase text-red-600 mb-2 border-b border-gray-100 pb-1">
                            <FileText className="h-4 w-4 mr-2" /> Acadêmico
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b border-gray-300 pb-1 text-xs">
                                <span className="font-bold uppercase text-[9px] text-gray-500 block">Polo Específico</span>
                                <div className="h-4"></div>
                            </div>
                            <div className="border-b border-gray-300 pb-1 text-xs">
                                <span className="font-bold uppercase text-[9px] text-gray-500 block">Escola de Origem (EBM)</span>
                                <div className="h-4"></div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Responsáveis */}
                <section>
                    <h2 className="flex items-center text-sm font-black uppercase text-red-600 mb-2 border-b border-gray-100 pb-1">
                        <Users className="h-4 w-4 mr-2" /> Filiação / Responsáveis
                    </h2>
                    <div className="grid grid-cols-12 gap-y-4 gap-x-2">
                        <div className="col-span-8 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Nome do 1º Responsável (Pai/Mãe/Tutor)</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">CPF do Responsável</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-8 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Nome do 2º Responsável (Opcional)</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-4 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">CPF do 2º Responsável</span>
                            <div className="h-4"></div>
                        </div>
                    </div>
                </section>

                {/* Saúde */}
                <section>
                    <h2 className="flex items-center text-sm font-black uppercase text-red-600 mb-2 border-b border-gray-100 pb-1">
                        <Heart className="h-4 w-4 mr-2" /> Informações de Saúde
                    </h2>
                    <div className="grid grid-cols-12 gap-y-4 gap-x-2">
                        <div className="col-span-6 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Alergias</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-6 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Restrição Alimentar</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-12 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Medicação Contínua / Doenças Crônicas</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-6 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Contato de Emergência (Nome)</span>
                            <div className="h-4"></div>
                        </div>
                        <div className="col-span-6 border-b border-gray-300 pb-1 text-xs">
                            <span className="font-bold uppercase text-[9px] text-gray-500 block">Contato de Emergência (Telefone)</span>
                            <div className="h-4"></div>
                        </div>
                    </div>
                </section>

                {/* Assinatura */}
                <section className="mt-8">
                    <div className="grid grid-cols-2 gap-12">
                        <div className="text-center pt-8 border-t border-gray-400 text-[10px] uppercase font-bold text-gray-500">
                            Assinatura do Responsável
                        </div>
                        <div className="text-center pt-8 border-t border-gray-400 text-[10px] uppercase font-bold text-gray-500">
                            Secretaria IBUC (Assinatura/Carimbo)
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[9px] text-gray-700 uppercase font-black font-sans bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="w-4 h-4 border-2 border-red-600 flex-shrink-0"></div>
                        <span>AUTORIZO O USO DA IMAGEM DO ALUNO PARA FINS DE DIVULGAÇÃO INSTITUCIONAL E PEDAGÓGICA (REDES SOCIAIS, SITE, IMPRESSOS), CONFORME A LGPD.</span>
                    </div>
                    <p className="mt-4 text-[8px] text-gray-400 text-center italic">
                        Autorizo o IBUC a prestar primeiros socorros e encaminhar ao hospital em caso de emergência médica.
                        Declaro que as informações acima são verdadeiras.
                    </p>
                </section>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    #blank-student-form, #blank-student-form * { visibility: visible; }
                    #blank-student-form {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    .no-print { display: none !important; }
                }
            `}} />
        </div>
    );
};

export default BlankStudentForm;
