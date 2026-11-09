'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { lorekeeperApi } from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';
import type {
  MinimalResource,
  EntityType,
  LocationType,
  ItemType,
  HealthCheckResponse,
} from '@/types/api';

type CodexTab = 'entities' | 'locations' | 'items';

const TAB_CONFIG: {
  id: CodexTab;
  label: string;
  subtitle: string;
  routePrefix: string;
}[] = [
  {
    id: 'entities',
    label: 'Entidades',
    subtitle: 'Monstros, NPCs, Deuses e Semideuses',
    routePrefix: '/entities',
  },
  {
    id: 'locations',
    label: 'Locais',
    subtitle: 'Cidades, Dungeons, Castelos e Ruínas',
    routePrefix: '/locations',
  },
  {
    id: 'items',
    label: 'Itens',
    subtitle: 'Armas, Armaduras, Artefatos e Poções',
    routePrefix: '/items',
  },
];

const ENTITY_TYPES: EntityType[] = ['MONSTER', 'NPC', 'GOD', 'DEMIGOD'];
const LOCATION_TYPES: LocationType[] = [
  'CITY',
  'DUNGEON',
  'HOUSE',
  'CASTLE',
  'HISTORIC',
];
const ITEM_TYPES: ItemType[] = ['WEAPON', 'ARMOR', 'ARTIFACT', 'POTION'];

