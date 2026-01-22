/**
 * Utilitário para geração de payload PIX (BRCode) seguindo o padrão EMV QRCPS.
 * Permite que qualquer aplicativo bancário reconheça o pagamento.
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

interface PixParams {
  key: string;
  receiverName: string;
  receiverCity: string;
  amount?: number;
  transactionId?: string;
  message?: string;
}

export function generatePixPayload({
  key,
  receiverName,
  receiverCity,
  amount,
  transactionId = '***',
  message
}: PixParams): string {
  // Validação: chave PIX é obrigatória
  if (!key || key.trim() === '') {
    throw new Error('Chave PIX não configurada. Configure em Admin > Financeiro > Configuração');
  }

  const payload: string[] = [];

  // 00: Payload Format Indicator
  payload.push(formatField('00', '01'));

  // 26: Merchant Account Information - PIX
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', key.trim());
  const infoAdicional = message ? formatField('02', message) : '';
  payload.push(formatField('26', `${gui}${keyField}${infoAdicional}`));

  // 52: Merchant Category Code
  payload.push(formatField('52', '0000'));

  // 53: Transaction Currency (BRL = 986)
  payload.push(formatField('53', '986'));

  // 54: Transaction Amount
  if (amount && amount > 0) {
    payload.push(formatField('54', amount.toFixed(2)));
  }

  // 58: Country Code
  payload.push(formatField('58', 'BR'));

  // 59: Merchant Name
  // Alfanumérico, espaços e caracteres básicos permitidos pelo EMV. 
  // Removendo acentos e caracteres não permitidos para evitar rejeição em alguns bancos.
  const safeName = receiverName || 'BENEFICIARIO';
  const cleanName = safeName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '')     // Apenas letras, números e espaços (mais seguro)
    .trim()
    .substring(0, 25)
    .toUpperCase();
  payload.push(formatField('59', cleanName));

  // 60: Merchant City
  const safeCity = receiverCity || 'SAO PAULO';
  const cleanCity = safeCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .substring(0, 15)
    .toUpperCase();
  payload.push(formatField('60', cleanCity));

  // 62: Additional Data Field (TXID)
  // IMPORTANTE: TXID em PIX Estático deve ser estritamente alfanumérico [a-zA-Z0-9]
  // Muitos bancos rejeitam hyphens (-) no TXID.
  const cleanTxId = (transactionId || '***')
    .replace(/[^a-zA-Z0-9]/g, '') // Remove hyphens e outros caracteres
    .substring(0, 25);
  
  const txidFinal = cleanTxId || '***';
  const txidField = formatField('05', txidFinal);
  payload.push(formatField('62', txidField));

  // 63: CRC16
  const prePayload = payload.join('') + '6304';
  const crc = calculateCRC16(prePayload);

  return prePayload + crc;
}
