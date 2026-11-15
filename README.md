# Imperium_Italia

**Gioco strategico per browser e Android**

Imperium_Italia è un progetto indipendente di strategia ambientato in Italia. Questo repository è dedicato esclusivamente a Imperium_Italia.

## Funzionalità attuali
- Campagna a turni con tutte le 20 regioni italiane.
- Tesorerie regionali, entrate e sviluppo economico.
- Reclutamento di fanteria, arcieri e cavalleria.
- Acquisizione di territori neutrali.
- Salvataggio locale della campagna e interfaccia responsive per smartphone e desktop.

## Tecnologia
- HTML, CSS e JavaScript.
- Capacitor 6.2.0 per Android.
- GitHub Actions per test, anteprima web e compilazione APK.

## Anteprima web
https://damianoavvocato-star.github.io/Imperium_Italia/

## APK Android
Apri la scheda Actions del repository e seleziona il workflow **Imperium_Italia Android APK**. Al termine, scarica l'artifact **IMPERIUM-ITALIAE-debug-APK**.

## Avvio locale
Apri `www/index.html` in un browser moderno. La pagina `www/imperium.html` contiene la stessa esperienza di gioco sorgente.

## Test
Esegui `npm test` per i controlli automatici di base sul gioco.

## Salvataggi
La campagna viene conservata nella memoria locale del browser/dispositivo. Cancellare i dati del browser o dell'app può eliminare i salvataggi.
