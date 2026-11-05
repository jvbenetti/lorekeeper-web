export type LocationType = 'CITY' | 'DUNGEON' | 'HOUSE' | 'CASTLE' | 'HISTORIC';
export type EntityType = 'MONSTER' | 'NPC' | 'GOD' | 'DEMIGOD';
export type ItemType = 'WEAPON' | 'ARMOR' | 'ARTIFACT' | 'POTION';

export interface MinimalResource {
  id: number;
  name: string;
  type: string;
}

export interface Action {
  name: string;
  type?: string;
  hit?: string;
  reach?: string;
  damage?: string;
  effect?: string;
}

export interface LegendaryAction {
  name: string;
  effect: string;
}

export interface MonsterStats {
  armor_class?: number;
  hit_points?: string;
  speed?: string;
  attributes?: Record<string, number>; // Ex: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 14, CHA: 18 }
  saving_throws?: string[];
  skills?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  senses?: string[];
  languages?: string[];
  challenge_rating?: string;
  actions?: Action[];
  legendary_actions?: LegendaryAction[];
}

export interface SpecialEffect {
  name: string;
  description: string;
}

export interface ItemProperties {
  weapon_type?: string;
  subtype?: string;
  rarity?: string;
  attunement_required?: boolean;
  damage?: string;
  damage_type?: string;
  weight?: string; // IMPORTANTE: enviar como string (ex: "2.5 lb.")
  magic_bonus?: string;
  special_effects?: SpecialEffect[];
  curse?: string;
}

export interface EntityResponse {
  id: number;
  name: string;
  type: EntityType;
  lore: string;
  image_url: string;
  stats: MonsterStats | null;
  locations: MinimalResource[];
  drops: MinimalResource[];
}

export interface LocationResponse {
  id: number;
  name: string;
  type: LocationType;
  lore: string;
  image_url: string;
  sub_areas: MinimalResource[];
  entities: MinimalResource[];
  hidden_items: MinimalResource[];
  entity_drops: MinimalResource[];
}

export interface ItemResponse {
  id: number;
  name: string;
  type: ItemType;
  lore: string;
  image_url: string;
  properties: ItemProperties | null;
  locations: MinimalResource[];
  dropped_by: MinimalResource[];
}

// Auth & Standard Payloads conforme API_CONTRACT.md
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface ApiMessageResponse {
  message: string;
}

// Request Payloads
export interface CreateEntityRequest {
  name: string;
  type: EntityType;
  lore: string;
  image_url: string;
  stats: MonsterStats;
}

export type UpdateEntityRequest = Partial<CreateEntityRequest>;

export interface CreateLocationRequest {
  name: string;
  type: LocationType;
  lore: string;
  image_url: string;
  parent_id?: number | null;
}

export type UpdateLocationRequest = Partial<CreateLocationRequest>;

export interface CreateItemRequest {
  name: string;
  type: ItemType;
  lore: string;
  image_url: string;
  properties: ItemProperties;
}

export type UpdateItemRequest = Partial<CreateItemRequest>;
