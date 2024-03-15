import { PropertyValueMap, TemplateResult, html, nothing } from "lit";
import { repeat } from "lit-html/directives/repeat.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { customElement, property, state } from "lit/decorators.js";
import { Api } from "../api";
import { BaseElement, ExpandableList } from "../app";
import {
    MissingEntry,
    MissingPerson,
    Person,
    PlaqueCallout,
    SectionScreams,
    SessionSection,
    SpeakerSection,
    partyColors,
    periodDates,
} from "../common/common";
import { renderBarChart } from "../utils/charts";
import { arrowLeftIcon, arrowRightIcon } from "../utils/icons";
import { router } from "../utils/routing";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";
import { download, downloadFile } from "../utils/utils";
import { matchesQuery, prepareQuery } from "../common/query";

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function renderSectionText(section: SpeakerSection, highlights = new Set<string>()) {
    let text = section.text;
    for (const callout of section.callouts) {
        if (callout.caller) {
            const index = text.indexOf(callout.text);
            if (index == -1) continue;

            const speakerIndex = text.lastIndexOf("Abg. ", index);
            if (speakerIndex != -1) {
                const partAfterCalloutText = text.substring(index + callout.text.length);
                const calloutTextReplacement = `<span class="text-violet-700 dark:text-green-500 italic">${callout.text}</span>`;

                const partBeforeAbgIndex = text.substring(0, speakerIndex);
                const anchorText = text.substring(speakerIndex, index);
                const anchorReplacement = `<a href="/person/${callout.caller}" class="text-blue-400 italic">${anchorText}</a>${calloutTextReplacement}`;

                text = partBeforeAbgIndex + anchorReplacement + partAfterCalloutText;
            }
        } else {
            text = text.replaceAll(callout.text, /*html*/ `<span class="text-violet-700 dark:text-green-500 italic">${callout.text}</span>`);
        }
    }

    for (const highlight of highlights) {
        text = text.replaceAll(new RegExp(escapeRegExp(highlight), "gi"), /*html*/ `<span class="bg-red-500 p-[2px] text-[#fff] italic">$&</span>`);
    }

    for (const link of section.links) {
        text = text.replaceAll(link.label, /*html*/ `<a class="text-blue-400 italic" href="${link.url}">${link.label}</span>`);
    }
    return text;
}

@customElement("missing-list")
export class MissingList extends ExpandableList<MissingEntry> {
    @property()
    person!: Person;

    constructor() {
        super();
        this.numVisible = 3;
    }

    itemId(item: MissingEntry): string {
        return item.period + "-" + item.session;
    }

    renderItem(item: MissingEntry): TemplateResult {
        const section: SpeakerSection = {
            callouts: [],
            links: [],
            speaker: this.person,
            text: "Als verhindert gemeldet sind " + item.sourceText,
        };

        // prettier-ignore
        return html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
            <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${0}></section-header>
            <div class="italic">${unsafeHTML(renderSectionText(section, new Set<string>([item.nameInText])))}</div>
        </div>`;
    }
}

@customElement("plaque-list")
export class PlaqueList extends ExpandableList<PlaqueCallout> {
    @state()
    sections: SessionSection[] = [];

    constructor() {
        super();
        this.numVisible = 3;
    }

    itemId(item: PlaqueCallout): string {
        return item.period + "-" + item.session + "-" + item.section;
    }

    renderItem(item: PlaqueCallout): TemplateResult {
        let plaqueSection: SessionSection | undefined = undefined;
        for (const section of this.sections) {
            if (section.period == item.period && section.session == item.session && section.sectionIndex == item.section) {
                plaqueSection = section;
                break;
            }
        }

        const toggleSectionText = (button: HTMLButtonElement) => {
            const parent = button.parentElement;
            const section = parent?.querySelector<HTMLDivElement>("#section")!;
            section.classList.toggle("hidden");
            button.textContent = section.classList.contains("hidden") ? "Redebeitrag anzeigen" : "Redebeitrag ausblenden";
        };

        // prettier-ignore
        return html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
            <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${item.section}></section-header>
            <div class="italic">${item.text}</div>
            ${plaqueSection
                ? html`<button class="self-start button-muted" @click=${(ev: Event) => toggleSectionText(ev.target as HTMLButtonElement)}>
                          Redebeitrag anzeigen
                      </button>
                      <div id="section" class="hidden p-4 border border-divider rounded-md whitespace-pre-wrap">${unsafeHTML(renderSectionText(plaqueSection.section, new Set<string>([item.text])))}</div> `
                : nothing}
        </div>`;
    }
}

