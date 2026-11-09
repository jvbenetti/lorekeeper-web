'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { lorekeeperApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import type {
  LocationResponse,
  LocationType,
  MinimalResource,
} from '@/types/api';

const LOCATION_TYPES: LocationType[] = [
  'CITY',
  'DUNGEON',
  'HOUSE',
  'CASTLE',
  'HISTORIC',
];

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [location, setLocation] = useState<LocationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Listas para vínculo Admin (Entidades, Itens e Locais para parent_id)
  const [allEntities, setAllEntities] = useState<MinimalResource[]>([]);
  const [allItems, setAllItems] = useState<MinimalResource[]>([]);
  const [allLocations, setAllLocations] = useState<MinimalResource[]>([]);

  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  // Modal de Edição (PUT /locations/:id)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<LocationType>('DUNGEON');
  const [editLore, setEditLore] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editParentId, setEditParentId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const loadLocation = useCallback(async () => {
    if (!params?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await lorekeeperApi.getLocationById(params.id);
      setLocation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar local.');
    } finally {
      setIsLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (isAdmin) {
      lorekeeperApi
        .getEntities()
        .then((list) => setAllEntities(Array.isArray(list) ? list : []))
        .catch(() => {});
      lorekeeperApi
        .getItems()
        .then((list) => setAllItems(Array.isArray(list) ? list : []))
        .catch(() => {});
      lorekeeperApi
        .getLocations()
        .then((list) => setAllLocations(Array.isArray(list) ? list : []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const openEditModal = () => {
    if (!location) return;
    setEditName(location.name);
    setEditType(location.type);
    setEditLore(location.lore || '');
    setEditImageUrl(location.image_url || '');
    setEditParentId('');
    setIsEditOpen(true);
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await lorekeeperApi.updateLocation(location.id, {
        name: editName.trim(),
        type: editType,
        lore: editLore,
        image_url: editImageUrl,
        parent_id: editParentId ? Number(editParentId) : null,
      });
      setIsEditOpen(false);
      setFeedback('Local atualizado com sucesso!');
      await loadLocation();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao atualizar local.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!location) return;
    if (!window.confirm(`Deseja realmente remover o local "${location.name}"?`))
      return;
    try {
      await lorekeeperApi.deleteLocation(location.id);
      router.push('/');
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao remover local.'
      );
    }
  };

  const handleLinkEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !selectedEntityId) return;
    setFeedback(null);
    try {
      const res = await lorekeeperApi.addLocationEntity(
        location.id,
        selectedEntityId
      );
      setFeedback(res.message);
      setSelectedEntityId('');
      await loadLocation();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao vincular entidade.'
      );
    }
  };

  const handleUnlinkEntity = async (entityId: number) => {
    if (!location) return;
    setFeedback(null);
    try {
      const res = await lorekeeperApi.removeLocationEntity(
        location.id,
        entityId
      );
      setFeedback(res.message);
      await loadLocation();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao remover entidade do local.'
      );
    }
  };

  const handleLinkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !selectedItemId) return;
    setFeedback(null);
    try {
      const res = await lorekeeperApi.addLocationItem(
        location.id,
        selectedItemId
      );
      setFeedback(res.message);
      setSelectedItemId('');
      await loadLocation();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao esconder item no local.'
      );
    }
  };

  const handleUnlinkItem = async (itemId: number) => {
    if (!location) return;
    setFeedback(null);
    try {
      const res = await lorekeeperApi.removeLocationItem(location.id, itemId);
      setFeedback(res.message);
      await loadLocation();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao remover item do local.'
      );
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

  if (error || !location) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] p-6">
        <div className="mx-auto max-w-4xl rounded border border-[#c8aa6e]/30 bg-[#121216] p-8 text-center">
          <p className="font-serif text-lg text-[#c8aa6e]">
            {error || 'Local não encontrado'}
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
                onClick={handleDeleteLocation}
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
          {location.image_url && (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[#c8aa6e]/30 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={location.image_url}
                alt={location.name}
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6">
            <span className="rounded border border-[#c8aa6e]/50 bg-[#09090b] px-2.5 py-1 font-serif text-xs uppercase tracking-widest text-[#c8aa6e]">
              {location.type} • ID #{location.id}
            </span>

            <h1 className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-[#e4e4e7]">
              {location.name}
            </h1>

            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#e4e4e7]/85">
              {location.lore || 'Sem registros de lore disponíveis.'}
            </div>
          </div>
        </section>

        {/* Grid de Relações: Sub-áreas, Habitantes (Entidades), Itens Escondidos e Drops de Entidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sub-áreas */}
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Sub-áreas ({location.sub_areas?.length || 0})
            </h2>
            {location.sub_areas && location.sub_areas.length > 0 ? (
              <div className="space-y-2">
                {location.sub_areas.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/locations/${sub.id}`}
                    className="flex items-center justify-between rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2.5 text-sm transition hover:border-[#c8aa6e]"
                  >
                    <span className="font-serif text-[#e4e4e7]">{sub.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                      {sub.type} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Nenhuma sub-área vinculada a este local.
              </p>
            )}
          </section>

          {/* Drops de Entidades deste Local */}
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Espólios de Habitantes ({location.entity_drops?.length || 0})
            </h2>
            {location.entity_drops && location.entity_drops.length > 0 ? (
              <div className="space-y-2">
                {location.entity_drops.map((drop) => (
                  <Link
                    key={drop.id}
                    href={`/items/${drop.id}`}
                    className="flex items-center justify-between rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2.5 text-sm transition hover:border-[#c8aa6e]"
                  >
                    <span className="font-serif text-[#e4e4e7]">
                      {drop.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                      {drop.type} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Nenhum drop de habitante registrado neste local.
              </p>
            )}
          </section>

          {/* Habitantes / Entidades (POST & DELETE /locations/:id/entities/:entity_id) */}
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Habitantes / Entidades ({location.entities?.length || 0})
            </h2>
            {location.entities && location.entities.length > 0 ? (
              <div className="space-y-2">
                {location.entities.map((ent) => (
                  <div
                    key={ent.id}
                    className="flex items-center justify-between gap-2 rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/entities/${ent.id}`}
                      className="flex-1 font-serif text-[#e4e4e7] hover:text-[#c8aa6e]"
                    >
                      {ent.name}{' '}
                      <span className="text-[10px] uppercase text-[#c8aa6e]">
                        ({ent.type})
                      </span>
                    </Link>

                    {isAdmin && (
                      <button
                        onClick={() => handleUnlinkEntity(ent.id)}
                        className="rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase text-red-300 hover:bg-red-950/50"
                      >
                        Desvincular
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Nenhuma entidade habita este local.
              </p>
            )}

            {isAdmin && (
              <form
                onSubmit={handleLinkEntity}
                className="mt-4 border-t border-[#c8aa6e]/20 pt-4 space-y-2"
              >
                <label className="block font-serif text-xs uppercase tracking-wider text-[#c8aa6e]">
                  Vincular Entidade (POST /locations/{location.id}/entities/:entity_id)
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="flex-1 rounded border border-[#c8aa6e]/40 bg-[#09090b] px-3 py-2 text-xs text-[#e4e4e7]"
                  >
                    <option value="">Selecione uma entidade...</option>
                    {allEntities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        #{ent.id} - {ent.name} ({ent.type})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!selectedEntityId}
                    className="rounded bg-[#c8aa6e] px-3 py-2 font-serif text-xs font-bold uppercase text-[#09090b] disabled:opacity-50"
                  >
                    Vincular
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Itens Escondidos (POST & DELETE /locations/:id/items/:item_id) */}
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Itens Escondidos ({location.hidden_items?.length || 0})
            </h2>
            {location.hidden_items && location.hidden_items.length > 0 ? (
              <div className="space-y-2">
                {location.hidden_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/items/${item.id}`}
                      className="flex-1 font-serif text-[#e4e4e7] hover:text-[#c8aa6e]"
                    >
                      {item.name}{' '}
                      <span className="text-[10px] uppercase text-[#c8aa6e]">
                        ({item.type})
                      </span>
                    </Link>

                    {isAdmin && (
                      <button
                        onClick={() => handleUnlinkItem(item.id)}
                        className="rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase text-red-300 hover:bg-red-950/50"
                      >
                        Desvincular
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Nenhum item escondido neste local.
              </p>
            )}

            {isAdmin && (
              <form
                onSubmit={handleLinkItem}
                className="mt-4 border-t border-[#c8aa6e]/20 pt-4 space-y-2"
              >
                <label className="block font-serif text-xs uppercase tracking-wider text-[#c8aa6e]">
                  Esconder Item (POST /locations/{location.id}/items/:item_id)
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="flex-1 rounded border border-[#c8aa6e]/40 bg-[#09090b] px-3 py-2 text-xs text-[#e4e4e7]"
                  >
                    <option value="">Selecione um item...</option>
                    {allItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        #{it.id} - {it.name} ({it.type})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!selectedItemId}
                    className="rounded bg-[#c8aa6e] px-3 py-2 font-serif text-xs font-bold uppercase text-[#09090b] disabled:opacity-50"
                  >
                    Esconder
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Edição (PUT /locations/:id) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-[#c8aa6e] bg-[#09090b] p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#c8aa6e]/20 pb-3">
              <h2 className="font-serif text-lg font-bold text-[#c8aa6e]">
                Editar Local #{location.id}
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-sm text-[#e4e4e7]/60 hover:text-[#e4e4e7]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLocation} className="space-y-4">
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
                    onChange={(e) =>
                      setEditType(e.target.value as LocationType)
                    }
                    className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm"
                  >
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#c8aa6e] mb-1">
                  Local Pai (parent_id opcional)
                </label>
                <select
                  value={editParentId}
                  onChange={(e) => setEditParentId(e.target.value)}
                  className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm"
                >
                  <option value="">Nenhum (Local Raiz)</option>
                  {allLocations
                    .filter((l) => l.id !== location.id)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        #{l.id} - {l.name} ({l.type})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#c8aa6e] mb-1">
                  Lore
                </label>
                <textarea
                  rows={4}
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
