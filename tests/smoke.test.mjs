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
  for (const id of ['recruitInfantry', 'recruitArchers', 'recruitCavalry', 'develop', 'claim', 'endTurn', 'save', 'reset', 'map', 'moveDestination', 'moveArmy']) {
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
  assert.match(script, /function resolveBattle\(from,to\)/);
  assert.match(script, /const generalBonus=from\.general\?1\+from\.general\.skill\*\.12:1/);
  assert.match(script, /applyCasualties\(attackers,attackerLosses\)/);
  assert.match(script, /to\.owner="player"/);
  assert.match(script, /SCONFITTA davanti a/);
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
  assert.match(script, /tactic\.label/);
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