@customElement("section-list")
export class SectionList extends ExpandableList<SessionSection> {
    @property()
    highlights = new Set<string>();

    itemId(item: SessionSection): string {
        return item.period + "-" + item.session;
    }

    renderItem(item: SessionSection): TemplateResult {
        return html` <div class="flex flex-col gap-2 border border-divider rounded-md p-4">
            <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${item.sectionIndex}></section-header>
            <div class="whitespace-pre-wrap">${unsafeHTML(renderSectionText(item.section, this.highlights))}</div>
        </div>`;
    }

    setSections(sections: SessionSection[], highlights = new Set<string>()) {
        this.numVisible = 5;
        this.highlights = highlights;
        this.list = sections;
    }
}

@customElement("section-view")
export class SectionView extends BaseElement {
    @property()
    period = "";

    @property()
    session = 0;

    @property()
    section = 0;

    @property()
    highlights?: string[];

    @state()
    text: string = "";

    @state()
    loading = true;

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        this.load();
    }

    async load() {
        try {
            const response = await Api.section(this.period, this.session, this.section);
            if (response instanceof Error) throw new Error();
            this.text = renderSectionText(response.section, new Set<string>(this.highlights ? this.highlights : []));
        } catch (e) {
            this.text = "Konnte Redebeitrag nicht laden";
        } finally {
            this.loading = false;
        }
    }

    render() {
        // prettier-ignore
        return html`<div id="section" class="p-4 border border-divider rounded-md whitespace-pre-wrap">${this.loading ? html`<loading-spinner></loading-spinner>` : unsafeHTML(this.text)}</div>`;
    }
}

@customElement("section-screams-list")
export class ScreamsList extends ExpandableList<SectionScreams> {
    @property()
    person!: Person;

    constructor() {
        super();
        this.stepSize = 10;
        this.numVisible = 3;
    }

    itemId(item: SectionScreams): string {
        return item.period + "-" + item.session + "-" + item.section;
    }

