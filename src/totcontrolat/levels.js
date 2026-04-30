'use strict';

// Per-world, per-level configuration.
// All 5 levels start with the same base values — tune per level here as needed.
// quota: number of building upgrades required to complete the mandate.

const LEVELS = {
  vilaturisme: [
    { level: 1, quota: 2,  startMoney: 600, startFactions: { veins: 55, mercat: 70, activistes: 50 }, startTax: 'mid', drift: { veins: -1.3, mercat: -0.7, activistes: -1.3 } },
    { level: 2, quota: 4,  startMoney: 600, startFactions: { veins: 55, mercat: 70, activistes: 50 }, startTax: 'mid', drift: { veins: -1.3, mercat: -0.7, activistes: -1.3 } },
    { level: 3, quota: 6,  startMoney: 600, startFactions: { veins: 55, mercat: 70, activistes: 50 }, startTax: 'mid', drift: { veins: -1.3, mercat: -0.7, activistes: -1.3 } },
    { level: 4, quota: 8,  startMoney: 600, startFactions: { veins: 55, mercat: 70, activistes: 50 }, startTax: 'mid', drift: { veins: -1.3, mercat: -0.7, activistes: -1.3 } },
    { level: 5, quota: 10, startMoney: 600, startFactions: { veins: 55, mercat: 70, activistes: 50 }, startTax: 'mid', drift: { veins: -1.3, mercat: -0.7, activistes: -1.3 } },
  ],
  sleeptown: [
    { level: 1, quota: 2,  startMoney: 400, startFactions: { veins: 65, mercat: 55, activistes: 58 }, startTax: 'mid', drift: { veins: -0.9, mercat: -0.7, activistes: -1.1 } },
    { level: 2, quota: 4,  startMoney: 400, startFactions: { veins: 65, mercat: 55, activistes: 58 }, startTax: 'mid', drift: { veins: -0.9, mercat: -0.7, activistes: -1.1 } },
    { level: 3, quota: 6,  startMoney: 400, startFactions: { veins: 65, mercat: 55, activistes: 58 }, startTax: 'mid', drift: { veins: -0.9, mercat: -0.7, activistes: -1.1 } },
    { level: 4, quota: 8,  startMoney: 400, startFactions: { veins: 65, mercat: 55, activistes: 58 }, startTax: 'mid', drift: { veins: -0.9, mercat: -0.7, activistes: -1.1 } },
    { level: 5, quota: 10, startMoney: 400, startFactions: { veins: 65, mercat: 55, activistes: 58 }, startTax: 'mid', drift: { veins: -0.9, mercat: -0.7, activistes: -1.1 } },
  ],
  technoburg: [
    { level: 1, quota: 2,  startMoney: 550, startFactions: { veins: 50, mercat: 68, activistes: 54 }, startTax: 'mid', drift: { veins: -1.3, mercat: -1.1, activistes: -1.4 } },
    { level: 2, quota: 4,  startMoney: 550, startFactions: { veins: 50, mercat: 68, activistes: 54 }, startTax: 'mid', drift: { veins: -1.3, mercat: -1.1, activistes: -1.4 } },
    { level: 3, quota: 6,  startMoney: 550, startFactions: { veins: 50, mercat: 68, activistes: 54 }, startTax: 'mid', drift: { veins: -1.3, mercat: -1.1, activistes: -1.4 } },
    { level: 4, quota: 8,  startMoney: 550, startFactions: { veins: 50, mercat: 68, activistes: 54 }, startTax: 'mid', drift: { veins: -1.3, mercat: -1.1, activistes: -1.4 } },
    { level: 5, quota: 10, startMoney: 550, startFactions: { veins: 50, mercat: 68, activistes: 54 }, startTax: 'mid', drift: { veins: -1.3, mercat: -1.1, activistes: -1.4 } },
  ],
};