export default function CodexHomePage() {
  const { isAdmin, login, logout, setTokenManually } = useAuth();

  const [activeTab, setActiveTab] = useState<CodexTab>('entities');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('');
  const [resources, setResources] = useState<MinimalResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Health Check (GET http://localhost:8080/health)
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthError, setHealthError] = useState(false);

  // Modais (Login do Mestre & Criação Rápida via FAB)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Estado do Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Estado do Rascunho Rápido (FAB: POST /entities, /locations, /items)
  const [draftCategory, setDraftCategory] = useState<CodexTab>('entities');
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<string>('MONSTER');
  const [draftLore, setDraftLore] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');
  // Campos extras por tipo de recurso no modal de criação
  const [draftParentId, setDraftParentId] = useState<string>('');
  const [draftAc, setDraftAc] = useState<string>('');
  const [draftHp, setDraftHp] = useState<string>('');
  const [draftCr, setDraftCr] = useState<string>('');
  const [draftRarity, setDraftRarity] = useState<string>('');
  const [draftDamage, setDraftDamage] = useState<string>('');
  const [draftWeight, setDraftWeight] = useState<string>('');
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  const checkApiHealth = useCallback(async () => {
    try {
      const res = await lorekeeperApi.getHealth();
      setHealth(res);
      setHealthError(false);
    } catch {
      setHealth(null);
      setHealthError(true);
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
  }, [checkApiHealth]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      let data: MinimalResource[] = [];
      if (activeTab === 'entities') {
        data = await lorekeeperApi.getEntities({
          type: (typeFilter as EntityType) || '',
          search: searchQuery,
        });
      } else if (activeTab === 'locations') {
        data = await lorekeeperApi.getLocations({
          type: (typeFilter as LocationType) || '',
          search: searchQuery,
        });
      } else {
        data = await lorekeeperApi.getItems({
          type: (typeFilter as ItemType) || '',
          search: searchQuery,
          rarity: rarityFilter,
        });
      }
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setResources([]);
      setApiError(
        err instanceof Error
          ? err.message
          : 'Não foi possível sincronizar com o servidor de Lamúria.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, typeFilter, rarityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  const handleTabChange = (tab: CodexTab) => {
    setActiveTab(tab);
    setTypeFilter('');
    setRarityFilter('');
  };

  const handleOpenDraftModal = () => {
    setDraftCategory(activeTab);
    if (activeTab === 'entities') setDraftType('MONSTER');
    if (activeTab === 'locations') setDraftType('DUNGEON');
    if (activeTab === 'items') setDraftType('ARTIFACT');
    setDraftName('');
    setDraftLore('');
    setDraftImageUrl('');
    setDraftParentId('');
    setDraftAc('');
    setDraftHp('');
    setDraftCr('');
    setDraftRarity('');
    setDraftDamage('');
    setDraftWeight('');
    setDraftFeedback(null);
    setIsDraftModalOpen(true);
  };

  const handleCategoryChangeInModal = (cat: CodexTab) => {
    setDraftCategory(cat);
    if (cat === 'entities') setDraftType('MONSTER');
    if (cat === 'locations') setDraftType('DUNGEON');
    if (cat === 'items') setDraftType('ARTIFACT');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingAuth(true);
    try {
      await login({ username, password });
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Falha na autenticação.'
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;

    setIsSubmittingDraft(true);
    setDraftFeedback(null);

    try {
      if (draftCategory === 'entities') {
        await lorekeeperApi.createEntity({
          name: draftName.trim(),
          type: draftType as EntityType,
          lore: draftLore.trim() || 'Rascunho registrado em sessão.',
          image_url:
            draftImageUrl || 'https://cdn.lamuria.rpg/placeholder.jpg',
          stats: {
            armor_class: draftAc ? Number(draftAc) : undefined,
            hit_points: draftHp || undefined,
            challenge_rating: draftCr || undefined,
          },
        });
      } else if (draftCategory === 'locations') {
        await lorekeeperApi.createLocation({
          name: draftName.trim(),
          type: draftType as LocationType,
          lore: draftLore.trim() || 'Local descoberto recentemente.',
          image_url:
            draftImageUrl || 'https://cdn.lamuria.rpg/placeholder.jpg',
          parent_id: draftParentId ? Number(draftParentId) : null,
        });
      } else {
        await lorekeeperApi.createItem({
          name: draftName.trim(),
          type: draftType as ItemType,
          lore: draftLore.trim() || 'Artefato catalogado pelo Mestre.',
          image_url:
            draftImageUrl || 'https://cdn.lamuria.rpg/placeholder.jpg',
          properties: {
            rarity: draftRarity || undefined,
            damage: draftDamage || undefined,
            weight: draftWeight ? String(draftWeight) : undefined,
          },
        });
      }

      setIsDraftModalOpen(false);
      fetchResources();
    } catch (err) {
      setDraftFeedback(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar rascunho na API.'
      );
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const currentTabConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const availableTypes =
    activeTab === 'entities'
      ? ENTITY_TYPES
      : activeTab === 'locations'
      ? LOCATION_TYPES
      : ITEM_TYPES;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#e4e4e7]">
      {/* Cabeçalho Dark Fantasy */}
      <header className="sticky top-0 z-20 border-b border-[#c8aa6e]/30 bg-[#09090b]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#c8aa6e]">
                Crônicas de Lamúria
              </span>
              <button
                type="button"
                onClick={checkApiHealth}
                title="Verificar GET /health"
                className="inline-flex items-center gap-1 rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-0.5 text-[10px] text-[#e4e4e7]/70 hover:border-[#c8aa6e]"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    health
                      ? 'bg-emerald-400'
                      : healthError
                      ? 'bg-red-400'
                      : 'bg-amber-400'
                  }`}
                />
                {health ? `${health.status} (${health.world})` : 'API Offline'}
              </button>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#e4e4e7]">
              LOREKEEPER <span className="text-[#c8aa6e]">CODEX</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#c8aa6e]/40 bg-[#c8aa6e]/10 px-3 py-1 text-xs text-[#c8aa6e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8aa6e]" />
                  Visão do Mestre
                </span>
                <button
                  onClick={logout}
                  className="rounded border border-[#c8aa6e]/40 px-3 py-1.5 text-xs font-medium text-[#e4e4e7] transition hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/10"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="rounded border border-[#c8aa6e]/60 bg-[#121216] px-3.5 py-1.5 font-serif text-xs uppercase tracking-widest text-[#c8aa6e] transition hover:bg-[#c8aa6e] hover:text-[#09090b]"
              >
                Acesso do Mestre
              </button>
            )}
          </div>
        </div>

        {/* Barra de Pesquisa Superior + Filtros de Query Params da API */}
        <div className="mx-auto max-w-5xl px-4 pb-4 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c8aa6e]"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar nos pergaminhos de Lamúria (?search=texto)..."
                className="w-full rounded-md border border-[#c8aa6e]/40 bg-[#121216] py-2.5 pl-10 pr-4 text-sm text-[#e4e4e7] placeholder-[#e4e4e7]/40 focus:border-[#c8aa6e] focus:outline-none focus:ring-1 focus:ring-[#c8aa6e]"
              />
            </div>

            {/* Filtro por ?type=Enum */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2.5 font-serif text-xs uppercase tracking-wider text-[#c8aa6e] focus:border-[#c8aa6e] focus:outline-none"
            >
              <option value="">Todos os Tipos (?type)</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Filtro extra de Raridade para Itens (?rarity=texto) */}
            {activeTab === 'items' && (
              <input
                type="text"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                placeholder="Raridade (?rarity)"
                className="sm:w-44 rounded-md border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2.5 text-xs text-[#e4e4e7] placeholder-[#e4e4e7]/40 focus:border-[#c8aa6e] focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Três Abas de Navegação Visual (Entidades, Locais, Itens) */}
        <nav
          aria-label="Categorias do Codex"
          className="mx-auto grid max-w-5xl grid-cols-3 border-t border-[#c8aa6e]/20 px-2 sm:px-4"
        >
          {TAB_CONFIG.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative py-3 text-center font-serif text-xs sm:text-sm uppercase tracking-widest transition ${
                  isSelected
                    ? 'text-[#c8aa6e] font-semibold'
                    : 'text-[#e4e4e7]/60 hover:text-[#e4e4e7]'
                }`}
              >
                {tab.label}
                {isSelected && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#c8aa6e] shadow-[0_0_8px_#c8aa6e]" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#c8aa6e]/20 pb-3">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#c8aa6e]">
              {currentTabConfig.label}
            </h2>
            <p className="text-xs text-[#e4e4e7]/60">
              {currentTabConfig.subtitle}
            </p>
          </div>
          <span className="text-xs text-[#e4e4e7]/50">
            {resources.length} registro(s) encontrado(s)
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="h-24 animate-pulse rounded-md border border-[#c8aa6e]/20 bg-[#121216] p-4"
              />
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((item) => (
              <Link
                key={item.id}
                href={`${currentTabConfig.routePrefix}/${item.id}`}
                className="group relative flex flex-col justify-between rounded-md border border-[#c8aa6e]/30 bg-[#121216] p-4 transition hover:border-[#c8aa6e] hover:shadow-[0_0_15px_rgba(200,170,110,0.12)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-base font-semibold text-[#e4e4e7] group-hover:text-[#c8aa6e] transition">
                    {item.name}
                  </h3>
                  <span className="shrink-0 rounded border border-[#c8aa6e]/40 bg-[#09090b] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c8aa6e]">
                    {item.type}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[#e4e4e7]/50">
                  <span>ID #{item.id}</span>
                  <span className="text-[#c8aa6e] group-hover:translate-x-0.5 transition">
                    Abrir Pergaminho →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-[#c8aa6e]/25 bg-[#121216]/70 p-8 text-center">
            <p className="font-serif text-base text-[#c8aa6e]">
              Nenhum registro inscrito nesta seção
            </p>
            <p className="mt-1 text-xs text-[#e4e4e7]/60">
              {apiError
                ? `Aguardando conexão com a API (${apiError}).`
                : 'Use a busca acima ou adicione novos registros com o botão rápido do Mestre (+).'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) visível apenas quando o Mestre está logado */}
      {isAdmin && (
        <button
          onClick={handleOpenDraftModal}
          aria-label="Criar rascunho rápido"
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#c8aa6e] bg-[#09090b] text-[#c8aa6e] shadow-[0_0_20px_rgba(200,170,110,0.4)] transition hover:bg-[#c8aa6e] hover:text-[#09090b] active:scale-95"
        >
          <span className="font-serif text-3xl leading-none">+</span>
        </button>
      )}

      {/* Modal de Login do Mestre (POST /login) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-md border border-[#c8aa6e]/50 bg-[#09090b] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#c8aa6e]/20 pb-3">
              <h2 className="font-serif text-lg font-bold text-[#c8aa6e]">
                Selo do Mestre (POST /login)
              </h2>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-sm text-[#e4e4e7]/60 hover:text-[#e4e4e7]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c8aa6e] mb-1">
                  Usuário
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c8aa6e] mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-400">{loginError}</p>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full rounded bg-[#c8aa6e] py-2.5 font-serif text-xs font-bold uppercase tracking-widest text-[#09090b] transition hover:bg-[#c8aa6e]/90 disabled:opacity-50"
                >
                  {isSubmittingAuth ? 'Autenticando...' : 'Desbloquear Grimório'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTokenManually('dev-master-jwt-token');
                    setIsLoginModalOpen(false);
                  }}
                  className="w-full rounded border border-[#c8aa6e]/30 py-2 text-[11px] text-[#e4e4e7]/70 hover:border-[#c8aa6e] hover:text-[#c8aa6e]"
                >
                  Simular Sessão do Mestre (Token de Teste)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mobile-First de Criação Rápida (POST /entities, /locations, /items) */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-t-xl sm:rounded-md border-t sm:border border-[#c8aa6e]/60 bg-[#09090b] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-[#c8aa6e]/20 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c8aa6e]">
                  Cadastro Rápido Mobile (POST /{draftCategory})
                </span>
                <h2 className="font-serif text-lg font-bold text-[#e4e4e7]">
                  Novo Registro de Lamúria
                </h2>
              </div>
              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="rounded p-1 text-[#e4e4e7]/60 hover:text-[#e4e4e7]"
              >
                ✕
              </button>
            </div>

            {/* Seletor de Categoria no Modal */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              {TAB_CONFIG.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleCategoryChangeInModal(t.id)}
                  className={`rounded border py-2 font-serif text-xs uppercase tracking-wider transition ${
                    draftCategory === t.id
                      ? 'border-[#c8aa6e] bg-[#c8aa6e]/20 text-[#c8aa6e]'
                      : 'border-[#c8aa6e]/25 bg-[#121216] text-[#e4e4e7]/60'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#c8aa6e] mb-1 font-serif">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cavaleiro das Cinzas"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2.5 text-sm text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#c8aa6e] mb-1 font-serif">
                    Tipo ({draftCategory.toUpperCase()})
                  </label>
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value)}
                    className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2.5 text-sm text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
                  >
                    {draftCategory === 'entities' &&
                      ENTITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    {draftCategory === 'locations' &&
                      LOCATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    {draftCategory === 'items' &&
                      ITEM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Campos específicos de cada endpoint POST */}
              {draftCategory === 'entities' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Armor Class
                    </label>
                    <input
                      type="number"
                      placeholder="18"
                      value={draftAc}
                      onChange={(e) => setDraftAc(e.target.value)}
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Hit Points
                    </label>
                    <input
                      type="text"
                      placeholder="95 (10d10+40)"
                      value={draftHp}
                      onChange={(e) => setDraftHp(e.target.value)}
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Challenge Rating
                    </label>
                    <input
                      type="text"
                      placeholder="7"
                      value={draftCr}
                      onChange={(e) => setDraftCr(e.target.value)}
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {draftCategory === 'locations' && (
                <div>
                  <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
                    ID do Local Pai (parent_id opcional para criar sub-área)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 1 (deixe vazio se for local raiz)"
                    value={draftParentId}
                    onChange={(e) => setDraftParentId(e.target.value)}
                    className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-3 py-2 text-xs"
                  />
                </div>
              )}

              {draftCategory === 'items' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Raridade
                    </label>
                    <input
                      type="text"
                      placeholder="Rare / Legendary"
                      value={draftRarity}
                      onChange={(e) => setDraftRarity(e.target.value)}
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Dano
                    </label>
                    <input
                      type="text"
                      placeholder="1d8 + 2"
                      value={draftDamage}
                      onChange={(e) => setDraftDamage(e.target.value)}
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Peso (string)
                    </label>
                    <input
                      type="text"
                      placeholder="3.0 lb."
                      value={draftWeight}
                      onChange={(e) => setDraftWeight(e.target.value)}
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c8aa6e] mb-1 font-serif">
                  Lore / Anotações Rápidas
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva os rumores, aparência ou segredos..."
                  value={draftLore}
                  onChange={(e) => setDraftLore(e.target.value)}
                  className="w-full rounded border border-[#c8aa6e]/40 bg-[#121216] px-3 py-2 text-sm text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
                />
              </div>

              <ImageUploader
                value={draftImageUrl}
                onChange={(url) => setDraftImageUrl(url)}
              />

              {draftFeedback && (
                <p className="text-xs text-amber-400">{draftFeedback}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="w-1/3 rounded border border-[#c8aa6e]/30 py-2.5 text-xs uppercase tracking-wider text-[#e4e4e7]/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDraft}
                  className="w-2/3 rounded bg-[#c8aa6e] py-2.5 font-serif text-xs font-bold uppercase tracking-widest text-[#09090b] transition hover:bg-[#c8aa6e]/90 disabled:opacity-50"
                >
                  {isSubmittingDraft ? 'Inscrevendo...' : 'Salvar Rascunho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
