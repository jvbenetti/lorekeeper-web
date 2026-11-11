'use client';

import React from 'react';
import type { MonsterStats, Action, LegendaryAction } from '@/types/api';

const ATTRIBUTE_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;

interface MonsterStatsFormProps {
  value: MonsterStats;
  onChange: (stats: MonsterStats) => void;
}

export default function MonsterStatsForm({
  value,
  onChange,
}: MonsterStatsFormProps) {
  const attributes = value.attributes || {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  };
  const actions: Action[] = value.actions || [];
  const legendaryActions: LegendaryAction[] = value.legendary_actions || [];

  const updateField = <K extends keyof MonsterStats>(
    field: K,
    fieldValue: MonsterStats[K]
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleAttributeChange = (attr: string, num: number) => {
    onChange({
      ...value,
      attributes: {
        ...attributes,
        [attr]: num,
      },
    });
  };

  const parseCommaList = (raw: string): string[] =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  // Gerenciamento dinâmico de Actions
  const handleAddAction = () => {
    const newAction: Action = {
      name: '',
      type: 'Melee Weapon Attack',
      hit: '',
      reach: '',
      damage: '',
      effect: '',
    };
    updateField('actions', [...actions, newAction]);
  };

  const handleUpdateAction = (
    index: number,
    key: keyof Action,
    val: string
  ) => {
    const next = actions.map((act, i) =>
      i === index ? { ...act, [key]: val } : act
    );
    updateField('actions', next);
  };

  const handleRemoveAction = (index: number) => {
    updateField(
      'actions',
      actions.filter((_, i) => i !== index)
    );
  };

  // Gerenciamento dinâmico de Legendary Actions
  const handleAddLegendaryAction = () => {
    updateField('legendary_actions', [
      ...legendaryActions,
      { name: '', effect: '' },
    ]);
  };

  const handleUpdateLegendaryAction = (
    index: number,
    key: keyof LegendaryAction,
    val: string
  ) => {
    const next = legendaryActions.map((leg, i) =>
      i === index ? { ...leg, [key]: val } : leg
    );
    updateField('legendary_actions', next);
  };

  const handleRemoveLegendaryAction = (index: number) => {
    updateField(
      'legendary_actions',
      legendaryActions.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-5 rounded-md border border-[#c8aa6e]/30 bg-[#09090b]/80 p-4">
      <div className="border-b border-[#c8aa6e]/20 pb-2">
        <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-[#c8aa6e]">
          Estatísticas da Entidade (MonsterStats)
        </h3>
      </div>

      {/* Linha 1: CA, HP, Speed, CR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#c8aa6e] mb-1">
            Armor Class (CA)
          </label>
          <input
            type="number"
            placeholder="Ex: 16"
            value={value.armor_class ?? ''}
            onChange={(e) =>
              updateField(
                'armor_class',
                e.target.value !== '' ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded border border-[#c8aa6e]/35 bg-[#121216] px-2.5 py-2 text-xs text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#c8aa6e] mb-1">
            Hit Points (HP)
          </label>
          <input
            type="text"
            placeholder="Ex: 85 (10d10 + 30)"
            value={value.hit_points || ''}
            onChange={(e) => updateField('hit_points', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/35 bg-[#121216] px-2.5 py-2 text-xs text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#c8aa6e] mb-1">
            Deslocamento (Speed)
          </label>
          <input
            type="text"
            placeholder="Ex: 9 m, voo 18 m"
            value={value.speed || ''}
            onChange={(e) => updateField('speed', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/35 bg-[#121216] px-2.5 py-2 text-xs text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#c8aa6e] mb-1">
            Challenge Rating (CR)
          </label>
          <input
            type="text"
            placeholder="Ex: 5 (1.800 XP)"
            value={value.challenge_rating || ''}
            onChange={(e) => updateField('challenge_rating', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/35 bg-[#121216] px-2.5 py-2 text-xs text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
          />
        </div>
      </div>

      {/* Atributos Principais: STR, DEX, CON, INT, WIS, CHA */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[#c8aa6e] mb-1.5">
          Atributos (STR, DEX, CON, INT, WIS, CHA)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ATTRIBUTE_KEYS.map((attr) => (
            <div
              key={attr}
              className="rounded border border-[#c8aa6e]/30 bg-[#121216] p-2 text-center"
            >
              <span className="block font-serif text-[11px] font-bold text-[#c8aa6e]">
                {attr}
              </span>
              <input
                type="number"
                value={attributes[attr] ?? 10}
                onChange={(e) =>
                  handleAttributeChange(attr, Number(e.target.value))
                }
                className="mt-1 w-full rounded border border-[#c8aa6e]/25 bg-[#09090b] py-1 text-center text-xs text-[#e4e4e7] focus:border-[#c8aa6e] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Listas separadas por vírgula: Salvaguardas, Perícias, Resistências, Imunidades, Sentidos, Idiomas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Salvaguardas (Saving Throws - sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: DEX +5, WIS +4"
            value={(value.saving_throws || []).join(', ')}
            onChange={(e) =>
              updateField('saving_throws', parseCommaList(e.target.value))
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Perícias (Skills - sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Furtividade +6, Percepção +4"
            value={(value.skills || []).join(', ')}
            onChange={(e) =>
              updateField('skills', parseCommaList(e.target.value))
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Resistências a Dano (sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Necrótico, Frio"
            value={(value.damage_resistances || []).join(', ')}
            onChange={(e) =>
              updateField('damage_resistances', parseCommaList(e.target.value))
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Imunidades a Dano (sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Veneno, Psíquico"
            value={(value.damage_immunities || []).join(', ')}
            onChange={(e) =>
              updateField('damage_immunities', parseCommaList(e.target.value))
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Imunidades a Condição (sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Enfeitiçado, Exaustão, Amedrontado"
            value={(value.condition_immunities || []).join(', ')}
            onChange={(e) =>
              updateField(
                'condition_immunities',
                parseCommaList(e.target.value)
              )
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Sentidos (Senses - sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Visão no Escuro 18 m, Percepção Passiva 14"
            value={(value.senses || []).join(', ')}
            onChange={(e) =>
              updateField('senses', parseCommaList(e.target.value))
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-wider text-[#e4e4e7]/75 mb-1">
            Idiomas (Languages - sep. por vírgula)
          </label>
          <input
            type="text"
            placeholder="Ex: Comum, Abissal, Infernal"
            value={(value.languages || []).join(', ')}
            onChange={(e) =>
              updateField('languages', parseCommaList(e.target.value))
            }
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>
      </div>

      {/* Lista Dinâmica de Ações (actions: Action[]) */}
      <div className="space-y-3 border-t border-[#c8aa6e]/25 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c8aa6e]">
              Ações ({actions.length})
            </h4>
            <p className="text-[11px] text-[#e4e4e7]/50">
              Adicione golpes, habilidades ou ataques da entidade
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAction}
            className="rounded border border-[#c8aa6e] bg-[#c8aa6e]/15 px-3 py-1.5 font-serif text-[11px] font-semibold uppercase tracking-wider text-[#c8aa6e] transition hover:bg-[#c8aa6e] hover:text-[#09090b]"
          >
            + Adicionar Ação
          </button>
        </div>

        {actions.length === 0 ? (
          <p className="rounded border border-dashed border-[#c8aa6e]/25 p-3 text-center text-xs text-[#e4e4e7]/40">
            Nenhuma ação cadastrada. Toque em &quot;+ Adicionar Ação&quot;.
          </p>
        ) : (
          <div className="space-y-3">
            {actions.map((act, idx) => (
              <div
                key={idx}
                className="space-y-2.5 rounded border border-[#c8aa6e]/35 bg-[#121216] p-3"
              >
                <div className="flex items-center justify-between border-b border-[#c8aa6e]/15 pb-1.5">
                  <span className="font-serif text-xs font-semibold text-[#c8aa6e]">
                    Ação #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(idx)}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Remover
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Nome da Ação (name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Adaga Escondida"
                      value={act.name}
                      onChange={(e) =>
                        handleUpdateAction(idx, 'name', e.target.value)
                      }
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#c8aa6e]">
                      Tipo de Ataque (type)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Melee Weapon Attack"
                      value={act.type || ''}
                      onChange={(e) =>
                        handleUpdateAction(idx, 'type', e.target.value)
                      }
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-[#e4e4e7]/70">
                      Acerto (hit)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: +4"
                      value={act.hit || ''}
                      onChange={(e) =>
                        handleUpdateAction(idx, 'hit', e.target.value)
                      }
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e4e4e7]/70">
                      Alcance (reach)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1.5 m."
                      value={act.reach || ''}
                      onChange={(e) =>
                        handleUpdateAction(idx, 'reach', e.target.value)
                      }
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#e4e4e7]/70">
                      Dano (damage)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 4 (1d4 + 2) piercing damage"
                      value={act.damage || ''}
                      onChange={(e) =>
                        handleUpdateAction(idx, 'damage', e.target.value)
                      }
                      className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#e4e4e7]/70">
                    Efeito / Descrição do que faz (effect)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descreva efeitos adicionais, testes de resistência ou condições..."
                    value={act.effect || ''}
                    onChange={(e) =>
                      handleUpdateAction(idx, 'effect', e.target.value)
                    }
                    className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista Dinâmica de Ações Lendárias (legendary_actions: LegendaryAction[]) */}
      <div className="space-y-3 border-t border-[#c8aa6e]/25 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#c8aa6e]">
              Ações Lendárias ({legendaryActions.length})
            </h4>
            <p className="text-[11px] text-[#e4e4e7]/50">
              Habilidades especiais executadas fora do turno
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddLegendaryAction}
            className="rounded border border-[#c8aa6e]/60 bg-[#121216] px-3 py-1.5 font-serif text-[11px] uppercase tracking-wider text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#09090b]"
          >
            + Ação Lendária
          </button>
        </div>

        {legendaryActions.length > 0 && (
          <div className="space-y-2.5">
            {legendaryActions.map((leg, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded border border-[#c8aa6e]/35 bg-[#121216] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs font-semibold text-[#c8aa6e]">
                    Ação Lendária #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLegendaryAction(idx)}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Remover
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nome da ação lendária"
                  value={leg.name}
                  onChange={(e) =>
                    handleUpdateLegendaryAction(idx, 'name', e.target.value)
                  }
                  className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Efeito da ação lendária (effect)"
                  value={leg.effect}
                  onChange={(e) =>
                    handleUpdateLegendaryAction(idx, 'effect', e.target.value)
                  }
                  className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
