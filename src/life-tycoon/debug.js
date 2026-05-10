'use strict';

// ── Dev panel — only active when URL contains ?dev ──────────────────────────
// Usage: open index.html?dev in browser

const DEBUG_PRESETS = {
  prehistoria: [
    {
      id: 'pre_quick',
      name: 'Inici Ràpid',
      desc: 'Llengua Bàsica i Organització Tribal actius. Social 3, Persuasió desblocat. Bon punt de partida per provar les primeres zones sense jugar els 8 primers cicles.',
      era: 'prehistoria', eraCycle: 8, generation: 1,
      char: {
        name: 'Brac', gender: 'M', physical: 2, intelligence: 2, social: 3,
        knowledgeIds: ['language_basics', 'tribal_organization'],
        traitIds: ['born_leader', 'sharp_intuition'],
        learnedSkillIds: [],
        partner: null, children: [],
      },
      resources: { food: 45, health: 80, happiness: 65, familyReputation: 10 },
      unlockedSkillIds: ['persuasion'],
    },
    {
      id: 'pre_mid',
      name: 'Meitat de l\'Era',
      desc: 'Cicle 28. Foc i Eines de Pedra actius. Parella, 2 fills, Chieftainship i Caça Major desblocat. Ideal per provar la mecànica familiar i les zones de bosc.',
      era: 'prehistoria', eraCycle: 28, generation: 1,
      char: {
        name: 'Dal', gender: 'M', physical: 3, intelligence: 3, social: 4,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools'],
        traitIds: ['great_strength', 'sharp_intuition'],
        learnedSkillIds: ['tracking'],
        partner: { name: 'Mira', gender: 'F', stats: { physical: 2, intelligence: 3, social: 3 } },
        children: [
          { name: 'Arn', gender: 'M', physical: 3, intelligence: 2, social: 3,
            virtueLabel: 'La seva força és llegendària des de petit',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire'],
            learnedSkillIds: [], traitIds: ['great_strength', 'quick_learner'],
            bornCycle: 5, bornEraCycle: 10, bornEraId: 'prehistoria', familyReputation: 15 },
          { name: 'Sela', gender: 'F', physical: 2, intelligence: 3, social: 3,
            virtueLabel: 'Té un talent innat per entendre el món',
            knowledgeIds: ['language_basics', 'tribal_organization'],
            learnedSkillIds: [], traitIds: ['sharp_intuition', 'adaptable'],
            bornCycle: 8, bornEraCycle: 18, bornEraId: 'prehistoria', familyReputation: 15 },
        ],
      },
      resources: { food: 50, health: 85, healthMax: 85, happiness: 70, familyReputation: 25 },
      unlockedSkillIds: ['chieftainship', 'big_game_hunting'],
    },
    {
      id: 'pre_late',
      name: 'Pre-Transició',
      desc: 'Cicle 50. Tots els techs fins al Sedentarisme. Xamanisme i Proto-Agricultura actius. 3 fills, un d\'ells preparat per heretar. A un pas de l\'Agricultura.',
      era: 'prehistoria', eraCycle: 50, generation: 2,
      char: {
        name: 'Kur', gender: 'M', physical: 4, intelligence: 4, social: 4,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism'],
        traitIds: ['sharp_intuition', 'natural_resilience'],
        learnedSkillIds: ['art_narratiu', 'cooking'],
        partner: { name: 'Bera', gender: 'F', stats: { physical: 3, intelligence: 4, social: 3 } },
        children: [
          { name: 'Mog', gender: 'M', physical: 4, intelligence: 3, social: 4,
            virtueLabel: 'No destaca en res però mai falla en res',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking'],
            learnedSkillIds: ['art_narratiu'], traitIds: ['sharp_intuition', 'born_leader'],
            bornCycle: 3, bornEraCycle: 35, bornEraId: 'prehistoria', familyReputation: 40 },
          { name: 'Thea', gender: 'F', physical: 3, intelligence: 4, social: 3,
            virtueLabel: 'La curiositat el/la guia on altres no s\'atreveixen',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools'],
            learnedSkillIds: ['cooking'], traitIds: ['quick_learner', 'adaptable'],
            bornCycle: 6, bornEraCycle: 42, bornEraId: 'prehistoria', familyReputation: 40 },
          { name: 'Bok', gender: 'M', physical: 4, intelligence: 3, social: 4,
            virtueLabel: 'Nascut/da per a la cacera',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism'],
            learnedSkillIds: [], traitIds: ['great_strength', 'natural_resilience'],
            bornCycle: 9, bornEraCycle: 48, bornEraId: 'prehistoria', familyReputation: 40 },
        ],
      },
      resources: { food: 55, health: 88, healthMax: 90, happiness: 75, familyReputation: 45 },
      unlockedSkillIds: ['shamanism', 'proto_agriculture', 'shelter_building'],
    },
  ],

  neolitic: [
    {
      id: 'neo_farmer',
      name: 'Pagès del Neolític',
      desc: 'Inici del Neolític (cicle d\'era 12). Ramaderia i Ceràmica actives. Ramader descobert, Cria Selectiva desblocat. Ideal per provar la transició agrícola i els camps.',
      era: 'neolitic', eraCycle: 12, generation: 2,
      char: {
        name: 'Mira', gender: 'F', physical: 3, intelligence: 3, social: 2,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura', 'herding', 'pottery'],
        traitIds: ['natural_resilience', 'adaptable'],
        learnedSkillIds: ['herder'],
        partner: { name: 'Dal', gender: 'M', stats: { physical: 3, intelligence: 2, social: 2 } },
        children: [],
      },
      resources: { food: 50, health: 85, healthMax: 85, happiness: 68, familyReputation: 20 },
      unlockedSkillIds: ['selective_breeding'],
    },
    {
      id: 'neo_artisan',
      name: 'Artesà i Pagès',
      desc: 'Cicle d\'era 30. Agricultura Intensiva i Arquitectura actives. Terrisser/a i Agrònom/a descoberts. Vasos Fins i Irrigació desblocat. Per provar el taller i els camps avançats.',
      era: 'neolitic', eraCycle: 30, generation: 2,
      char: {
        name: 'Gar', gender: 'M', physical: 3, intelligence: 4, social: 3,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura', 'herding', 'pottery', 'intensive_farming', 'architecture'],
        traitIds: ['quick_learner', 'sharp_intuition'],
        learnedSkillIds: ['potter', 'agronomist'],
        partner: { name: 'Lira', gender: 'F', stats: { physical: 2, intelligence: 4, social: 3 } },
        children: [
          { name: 'Nara', gender: 'F', physical: 2, intelligence: 4, social: 3,
            virtueLabel: 'Té un talent innat per entendre el món',
            knowledgeIds: ['language_basics', 'herding', 'pottery'],
            learnedSkillIds: [], traitIds: ['sharp_intuition', 'adaptable'],
            bornCycle: 4, bornEraCycle: 18, bornEraId: 'neolitic', familyReputation: 25 },
        ],
      },
      resources: { food: 58, health: 88, healthMax: 88, happiness: 72, familyReputation: 30 },
      unlockedSkillIds: ['clay_art', 'irrigation', 'urban_planning'],
    },
    {
      id: 'neo_trader',
      name: 'Comerciant del Neolític',
      desc: 'Cicle d\'era 42. Xarxes Comercials actives. Comerciant i Curandero/a descoberts. Diplomàcia i Intel·ligència Comercial desblocat. Per provar el mercat avançat i els tractats.',
      era: 'neolitic', eraCycle: 42, generation: 3,
      char: {
        name: 'Sela', gender: 'F', physical: 2, intelligence: 4, social: 5,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura', 'herding', 'pottery', 'intensive_farming', 'architecture', 'trade_routes'],
        traitIds: ['gift_of_speech', 'quick_learner'],
        learnedSkillIds: ['merchant', 'healer'],
        partner: { name: 'Jok', gender: 'M', stats: { physical: 2, intelligence: 3, social: 4 } },
        children: [
          { name: 'Thag', gender: 'M', physical: 3, intelligence: 3, social: 4,
            virtueLabel: 'La tribu el/la segueix sense dubtar',
            knowledgeIds: ['language_basics', 'herding', 'pottery', 'trade_routes'],
            learnedSkillIds: ['merchant'], traitIds: ['born_leader', 'gift_of_speech'],
            bornCycle: 3, bornEraCycle: 30, bornEraId: 'neolitic', familyReputation: 38 },
          { name: 'Una', gender: 'F', physical: 2, intelligence: 4, social: 4,
            virtueLabel: 'Té el do de la paraula',
            knowledgeIds: ['language_basics', 'tribal_organization', 'pottery'],
            learnedSkillIds: [], traitIds: ['gift_of_speech', 'adaptable'],
            bornCycle: 6, bornEraCycle: 36, bornEraId: 'neolitic', familyReputation: 38 },
        ],
      },
      resources: { food: 60, health: 88, healthMax: 90, happiness: 78, familyReputation: 45 },
      unlockedSkillIds: ['diplomacy', 'trade_intelligence', 'food_preservation'],
    },
    {
      id: 'neo_scholar',
      name: 'Escriba del Llinatge',
      desc: 'Cicle d\'era 52. Proto-Escriptura activa. Escriba i Paleta descoberts. Arxius del Llinatge i Astronomia desblocat. Ideal per provar el temple i els registres del llinatge.',
      era: 'neolitic', eraCycle: 52, generation: 3,
      char: {
        name: 'Kur', gender: 'M', physical: 2, intelligence: 5, social: 3,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura', 'herding', 'pottery', 'intensive_farming', 'architecture', 'trade_routes', 'proto_writing'],
        traitIds: ['sharp_intuition', 'natural_resilience'],
        learnedSkillIds: ['scribe_skill', 'mason'],
        partner: { name: 'Asha', gender: 'F', stats: { physical: 2, intelligence: 4, social: 3 } },
        children: [
          { name: 'Huk', gender: 'M', physical: 2, intelligence: 5, social: 3,
            virtueLabel: 'La ment sempre un pas endavant',
            knowledgeIds: ['language_basics', 'pottery', 'architecture', 'proto_writing'],
            learnedSkillIds: ['scribe_skill'], traitIds: ['sharp_intuition', 'quick_learner'],
            bornCycle: 3, bornEraCycle: 40, bornEraId: 'neolitic', familyReputation: 48 },
          { name: 'Vela', gender: 'F', physical: 3, intelligence: 4, social: 3,
            virtueLabel: 'Un equilibri que pocs assoleixen',
            knowledgeIds: ['language_basics', 'herding', 'pottery', 'intensive_farming'],
            learnedSkillIds: ['mason'], traitIds: ['natural_resilience', 'adaptable'],
            bornCycle: 6, bornEraCycle: 46, bornEraId: 'neolitic', familyReputation: 48 },
        ],
      },
      resources: { food: 62, health: 90, healthMax: 92, happiness: 80, familyReputation: 55 },
      unlockedSkillIds: ['lineage_archives', 'astronomical_knowledge', 'monumental_building'],
    },
  ],
};

