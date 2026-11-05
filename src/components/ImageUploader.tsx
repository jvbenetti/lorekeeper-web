'use client';

import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  value?: string;
  onChange?: (imageUrl: string) => void;
  label?: string;
}

export default function ImageUploader({
  value = '',
  onChange,
  label = 'Capturar ou Enviar Ilustração',
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [fileName, setFileName] = useState<string>('');
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsSimulatingUpload(true);

    // Simula upload e retorna uma URL genérica do grimório de Lamúria
    setTimeout(() => {
      const simulatedUrl = `https://cdn.lamuria.rpg/codex/${Date.now()}-${encodeURIComponent(
        file.name
      )}`;
      setPreviewUrl(simulatedUrl);
      setIsSimulatingUpload(false);
      onChange?.(simulatedUrl);
    }, 500);
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs uppercase tracking-widest text-[#c8aa6e] font-serif">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer rounded-md border border-dashed border-[#c8aa6e]/60 bg-[#121216] p-4 transition hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/5 active:scale-[0.99]"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c8aa6e]/40 bg-[#09090b] text-[#c8aa6e]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>

          {isSimulatingUpload ? (
            <p className="text-sm text-[#c8aa6e] animate-pulse">
              Gravando registro místico...
            </p>
          ) : previewUrl ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#c8aa6e]">
                Imagem vinculada ({fileName || 'URL gerada'})
              </p>
              <p className="max-w-xs truncate text-[11px] text-[#e4e4e7]/60">
                {previewUrl}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-[#e4e4e7]">
                Toque para abrir a câmera traseira
              </p>
              <p className="text-xs text-[#e4e4e7]/60">
                Otimizado para captura rápida no iPhone do Mestre
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
