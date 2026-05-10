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
      id: 'neo_social',
      name: 'Llinatge Social',
      desc: 'Líder nat amb talent per la diplomàcia. Social 5, Chieftainship i Persuasió actius. 2 fills amb destreses heretades. Ideal per provar accions de negociació i lideratge.',
      era: 'neolitic', eraCycle: 1, generation: 2,
      char: {
        name: 'Sela', gender: 'F', physical: 2, intelligence: 3, social: 5,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura'],
        traitIds: ['born_leader', 'gift_of_speech'],
        learnedSkillIds: ['socialitzar', 'art_narratiu'],
        partner: { name: 'Arn', gender: 'M', stats: { physical: 3, intelligence: 2, social: 4 } },
        children: [
          { name: 'Kala', gender: 'F', physical: 2, intelligence: 3, social: 5,
            virtueLabel: 'La tribu el/la segueix sense dubtar',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire'],
            learnedSkillIds: ['socialitzar'], traitIds: ['born_leader', 'gift_of_speech'],
            bornCycle: 2, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 30 },
          { name: 'Drak', gender: 'M', physical: 3, intelligence: 2, social: 4,
            virtueLabel: 'Fa amics allà on va',
            knowledgeIds: ['language_basics', 'tribal_organization'],
            learnedSkillIds: ['art_narratiu'], traitIds: ['adaptable', 'gift_of_speech'],
            bornCycle: 5, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 30 },
        ],
      },
      resources: { food: 55, health: 86, healthMax: 86, happiness: 75, familyReputation: 35 },
      unlockedSkillIds: ['chieftainship', 'persuasion'],
    },
    {
      id: 'neo_religious',
      name: 'Llinatge Religiós',
      desc: 'Xaman i artista rupestre. Connecta amb forces invisibles i immortalitza les gestes del llinatge. Intel·ligència 4, Xamanisme i Art Rupestre actius.',
      era: 'neolitic', eraCycle: 1, generation: 2,
      char: {
        name: 'Thea', gender: 'F', physical: 2, intelligence: 4, social: 3,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura'],
        traitIds: ['sharp_intuition', 'quick_learner'],
        learnedSkillIds: ['art_narratiu', 'medicinal_plants'],
        partner: { name: 'Mog', gender: 'M', stats: { physical: 2, intelligence: 3, social: 3 } },
        children: [
          { name: 'Yuna', gender: 'F', physical: 2, intelligence: 4, social: 3,
            virtueLabel: 'La curiositat el/la guia on altres no s\'atreveixen',
            knowledgeIds: ['language_basics', 'fire', 'symbolic_thinking'],
            learnedSkillIds: ['art_narratiu'], traitIds: ['sharp_intuition', 'quick_learner'],
            bornCycle: 2, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 25 },
          { name: 'Fal', gender: 'M', physical: 3, intelligence: 3, social: 3,
            virtueLabel: 'No destaca en res però mai falla en res',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire'],
            learnedSkillIds: ['medicinal_plants'], traitIds: ['adaptable', 'sharp_intuition'],
            bornCycle: 5, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 25 },
        ],
      },
      resources: { food: 50, health: 86, healthMax: 86, happiness: 80, familyReputation: 28 },
      unlockedSkillIds: ['shamanism', 'cave_art'],
    },
    {
      id: 'neo_science',
      name: 'Llinatge Científic',
      desc: 'Artesans i pensadors que dominen la pedra i els símbols. Intel·ligència 5, Artesania Avançada i Art Rupestre actius.',
      era: 'neolitic', eraCycle: 1, generation: 2,
      char: {
        name: 'Gar', gender: 'M', physical: 3, intelligence: 5, social: 2,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura'],
        traitIds: ['quick_learner', 'sharp_intuition'],
        learnedSkillIds: ['weaving', 'cooking'],
        partner: { name: 'Nara', gender: 'F', stats: { physical: 2, intelligence: 4, social: 3 } },
        children: [
          { name: 'Huk', gender: 'M', physical: 3, intelligence: 5, social: 2,
            virtueLabel: 'La ment sempre un pas endavant',
            knowledgeIds: ['language_basics', 'stone_tools', 'symbolic_thinking'],
            learnedSkillIds: ['weaving'], traitIds: ['quick_learner', 'sharp_intuition'],
            bornCycle: 2, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 20 },
          { name: 'Lira', gender: 'F', physical: 2, intelligence: 4, social: 3,
            virtueLabel: 'Té un talent innat per entendre el món',
            knowledgeIds: ['language_basics', 'fire', 'stone_tools'],
            learnedSkillIds: ['cooking'], traitIds: ['sharp_intuition', 'adaptable'],
            bornCycle: 5, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 20 },
        ],
      },
      resources: { food: 52, health: 86, healthMax: 86, happiness: 72, familyReputation: 22 },
      unlockedSkillIds: ['advanced_crafting', 'cave_art'],
    },
    {
      id: 'neo_warrior',
      name: 'Llinatge Guerrer',
      desc: 'Caçadors llegendaris que dominen el foc i la nit. Físic 5, Caça Major i Tècniques del Foc actius. Per provar les accions de caça de gran perill.',
      era: 'neolitic', eraCycle: 1, generation: 2,
      char: {
        name: 'Thag', gender: 'M', physical: 5, intelligence: 2, social: 3,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura'],
        traitIds: ['great_strength', 'natural_resilience'],
        learnedSkillIds: ['tracking', 'fishing'],
        partner: { name: 'Hara', gender: 'F', stats: { physical: 4, intelligence: 2, social: 2 } },
        children: [
          { name: 'Bok', gender: 'M', physical: 5, intelligence: 2, social: 3,
            virtueLabel: 'Nascut/da per a la cacera',
            knowledgeIds: ['language_basics', 'stone_tools', 'fire'],
            learnedSkillIds: ['tracking'], traitIds: ['great_strength', 'natural_resilience'],
            bornCycle: 2, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 20 },
          { name: 'Vela', gender: 'F', physical: 4, intelligence: 2, social: 3,
            virtueLabel: 'El cos mai li falla quan importa',
            knowledgeIds: ['language_basics', 'fire'],
            learnedSkillIds: ['fishing'], traitIds: ['great_strength', 'adaptable'],
            bornCycle: 5, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 20 },
        ],
      },
      resources: { food: 60, health: 90, healthMax: 90, happiness: 65, familyReputation: 20 },
      unlockedSkillIds: ['big_game_hunting', 'fire_techniques'],
    },
    {
      id: 'neo_trader',
      name: 'Llinatge Comerciant',
      desc: 'Xarxa de contactes i tradició oral forta. Intel·ligència i Social 4 equilibrats. Bescanvi i Tradició Oral actius. Ideal per provar relacions amb tribus veïnes.',
      era: 'neolitic', eraCycle: 1, generation: 2,
      char: {
        name: 'Una', gender: 'F', physical: 2, intelligence: 4, social: 4,
        knowledgeIds: ['language_basics', 'tribal_organization', 'fire', 'stone_tools', 'symbolic_thinking', 'sedentarism', 'agricultura'],
        traitIds: ['gift_of_speech', 'quick_learner'],
        learnedSkillIds: ['socialitzar', 'cooking'],
        partner: { name: 'Jok', gender: 'M', stats: { physical: 2, intelligence: 3, social: 4 } },
        children: [
          { name: 'Asha', gender: 'F', physical: 2, intelligence: 4, social: 4,
            virtueLabel: 'Té el do de la paraula',
            knowledgeIds: ['language_basics', 'tribal_organization', 'fire'],
            learnedSkillIds: ['socialitzar'], traitIds: ['gift_of_speech', 'quick_learner'],
            bornCycle: 2, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 32 },
          { name: 'Dal', gender: 'M', physical: 3, intelligence: 3, social: 4,
            virtueLabel: 'Fa amics allà on va',
            knowledgeIds: ['language_basics', 'tribal_organization'],
            learnedSkillIds: ['cooking'], traitIds: ['adaptable', 'gift_of_speech'],
            bornCycle: 5, bornEraCycle: 0, bornEraId: 'neolitic', familyReputation: 32 },
        ],
      },
      resources: { food: 55, health: 86, healthMax: 86, happiness: 78, familyReputation: 38 },
      unlockedSkillIds: ['barter_trade', 'oral_tradition'],
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
