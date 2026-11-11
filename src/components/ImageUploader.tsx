'use client';

import React, { useState, useRef, useEffect } from 'react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

interface ImageUploaderProps {
  value?: string;
  onImageUploaded?: (url: string) => void;
  onChange?: (url: string) => void;
  label?: string;
}

export default function ImageUploader({
  value = '',
  onImageUploaded,
  onChange,
  label = 'Capturar ou Enviar Ilustração',
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadError(null);
    setIsUploading(true);

    try {
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      const uniqueFilePath = `${Date.now()}-${sanitizedName}`;

      const { data: uploadData, error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uniqueFilePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError || !uploadData) {
        throw new Error(
          storageError?.message ||
            'Falha ao enviar a imagem para o arquivo arcano (Supabase Storage).'
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      const finalUrl = publicUrlData.publicUrl;

      setPreviewUrl(finalUrl);
      onImageUploaded?.(finalUrl);
      onChange?.(finalUrl);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Erro de conexão ao tentar enviar a imagem.'
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs uppercase tracking-widest text-[#c8aa6e] font-serif">
        {label}
      </label>

      <div
        onClick={() => {
          if (!isUploading) {
            inputRef.current?.click();
          }
        }}
        className={`relative rounded-md border border-dashed p-4 transition ${
          isUploading
            ? 'cursor-wait border-[#c8aa6e]/50 bg-[#121216]/80'
            : 'cursor-pointer border-[#c8aa6e]/60 bg-[#121216] hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/5 active:scale-[0.99]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={isUploading}
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {isUploading ? (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c8aa6e]/50 bg-[#09090b] text-[#c8aa6e]">
                <svg
                  className="h-5 w-5 animate-spin text-[#c8aa6e]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <p className="font-serif text-xs uppercase tracking-wider text-[#c8aa6e] animate-pulse">
                Fazendo upload para o grimório...
              </p>
              <p className="text-[11px] text-[#e4e4e7]/50">
                Aguarde enquanto a imagem é selada no Supabase
              </p>
            </>
          ) : (
            <>
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

              {previewUrl ? (
                <div className="w-full space-y-2">
                  <div className="mx-auto h-28 w-28 overflow-hidden rounded border border-[#c8aa6e]/40 bg-[#09090b]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Prévia da ilustração"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-[#c8aa6e]">
                    Imagem sincronizada ({fileName || 'Toque para substituir'})
                  </p>
                  <p className="mx-auto max-w-xs truncate text-[11px] text-[#e4e4e7]/60">
                    {previewUrl}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-[#e4e4e7]">
                    Toque para abrir a câmera traseira
                  </p>
                  <p className="text-xs text-[#e4e4e7]/60">
                    Upload direto para o bucket{' '}
                    <span className="text-[#c8aa6e]">lorekeeper-images</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alerta sutil de erro na estética Dark Fantasy (tons de vermelho escuro / vinho) */}
      {uploadError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-md border border-[#7f1d1d] bg-[#2a0a0e]/90 px-3 py-2.5 text-xs text-[#fca5a5] shadow-[0_0_12px_rgba(127,29,29,0.25)]"
        >
          <div className="space-y-0.5">
            <span className="block font-serif text-[10px] font-bold uppercase tracking-widest text-[#f87171]">
              Falha no Ritual de Upload
            </span>
            <p className="text-[11px] leading-relaxed text-[#fecaca]/90">
              {uploadError}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="shrink-0 text-xs text-[#f87171]/70 hover:text-[#fca5a5]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