    renderItem(item: SectionScreams): TemplateResult {
        const toggleSectionText = (button: HTMLButtonElement) => {
            const parent = button.parentElement;
            const section = parent?.querySelector<HTMLDivElement>("#section")!;
            section.classList.toggle("hidden");
            button.textContent = section.classList.contains("hidden") ? "Redebeitrag anzeigen" : "Redebeitrag ausblenden";
        };

        const from = item.direction == "from" ? item.person : this.person;
        const to = item.direction == "from" ? this.person : item.person;

        // prettier-ignore
        return html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
            <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${item.section}></section-header>
            <div class="flex items-center gap-2">
                <a href="/person/${from.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${from.imageUrl}/>
                    ${item.direction == "from" ? html`
                        <span>${from.name}</span>
                        <span>[${from.parties.join(", ")}]</span>`: nothing}
                </a>
                <i class="icon w-6 h-6">${arrowRightIcon}</i>
                <a href="/person/${to.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${to.imageUrl}/>
                    ${item.direction != "from" ? html`
                        <span>${to.name}</span>
                        <span>[${to.parties.join(", ")}]</span>` :nothing}
                </a>
            </div>
            ${repeat(item.texts, (text) => html`<div class="italic">"${text}"</div>`)}
            <button class="self-start button-muted" @click=${(ev: Event) => toggleSectionText(ev.target as HTMLButtonElement)}>
            Redebeitrag anzeigen
            </button>
            <section-view id="section" class="hidden" .period=${item.period} .session=${item.session} .section=${item.section} .highlights=${item.texts}></section-view>
        </div>`;
    }
}

type ScreamsPerPerson = {
    person: Person;
    numScreams: number;
    screams: SectionScreams[];
};
@customElement("per-person-screams-list")
export class PerPersonScreamsList extends ExpandableList<ScreamsPerPerson> {
    @property()
    person!: Person;

    constructor() {
        super();
        this.stepSize = 10;
        this.numVisible = 3;
    }

    itemId(item: ScreamsPerPerson): string {
        return item.person.id;
    }
    renderItem(item: ScreamsPerPerson): TemplateResult {
        const toggleScreams = (el: HTMLElement) => {
            const parent = el.tagName == "SPAN" ? el.parentElement?.parentElement! : el.parentElement!;
            const list = parent.querySelector("section-screams-list")!;
            list.classList.toggle("hidden");
            parent.querySelector<HTMLSpanElement>("#toggle")!.innerText = list.classList.contains("hidden") ? "Anzeigen" : "Ausblenden";
        };

        const direction = this.list[0].screams[0].direction;
        const from = direction == "from" ? item.person : this.person;
        const to = direction == "from" ? this.person : item.person;

        return html`<div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <a href="/person/${from.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${from.imageUrl} />
                    ${direction == "from"
                        ? html` <span>${from.name}</span>
                              <span>[${from.parties.join(", ")}]</span>`
                        : nothing}
                </a>
                <i class="icon w-6 h-6">${arrowRightIcon}</i>
                <a href="/person/${to.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${to.imageUrl} />
                    ${direction != "from"
                        ? html` <span>${to.name}</span>
                              <span>[${to.parties.join(", ")}]</span>`
                        : nothing}
                </a>
            </div>
            <div
                class="px-4 h-8 flex items-center rounded-md border gap-2 cursor-pointer"
                style="background-color: rgba(54, 162, 235, 0.2); border-color: rgba(54, 162, 235, 1); width: ${(
                    (100 * item.numScreams) /
                    this.list[0].numScreams
                ).toFixed(0)}%;"
                @click=${(ev: Event) => toggleScreams(ev.target as HTMLElement)}
            >
                <span id="toggle">Anzeigen</span>
                <span class="ml-auto">${item.numScreams}</span>
            </div>
            <section-screams-list class="hidden" .person=${this.person} .list=${item.screams}></section-screams-list>
        </div>`;
    }
}

@customElement("person-header")
export class PersonHeader extends BaseElement {
    @property()
    person!: Person;

    render() {
        return html`<div class="flex items-center">
            ${this.person.imageUrl
                ? html`<img src=${this.person.imageUrl} class="flex-shrink-0 w-24 h-24 rounded-full object-cover object-center shadow-md" />`
                : nothing}
            <div class="flex flex-col px-4">
                <h2 class="flex gap-2">
                    ${this.person.name}
                    <json-api-boxes .prefix=${this.person.name + "-person"} .obj=${this.person} api="/api/persons/${this.person.id}"></json-api-boxes>
                </h2>
                <span>${this.person.parties.join(", ")}</span>
                <span class="text-xs">Gesetzgebungs-Perioden: ${this.person.periods.join(", ")}</span>
                <a href="https://parlament.gv.at/person/${this.person.id}" class="text-blue-400">Parlamentsseite</a>
            </div>
        </div>`;
    }
}

@customElement("json-api-boxes")
export class JsonApiBoxes extends BaseElement {
    @property()
    prefix!: string;

    @property()
    obj: any;

    @property()
    api!: string;

    render() {
        return html` <div class="flex gap-2">
            <div
                class="inline cursor-pointer button-muted px-1 py-1 border border-divider rounded text-sm font-semibold"
                @click=${() => download(this.prefix, this.obj)}
            >
                JSON
            </div>
            <a href="${this.api}" class="button-muted px-1 py-1 border border-divider rounded text-sm font-semibold">API</a>
        </div>`;
    }
}

@customElement("section-header")
export class SectionHeader extends BaseElement {
    @property()
    date!: string;

    @property()
    period!: string;

    @property()
    session!: string | number;

    @property()
    section!: string | number;

    render() {
        const section = typeof this.section == "string" ? parseInt(this.section) : this.section;
        return html` <div class="flex gap-2">
            <a class="text-blue-400" href="/section/${this.period}/${this.session}/${this.section}"
                >${this.date.split("T")[0]} GP ${this.period}, Sitzung ${this.session.toString()}, Redebeitrag ${section + 1}</a
            >
        </div>`;
    }
}

@customElement("person-page")
export class PersonPage extends BaseElement {
    @state()
    loading = true;

    @state()
    person?: Person;

    @state()
    sections: SessionSection[] = [];

    @state()
    plaques: PlaqueCallout[] = [];

    @state()
    missing!: MissingPerson;

    @state()
    screams: SectionScreams[] = [];
    numScreams = 0;

    @state()
    screamsPerPerson: ScreamsPerPerson[] = [];

    @state()
    screamsAt: SectionScreams[] = [];
    numScreamsAt = 0;

    @state()
    screamsAtPerPerson: ScreamsPerPerson[] = [];

    @state()
    searchResults: SessionSection[] = [];

    @state()
    searching = false;

    @state()
    periods = periodDates.map((item) => {
        return { ...item, selected: true };
    });

    @state()
    sectionsPerPeriod: { period: string; numSections: number }[] = [];

    connectedCallback(): void {
        super.connectedCallback();
        this.load();
    }

    async load() {
        try {
            const id = router.getCurrentParams()?.get("id");
            if (!id) throw new Error();
            let person: Person;
            let sections: SessionSection[];
            let plaques: PlaqueCallout[];
            let missing: MissingPerson;
            let screams: SectionScreams[];
            let screamsAt: SectionScreams[];
            {
                const result = await Api.person(id);
                if (result instanceof Error) throw result;
                if (result.length == 0) throw result;
                person = result[0].person;
            }

            {
                const result = await Api.personSections(person.id, []);
                if (result instanceof Error) throw result;
                sections = result.sections;
            }
            {
                const result = await Api.personPlaques(person.id);
                if (result instanceof Error) throw result;
                plaques = result;
            }
            {
                const result = await Api.personMissing(person.id);
                if (result instanceof Error) throw result;
                missing = result;
            }
            {
                const result = await Api.personScreams(person.id);
                if (result instanceof Error) throw result;
                screams = result;
                const screamsPerPerson = new Map<string, ScreamsPerPerson>();
                for (const scream of screams) {
                    this.numScreams += scream.texts.length;
                    const personScreams: ScreamsPerPerson = screamsPerPerson.get(scream.person.id) ?? {
                        person: scream.person,
                        screams: [],
                        numScreams: 0,
                    };
                    personScreams.screams.push(scream);
                    personScreams.numScreams += scream.texts.length;
                    screamsPerPerson.set(scream.person.id, personScreams);
                }
                this.screamsPerPerson = Array.from(screamsPerPerson.values()).sort((a, b) => b.numScreams - a.numScreams);
            }
            {
                const result = await Api.personScreamsAt(person.id);
                if (result instanceof Error) throw result;
                screamsAt = result;
                const screamsAtPerPerson = new Map<string, ScreamsPerPerson>();
                for (const scream of screamsAt) {
                    this.numScreamsAt += scream.texts.length;
                    const personScreams: ScreamsPerPerson = screamsAtPerPerson.get(scream.person.id) ?? {
                        person: scream.person,
                        screams: [],
                        numScreams: 0,
                    };
                    personScreams.screams.push(scream);
                    personScreams.numScreams += scream.texts.length;
                    screamsAtPerPerson.set(scream.person.id, personScreams);
                }
                this.screamsAtPerPerson = Array.from(screamsAtPerPerson.values()).sort((a, b) => b.numScreams - a.numScreams);
            }

            this.person = person;
            this.sections = sections;
            this.searchResults = sections;
            this.plaques = plaques;
            this.missing = missing;
            this.screams = screams;
            this.screamsAt = screamsAt;

            // Sections per period chart
            const periods = new Set<string>();
            const sectionsPerPeriod: Map<string, { period: string; num: number }> = new Map();
            for (const section of sections) {
                periods.add(section.period);
                const period = sectionsPerPeriod.get(section.period) ?? { period: section.period, num: 0 };
                period.num++;
                sectionsPerPeriod.set(section.period, period);
            }
            this.periods = this.periods.filter((item) => periods.has(item.name));
            let data = Array.from(sectionsPerPeriod.values()).reverse();
            renderBarChart(
                this,
                "#sectionsPerPeriod",
                data.map((item) => item.period),
                data.map((item) => item.num),
                "Gesetzsgebungsperiode",
                "Reden"
            );

            // Plaques chart
            const plaquesPerPeriod: Map<string, { period: string; num: number }> = new Map();
            for (const plaque of this.plaques) {
                const period = plaquesPerPeriod.get(plaque.period) ?? { period: plaque.period, num: 0 };
                period.num++;
                plaquesPerPeriod.set(plaque.period, period);
            }
            data = Array.from(plaquesPerPeriod.values()).reverse();
            renderBarChart(
                this,
                "#plaques",
                data.map((item) => item.period),
                data.map((item) => item.num),
                "Gesetzsgebungsperiode",
                "Taferl"
            );

            // Missing chart
            const missingPerPeriod: Map<string, { period: string; num: number }> = new Map();
            for (const missing of this.missing.missing) {
                const period = missingPerPeriod.get(missing.period) ?? { period: missing.period, num: 0 };
                period.num++;
                missingPerPeriod.set(missing.period, period);
            }
            data = Array.from(missingPerPeriod.values()).reverse();
            renderBarChart(
                this,
                "#missing",
                data.map((item) => item.period),
                data.map((item) => item.num),
                "Gesetzsgebungsperiode",
                "Abwesenheiten"
            );

            // Screams chart
            {
                const screamsPerPeriod: Map<string, { period: string; num: number }> = new Map();
                const screamsPerParty: Map<string, { party: string; num: number }> = new Map();
                for (const scream of this.screams) {
                    const period = screamsPerPeriod.get(scream.period) ?? { period: scream.period, num: 0 };
                    period.num += scream.texts.length;
                    screamsPerPeriod.set(scream.period, period);

                    for (const party of scream.person.parties) {
                        const partyScreams = screamsPerParty.get(party) ?? { party, num: 0 };
                        partyScreams.num += scream.texts.length;
                        screamsPerParty.set(party, partyScreams);
                    }
                }

                data = Array.from(screamsPerPeriod.values()).reverse();
                renderBarChart(
                    this,
                    "#screams",
                    data.map((item) => item.period),
                    data.map((item) => item.num),
                    "Gesetzsgebungsperiode",
                    "Zwischenrufe"
                );
                const perPartyData = Array.from(screamsPerParty.values()).sort((a, b) => b.num - a.num);
                const bgColors: string[] = [];
                const borderColors: string[] = [];
                for (const party of perPartyData) {
                    const color = partyColors[party.party];
                    bgColors.push("rgb(" + color + ")");
                    borderColors.push("rgba(" + color + ", 0.2)");
                }
                renderBarChart(
                    this,
                    "#screamsPerParty",
                    perPartyData.map((item) => item.party),
                    perPartyData.map((item) => item.num),
                    "Partei",
                    "Zwischenrufe",
                    bgColors,
                    borderColors
                );
            }

            // Screams at chart
            {
                const screamsPerPeriod: Map<string, { period: string; num: number }> = new Map();
                const screamsPerParty: Map<string, { party: string; num: number }> = new Map();
                for (const scream of this.screamsAt) {
                    const period = screamsPerPeriod.get(scream.period) ?? { period: scream.period, num: 0 };
                    period.num += scream.texts.length;
                    screamsPerPeriod.set(scream.period, period);

                    for (const party of scream.person.parties) {
                        const partyScreams = screamsPerParty.get(party) ?? { party, num: 0 };
                        partyScreams.num++;
                        screamsPerParty.set(party, partyScreams);
                    }
                }

                data = Array.from(screamsPerPeriod.values()).reverse();
                renderBarChart(
                    this,
                    "#screamsAt",
                    data.map((item) => item.period),
                    data.map((item) => item.num),
                    "Gesetzsgebungsperiode",
                    "Zwischenrufe"
                );
                const perPartyData = Array.from(screamsPerParty.values()).sort((a, b) => b.num - a.num);
                const bgColors: string[] = [];
                const borderColors: string[] = [];
                for (const party of perPartyData) {
                    const color = partyColors[party.party];
                    bgColors.push("rgb(" + color + ")");
                    borderColors.push("rgba(" + color + ", 0.2)");
                }
                renderBarChart(
                    this,
                    "#screamsAtPerParty",
                    perPartyData.map((item) => item.party),
                    perPartyData.map((item) => item.num),
                    "Partei",
                    "Zwischenrufe",
                    bgColors,
                    borderColors
                );
            }
        } catch (e) {
            alert("Sorry, das ist etwas schief gelaufen");
        } finally {
            this.loading = false;
        }
    }

    render() {
        return html`<div class="${pageContainerStyle} min-h-[100vh]">
            <div class="${pageContentStyle} h-[100vh]">
                <div class="flex-grow flex flex-col w-full mt-4 gap-4 px-4">
                    <div class="flex">
                        <div href="/" class="flex items-center cursor-pointer" @click=${() => router.pop()}>
                            <i class="icon w-6">${arrowLeftIcon}</i>Zurück
                        </div>
                        <theme-toggle class="ml-auto"></theme-toggle>
                    </div>
                    ${this.loading ? html`<loading-spinner></loading-spinner>` : nothing}
                    ${this.person
                        ? html`<person-header .person=${this.person}></person-header>
                              <h2 class="flex gap-2">
                                  Zwischenrufe von ${this.person.name} (${this.numScreams})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-zwischenrufe"}
                                      .obj=${this.screams}
                                      api="/api/screams/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${this.numScreams == 0 ? nothing : html`<canvas id="screams"></canvas><canvas id="screamsPerParty"></canvas>`}
                              ${this.numScreams == 0
                                  ? html`<span>Keine Zwischenrufe</span>`
                                  : html`<h3>Zwischenrufe chronologisch</h3>
                                        <section-screams-list .list=${this.screams} .person=${this.person}></section-screams-list>
                                        <h3>Zwischenrufe pro Person (absteigend)</h3>
                                        <per-person-screams-list .list=${this.screamsPerPerson} .person=${this.person}></per-person-screams-list>`}

                              <h2 class="flex gap-2">
                                  Zwischenrufe an ${this.person.name} (${this.numScreamsAt})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-zwischenrufe-an"}
                                      .obj=${this.screamsAt}
                                      api="/api/screamsat/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${this.numScreamsAt == 0 ? nothing : html`<canvas id="screamsAt"></canvas><canvas id="screamsAtPerParty"></canvas>`}
                              ${this.numScreamsAt == 0
                                  ? html`<span>Keine Zwischenrufe</span>`
                                  : html`<h3>Zwischenrufe chronologisch</h3>
                                        <section-screams-list .list=${this.screamsAt} .person=${this.person}></section-screams-list>
                                        <h3>Zwischenrufe pro Person (absteigend)</h3>
                                        <per-person-screams-list .list=${this.screamsAtPerPerson} .person=${this.person}></per-person-screams-list>`}
                              <h2 class="flex gap-2">
                                  Abwesenheiten (${this.missing.missing.length})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-abwesenheiten"}
                                      .obj=${this.missing.missing}
                                      api="/api/missing/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              <div class="text-sm text-red-400 italic text-center">
                                  Die Abwesenheit einer Person kann verschiedene Gründe haben, z. B. eine langwierige Krankheit usw. Abwesenheiten
                                  werden aus den stenographischen Protokollen des Nationalrats maschinell erfasst und können Fehler aufweisen, z. B.
                                  bei uneindeutigen Familiennamen. Die Quelle für jede Abwesenheit in den Protokollen wird daher unten angeführt, um
                                  die manuelle Überprüfung zu ermöglichen. Es werden nur gemeldete Abwesenheiten für die gesamte Sitzung erfasst.
                                  Temporäre Abewesenheiten während einer Sitzung können nicht erfasst werden. Die Abwesenheiten während der Funktion
                                  als Bundesminister:in werden nicht angezeigt.
                              </div>
                              ${this.missing.missing.length == 0 ? nothing : html`<canvas id="missing"></canvas>`}
                              ${this.missing.missing.length == 0
                                  ? html`<span>Nie abwesend</span>`
                                  : html`<missing-list .list=${this.missing.missing} .person=${this.person}></missing-list>`}
                              <h2 class="flex gap-2">
                                  Taferl (${this.plaques.length})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-taferl"}
                                      .obj=${this.plaques}
                                      api="/api/plaques/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${this.plaques.length == 0 ? nothing : html`<canvas id="plaques"></canvas>`}
                              ${this.plaques.length == 0
                                  ? html`<span>Keine Taferl</span>`
                                  : html`<div class="text-xs italic text-center">
                                            Für die Anzeige des Redebeitrags einer Person während deren Taferlaufstellung kann deren Redebeitrag
                                            angezeigt werden. Redebeiträge anderer Personen, während die Person ein Taferl aufgestellt hat, werden
                                            nicht angezeigt.
                                        </div>
                                        <plaque-list .list=${this.plaques} .sections=${this.sections}></plaque-list>`}
                              <h2 class="flex gap-2">
                                  Redebeiträge
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-redebeiträge"}
                                      .obj=${this.sections}
                                      api="/api/sections?person=${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              <canvas id="sectionsPerPeriod"></canvas>
                              <input
                                  id="query"
                                  class="px-4 py-2 border border-divider rounded-full bg-transparent"
                                  placeholder="Reden nach Stichwörtern durchsuchen ..."
                                  @input=${() => this.handleQuery()}
                                  @keyup=${() => this.handleQuery()}
                              />
                              <div class="text-xs text-center italic">
                                  Um ein Wort aus- bzw. unbedingt einzuschließen, <code>'-'</code> oder <code>'+'</code> voransetzen. Z.B.
                                  '+Fristenlösung +Abtreibung' um nur Redebeiträge anzuzeigen, die beide Worte beinhalten. Zur Suche ganzer Phrasen,
                                  die Phrase in Anführungszeichen setzen. Z.B. "Wer schafft die Arbeit?".
                              </div>
                              <div class="flex justify-center items-center flex-wra gap-2">
                                  ${repeat(
                                      this.periods,
                                      (item) => item.name,
                                      (item) =>
                                          html`<div
                                              class="flex flex-col px-2 py-1 cursor-pointer border rounded-md ${item.selected
                                                  ? "border-primary"
                                                  : "border-divider"}"
                                              @click=${() => {
                                                  item.selected = !item.selected;
                                                  this.periods = [...this.periods];
                                                  this.search();
                                              }}
                                          >
                                              <span class="text-center">${item.name}</span
                                              ><span class="text-center" style="font-size: 8px;">${item.dates}</span>
                                          </div>`
                                  )}
                              </div>
                              <div class="text-xs text-center italic">
                                  Hier können Suchresultate auf bestimmte Gesetzgebungsperioden eingeschränkt werden.
                              </div>
                              <div class="font-bold flex gap-2 items-center">
                                  Ergebnisse
                                  (${this.sections.length == this.searchResults.length
                                      ? this.sections.length
                                      : `${this.searchResults.length}/${this.sections.length}`})

                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-reden-sucheergebnis"}
                                      .obj=${this.searchResults}
                                      api="/api/sections?person=${this.person.id}&${this.periods
                                          .map((period) => `period=${period}`)
                                          .join("&")}&query=${this.querySelector<HTMLInputElement>("#query")?.value.trim() ?? ""}"
                                  ></json-api-boxes>
                              </div>
                              ${this.searching ? html`<loading-spinner></loading-spinner>` : nothing}
                              <section-list .list=${this.searchResults}></section-list>`
                        : nothing}
                </div>
                <page-footer></page-footer>
            </div>
        </div>`;
    }

    timeoutId = 0;
    handleQuery() {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(async () => {
            this.searchResults = [];
            this.searching = true;
            await this.search();
        }, 200) as any as number;
    }

    async search() {
        try {
            const query = this.querySelector<HTMLInputElement>("#query")!.value.trim();
            const sectionList = this.querySelector<SectionList>("section-list")!;
            this.searchResults = [...this.sections.filter((item) => this.periods.some((period) => period.selected && period.name == item.period))];
            const preparedQuery = prepareQuery(query);
            if (preparedQuery.tokens.length == 0) {
                sectionList.setSections(this.searchResults);
            } else {
                this.searchResults = this.searchResults.filter((item) => matchesQuery(preparedQuery, item.section.text));
                sectionList.setSections(this.searchResults, new Set<string>([...preparedQuery.must, ...preparedQuery.optional]));
            }
        } finally {
            this.searching = false;
        }
    }
}
