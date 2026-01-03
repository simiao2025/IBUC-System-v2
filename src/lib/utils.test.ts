import { describe, it, expect } from 'vitest';
import { formatCPF, formatCEP, formatPhone, formatCurrency } from './format';

describe('Utils: format', () => {
    describe('formatCPF', () => {
        it('should format clean CPF string correctly', () => {
            expect(formatCPF('12345678901')).toBe('123.456.789-01');
        });
        
        it('should handle input with existing non-digit characters', () => {
            expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
        });

        it('should handle input with existing non-digit characters', () => {
            expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
        });
    });

    describe('formatCEP', () => {
        it('should format clean CEP string correctly', () => {
            expect(formatCEP('12345678')).toBe('12345-678');
        });

        it('should truncate extra characters', () => {
            expect(formatCEP('123456789')).toBe('12345-678');
        });
    });

    describe('formatPhone', () => {
        it('should format 10-digit phone', () => {
            expect(formatPhone('1198765432')).toBe('(11) 9876-5432');
        });

        it('should format 11-digit phone', () => {
             expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
        });
    });

    describe('formatCurrency', () => {
        it('should format number to BRL', () => {
            // Note: Exact string might depend on node environment (NTSP) but typically:
            // "R$ 1.234,56" or "R$1.234,56". We check for standard node/browser pt-BR output.
            const result = formatCurrency(1234.56);
            // Replace non-breaking initial space if present often used by Intl
            const normalized = result.replace(/\u00A0/g, ' '); 
            expect(normalized).toMatch(/R\$\s?1\.234,56/);
        });
    });
});
