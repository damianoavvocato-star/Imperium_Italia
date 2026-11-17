import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../www/index.html', import.meta.url), 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
const script = html.slice(scriptStart + 8, scriptEnd);

test('la pagina principale è Imperium_Italia', () => {
  assert.match(html, /<title>Imperium_Italia/);
  assert.match(html, /IMPERIUM_ITALIA/);
  assert.doesNotMatch(html, /WAR ITALY|WAR_ITALY/i);
});

test('lo script di gioco è presente e sintatticamente valido', () => {
  assert.ok(scriptStart >= 0 && scriptEnd > scriptStart, 'script di gioco non trovato');
  assert.doesNotThrow(() => new vm.Script(script));
});

test('la campagna include tutte le 20 regioni italiane', () => {
  for (const name of [
    "Valle d'Aosta", 'Piemonte', 'Liguria', 'Lombardia', 'Trentino-Alto Adige',
    'Veneto', 'Friuli-Venezia Giulia', 'Emilia-Romagna', 'Toscana', 'Umbria',
    'Marche', 'Lazio', 'Abruzzo', 'Molise', 'Campania', 'Puglia',
    'Basilicata', 'Calabria', 'Sicilia', 'Sardegna'
  ]) assert.ok(html.includes(name), 'regione mancante: ' + name);
});

test('sono presenti le azioni principali e il salvataggio locale', () => {
  for (const id of ['recruitInfantry', 'recruitArchers', 'recruitCavalry', 'develop', 'claim', 'endTurn', 'save', 'reset', 'map', 'moveDestination', 'moveArmy', 'terrainLabel', 'moraleLabel']) {
    assert.ok(html.includes('id="' + id + '"'), 'controllo mancante: ' + id);
  }
  assert.match(script, /localStorage\.setItem/);
  assert.match(script, /localStorage\.getItem/);
});

test("il movimento degli eserciti è limitato alle province confinanti controllate", () => {
  assert.match(script, /function areAdjacent\(a,b\)/);
  assert.match(script, /function availableDestinations\(from\)/);
  assert.match(script, /to\.owner!=="player"/);
  assert.match(script, /Esercito trasferito da/);
});


