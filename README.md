# WAR ITALY · 2035

**Strategia · Diplomazia · Guerra · Futuro**

WAR ITALY è un gioco strategico per browser e Android ambientato in un'Italia alternativa del 2035.

## Funzionalità attuali
- Quattro fazioni giocabili con bonus e punti di partenza differenti.
- Mappa strategica con 12 macro-regioni italiane.
- Economia, risorse, sviluppo regionale e infrastrutture.
- Reclutamento, riparazione unità, combattimento e rapporti di battaglia.
- Sei tecnologie, missioni progressive ed eventi strategici.
- Diplomazia, trattati, intelligence e fazioni rivali con IA.
- Salvataggi locali con più slot e ripresa della campagna.
- Interfaccia mobile con menu di comando compatto, impostazioni di accessibilità e guida integrata.

## Tecnologia
- HTML, CSS e JavaScript
- Capacitor 6.2.0
- Android
- GitHub Actions per anteprima web e compilazione APK

## Anteprima web
https://damianoavvocato-star.github.io/War_Italy/

## Generare e scaricare l'APK
Ogni push su `main` avvia il workflow Android. Al termine della compilazione, apri la run GitHub Actions e scarica l'artifact **WAR-ITALY-debug-APK**.

Workflow: https://github.com/damianoavvocato-star/War_Italy/actions

## Nota sui salvataggi
I salvataggi sono conservati nella memoria locale del browser/dispositivo. Per non perderli, usa gli slot di salvataggio e non cancellare i dati dell'app.


## Imperium Italiae · campagna strategica

È stata aggiunta una seconda esperienza di gioco indipendente all'interno dello stesso repository:
- Pagina web: `www/imperium.html`
- Mappa strategica schematica con tutte le 20 regioni italiane.
- Turni, entrate regionali e tesorerie separate per territorio.
- Reclutamento regionale di fanteria, arcieri e cavalleria.
- Sviluppo economico delle province e acquisizione dei territori neutrali.
- Salvataggio locale della campagna.
- Interfaccia responsive per smartphone e desktop.

### Anteprima web
Dopo il completamento della pubblicazione GitHub Pages, la pagina è disponibile all'indirizzo:
https://damianoavvocato-star.github.io/War_Italy/imperium.html

### APK dedicato
Il workflow `Imperium Italiae Android APK` compila questa esperienza come app Android separata, con identificativo `com.imperiumitaliae.game`. Avvia una build da Actions oppure attendi il completamento automatico dopo un push che modifica `www/imperium.html`. L'artifact si chiama `IMPERIUM-ITALIAE-debug-APK`.

La versione WAR ITALY esistente e il suo workflow APK restano separati e non vengono sostituiti.
