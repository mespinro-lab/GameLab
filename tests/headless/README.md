# Tests headless — Bloodline (prototip JS)

Harness de regressió per al prototip `prototypes/bloodline-v2/`. Carrega el joc real a
Chromium (Playwright), arrenca un servidor estàtic intern i comprova invariants i fixos.

## Executar
```
npm run test:headless
```
(o `node tests/headless/run.cjs`). Surt amb codi ≠ 0 si algun check falla → apte per a CI.

## Què cobreix (run.cjs)
- **START-01** — branca inicial determinista (Recol·lector).
- **2a salut** — `healthMax()` retorna el pic en creixement (no clawback de la salut guanyada).
- **EVT-OPT-MAT** — les opcions d'event apliquen `material_delta`.
- **FOOD-CAP-01** — "Assecar Provisions" es deshabilita (FADED) al cap màxim.
- **BAL-01** — `act_coure_ceramica` genera material.
- **LOG-02** — les compres es capturen a l'historial (`_turnExtras`).
- **TEACH-01** — ensenyament per-fill + deshabilitat quan tots els fills han après.
- **SUCC-01** — la successió pendent sobreviu save/load.
- Cap error de pàgina al carregar/executar.

## Notes
- Els checks criden funcions internes (globals del script) via `page.evaluate` per ser
  deterministes i ràpids (sense esperar animacions de donut).
- En afegir un fix nou, afegeix-hi un `check(...)` aquí.
- Requereix les devDependencies `playwright` i `serve` (ja al `package.json`).
