import React, { useState, useRef } from 'react';
import { FileText, Upload, X, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
    label: string;
    tipo: string;
    value?: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    required?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
    label,
    tipo,
    value,
    onChange,
    error,
    required = false
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>(value?.name || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Validação de tipo
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Apenas arquivos JPG, PNG e PDF são aceitos');
            return;
        }

        // Validação de tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('O arquivo deve ter no máximo 10MB');
            return;
        }

        setFileName(file.name);
        onChange(file);
    };

    const handleRemove = () => {
        setFileName('');
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="flex items-center gap-3">
                {/* Upload Button or File Display */}
                {!fileName ? (
                    <button
                        type="button"
                        onClick={handleClick}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600"
                    >
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">Selecionar arquivo</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700 flex-1 truncate max-w-xs">
                            {fileName}
                        </span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                            <X className="h-4 w-4 text-red-600" />
                        </button>
                    </div>
                )}

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500">
                Formatos: JPG, PNG, PDF | Máx: 10MB
            </p>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default DocumentUpload;
