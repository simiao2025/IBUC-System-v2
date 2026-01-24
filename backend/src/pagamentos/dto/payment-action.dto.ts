export class UploadComprovanteDto {
  comprovante_url: string;
}

export class RejeitarPagamentoDto {
  rejection_note: string;
  diretor_id: string; // Quem rejeitou
}

export class AprovarPagamentoDto {
  diretor_id: string; // Quem aprovou
}

export class InitiatePaymentDto {
  mensalidade_id: string;
  metodo: 'pix' | 'cartao' | 'boleto' | 'dinheiro'; // Expansível
}
