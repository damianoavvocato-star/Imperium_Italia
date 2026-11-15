import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../www/index.html', import.meta.url), 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
const script = html.slice(scriptStart + 8, scriptEnd);

test('la pagina principale è Imperium Italiae', () => {
  assert.match(html, /<title>Imperium Italiae/);
  assert.match(html, /IMPERIUM ITALIAE/);
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
  for (const id of ['recruitInfantry', 'recruitArchers', 'recruitCavalry', 'develop', 'claim', 'endTurn', 'save', 'reset', 'map']) {
    assert.ok(html.includes('id="' + id + '"'), 'controllo mancante: ' + id);
  }
  assert.match(script, /localStorage\.setItem/);
  assert.match(script, /localStorage\.getItem/);
});
