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
  assert.match(script, /filter\(id=>state\.regions\[id\]\.owner!=="player"\)/);
});
