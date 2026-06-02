# Era Design State — Prehistòria (Paleolític)

## Metadades
- **Era ID**: `era_prehistoria`
- **Nom Display**: Paleolític
- **Període Històric**: Paleolític Superior, 50.000–10.000 AEC
- **Era precedent**: cap (primera era)
- **ERA_CYCLES**: 100 (tota l'era, multi-generació)
- **LIFE_EXPECTANCY per personatge**: 20 cicles → ~5 generacions per era
- **Creat**: 2026-06-02
- **Actualitzat**: 2026-06-02

## Progrés de Fases

- [x] **Fase 1: Tecnologies** → `design/eras/prehistoria/01-technologies.md` ✅ IMPORTAT (7 techs)
- [x] **Fase 2: Branques** → `design/eras/prehistoria/02-branches.md` ✅ IMPORTAT (4 branques)
- [x] **Fase 3: Habilitats** → `design/eras/prehistoria/03-skills.md` ✅ IMPORTAT (13 habilitats)
- [ ] **Fase 4: Accions** → `design/eras/prehistoria/04-actions.md` ⏳ PENDENT (importació + nous)
- [x] **Fase 5: Balanç** → `design/eras/prehistoria/05-balance.md` ✅ APROVAT (9 ajustos aplicats)
- [x] **Fase 6: Documentació** → `design/eras/prehistoria/state.md` ✅ CHECKPOINT (2026-06-02)
- [x] **Fase 7: Events** → `design/eras/prehistoria/07-events.md` ✅ COMPLET (tots 5 pools, 50 events total)

## Decisions Clau

- **Nombre de tecnologies**: 7 (ERA_CYCLES 10, 22, 36, 50, 65, 80, 92)
- **Branques**: Caçador, Recol·lector, Artesà, Místic
- **Habilitats totals**: 13 (5 compartides entre branques) + 7 passive effects nous
- **Accions totals**: 7 base + 4 familia/descoberta + 25 branca + 5 upgrades = ~41
- **Accions noves (2026-06-02)**: act_revisar_trampes, act_preparar_ungüent, act_preparar_terreny, act_negociar_pastures
- **Destreses**: 5 (sistema redissenyat 2026-06-01: condicions d'inclinació, no recompte)
- **Connector de sortida**: `ut_agricultura` (cicle 92) → Era 2 (Neolític)
- **Pools d'events pendents**: pool_caca, pool_ritual, pool_artesania, pool_recollecta, pool_social

## Divergències GDD ↔ Implementació

El fitxer `design/gdd/life-tycoon-2/content-plan-era1.md` és un disseny
anterior que usa LIFE_EXPECTANCY com a escala de cicle (2, 4, 6, 9, 12).
La implementació actual usa ERA_CYCLES (10, 22, 36, 50, 65, 80, 92).
**Font de veritat**: `prototypes/life-tycoon-2/data.js`

## Pendents Identificats

- [ ] **Balanç post-destresa**: el sistema de destreses va ser redesenyat (2026-06-01).
  Cal verificar que totes les branques estan equilibrades amb el nou sistema.
- [ ] **Events**: els pools d'events existents necessiten contingut. Quins pools i quants
  events per pool estan definits? (Fase 7)
- [ ] **Efectes passius**: alguns branch techs de data.js no tenen `passive_effect`.
  Verificar si és intencional o pendent de disseny.
- [ ] **Indicador "Llegat dinàstic"**: branques de Gen 2+ (ut_ceramica, ut_agricultura)
  necessiten comunicació al jugador.
- [ ] **Contingut nou** (si s'escau): identificar si falten accions base, habilitats o
  zones no cobertes.

## Notes

- Els branch techs `bt_guariment_plantes` i `bt_calendari_natural` tenien `is_hidden: true`
  però es va decidir canviar a `false` (2026-06-01, S2-09). Ara es descobreixen per
  inclinació normal com els altres.
- `bt_calendari_natural` requereix `intel·lecte MAX 0.05` (rara combinació: Recol·lector
  molt intuïtiu, no analític). Es un híbrid Recol·lector/Místic deliberat.
