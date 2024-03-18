import hljs from "highlight.js";
import { LitElement, PropertyValueMap, html } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { customElement } from "lit/decorators.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";
import { BaseElement } from "../app.js";
import { logoIcon } from "../utils/icons.js";

@customElement("page-footer")
export class PageFooter extends BaseElement {
    render() {
        return html`<div class="flex flex-col text-xs text-center text-fg-muted pb-4 px-4 mt-8">
            <span>Mit Spucke und Tixo gebaut von <a href="https://twitter.com/badlogicgames" class="text-blue-400">Mario Zechner</a></span>
            <span>Logo von <a href="https://twitter.com/RaffiReithofer" class="text-blue-400">Raffael Reithofer</a></span>
            <span>Es werden keine Daten gesammelt, nicht einmal deine IP Adresse</span>
        </div>`;
    }
}

@customElement("main-page")
export class MainPage extends LitElement {
    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
    }

    render() {
        const code = (code: string) => {
            return unsafeHTML(hljs.highlight(code.trim(), { language: "json" }).value);
        };

        return html`<div class="${pageContainerStyle} min-h-[100vh]">
            <div class="${pageContentStyle} h-[100vh]">
                <div class="flex-grow flex flex-col w-full mt-4 gap-4 px-4">
                    <theme-toggle class="self-end"></theme-toggle>
                    <div class="flex gap-4 items-center justify-center text-4xl">
                        <i class="icon">${logoIcon}</i>
                        <div class="text-center">
                            Wos wor mei <br />
                            Leistung?
                        </div>
                    </div>
                    <p class="text-center italic text-sm">
                        Ein Datenprojekt basierend auf den stenographischen Protokollen aller Sitzungen des Österreichischen Parlaments ab dem
                        20.12.2002
                    </p>
                    <p class="text-center text-xs italic">
                        Ja, das Meischberger Zitat lautet "Wo wor mei Leistung". Hier wollen wir aber wissen "wos" die Leistung war.
                    </p>
                    <h1>Recherche Tools</h1>
                    <div>
                        Hier entstehen verschiedene Recherche bzw. Analyse Tools, basierend auf den unten beschrieben Daten. Einfach auf das
                        entsprechende Kasterl klicken :D
                    </div>
                    <div class="flex flex-col self-center items-center justify-center flex-wrap gap-4">
                        <a class="flex flex-col sm:flex-row gap-2 border hover:border-primary rounded-md text-center shadow-lg" href="/persons">
                            <div class="flex flex-col">
                                <img src="/img/persons.jpeg" class="object-fit" />
                            </div>
                            <div class="flex flex-col p-4">
                                <span class="text-lg font-bold">Personen Recherche</span>
                                <p>Personen suchen und deren Zwischenrufe, Abwesenheiten, Taferln und Redebeiträge analysieren.</p>
                                <span class="text-xs mt-auto">Foto: APA</span>
                            </div>
                        </a>
                    </div>
                    <h1>Daten</h1>
                    <p>
                        Im Rahmen des Projekts werden die
                        <a class="text-blue-400" href="https://www.parlament.gv.at/recherchieren/open-data/daten-und-lizenz/index.html"
                            >Rohdaten der Open Data Schnittstelle</a
                        >
                        des Parlaments verarbeitet, normiert, und in ein einfach(er) zu verarbeitendes Datenformat, inklusive Konvertierung auf UTF-8,
                        übergeführt. Der Fokus liegt hierbei auf Daten zu im Parlament vertretenen Personen sowie den stenographischen Protokollen der
                        Nationalratssitzungen ab dem 20.12.2002.
                    </p>

                    <p>Die Daten sollen für wissenschaftliche Arbeiten sowie Daten-Journalismus zugänglicher gemacht werden.</p>
                    <h2>Lizenz</h2>
                    <p>
                        Die originalen Datensätze unterliegen der
                        <a class="text-blue-400" href="https://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0 Lizenz</a>. Die hier zur
                        Verfügung gestellten transformierten Daten unterliegen ebenfalls der CC BY 4.0 Lizenz.
                    </p>
                    <h2>Personen Daten</h2>
                    <p>
                        Der Personen-Datensatz ist im JSON-Format unter folgendem Link verfügbar:
                        <a class="text-blue-400" href="/data/persons.json">persons.json (192KB)</a>
                    </p>
                    <p>
                        Der Datensatz beinhaltet Informationen zu allen Personen, die ab dem 20.12.2002 im Parlament zumindest eine Wortmeldung
                        getätigt haben (entweder am Podium oder per Zuruf).
                    </p>

                    <p>Die JSON-Datei hat folgende Struktur:</p>
                    <pre><code>
${code(`
[
  {
    "id": "3612",
    "name": "Sonja Ablinger",
    "givenName": "Sonja",
    "familyName": "Ablinger",
    "titles": [],
    "parties": [
      "SPÖ"
    ],
    "periods": [
      "XX",
      "XXIII",
      "XXIV"
    ],
    "url": "https://parlament.gv.at/person/3612",
    "imageUrl": "https://parlament.gv.at/dokument/bild/34898/3489874_384.jpg"
  },
  {
    "id": "14854",
    "name": "Dipl.-Ing. Elke Achleitner",
    "givenName": "Elke",
    "familyName": "Achleitner",
    "titles": ["Dipl.-Ing."],
    "parties": [
      "BZÖ",
      "FPÖ"
    ],
    "periods": [
      "XXII"
    ],
    "url": "https://parlament.gv.at/person/14854",
    "imageUrl": "https://parlament.gv.at/dokument/bild/21013/2101309_384.jpg"
  },
  ... weitere Personen ...
]
`)}
                    </code></pre>
                    <p>Jeder Eintrag hat dabei folgende Felder:</p>
                    <ul class="px-4">
                        <li><b>id</b>: die Parlaments-ID der Person.</li>
                        <li>
                            <b>name</b>: Der Name der Person, inklusive Titel. Titel sind sowohl vor als auch nach dem Namen (getrennt durch ein
                            Komma) möglich, z.B. <code>Mag. Hannes Amesbauer, BA</code>.
                        </li>
                        <li><b>givenName</b>: Der Vorname der Person.</li>
                        <li><b>familyName</b>: Der Nachname der Person.</li>
                        <li><b>titles</b>: Die akademischen Title der Person oder eine leere Liste.</li>
                        <li>
                            <b>parties</b>: Parteizugehörigkeit, so in den Parlamentsdaten eruierbar. Bei mehreren Einträgen gibt die Reihenfolge der
                            Liste nicht die chronologische Reihenfolge wieder! Mögliche Werte: <code>ÖVP</code>, <code>SPÖ</code>, <code>FPÖ</code>,
                            <code>GRÜNE</code>, <code>NEOS</code>, <code>BZÖ</code>, <code>STRONACH</code>, <code>PILZ</code> (Liste Pilz/JETZT),
                            <code>Ohne Klub</code>. Bei Personen, die ohne Parteizugehörigkeit und vorheriges Nationalratsmandat zu
                            Regierungsmitgliedern ernannt wurden, ist diese Liste leer. Das ist z.B. bei den Regierungsmitgliedern der
                            <a class="text-blue-400" href="https://de.wikipedia.org/wiki/Bundesregierung_Bierlein">Bundesregierung Bierlein</a> der
                            Fall, oder auch bei parteilosen Minister:innen, die von einer Partei nominiert wurden, wie z.B. Mag. Dr. Martin Kocher.
                        </li>
                        <li>
                            <b>periods</b>: Legislaturperioden während derer die Person Abgeordnete(r) im Parlament war. Bei Personen ohne Mandat ist
                            diese Liste leer. Nähere Informationen zu den Legislaturperioden finden sich auf
                            <a class="text-blue-400" href="https://de.wikipedia.org/wiki/Nationalrat_(%C3%96sterreich)#Gesetzgebungsperioden"
                                >Wikipedia</a
                            >. Stenographische Protokolle sind in diesem Datensatz ab Periode XXII verfügbar.
                        </li>
                        <li>
                            <b>url</b>: die URL zum Personeintrag auf der Parlamentsseite. Diese URL kann auch über die ID der Person rekonstruiert
                            werden, z.B. <code>3612</code> -> <code>https://parlament.gv.at/person/3612</code>
                        </li>
                        <li>
                            <b>imageUrl</b>: optional, die URL zum Bild der Person auf der Parlamentsseite. So kein Bild vorhanden ist, fehlt dieses
                            Feld.
                        </li>
                    </ul>

                    <h2>Sitzungs Daten</h2>
                    <p class="italic text-sm">
                        <span class="font-semibold">ACHTUNG</span>: Protokolle für Sitzungen ab dem 24.5.2023 sind in diesem Datensatz noch nicht
                        enthalten, da es sich um vorläufige Protokolle handelt. Mehr Informationen in diesem
                        <a class="text-blue-400" href="https://twitter.com/OeParl/status/1757021460227313695">Tweet</a> des Österreichischen
                        Parlaments.
                    </p>
                    <p>Der Sitzungs-Datensatz ist im JSON-Format unter folgendem Link verfügbar:</p>
                    <a class="text-blue-400" href="/data/sessions.json">sessions.json (440MB)</a>
                    <p>Der Datensatz beinhaltet alle stenographischen Protokolle aller Nationalratssitzungen seit dem 20.12.2002.</p>
                    <p>Die JSON-Datei hat folgende Struktur:</p>

                    <pre><code>
${code(`
[
  {
    "uri": "https://parlament.gv.at/gegenstand/XXVII/NRSITZ/216",
    "period": "XXVII",
    "sessionNumber": 216,
    "sessionLabel": "216. Sitzung (216/NRSITZ)",
    "date": "2023-05-25T00:00:00",
    "protocolUrls": [
        "https://parlament.gv.at/dokument/XXVII/NRSITZ/216/fname_1598900.pdf",
        "https://parlament.gv.at/dokument/XXVII/NRSITZ/216/fnameorig_1598900.html"
    ],
    "sections": [
        ... Sprecher:innen Sektionen ...
    ]
  },
  {
    "url": "https://parlament.gv.at/gegenstand/XXVII/NRSITZ/213",
    "period": "XXVII",
    "sessionNumber": 213,
    "sessionLabel": "213. Sitzung (213/NRSITZ)",
    "date": "2023-05-24T00:00:00",
    "protocolUrls": [],
    "sections": []
  },
  ... weitere Sitzungen ...
]`)}
                    </code></pre>
                    <p>Jeder Eintrag hat dabei folgende Felder:</p>
                    <ul class="px-4">
                        <li><b>url</b>: die URL zur Sitzung auf der Parlamentsseite.</li>
                        <li>
                            <b>period</b>: Die Legislaturperiode in der die Sitzung stattfand. Nähere Informationen zu den Legislaturperioden finden
                            sich auf
                            <a class="text-blue-400" href="https://de.wikipedia.org/wiki/Nationalrat_(%C3%96sterreich)#Gesetzgebungsperioden"
                                >Wikipedia</a
                            >.
                        </li>
                        <li><b>sessionNumber</b>: die Sitzungsnummer, beginnend bei 1 für jede Legislaturperiode.</li>
                        <li><b>sessionLabel</b>: die Bezeichnung der Sitzung.</li>
                        <li><b>date</b>: das Datum der Sitzung im ISO 8601 Format.</li>
                        <li>
                            <b>protocolUrls</b>: die URLs zu den Sitzungsprotokollen auf der Parlamentsseite. Sitzungsprotokolle werden als
                            <code>.html</code> als auch <code>.pdf</code> Dateien angeboten. Für Sitzungen, für die kein stenographisches Protokoll
                            verfügbar ist, ist diese Liste leer.
                        </li>
                        <li>
                            <b>sections</b>: eine chronologische Liste von Sprecher:innen-Sektionen. Siehe unten für Details. Für Sitzungen, für die
                            kein stenographisches Protokoll verfügbar ist, ist diese Liste leer.
                        </li>
                    </ul>

                    <h2>Sprecher:innen Sektionen</h2>
                    <p>
                        Jede Sitzung, für die ein stenographisches Protokoll existiert, hat eine oder mehrere Specher:innen-Sektionen. Diese sind für
                        eine Sitzung in chronologischer Reihenfolge im Feld <code>sections</code> abgelegt.
                    </p>
                    <p>Eine Sprecher:innen-Sektion in der <code>sections</code> Liste hat folgende Struktur:</p>

                    <pre><code>
${code(`
{
  "speaker": "88386",
  "text": "Da die Anträge ordnungsgemäß eingebracht sind, darf ich die Schriftführer ersuchen, die Anträge zu verlesen. Das ist an und für sich ein normaler Vorgang. Ich darf dementsprechend Frau Abgeordnete Steinacker ersuchen, den Antrag 3373/A, und Abgeordneten Zanger, den Antrag 3374/A vom Berichterstatterpult aus zu verlesen.– Bitte. (Abg. Martin Graf: Das war ein Schallmeiner-Schurkenstück! – Abg. Schallmeiner: ... kennt sich der Herr Graf aus, mit den Schurkenstücken! – Unruhe im Saal. – Der Präsident gibt das Glockenzeichen.)",
  "callouts": [
    {
      "caller": "2834",
      "text": "Das war ein Schallmeiner-Schurkenstück!"
    },
    {
      "caller": "5676",
      "text": "... kennt sich der Herr Graf aus, mit den Schurkenstücken!"
    },
    {
      "text": "Unruhe im Saal."
    },
    {
      "text": "Der Präsident gibt das Glockenzeichen."
    }
  ],
  "links": [
    {
      "label": "3373/A",
      "url": "https://parlament.gv.at/PAKT/VHG/XXVII/A/A_03373/index.shtml"
    },
    {
      "label": "3374/A",
      "url": "https://parlament.gv.at/PAKT/VHG/XXVII/A/A_03374/index.shtml"
    }
  ]
}
`)}
                    </code></pre>
                    <p>Eine Sprecher:innen-Sektion hat dabei folgende Felder:</p>
                    <ul class="px-4">
                        <li>
                            <b>speaker</b>: Die Parlaments-ID der Person, die spricht. Mit dieser ID können die Details zur Person im
                            Personen-Datensatz gefunden werden (vgl. oben).
                        </li>
                        <li><b>isPresident</b>: Ob die Person diesen Redebeitrag als Parlamentspräsident:in getätigt hat.</li>
                        <li><b>text</b>: Das Transkript der Rede der Person, inklusive Zwischenrufen und Beschreibungen der Situation im Plenum.</li>
                        <li>
                            <b>callouts</b>: Eine Liste von Zwischenrufen und Situationsbeschreibungen. Bei einem Zwischenruf gibt das Feld
                            <code>caller</code> die Parlaments-ID der Person, die den Zwischenruf getätigt hat, an. Bei Situationsbeschreibungen fehlt
                            dieses Feld. Das Feld <code>text</code> gibt das Transkript des Zwischenrufes oder die Situationsbeschreibung wieder.
                        </li>
                        <li>
                            <b>links</b>: Eine Liste an Links, die im stenographischen Protokoll in dieser Sprecher:innen-Sektion gefunden wurden. Das
                            Feld <code>label</code> gibt den Text des Links wieder, das Feld <code>url</code> den Link selbst.
                        </li>
                    </ul>

                    <h2>Datenerhebung und Qualität</h2>
                    <h3>Personen Datensatz</h3>
                    <p>
                        Als Basis des transformierten Datensatzes dient die
                        <a
                            class="text-blue-400"
                            href="https://www.parlament.gv.at/recherchieren/open-data/daten-und-lizenz/parlamentarierinnen/index.html"
                            >Open Data API des Parlaments für Parlamentarier:innen ab 1918</a
                        >. Über diese API werden die Parlamentarier:innen für die untersuchten Legislaturperioden ab 20.12.2002 extrahiert. Die von
                        der API returnierten Daten beinhalten den Namen der Person, die Legislaturperioden in denen die Person im Plenum teilgenommen
                        hat, sowie rudimentäre und uneinheitlich kodierte Information über die Klubzugehörigkeit der Person. Aus diesen Daten werden
                        die Legislaturperiodeninformation sowie Klubzugehörigkeit verwendet, wobei letzteres normiert wird (vgl. Feld
                        <code>parties</code> im Personen Datensatz oben).
                    </p>
                    <p>
                        In einem zweiten Schritt werden für jede Person die Detaildaten per JSON API abgerufen, z.B.
                        <a class="text-blue-400" href="https://www.parlament.gv.at/person/18140?json=true"
                            >https://www.parlament.gv.at/person/18140?json=true</a
                        >. Aus diesen Daten werden die normierten Namen der Personen verwendet. Weiters wird in diesen Daten nach weiteren Hinweisen
                        zur Parteizugehörigkeit gesucht. So befinden sich in den Biographie-Daten meist Parteinamen, die auf eine Parteizugehörigkeit
                        hinweisen. Auch werden aus diesen Daten die URLs der Bilder für jede Person extrahiert.
                    </p>
                    <p>
                        Der transformierte Datensatz wurde stichprobenartig überprüft, um die Extraktions-Pipeline zu validieren. Es wurden aus den
                        insgesamt 681 Personen des Datensatzes 10% randomisiert ausgewählt und mit den Rohdaten verglichen.
                    </p>
                    <p>
                        Die Zuweisung der Personen-ID an eine Person ist immer korrekt, da die IDs eindeutig in den Rohdaten ausgewiesen sind.
                        Entsprechend sind auch die URLs der Seiten zu Personen auf der Parlamentsseite, sowie die Bild URLs immer korrekt.
                    </p>
                    <p>Die Extraktion des Namens einer Person war in allen geprüften Fällen (68) korrekt.</p>
                    <p>Die Extraktion des Vornames einer Person war in allen geprüften Fällen (68) korrekt.</p>
                    <p>Die Extraktion des Nachnamens einer Person war in allen geprüften Fällen (68) korrekt.</p>
                    <p>Die Extraktion der akademischen Titel einer Person war in allen geprüften Fällen (68) korrekt.</p>
                    <p>Die Extraktion der Klub- bzw. Parteizugehörigkeit war in allen Fällen (68) korrekt.</p>
                    <p>Die Extraktion der Legislaturperioden, in denen die Person im Parlament vertreten war, war in allen Fällen (68) korrekt.</p>
                    <p>
                        Der Code zur Extraktion personenbezogener Daten ist in der Datei
                        <a class="text-blue-400" href="https://github.com/badlogic/woswormeileistung/blob/main/src/server/persons.ts">persons.ts</a>
                        auf GitHub zu finden.
                    </p>

                    <h3>Sitzungs Datensatz</h3>
                    <p>
                        Als Basis des transformierten Datensatzes dienen die im HTML-Format abgespeicherten stenographischen Protokolle von der
                        Parlamentsseite. Die rohen HTML-Dateien werden dabei mit einem einfachen Algorithmus heuristisch geparst, um
                        Sprecher:innen-Sektionen zu extrahieren.
                    </p>
                    <p>
                        Diese rohen HTML-Dateien wurden von den Erstellern aus Microsoft Word exportiert. Leider sind diese HTML-Exporte von minderer
                        Qualität und kein valides HTML, ein bekanntes Problem von Microsoft Word. Dies kann zur Folge haben, dass die Extraktion der
                        Sprecher:innen-Sektionen nicht 100% korrekt ist. Auch die Verknüpfung von Zwischenrufen mit Personen kann fehlschlagen.
                    </p>

                    <p>
                        Der transformierte Datensatz wurde daher stichprobenartig überprüft, um die Extraktions-Pipeline zu validieren. Es wurden pro
                        Legislaturperiode jeweils 4 Sitzungen mit stenographischem Protokoll ausgewählt und manuell mit den Rohdaten der
                        Parlamentsseite verglichen. Dabei wurden für jede Sitzung jeweils 20 Sprecher:innen-Sektionen, verteilt über das ganze
                        Protokoll, verglichen.
                    </p>
                    <p>
                        Die Zuweisung der Personen-ID an eine Sprecher:innen-Sektion ist immer korrekt, da die IDs eindeutig in den Rohdaten
                        ausgewiesen sind.
                    </p>
                    <p>Die Extraktionen des Transkripts einer Sprecher:innen-Sektion war in allen geprüften Fällen (480) korrekt.</p>
                    <p>
                        Die Extraktion von Zwischenrufen und die Zuweisung der dazugehörigen Personen-IDs war in allen geprüften Fällen (480) korrekt.
                    </p>
                    <p>
                        Die Extraktion von Situationsbeschreibungen wies stellenweise Fehler auf. Z.B. werden in den Rohdaten manche Phrasen, bei
                        denen es sich nicht um Situationsbeschreibungen handelt, gleich markiert wie Situationsbeschreibungen, z.B.
                        <code>zur Geschäftsbehandlung</code>. Diese Fehler können maschinell nicht, oder nur mit erheblichem Aufwand bereinigt werden.
                        Da es sich bei Situationsbeschreibungen um nicht-kritische Daten handelt, wurde hier keine weitere Zeit investiert, um diese
                        Fehler bestmöglichst zu bereinigen.
                    </p>

                    <p>
                        Der Code zur Extraktion der Sitzungen ist in der Datei
                        <a class="text-blue-400" href="https://github.com/badlogic/woswormeileistung/blob/main/src/server/sessions.ts">sessions.ts</a>
                        auf GitHub zu finden.
                    </p>

                    <h2>Open Source</h2>
                    <p>
                        Zur Reproduzierbarkeit ist der gesamte Code für dieses Projekt auf
                        <a class="text-blue-400" href="https://github.com/badlogic/woswormeileistung/tree/main">GitHub</a> verfügbar. Der Code ist
                        unter der BSD-2-Clause Lizenz lizensiert und damit frei für kommerzielle als auch nicht-kommerzielle Projekte verwendbar.
                    </p>

                    <h2>API</h2>
                    <p>To be defined</p>
                    <h2>Zitat</h2>
                    <pre><code>
@software{zechner2024wwml,
    title={Wos wor mei Leistung? - Ein Datenprojekt basierend auf den stenographischen Protokollen aller Sitzungen des Österreichischen Parlaments ab dem 20.12.2002},
    author={Mario Zechner},
    year={2024},
    url={https://woswormeileistung.marioslab.io},
    note={License: CC BY 4.0}
}
                    </code></pre>
                </div>

                <page-footer></page-footer>
            </div>
        </div>`;
    }
}
