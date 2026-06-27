# Bloodline — Pla de proves manual

> **Generat 2026-06-27** (sessió autònoma). Target: prototip JS `prototypes/bloodline-v2/`.
> URL: https://mespinro-lab.github.io/GameLab/ (targeta Bloodline) o `.../prototypes/bloodline-v2/`.
> Checklist per a tu: marca ✅/❌ i anota el que falli. Prioritza els blocs marcats **[FIX RECENT]**.

## Com provar
1. Obre la URL. Menú → **✦ Nova partida** → *Comença*.
2. Per a re-tests nets, sempre **Nova partida** (esborra el desat).
3. L'historial s'obre tocant la **barra de log** inferior (📋 Historial de torns).

---

## 1. Arrencada i branca inicial
- [ ] Nova partida → la branca activa és **Recol·lector** des del torn 1 (determinista, mai aleatòria). **[FIX]**
- [ ] Els quatre eixos d'inclinació parteixen del centre (sociabilitat lleugerament +).
- [ ] El carrusel mostra accions base a Campament/Planes.

## 2. Seqüència de torn i salut **[FIX RECENT]**
- [ ] Fer **Contemplació**: el +salut (floater + comptador) apareix en acabar el donut **d'ACCIÓ**, no al donut 🌙.
- [ ] La salut guanyada (acció o event) **no es retalla** al fi de torn en els primers torns (no cau de cop). **[FIX 2a]**
- [ ] Si fas només accions sense menjar, el menjar baixa i a 0 perds salut (−10/torn): és **gana intencionada**, no bug.
- [ ] Un event que cura (p.ex. ritual +3❤️) suma de veritat (la salut puja i s'hi queda).

## 3. Events **[FIX RECENT]**
- [ ] Cada event mostra el seu **impacte numèric** (p.ex. `+3🌾`, `−3❤️`) — a la targeta i/o per opció. **[EVT-01]**
- [ ] Un event amb opcions **no** mostra cap impacte fantasma d'un event anterior. **[EVT-01]**
- [ ] Una opció amb cost/guany de **material** (p.ex. arbust espinós, fissura de pedra) **aplica el material**. **[EVT-OPT-MAT]**
- [ ] El resultat d'un event surt després del resultat de l'acció, com a beat separat.

## 4. Historial de torns (log) **[FIX RECENT]**
- [ ] L'historial desa, com a **files separades** del mateix cicle: **acció**+delta, **event**+opció+delta. **[LOG-01]**
- [ ] Quan es descobreix el **foc** (cicle 10), surt al log com a descobriment. **[LOG-01]**
- [ ] Quan es desbloqueja una **habilitat** (tècnica), surt al log. **[LOG-01]**
- [ ] En **ensenyar un fill**, surt una fila d'**ensenyament** (📖 aprenentatge → fill). **[TEACH-01]**
- [ ] *(Pendent LOG-02)*: encara NO surten aprenentatge descobert, acció comprada ni upgrade.

## 5. Branques, inclinació i habilitats
- [ ] Executar accions mou la inclinació; en superar ~34% d'un eix, la branca corresponent s'activa.
- [ ] Les accions fora de rang d'inclinació es veuen atenuades (fade) o desapareixen.
- [ ] **Habilitats de branca**: es desbloquegen executant **"Escoltar els Estrangers"** (Campament), que només
      apareix quan hi ha habilitats elegibles. *(Flux poc clar — pendent de millora UX/DESIGN-02.)*
- [ ] En desbloquejar una habilitat, les seves accions es fan **comprables al mercat**.

## 6. Eines (cadena lliure)
- [ ] Comprar l'eina d'una branca; en virar de branca, l'eina nova substitueix l'anterior (1 sola activa).
- [ ] *(DESIGN-02, pendent d'implementar)*: cadena lliure + retorn gratuït a una eina ja coneguda.

## 7. Economia (material i menjar)
- [ ] Totes les accions generen material (🔵); `act_coure_ceramica` ara també (abans 0). **[BAL-01]**
- [ ] **Assecar Provisions** amplia el magatzem; quan arriba al màxim (o esgota usos), surt **deshabilitada**. **[FOOD-CAP-01]**
- [ ] El menjar és escàs als primers torns (tensió real); Assecar Provisions allarga la viabilitat.

## 8. Successió i herència **[FIX RECENT]**
- [ ] Cercar parella (Campament) → tenir fill (Llar).
- [ ] **Ensenyar el Fill** (Llar): ensenya 1 aprenentatge a l'atzar a un fill que encara no n'hagi après. **[TEACH-01]**
- [ ] Després d'ensenyar, apareix una **card** "Has ensenyat [X] a [fill]". **[TEACH-01]**
- [ ] Amb 2 fills: pots ensenyar a cada un (un cop); quan tots han après, l'acció surt **deshabilitada**. **[TEACH-01]**
- [ ] En morir, cada fill-successor **hereta el seu** aprenentatge ensenyat (no un de compartit). **[TEACH-01]**
- [ ] L'hereu hereta inclinació (85%), habilitats (100%), accions comprades (100%), part de stats/material.
- [ ] Un aprenentatge heretat es pot **tornar a ensenyar** als néts (cadena gen→gen).
- [ ] ⚠️ **Edge conegut (SUCC-01, pendent)**: si tanques l'app a la pantalla de mort/successió, es pot perdre.

## 9. Final de partida i scoring
- [ ] En completar l'era (cicle 100) o extingir-se el llinatge, surt la pantalla de scoring.
- [ ] El scoring mostra generacions, habilitats, aprenentatges i títol de dinastia.

---

## Resum de fixos a verificar aquesta tongada (commits del 2026-06-27)
| Fix | Commit | Què mirar |
|-----|--------|-----------|
| 2a salut (no clawback complet) | 0b11672 | §2: la salut guanyada per events/heals es manté |
| EVT-OPT-MAT | 89b43d5 | §3: material en opcions d'event |
| FOOD-CAP-01 | 0fa134c | §7: Assecar Provisions deshabilitada al màxim |
| BAL-01 | 0fa134c | §7: coure_ceramica genera material |
| TEACH-01 | ded9b8b | §8: ensenyament per-fill + card + log |

**Pendents (no a Pages encara)**: SUCC-01, LOG-02 (compra/upgrade/apr-descobert), DESIGN-02-IMPL (contingut),
TEST-HARNESS, DOCS-SYNC. Vegeu `production/backlog.md` i `production/next-steps.md`.
