# Lorekeeper API Contract (v1)

> **REGRA PARA OS AGENTES:**
> - **Backend Agent:** Sempre que criar/alterar uma rota, struct de response ou enum em Go, atualize este arquivo imediatamente.
> - **Frontend Agent:** Use este arquivo como única fonte de verdade para chamadas HTTP (`fetch`/axios) e tipagens TypeScript. Nunca invente endpoints que não estejam listados aqui.

## Base Configuration
- **Local Base URL:** `http://localhost:8080/api/v1`
- **Health Check URL:** `GET http://localhost:8080/health` (Público) -> `{ "status": "online", "world": "lorekeeper api" }`
- **Auth Header (Rotas Admin 🔒):** `Authorization: Bearer <token>`
- **Formato Padrão de Erro (`400`, `401`, `404`, `500`):** `{ "error": "string" }`
- **Formato Padrão de Mensagem (`200` em ações/deletes):** `{ "message": "string" }`

---

## 1. Enums Permitidos
- **LocationType:** `CITY` | `DUNGEON` | `HOUSE` | `CASTLE` | `HISTORIC`
- **EntityType:** `MONSTER` | `NPC` | `GOD` | `DEMIGOD`
- **ItemType:** `WEAPON` | `ARMOR` | `ARTIFACT` | `POTION`

---

## 2. Endpoints

### Auth
- **POST `/login`** (Público)
    - Request: `{ "username": "string", "password": "string" }`
    - Response `200 OK`: `{ "token": "string" }` (válido por 72h)

### Entities (Monstros, NPCs, Deuses, Semideuses)
- **GET `/entities`** (Público)
    - Query Params Opcionais: `?type=EntityType&search=texto`
    - Response `200 OK`: `MinimalResource[]` (retorna `[]` quando vazio)
- **GET `/entities/:id`** (Público)
    - Response `200 OK`: `EntityResponse`
- **POST `/entities`** (Admin 🔒)
    - Request: `{ "name": "string", "type": "EntityType", "lore": "string", "image_url": "string", "stats": MonsterStats }`
    - Response `201 Created`: Entidade criada
- **PUT `/entities/:id`** (Admin 🔒)
    - Request (Atualização Parcial ou Completa): `{ "name"?: "string", "type"?: "EntityType", "lore"?: "string", "image_url"?: "string", "stats"?: MonsterStats }`
    - Response `200 OK`: Entidade atualizada (`404 Not Found` se não existir)
- **DELETE `/entities/:id`** (Admin 🔒)
    - Response `200 OK`: `{ "message": "Entidade removida com sucesso" }` (`404 Not Found` se não existir)
- **POST `/entities/:id/drops/:item_id`** (Admin 🔒)
    - Vincula um item existente aos drops da entidade. Sem body.
    - Response `200 OK`: `{ "message": "Item adicionado aos drops do monstro com sucesso" }` (`404 Not Found` se entidade ou item não existir)
- **DELETE `/entities/:id/drops/:item_id`** (Admin 🔒)
    - Remove o vínculo de um item dos drops da entidade (sem deletar o item do banco). Sem body.
    - Response `200 OK`: `{ "message": "Item removido dos drops da entidade com sucesso" }` (`404 Not Found` se entidade ou item não existir)

### Locations (Cidades, Dungeons, Castelos, etc.)
- **GET `/locations`** (Público)
    - Query Params Opcionais: `?type=LocationType&search=texto`
    - Response `200 OK`: `MinimalResource[]` (retorna `[]` quando vazio)
- **GET `/locations/:id`** (Público)
    - Response `200 OK`: `LocationResponse`
- **POST `/locations`** (Admin 🔒)
    - Request: `{ "name": "string", "type": "LocationType", "lore": "string", "image_url": "string", "parent_id"?: number | null }`
    - Response `201 Created`: Local criado
- **PUT `/locations/:id`** (Admin 🔒)
    - Request (Atualização Parcial ou Completa): `{ "name"?: "string", "type"?: "LocationType", "lore"?: "string", "image_url"?: "string", "parent_id"?: number | null }`
    - Response `200 OK`: Local atualizado (`404 Not Found` se não existir)
- **DELETE `/locations/:id`** (Admin 🔒)
    - Response `200 OK`: `{ "message": "Local removido com sucesso" }` (`404 Not Found` se não existir)
- **POST `/locations/:id/entities/:entity_id`** (Admin 🔒)
    - Vincula uma entidade existente ao local. Sem body.
    - Response `200 OK`: `{ "message": "Entidade vinculada ao local com sucesso" }` (`404 Not Found` se local ou entidade não existir)
- **DELETE `/locations/:id/entities/:entity_id`** (Admin 🔒)
    - Remove o vínculo da entidade com o local (sem deletar a entidade do banco). Sem body.
    - Response `200 OK`: `{ "message": "Entidade removida do local com sucesso" }` (`404 Not Found` se local ou entidade não existir)
- **POST `/locations/:id/items/:item_id`** (Admin 🔒)
    - Esconde/vincula um item existente no local. Sem body.
    - Response `200 OK`: `{ "message": "Item escondido no local com sucesso" }` (`404 Not Found` se local ou item não existir)
- **DELETE `/locations/:id/items/:item_id`** (Admin 🔒)
    - Remove o vínculo do item escondido no local (sem deletar o item do banco). Sem body.
    - Response `200 OK`: `{ "message": "Item removido do local com sucesso" }` (`404 Not Found` se local ou item não existir)

### Items (Armas, Armaduras, Artefatos, Poções)
- **GET `/items`** (Público)
    - Query Params Opcionais: `?type=ItemType&search=texto&rarity=texto`
    - Response `200 OK`: `MinimalResource[]` (retorna `[]` quando vazio)
- **GET `/items/:id`** (Público)
    - Response `200 OK`: `ItemResponse`
- **POST `/items`** (Admin 🔒)
    - Request: `{ "name": "string", "type": "ItemType", "lore": "string", "image_url": "string", "properties": ItemProperties }`
    - Response `201 Created`: Item criado
- **PUT `/items/:id`** (Admin 🔒)
    - Request (Atualização Parcial ou Completa): `{ "name"?: "string", "type"?: "ItemType", "lore"?: "string", "image_url"?: "string", "properties"?: ItemProperties }`
    - Response `200 OK`: Item atualizado (`404 Not Found` se não existir)
- **DELETE `/items/:id`** (Admin 🔒)
    - Response `200 OK`: `{ "message": "Item removido com sucesso" }` (`404 Not Found` se não existir)

---

## 3. Data Transfer Objects (TypeScript Schemas)

```typescript
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
```
