import React, { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';

interface PhotoUploadProps {
    value?: File | string | null;
    onChange: (file: File | null) => void;
    error?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ value, onChange, error }) => {
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string' ? value : null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Validação de tipo
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert('Apenas arquivos JPG e PNG são aceitos');
            return;
        }

        // Validação de tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('O arquivo deve ter no máximo 5MB');
            return;
        }

        // Cria preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onChange(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Camera className="h-4 w-4 text-red-600" />
                Foto do Aluno
            </label>

            <div className="flex flex-col items-start gap-3">
                {/* Preview Circle */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 overflow-hidden flex items-center justify-center">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Foto do aluno"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-gray-400" />
                        )}
                    </div>

                    {/* Camera Button */}
                    <button
                        type="button"
                        onClick={handleClick}
                        className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
                    >
                        <Camera className="h-4 w-4" />
                    </button>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Info Text */}
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Formatos aceitos:</strong> JPG, PNG</p>
                    <p><strong>Tamanho máximo:</strong> 5MB</p>
                    <p className="text-gray-500 italic">A foto será exibida na ficha do aluno</p>
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>
        </div>
    );
};

export default PhotoUpload;