test('sono presenti nomina, statistiche e trasferimento del generale con le truppe', () => {
  for (const id of ['generalName', 'generalSkill', 'recruitGeneral']) assert.ok(html.includes('id="' + id + '"'));
  assert.match(script, /r\.general=\{name:generalNames/);
  assert.match(script, /to\.general=from\.general/);
  assert.match(script, /Abilità di comando/);
});

test('il salvataggio usa il nuovo identificativo e migra quello precedente', () => {
  assert.match(script, /imperium_italia_save/);
  assert.match(script, /imperiumItaliaeSave/);
});

test('il sistema di battaglia calcola forza, perdite e conquista', () => {
  for (const id of ['garrisonCount', 'attackDestination', 'attackProvince']) assert.ok(html.includes('id="' + id + '"'));
  assert.match(script, /function unitPower\(units\)/);
  assert.match(script, /function terrainForRegion\(id\)/);
  assert.match(script, /function moraleOf\(region\)/);
  assert.match(script, /function resolveBattle\(from,to\)/);
  assert.match(script, /general=from\.general\?1\+from\.general\.skill\*\.12:1/);
  assert.match(script, /applyCasualties\(attackers,attackerLosses\)/);
  assert.match(script, /to\.owner="player"/);
  assert.match(script, /SCONFITTA davanti a/);
  assert.match(script, /terrainBonus/);
  assert.match(script, /from\.morale=Math\.max/);
});
test('le province confinanti non controllate sono obiettivi di attacco', () => {
  assert.match(script, /function availableAttackTargets\(from\)/);
  assert.match(script, /filter\(id=>state\.regions\[id\]\.owner!=="player"&&/);
});


test('le quattro tattiche modificano la forza o le perdite in base alla composizione', () => {
  assert.ok(html.includes('id="battleTactic"'));
  assert.match(script, /function tacticalModifiers\(tactic,units\)/);
  assert.match(script, /tactic\.power/);
  assert.match(script, /tactic\.loss/);
  assert.match(script, /Carica di cavalleria/);
  assert.match(script, /Pioggia di frecce/);
  assert.match(script, /tacticalModifiers\(b\.tactic,b\.attackers\)\.label/);
});

test('i vecchi salvataggi vengono completati con guarnigioni e unità mancanti', () => {
  assert.match(script, /if\(!r\.garrison\)r\.garrison=/);
  assert.match(script, /r\.units=\{infantry:0,archers:0,cavalry:0/);
  assert.match(script, /state\.selected=11/);
});


test('le fazioni rivali hanno territori, identità e forze iniziali', () => {
  assert.ok(html.includes('id="regionFaction"'));
  assert.match(script, /function seedRivals\(list\)/);
  assert.match(script, /faction:"Etruschi"/);
  assert.match(script, /r\.owner==="enemy"/);
});

test('l’intelligenza artificiale recluta, valuta gli attacchi e può conquistare', () => {
  assert.match(script, /function runEnemyAI\(\)/);
  assert.match(script, /r\.gold>=250/);
  assert.match(script, /attackPower<defensePower\*1\.35/);
  assert.match(script, /to\.owner="enemy"/);
  assert.match(script, /runEnemyAI\(\);render\(\);save\(false\)/);
});

test('gli attacchi del giocatore contro fazioni nemiche affrontano il loro esercito', () => {
  assert.match(script, /to\.owner==="enemy"\?to\.units/);
  assert.match(script, /to\.faction="Roma"/);
});


test('la diplomazia consente tregue temporanee e blocca attacchi e incursioni AI', () => {
  assert.ok(html.includes('id="offerTruce"'));
  assert.ok(html.includes('id="diplomacyStatus"'));
  assert.match(script, /function isTruceActive\(faction\)/);
  assert.match(script, /state\.diplomacy\[target\.faction\]=state\.turn\+3/);
  assert.match(script, /to\.owner==="enemy"&&isPeacefulWithFaction\(to\.faction\)/);
  assert.match(script, /r\.owner==="player"&&!isPeacefulWithFaction\(from\.faction\)/);
  assert.match(script, /state\.diplomacy=state\.diplomacy\|\|\{\}/);
});

test('le alleanze diplomatiche sono temporanee e impediscono gli attacchi reciproci', () => {
  assert.ok(html.includes('id="offerAlliance"'));
  assert.match(script, /function isAllianceActive\(faction\)/);
  assert.match(script, /function isPeacefulWithFaction\(faction\)/);
  assert.match(script, /state\.alliances\[target\.faction\]=state\.turn\+4/);
  assert.match(script, /filter\(r=>r\.owner==="player"&&!isPeacefulWithFaction\(from\.faction\)\)/);
  assert.match(script, /state\.alliances=state\.alliances\|\|\{\}/);
});
test('le fazioni nemiche possono espandersi conquistando province neutrali', () => {
  assert.match(script, /filter\(r=>r\.owner==="neutral"\)/);
  assert.match(script, /unitCount\(from\.units\)<4/);
  assert.match(script, /espande il proprio dominio conquistando/);
});

test('le armate rivali si riposizionano tra province alleate verso il fronte romano', () => {
  assert.match(script, /const distanceToRome=origin=>/);
  assert.match(script, /distanceToRome\(r\.id\)<currentDistance/);
  assert.match(script, /sposta .*unità da/);
  assert.match(script, /from\.units\[type\]-=count/);
});

test('le fazioni inviano rinforzi dalle retrovie alle province di confine minacciate', () => {
  assert.match(script, /const borderThreats=enemyRegions\.filter/);
  assert.match(script, /unitPower\(front\.units\)>=threat\*1\.1/);
  assert.match(script, /invia .*rinforzi da .* a .* per difendere il confine/);
  assert.match(script, /Math\.floor\(unitCount\(donor\.units\)\/2\)/);
});

test("terreno, morale e ritirata strategica sono integrati e compatibili con i salvataggi", () => {
  assert.ok(html.includes('id="terrainLabel"'));
  assert.ok(html.includes('id="moraleLabel"'));
  assert.match(script, /function terrainFor\(region\)/);
  assert.match(script, /function moraleFactor\(region\)/);
  assert.match(script, /b\.attackMorale<=8/);
  assert.match(script, /r\.morale=Math\.min\(100,\(r\.morale\?\?75\)\+2\)/);
  assert.match(script, /if\(!Number\.isFinite\(r\.morale\)\)/);
});

test('gli assedi si salvano, avanzano a ogni turno e indeboliscono le difese', () => {
  assert.ok(html.includes('id="startSiege"'));
  assert.match(script, /state\.sieges\[to\.id\]=\{originId:from\.id,turns:0\}/);
  assert.match(script, /siege\.turns\+\+/);
  assert.match(script, /Math\.min\(\.45,b\.siegeTurns\*\.15\)/);
  assert.match(script, /state\.sieges=state\.sieges\|\|\{\}/);
});


test('le battaglie si svolgono in un campo tattico a tre round con ordini del giocatore', () => {
  for (const id of ['battleOverlay','battleAttackers','battleDefenders','battleRound','orderAdvance','orderVolley','orderCharge','orderHold','orderRetreat']) assert.ok(html.includes('id="' + id + '"'));
  assert.match(script, /function issueBattleOrder\(order\)/);
  assert.match(script, /function renderBattle\(\)/);
  assert.match(script, /state\.battle=\{/);
  assert.match(script, /b\.round>3/);
  assert.match(script, /finishBattle\(false,true\)/);
  assert.match(script, /state\.battle=state\.battle\|\|null/);
});

test('le battaglie applicano bonus del terreno e modificatori di morale', () => {
  assert.match(script, /function terrainFor\(region\)/);
  assert.match(script, /terrainDefenseBonus\(to\)/);
  assert.match(script, /terrainAttackBonus\(to,attackers\)/);
  assert.match(script, /moraleFactor\(\{morale:b\.attackMorale\}\)/);
  assert.match(script, /r\.morale=Math\.min\(100,\(r\.morale\?\?75\)\+2\)/);
  assert.ok(html.includes('id="terrainLabel"'));
  assert.ok(html.includes('id="moraleLabel"'));
});

test('le battaglie avanzate gestiscono ritirata e conservazione dei superstiti', () => {
  assert.match(script, /order==="retreat"/);
  assert.match(script, /ripiegano verso/);
  assert.match(script, /finishBattle\(false,true\)/);
  assert.match(script, /from\.units=\{\.\.\.b\.attackers\}/);
});


test('il campo tattico mostra reparti su griglia e consente il movimento controllato', () => {
  assert.ok(html.includes('id="tacticalMap"'));
  assert.match(script, /function drawTacticalMap\(\)/);
  assert.match(script, /function moveTacticalUnit\(x,y\)/);
  assert.match(script, /b\.positions=\{/);
  assert.match(script, /Math\.abs\(p\.x-x\)\+Math\.abs\(p\.y-y\)>2/);
  assert.match(script, /b\.selectedUnit=null/);
});


test('le battaglie salvate prima della griglia ricevono posizioni tattiche predefinite', () => {
  assert.match(script, /if\(!b\.positions\)b\.positions=\{/);
});


test('il movimento tattico rispetta percorso, ostacoli e velocità differenziata', () => {
  assert.match(script, /function tacticalCellBlocked\(x,y,b\)/);
  assert.match(script, /function tacticalReachable\(b,type\)/);
  assert.match(script, /type===\"cavalry\"\?3:2/);
  assert.match(script, /reachable\.has\(x\+","\+y\)/);
});

test('la posizione dei reparti influenza gli ordini di carica, tiro e avanzata', () => {
  assert.match(script, /function tacticalPositionFactor\(b,order\)/);
  assert.match(script, /const positionFactor=tacticalPositionFactor\(b,order\)/);
  assert.match(script, /\*cmd\.attack\*positionFactor/);
  assert.match(script, /vantaggio di posizione/);
});
