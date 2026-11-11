'use client';

import React from 'react';
import type { ItemProperties, SpecialEffect } from '@/types/api';

interface ItemPropertiesFormProps {
  value: ItemProperties;
  onChange: (props: ItemProperties) => void;
}

export default function ItemPropertiesForm({
  value,
  onChange,
}: ItemPropertiesFormProps) {
  const specialEffects: SpecialEffect[] = value.special_effects || [];

  const updateField = <K extends keyof ItemProperties>(
    field: K,
    fieldValue: ItemProperties[K]
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleAddEffect = () => {
    updateField('special_effects', [
      ...specialEffects,
      { name: '', description: '' },
    ]);
  };

  const handleUpdateEffect = (
    idx: number,
    key: keyof SpecialEffect,
    val: string
  ) => {
    const next = specialEffects.map((fx, i) =>
      i === idx ? { ...fx, [key]: val } : fx
    );
    updateField('special_effects', next);
  };

  const handleRemoveEffect = (idx: number) => {
    updateField(
      'special_effects',
      specialEffects.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="space-y-4 rounded-md border border-[#c8aa6e]/30 bg-[#09090b]/80 p-4">
      <div className="border-b border-[#c8aa6e]/20 pb-2">
        <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-[#c8aa6e]">
          Propriedades do Item (ItemProperties)
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Raridade (rarity)
          </label>
          <input
            type="text"
            placeholder="Ex: Rare / Legendary"
            value={value.rarity || ''}
            onChange={(e) => updateField('rarity', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Tipo de Arma (weapon_type)
          </label>
          <input
            type="text"
            placeholder="Ex: Martial Melee"
            value={value.weapon_type || ''}
            onChange={(e) => updateField('weapon_type', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Subtipo (subtype)
          </label>
          <input
            type="text"
            placeholder="Ex: Longsword"
            value={value.subtype || ''}
            onChange={(e) => updateField('subtype', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Dano (damage)
          </label>
          <input
            type="text"
            placeholder="Ex: 1d8 + 2"
            value={value.damage || ''}
            onChange={(e) => updateField('damage', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Tipo de Dano (damage_type)
          </label>
          <input
            type="text"
            placeholder="Ex: Slashing"
            value={value.damage_type || ''}
            onChange={(e) => updateField('damage_type', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Peso (weight string)
          </label>
          <input
            type="text"
            placeholder='Ex: "2.5 lb."'
            value={value.weight || ''}
            onChange={(e) => updateField('weight', String(e.target.value))}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
            Bônus Mágico (magic_bonus)
          </label>
          <input
            type="text"
            placeholder="Ex: +2"
            value={value.magic_bonus || ''}
            onChange={(e) => updateField('magic_bonus', e.target.value)}
            className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="item-attunement"
            checked={Boolean(value.attunement_required)}
            onChange={(e) =>
              updateField('attunement_required', e.target.checked)
            }
            className="accent-[#c8aa6e]"
          />
          <label htmlFor="item-attunement" className="text-xs text-[#e4e4e7]">
            Requer Sintonização (attunement_required)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase text-[#c8aa6e] mb-1">
          Maldição (curse)
        </label>
        <input
          type="text"
          placeholder="Descreva a maldição caso o item seja amaldiçoado..."
          value={value.curse || ''}
          onChange={(e) => updateField('curse', e.target.value)}
          className="w-full rounded border border-[#c8aa6e]/30 bg-[#121216] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
        />
      </div>

      {/* Lista Dinâmica de Special Effects */}
      <div className="space-y-2.5 border-t border-[#c8aa6e]/20 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#c8aa6e]">
            Efeitos Especiais ({specialEffects.length})
          </span>
          <button
            type="button"
            onClick={handleAddEffect}
            className="rounded border border-[#c8aa6e] bg-[#c8aa6e]/15 px-2.5 py-1 font-serif text-[11px] uppercase text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#09090b]"
          >
            + Adicionar Efeito
          </button>
        </div>

        {specialEffects.map((fx, idx) => (
          <div
            key={idx}
            className="space-y-2 rounded border border-[#c8aa6e]/30 bg-[#121216] p-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs text-[#c8aa6e]">
                Efeito #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveEffect(idx)}
                className="text-[11px] text-red-400 hover:underline"
              >
                Remover
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Nome do efeito"
              value={fx.name}
              onChange={(e) => handleUpdateEffect(idx, 'name', e.target.value)}
              className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
            />
            <textarea
              rows={2}
              required
              placeholder="Descrição do efeito"
              value={fx.description}
              onChange={(e) =>
                handleUpdateEffect(idx, 'description', e.target.value)
              }
              className="w-full rounded border border-[#c8aa6e]/30 bg-[#09090b] px-2.5 py-1.5 text-xs text-[#e4e4e7]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
