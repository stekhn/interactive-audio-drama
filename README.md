# Interaktives Hörspiel

Vorlage für ein interaktives Hörspiel, welche im im Rahmen des Seminars [„Web-Entwicklung für Journalisten“](https://github.com/stekhn/programming-workshop) von M94.5 entstanden ist. [M94.5](https://www.m945.de/) ist ein Angebot der [Mediaschool Bayern](https://www.mediaschool.bayern/).

**Demo**: <https://stekhn.github.io/interactive-audio-drama/>

## Verwendung

1. Vorlage herunterladen und entpacken: <https://github.com/stekhn/interactive-audio-drama/archive/main.zip>
2. Notwendige Audio-Dateien und gegebenfalls Bilder in die entsprechenden Ordner `mp3` und `img` kopieren
3. Startseite in `index.html` und Storyline in `story.json` anpassen
4. Projektordner auf einen Web-Server hochladen

## Storyline editieren

Die Storyline beschreibt wie die einzelnen Kapitel einer interaktiven Geschichte zusammenhängen und wird in der Datei `story.json` beschrieben.

Hier ein Beispiel für ein einzelnes Kapitel:

```json
{
  "id": "chapter-1",
  "title": "Chapter 1",
  "text": "Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.",
  "audio": "./mp3/chapter-1.mp3",
  "options": [
    {
      "link": "chapter-2",
      "description": "Go to chapter 2"
    },
    {
      "link": "end",
      "description": "Go to final chapter"
    }
  ]
}
```

Die `id` ist der eindeutige Namen eines Kapitels. Die `id` muss jeweils einmalig sein und sollte keine Sonder- oder Leerzeichen enthalten. Typische Namen wären zum Beispiel `intro`, `chapter-1` oder `final-chapter`. Hauptsache man kennt sich selbst als Autor der Geschichte noch aus.

Der `titel` ist die jeweilige Überschrift eines Kapitels. Der `text` ist der Text darunter. Den Speicherort der zugehörigen Audio-Datei im MP3-Format wird ausgehend vom Hauptverzeichnis `./` im Feld `audio` angegeben.

Die `options` beschreiben die Auswahlmöglichkeiten die der Benutzer hat, um in der Geschichte weiterzukommen. Das Feld `link` gibt an, welche `id` das jeweils weiterführende Kapitel hat. Hier sollte auf jeden Fall sichergestellt werden, dass diese Kapitel auch existiert. Die `description` ist der Beschreibungstext der auf dem Auswahlknopf steht.

`options` müssen immer als Objekt-Array mit mindestens einem Objekt `[{}]` angegeben werden. Wie viele Auswahlmöglichkeiten dem Benutzer jeweils zur Verfügung stehen, ist dem Autoren überlassen. Vermutlich wäre es aber sinnvoll, die Auswahl auf zwei bis vier Optionen zu beschränken.

## Verbessungsvorschläge

- Überprüfen, ob die `id`s der weiterführenden Kapitel, welche mit `link` angegeben werden, auch existieren.
- „Echte“ Audio-Visualisierung einbauen

## Andere Beispiele

- Bayerischer Rundfunk: [Tag X](https://web.br.de/tag-x/)
- HdM Stuttgart: [(V)erdacht](http://www.v-erdacht.de/)