// ── Load preset into game state ──────────────────────────────────────────────
function loadDevPreset(preset) {
  initState();

  const era = GAME_DATA.eras.find(e => e.id === preset.era) || GAME_DATA.eras[0];
  S.currentEraId  = era.id;
  S.eraCycle      = preset.eraCycle ?? 1;
  S.generation    = preset.generation ?? 1;
  S.cycle         = 1;
  S.timeTotal     = era.timeTotal;
  S.timeLeft      = era.timeTotal;

  const c = S.char;
  c.name          = preset.char.name;
  c.gender        = preset.char.gender;
  c.physical      = preset.char.physical;
  c.intelligence  = preset.char.intelligence;
  c.social        = preset.char.social;
  c.knowledgeIds  = [...preset.char.knowledgeIds];
  c.traitIds      = [...(preset.char.traitIds ?? [])];
  c.learnedSkillIds = [...(preset.char.learnedSkillIds ?? [])];
  c.partner       = preset.char.partner ? { ...preset.char.partner } : null;
  c.children      = (preset.char.children ?? []).map(ch => ({ ...ch }));

  // Apply trait side-effects (traitAgingResist, traitDiscoveryBonus, etc.)
  for (const tId of c.traitIds) applyTrait(tId);

  // Override resources with explicit preset values after trait application
  const r = preset.resources ?? {};
  if (r.food             != null) S.resources.food.value             = r.food;
  if (r.health           != null) S.resources.health.value           = r.health;
  if (r.healthMax        != null) S.resources.health.max             = r.healthMax;
  if (r.happiness        != null) S.resources.happiness.value        = r.happiness;
  if (r.familyReputation != null) S.resources.familyReputation.value = r.familyReputation;

  S.unlockedSkillIds = [...(preset.unlockedSkillIds ?? [])];
  S.maxCycles = era.cyclesPerLife.base + Math.round(c.physical * era.mechanics.successionPhysicalFactor);
  S.dynastyName = dynastyName(c.name);

  initDiscoveredZones();
  S.pendingDiscoveries = [];
  S.phase = 'select';

  hide('overlay-menu');
  renderAll();
}

