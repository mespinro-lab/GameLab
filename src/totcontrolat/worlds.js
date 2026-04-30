'use strict';

const WORLDS = [
  {
    id: 'vilaturisme',
    name: 'Vilaturisme',
    icon: '🌅',
    color: '#FF9F43',
    description: 'Poble turístic en plena transformació. Gestiona l\'equilibri entre residents i la indústria de l\'hospitalitat.',
    unlockAfter: null,
    factionConfig: {
      veins:      { icon: '🏠', name: 'Residents' },
      mercat:     { icon: '🏨', name: 'Hostalers' },
      activistes: { icon: '🌿', name: 'Ecologistes' },
    },
    buildings: [
      { id: 'salut', chain: [
        { level: 1, name: 'Centre de Salut', icon: '🏥', cost: 200, fx: { driftMod: { veins: 0.35 } } },
        { level: 2, name: 'Clínica',          icon: '🏥', cost: 380, fx: { driftMod: { veins: 0.55, activistes: 0.2 } } },
        { level: 3, name: 'Hospital',          icon: '🏥', cost: 650, fx: { driftMod: { veins: 0.85, activistes: 0.35 } } },
      ]},
      { id: 'turisme', chain: [
        { level: 1, name: "Punt d'Info",         icon: '🗺️', cost: 160, fx: { driftMod: { mercat: 0.35 } } },
        { level: 2, name: 'Oficina de Turisme',  icon: '🏨', cost: 300, fx: { driftMod: { mercat: 0.65, veins: 0.15 } } },
        { level: 3, name: 'Centre de Visitants', icon: '🏨', cost: 580, fx: { driftMod: { mercat: 1.1, veins: 0.25 } } },
      ]},
      { id: 'seguretat', chain: [
        { level: 1, name: 'Vigilant de Nit',  icon: '👮', cost: 180, fx: { driftMod: { veins: 0.3 } } },
        { level: 2, name: 'Comissaria',       icon: '🚔', cost: 340, fx: { driftMod: { veins: 0.55, activistes: -0.1 } } },
        { level: 3, name: 'Districte Segur',  icon: '🛡️', cost: 600, fx: { driftMod: { veins: 0.85, activistes: -0.15 } } },
      ]},
      { id: 'cultura', chain: [
        { level: 1, name: 'Cartellet al Bar',  icon: '📢', cost: 90,  fx: { driftMod: { activistes: 0.3 } } },
        { level: 2, name: 'Centre Cultural',   icon: '🎭', cost: 280, fx: { driftMod: { activistes: 0.6, veins: 0.2 } } },
        { level: 3, name: 'Teatre Municipal',  icon: '🎪', cost: 540, fx: { driftMod: { activistes: 1.0, veins: 0.35 } } },
      ]},
    ],
  },

  {
    id: 'sleeptown',
    name: 'Sleeptown',
    icon: '🌙',
    color: '#A78BFA',
    description: 'Barri residencial que valora la tranquil·litat per sobre de tot. Gestiona conflictes entre veïns, propietaris i la generació jove.',
    unlockAfter: 'vilaturisme',
    factionConfig: {
      veins:      { icon: '🏠', name: 'Residents' },
      mercat:     { icon: '🏡', name: 'Propietaris' },
      activistes: { icon: '🎸', name: 'Joves' },
    },
    buildings: [
      { id: 'parc', chain: [
        { level: 1, name: 'Bancs al Carrer', icon: '🌳', cost: 120, fx: { driftMod: { veins: 0.3, activistes: 0.2 } } },
        { level: 2, name: 'Jardinets',       icon: '🌳', cost: 260, fx: { driftMod: { veins: 0.55, activistes: 0.4 } } },
        { level: 3, name: 'Parc Municipal',  icon: '🌳', cost: 520, fx: { driftMod: { veins: 0.9, activistes: 0.65 } } },
      ]},
      { id: 'escola', chain: [
        { level: 1, name: "Espai Joves",  icon: '📚', cost: 170, fx: { driftMod: { activistes: 0.35, veins: 0.15 } } },
        { level: 2, name: 'Escola',       icon: '📚', cost: 350, fx: { driftMod: { activistes: 0.55, veins: 0.35 } } },
        { level: 3, name: 'Institut',     icon: '🏫', cost: 620, fx: { driftMod: { activistes: 0.85, veins: 0.55 } } },
      ]},
      { id: 'civic', chain: [
        { level: 1, name: 'Sala de Reunions',   icon: '🤝', cost: 140, fx: { driftMod: { veins: 0.2, mercat: 0.2, activistes: 0.2 } } },
        { level: 2, name: 'Centre Cívic',        icon: '🏛️', cost: 300, fx: { driftMod: { veins: 0.4, mercat: 0.35, activistes: 0.4 } } },
        { level: 3, name: 'Casa de la Cultura',  icon: '🎨', cost: 560, fx: { driftMod: { veins: 0.65, mercat: 0.5, activistes: 0.65 } } },
      ]},
      { id: 'transit', chain: [
        { level: 1, name: 'Parada de Bus',       icon: '🚌', cost: 150, fx: { driftMod: { veins: 0.3, mercat: 0.15 } } },
        { level: 2, name: 'Aparcament Ordenat',  icon: '🅿️', cost: 290, fx: { driftMod: { veins: 0.5, mercat: 0.35 } } },
        { level: 3, name: 'Zona 30 Integral',    icon: '🛣️', cost: 540, fx: { driftMod: { veins: 0.8, mercat: 0.5, activistes: 0.3 } } },
      ]},
    ],
  },

  {
    id: 'technoburg',
    name: 'Technoburg',
    icon: '⚡',
    color: '#38BDF8',
    description: 'Hub tecnològic en formació. Gestiona l\'equilibri entre innovació, residents tradicionals i els Hacktivistes que ho qüestionen tot.',
    unlockAfter: 'sleeptown',
    factionConfig: {
      veins:      { icon: '🏘️', name: 'Veïns' },
      mercat:     { icon: '💻', name: 'Startups' },
      activistes: { icon: '🔓', name: 'Hacktivistes' },
    },
    buildings: [
      { id: 'xarxa', chain: [
        { level: 1, name: 'WiFi Públic',       icon: '📶', cost: 180, fx: { driftMod: { mercat: 0.35, activistes: 0.2 } } },
        { level: 2, name: 'Fibra Comunitària', icon: '🔌', cost: 360, fx: { driftMod: { mercat: 0.65, activistes: 0.4 } } },
        { level: 3, name: 'Hub Digital',       icon: '🖥️', cost: 640, fx: { driftMod: { mercat: 1.05, activistes: 0.6 } } },
      ]},
      { id: 'innovacio', chain: [
        { level: 1, name: 'Co-working',        icon: '💼', cost: 200, fx: { driftMod: { mercat: 0.45 } } },
        { level: 2, name: 'Acceleradora',      icon: '🚀', cost: 400, fx: { driftMod: { mercat: 0.8, veins: 0.1 } } },
        { level: 3, name: 'Campus Tecnològic', icon: '🏗️', cost: 700, fx: { driftMod: { mercat: 1.2, veins: 0.2 } } },
      ]},
      { id: 'sostenibilitat', chain: [
        { level: 1, name: 'Deixalleria',          icon: '♻️', cost: 140, fx: { driftMod: { activistes: 0.35, veins: 0.2 } } },
        { level: 2, name: 'Energia Solar',        icon: '☀️', cost: 320, fx: { driftMod: { activistes: 0.65, veins: 0.35 } } },
        { level: 3, name: 'Barri Zero Emissions', icon: '🌿', cost: 600, fx: { driftMod: { activistes: 1.0, veins: 0.5 } } },
      ]},
      { id: 'mobilitat', chain: [
        { level: 1, name: 'Bicicletes',         icon: '🚴', cost: 160, fx: { driftMod: { veins: 0.3, activistes: 0.2 } } },
        { level: 2, name: 'Patinets Elèctrics', icon: '🛴', cost: 300, fx: { driftMod: { veins: 0.5, activistes: 0.4 } } },
        { level: 3, name: 'Metro Lleuger',      icon: '🚇', cost: 580, fx: { driftMod: { veins: 0.8, activistes: 0.6, mercat: 0.3 } } },
      ]},
    ],
  },
];
