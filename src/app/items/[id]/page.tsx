'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { lorekeeperApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import ItemPropertiesForm from '@/components/ItemPropertiesForm';
import type { ItemResponse, ItemType, ItemProperties } from '@/types/api';

const ITEM_TYPES: ItemType[] = ['WEAPON', 'ARMOR', 'ARTIFACT', 'POTION'];

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal de Edição (PUT /items/:id)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<ItemType>('WEAPON');
  const [editLore, setEditLore] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editProps, setEditProps] = useState<ItemProperties>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadItem = useCallback(async () => {
    if (!params?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await lorekeeperApi.getItemById(params.id);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar item.');
    } finally {
      setIsLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const openEditModal = () => {
    if (!item) return;
    setEditName(item.name);
    setEditType(item.type);
    setEditLore(item.lore || '');
    setEditImageUrl(item.image_url || '');
    setEditProps(item.properties || {});
    setIsEditOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      await lorekeeperApi.updateItem(item.id, {
        name: editName.trim(),
        type: editType,
        lore: editLore,
        image_url: editImageUrl,
        properties: editProps,
      });
      setIsEditOpen(false);
      setFeedback('Item atualizado com sucesso!');
      await loadItem();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao atualizar item.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!item) return;
    if (!window.confirm(`Deseja realmente remover o item "${item.name}"?`))
      return;
    try {
      await lorekeeperApi.deleteItem(item.id);
      router.push('/');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao remover item.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-[#121216]" />
          <div className="h-64 animate-pulse rounded border border-[#c8aa6e]/20 bg-[#121216]" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] p-6">
        <div className="mx-auto max-w-4xl rounded border border-[#c8aa6e]/30 bg-[#121216] p-8 text-center">
          <p className="font-serif text-lg text-[#c8aa6e]">
            {error || 'Item não encontrado'}
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded border border-[#c8aa6e] px-4 py-2 text-xs uppercase tracking-widest text-[#c8aa6e]"
          >
            ← Voltar ao Codex
          </Link>
        </div>
      </div>
    );
  }

  const props = item.properties;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] pb-20">
      <header className="sticky top-0 z-20 border-b border-[#c8aa6e]/30 bg-[#09090b]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-serif text-xs uppercase tracking-widest text-[#c8aa6e] hover:underline"
          >
            ← Voltar ao Codex
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={openEditModal}
                className="rounded border border-[#c8aa6e] bg-[#121216] px-3 py-1.5 font-serif text-xs uppercase tracking-wider text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#09090b]"
              >
                Editar (PUT)
              </button>
              <button
                onClick={handleDeleteItem}
                className="rounded border border-red-500/50 bg-red-950/30 px-3 py-1.5 font-serif text-xs uppercase tracking-wider text-red-300 hover:bg-red-900/50"
              >
                Excluir (DELETE)
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {feedback && (
          <div className="rounded border border-[#c8aa6e] bg-[#c8aa6e]/10 px-4 py-3 text-xs text-[#c8aa6e]">
            {feedback}
          </div>
        )}

        {/* Hero Card */}
        <section className="overflow-hidden rounded-md border border-[#c8aa6e]/40 bg-[#121216]">
          {item.image_url && (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[#c8aa6e]/30 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded border border-[#c8aa6e]/50 bg-[#09090b] px-2.5 py-1 font-serif text-xs uppercase tracking-widest text-[#c8aa6e]">
                {item.type} • ID #{item.id}
              </span>
              {props?.rarity && (
                <span className="rounded border border-[#c8aa6e] bg-[#c8aa6e]/15 px-2.5 py-1 font-serif text-xs uppercase tracking-widest text-[#c8aa6e]">
                  Raridade: {props.rarity}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-[#e4e4e7]">
              {item.name}
            </h1>

            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#e4e4e7]/85">
              {item.lore || 'Sem registros de lore disponíveis.'}
            </div>
          </div>
        </section>

        {/* Propriedades do Item (ItemProperties) */}
        {props && (
          <section className="rounded-md border border-[#c8aa6e]/40 bg-[#121216] p-6 space-y-5">
            <h2 className="border-b border-[#c8aa6e]/30 pb-2 font-serif text-lg font-bold uppercase tracking-wider text-[#c8aa6e]">
              Propriedades Arcanas & Físicas (ItemProperties)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase text-[#c8aa6e]">
                  Dano
                </span>
                <span className="font-serif text-sm font-bold">
                  {props.damage || '—'}{' '}
                  {props.damage_type ? `(${props.damage_type})` : ''}
                </span>
              </div>
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase text-[#c8aa6e]">
                  Bônus Mágico
                </span>
                <span className="font-serif text-sm font-bold">
                  {props.magic_bonus || '—'}
                </span>
              </div>
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase text-[#c8aa6e]">
                  Peso (Weight)
                </span>
                <span className="font-serif text-sm font-bold">
                  {props.weight || '—'}
                </span>
              </div>
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase text-[#c8aa6e]">
                  Sintonização (Attunement)
                </span>
                <span className="font-serif text-sm font-bold">
                  {props.attunement_required ? 'Requerida' : 'Não Requerida'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              {props.weapon_type && (
                <div>
                  <strong className="text-[#c8aa6e]">Tipo de Arma: </strong>
                  <span>{props.weapon_type}</span>
                </div>
              )}
              {props.subtype && (
                <div>
                  <strong className="text-[#c8aa6e]">Subtipo: </strong>
                  <span>{props.subtype}</span>
                </div>
              )}
            </div>

            {props.special_effects && props.special_effects.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-serif text-xs uppercase tracking-wider text-[#c8aa6e]">
                  Efeitos Especiais
                </h3>
                {props.special_effects.map((fx, i) => (
                  <div
                    key={i}
                    className="rounded border border-[#c8aa6e]/25 bg-[#09090b] p-3 text-xs"
                  >
                    <strong className="font-serif text-[#c8aa6e]">
                      {fx.name}:{' '}
                    </strong>
                    <span>{fx.description}</span>
                  </div>
                ))}
              </div>
            )}

            {props.curse && (
              <div className="rounded border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-200">
                <strong className="font-serif uppercase tracking-wider text-red-400">
                  Maldição:{' '}
                </strong>
                {props.curse}
              </div>
            )}
          </section>
        )}

        {/* Relações: Onde encontrar (locations) e Quem dropa (dropped_by) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Escondido nos Locais ({item.locations?.length || 0})
            </h2>
            {item.locations && item.locations.length > 0 ? (
              <div className="space-y-2">
                {item.locations.map((loc) => (
                  <Link
                    key={loc.id}
                    href={`/locations/${loc.id}`}
                    className="flex items-center justify-between rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2.5 text-sm transition hover:border-[#c8aa6e]"
                  >
                    <span className="font-serif text-[#e4e4e7]">{loc.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                      {loc.type} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Não está escondido em nenhum local conhecido.
              </p>
            )}
          </section>

          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Dropado por Entidades ({item.dropped_by?.length || 0})
            </h2>
            {item.dropped_by && item.dropped_by.length > 0 ? (
              <div className="space-y-2">
                {item.dropped_by.map((ent) => (
                  <Link
                    key={ent.id}
                    href={`/entities/${ent.id}`}
                    className="flex items-center justify-between rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2.5 text-sm transition hover:border-[#c8aa6e]"
                  >
                    <span className="font-serif text-[#e4e4e7]">{ent.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                      {ent.type} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Nenhuma entidade conhecida dropa este item.
              </p>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Edição (PUT /items/:id) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[#c8aa6e] bg-[#09090b] p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#c8aa6e]/20 pb-3">
              <h2 className="font-serif text-lg font-bold text-[#c8aa6e]">
                Editar Item #{item.id}
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-sm text-[#e4e4e7]/60 hover:text-[#e4e4e7]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-[#c8aa6e] mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-[#c8aa6e] mb-1">
                    Tipo
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ItemType)}
                    className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#c8aa6e] mb-1">
                  Lore
                </label>
                <textarea
                  rows={3}
                  value={editLore}
                  onChange={(e) => setEditLore(e.target.value)}
                  className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#c8aa6e] mb-1">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm mb-2"
                />
                <ImageUploader
                  value={editImageUrl}
                  onChange={(url) => setEditImageUrl(url)}
                />
              </div>

              <ItemPropertiesForm
                value={editProps}
                onChange={(newProps) => setEditProps(newProps)}
              />

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded border border-[#c8aa6e]/30 px-4 py-2 text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded bg-[#c8aa6e] px-5 py-2 font-serif text-xs font-bold uppercase text-[#09090b]"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