// ── Dev panel UI ─────────────────────────────────────────────────────────────
function initDevPanel() {
  if (!new URLSearchParams(window.location.search).has('dev')) return;

  const panel = document.createElement('div');
  panel.id = 'dev-panel';
  panel.innerHTML = `
    <button id="dev-toggle">🛠️</button>
    <div id="dev-body" class="hidden">
      <div class="dev-title">Dev — Carregar Preset</div>
      <select id="dev-era-sel"></select>
      <div id="dev-preset-list"></div>
    </div>
  `;
  document.body.appendChild(panel);

  const toggle     = panel.querySelector('#dev-toggle');
  const body       = panel.querySelector('#dev-body');
  const eraSel     = panel.querySelector('#dev-era-sel');
  const presetList = panel.querySelector('#dev-preset-list');

  // Populate era selector from presets that have content
  for (const eraId of Object.keys(DEBUG_PRESETS)) {
    const eraData = GAME_DATA.eras.find(e => e.id === eraId);
    const opt = document.createElement('option');
    opt.value = eraId;
    opt.textContent = eraData ? `${eraData.icon} ${eraData.name}` : eraId;
    eraSel.appendChild(opt);
  }

  function renderPresets(eraId) {
    presetList.innerHTML = '';
    for (const preset of DEBUG_PRESETS[eraId] ?? []) {
      const card = document.createElement('div');
      card.className = 'dev-preset-card';
      card.innerHTML = `
        <div class="dev-preset-name">${preset.name}</div>
        <div class="dev-preset-desc">${preset.desc}</div>
        <button class="dev-preset-load">Carrega →</button>
      `;
      card.querySelector('.dev-preset-load').addEventListener('click', () => {
        loadDevPreset(preset);
        body.classList.add('hidden');
      });
      presetList.appendChild(card);
    }
  }

  toggle.addEventListener('click', () => body.classList.toggle('hidden'));
  eraSel.addEventListener('change', () => renderPresets(eraSel.value));
  renderPresets(eraSel.value);
}
