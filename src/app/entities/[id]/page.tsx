'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { lorekeeperApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import MonsterStatsForm from '@/components/MonsterStatsForm';
import type {
  EntityResponse,
  EntityType,
  MinimalResource,
  MonsterStats,
} from '@/types/api';

const ENTITY_TYPES: EntityType[] = ['MONSTER', 'NPC', 'GOD', 'DEMIGOD'];

export default function EntityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [entity, setEntity] = useState<EntityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Lista de todos os itens para vincular drops (Admin)
  const [allItems, setAllItems] = useState<MinimalResource[]>([]);
  const [selectedDropItemId, setSelectedDropItemId] = useState<string>('');
  const [isLinkingDrop, setIsLinkingDrop] = useState(false);

  // Modal de Edição (PUT /entities/:id)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<EntityType>('MONSTER');
  const [editLore, setEditLore] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editStats, setEditStats] = useState<MonsterStats>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadEntity = useCallback(async () => {
    if (!params?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await lorekeeperApi.getEntityById(params.id);
      setEntity(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar entidade.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadEntity();
  }, [loadEntity]);

  useEffect(() => {
    if (isAdmin) {
      lorekeeperApi
        .getItems()
        .then((items) => setAllItems(Array.isArray(items) ? items : []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const openEditModal = () => {
    if (!entity) return;
    setEditName(entity.name);
    setEditType(entity.type);
    setEditLore(entity.lore || '');
    setEditImageUrl(entity.image_url || '');
    setEditStats(
      entity.stats || {
        attributes: {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        },
        actions: [],
        legendary_actions: [],
      }
    );
    setIsEditOpen(true);
  };

  const handleUpdateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      await lorekeeperApi.updateEntity(entity.id, {
        name: editName.trim(),
        type: editType,
        lore: editLore,
        image_url: editImageUrl,
        stats: editStats,
      });
      setIsEditOpen(false);
      setFeedback('Entidade atualizada com sucesso!');
      await loadEntity();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao atualizar entidade.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntity = async () => {
    if (!entity) return;
    if (!window.confirm(`Deseja realmente remover "${entity.name}"?`)) return;
    try {
      await lorekeeperApi.deleteEntity(entity.id);
      router.push('/');
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao deletar entidade.'
      );
    }
  };

  const handleAddDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity || !selectedDropItemId) return;
    setIsLinkingDrop(true);
    setFeedback(null);
    try {
      const res = await lorekeeperApi.addEntityDrop(
        entity.id,
        selectedDropItemId
      );
      setFeedback(res.message);
      setSelectedDropItemId('');
      await loadEntity();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao vincular drop.'
      );
    } finally {
      setIsLinkingDrop(false);
    }
  };

  const handleRemoveDrop = async (itemId: number) => {
    if (!entity) return;
    setFeedback(null);
    try {
      const res = await lorekeeperApi.removeEntityDrop(entity.id, itemId);
      setFeedback(res.message);
      await loadEntity();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao desvincular drop.'
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

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] p-6">
        <div className="mx-auto max-w-4xl rounded border border-[#c8aa6e]/30 bg-[#121216] p-8 text-center">
          <p className="font-serif text-lg text-[#c8aa6e]">
            {error || 'Entidade não encontrada'}
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

  const stats = entity.stats;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] pb-20">
      {/* Top Bar */}
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
                onClick={handleDeleteEntity}
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
          {entity.image_url && (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[#c8aa6e]/30 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entity.image_url}
                alt={entity.name}
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded border border-[#c8aa6e]/50 bg-[#09090b] px-2.5 py-1 font-serif text-xs uppercase tracking-widest text-[#c8aa6e]">
                {entity.type} • ID #{entity.id}
              </span>
              {stats?.challenge_rating && (
                <span className="font-serif text-xs uppercase tracking-widest text-[#c8aa6e]">
                  Nível de Desafio (CR): {stats.challenge_rating}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-[#e4e4e7]">
              {entity.name}
            </h1>

            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#e4e4e7]/85">
              {entity.lore || 'Sem registros de lore disponíveis.'}
            </div>
          </div>
        </section>

        {/* Ficha de Atributos e Combate (MonsterStats) */}
        {stats && (
          <section className="rounded-md border border-[#c8aa6e]/40 bg-[#121216] p-6 space-y-6">
            <h2 className="border-b border-[#c8aa6e]/30 pb-2 font-serif text-lg font-bold uppercase tracking-wider text-[#c8aa6e]">
              Ficha de Estatísticas (MonsterStats)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                  Classe de Armadura
                </span>
                <span className="font-serif text-lg font-bold">
                  {stats.armor_class ?? '—'}
                </span>
              </div>
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                  Pontos de Vida
                </span>
                <span className="font-serif text-lg font-bold">
                  {stats.hit_points || '—'}
                </span>
              </div>
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                  Deslocamento
                </span>
                <span className="font-serif text-lg font-bold">
                  {stats.speed || '—'}
                </span>
              </div>
              <div className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3">
                <span className="block text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                  Challenge Rating
                </span>
                <span className="font-serif text-lg font-bold">
                  {stats.challenge_rating || '—'}
                </span>
              </div>
            </div>

            {stats.attributes && Object.keys(stats.attributes).length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {Object.entries(stats.attributes).map(([attr, val]) => {
                  const mod = Math.floor((Number(val) - 10) / 2);
                  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                  return (
                    <div
                      key={attr}
                      className="rounded border border-[#c8aa6e]/30 bg-[#09090b] py-2.5 px-2"
                    >
                      <span className="block font-serif text-xs font-bold text-[#c8aa6e]">
                        {attr}
                      </span>
                      <span className="text-base font-semibold text-[#e4e4e7]">
                        {val}
                      </span>
                      <span className="block text-[11px] text-[#e4e4e7]/60">
                        ({modStr})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {stats.saving_throws && stats.saving_throws.length > 0 && (
                <div>
                  <strong className="text-[#c8aa6e]">Salvaguardas: </strong>
                  <span>{stats.saving_throws.join(', ')}</span>
                </div>
              )}
              {stats.skills && stats.skills.length > 0 && (
                <div>
                  <strong className="text-[#c8aa6e]">Perícias: </strong>
                  <span>{stats.skills.join(', ')}</span>
                </div>
              )}
              {stats.damage_resistances &&
                stats.damage_resistances.length > 0 && (
                  <div>
                    <strong className="text-[#c8aa6e]">
                      Resistências a Dano:{' '}
                    </strong>
                    <span>{stats.damage_resistances.join(', ')}</span>
                  </div>
                )}
              {stats.damage_immunities &&
                stats.damage_immunities.length > 0 && (
                  <div>
                    <strong className="text-[#c8aa6e]">
                      Imunidades a Dano:{' '}
                    </strong>
                    <span>{stats.damage_immunities.join(', ')}</span>
                  </div>
                )}
              {stats.condition_immunities &&
                stats.condition_immunities.length > 0 && (
                  <div>
                    <strong className="text-[#c8aa6e]">
                      Imunidades a Condição:{' '}
                    </strong>
                    <span>{stats.condition_immunities.join(', ')}</span>
                  </div>
                )}
              {stats.senses && stats.senses.length > 0 && (
                <div>
                  <strong className="text-[#c8aa6e]">Sentidos: </strong>
                  <span>{stats.senses.join(', ')}</span>
                </div>
              )}
              {stats.languages && stats.languages.length > 0 && (
                <div>
                  <strong className="text-[#c8aa6e]">Idiomas: </strong>
                  <span>{stats.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {stats.actions && stats.actions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#c8aa6e]">
                  Ações
                </h3>
                {stats.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3 text-xs space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="font-serif text-sm text-[#c8aa6e]">
                        {act.name}
                      </strong>
                      {act.type && (
                        <span className="text-[11px] text-[#e4e4e7]/60">
                          {act.type}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[#e4e4e7]/80">
                      {act.hit && <span>Acerto: {act.hit}</span>}
                      {act.reach && <span>Alcance: {act.reach}</span>}
                      {act.damage && <span>Dano: {act.damage}</span>}
                    </div>
                    {act.effect && (
                      <p className="text-[#e4e4e7]/75">{act.effect}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {stats.legendary_actions && stats.legendary_actions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#c8aa6e]">
                  Ações Lendárias
                </h3>
                {stats.legendary_actions.map((leg, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-[#c8aa6e]/20 bg-[#09090b] p-3 text-xs"
                  >
                    <strong className="font-serif text-[#c8aa6e]">
                      {leg.name}:{' '}
                    </strong>
                    <span>{leg.effect}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Relações: Locais & Drops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Locais onde habita */}
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Locais Associados ({entity.locations?.length || 0})
            </h2>

            {entity.locations && entity.locations.length > 0 ? (
              <div className="space-y-2">
                {entity.locations.map((loc) => (
                  <Link
                    key={loc.id}
                    href={`/locations/${loc.id}`}
                    className="flex items-center justify-between rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2.5 text-sm transition hover:border-[#c8aa6e]"
                  >
                    <span className="font-serif text-[#e4e4e7]">
                      {loc.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#c8aa6e]">
                      {loc.type} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#e4e4e7]/50">
                Nenhum local vinculado a esta entidade.
              </p>
            )}
          </section>

          {/* Drops da Entidade (POST & DELETE /entities/:id/drops/:item_id) */}
          <section className="rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-5 space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#c8aa6e]">
              Espólios / Drops ({entity.drops?.length || 0})
            </h2>

            {entity.drops && entity.drops.length > 0 ? (
              <div className="space-y-2">
                {entity.drops.map((drop) => (
                  <div
                    key={drop.id}
                    className="flex items-center justify-between gap-2 rounded border border-[#c8aa6e]/25 bg-[#09090b] px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/items/${drop.id}`}
                      className="flex-1 font-serif text-[#e4e4e7] hover:text-[#c8aa6e]"
                    >
                      {drop.name}{' '}
                      <span className="text-[10px] uppercase text-[#c8aa6e]">
                        ({drop.type})
                      </span>
                    </Link>

                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveDrop(drop.id)}
                        title="Remover drop (DELETE /entities/:id/drops/:item_id)"
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
                Nenhum item vinculado aos drops.
              </p>
            )}

            {isAdmin && (
              <form
                onSubmit={handleAddDrop}
                className="mt-4 border-t border-[#c8aa6e]/20 pt-4 space-y-2"
              >
                <label className="block font-serif text-xs uppercase tracking-wider text-[#c8aa6e]">
                  Vincular Item aos Drops (POST /entities/{entity.id}/drops/:item_id)
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedDropItemId}
                    onChange={(e) => setSelectedDropItemId(e.target.value)}
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
                    disabled={!selectedDropItemId || isLinkingDrop}
                    className="rounded bg-[#c8aa6e] px-3 py-2 font-serif text-xs font-bold uppercase text-[#09090b] disabled:opacity-50"
                  >
                    Vincular
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Edição Completa (PUT /entities/:id) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[#c8aa6e] bg-[#09090b] p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#c8aa6e]/20 pb-3">
              <h2 className="font-serif text-lg font-bold text-[#c8aa6e]">
                Editar Entidade #{entity.id}
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-sm text-[#e4e4e7]/60 hover:text-[#e4e4e7]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEntity} className="space-y-4">
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
                    onChange={(e) => setEditType(e.target.value as EntityType)}
                    className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm"
                  >
                    {ENTITY_TYPES.map((t) => (
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

              <MonsterStatsForm
                value={editStats}
                onChange={(newStats) => setEditStats(newStats)}
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
