import { PropertyValueMap, TemplateResult, html, nothing } from "lit";
import { repeat } from "lit-html/directives/repeat.js";
import { customElement, property, state } from "lit/decorators.js";
import { Api } from "../api";
import { BaseElement, ExpandableList, renderSection, renderSectionCard, renderSectionText } from "../app";
import {
    MissingEntry,
    MissingPerson,
    Ordercall,
    Person,
    PlaqueCallout,
    Rollcall,
    SectionScreams,
    SessionSection,
    SpeakerSection,
    partyColors,
    periodDates,
} from "../common/common";
import { matchesQuery, prepareQuery } from "../common/query";
import { renderBarChart } from "../utils/charts";
import { arrowRightIcon, logoIcon, searchIcon } from "../utils/icons";
import { router } from "../utils/routing";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";

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
            speaker: this.person,
            isPresident: true,
            text: "Als verhindert gemeldet sind " + item.sourceText,
            tags: [],
            pages: item.pages,
        };

        // prettier-ignore
        return html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
            <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${item.section} .highlights=${[item.nameInText]}></section-header>
            <div class="italic">${renderSectionText(section, new Set<string>([item.nameInText]))}</div>
        </div>`;
    }
}

@customElement("ordercall-list")
export class OrdercallList extends ExpandableList<Ordercall> {
    @state()
    person!: Person;

    @state()
    sections: SessionSection[] = [];

    constructor() {
        super();
        this.stepSize = 5;
        this.numVisible = 3;
    }

    itemId(item: Ordercall): string {
        return item.period + "-" + item.session + "-" + item.referenceUrls.join("-");
    }

    renderItem(item: Ordercall): TemplateResult {
        const presidentSections = item.resolvedReferences.filter((item) => item.section.isPresident && item.section.text.includes("Ordnungsruf"));
        const contextSections = item.resolvedReferences.sort((a, b) => a.sectionIndex - b.sectionIndex);

        const renderSection = (ref: SessionSection) =>
            // prettier-ignore
            html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
                <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${ref.sectionIndex}></section-header>
                <div class="italic">${renderSectionText(ref.section, new Set<string>(["Ordnungsruf", this.person.familyName]))}</div>
            </div>`;

        const references = html`<div class="flex flex-col text-blue-400">
            ${repeat(item.referenceUrls, (url, index) => html`<a href=${url}>Referenz ${index + 1}</a>`)}
        </div>`;

        const context = html`<div id="context" class="hidden flex flex-col gap-4">
            ${repeat(contextSections, (item) => html` ${renderSection(item)} `)}
        </div>`;

        const toggleContext = (ev: Event) => {
            const target = ev.target as HTMLButtonElement;
            const context = target.parentElement?.querySelector<HTMLDivElement>("#context");
            context?.classList.toggle("hidden");
            target.innerText = context?.classList.contains("hidden") ? "Beanstandete Redebeiträge anzeigen" : "Beanstandete Redebeiträge ausblenden";
        };

        return html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
            ${presidentSections.length > 0
                ? html`<div class="flex flex-col gap-4">${repeat(presidentSections, (presidentSection) => renderSection(presidentSection))}</div>`
                : html`<session-header .date=${item.date} .period=${item.period} .session=${item.session}></session-header>
                      <div class="italic">
                          Der Redebeitrag, in dem der Ordnungsruf erteilt wurde, konnte nicht extrahiert werden. Evtl. ist der Redebeitrag durch die
                          Referenz-Links unten einsehbar.
                      </div>`}
            <h3 class="font-semibold">Referenz-Links zu Ordnungsruf und beanstandeten Redebeiträgen</h3>
            ${references}
            <button class="self-center button-muted" @click=${(ev: Event) => toggleContext(ev)}>Beanstandete Redebeiträge anzeigen</button>
            ${context}
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

        let highlight = item.text.substring(item.text.indexOf(", ") + 2);
        while (highlight.length > 0 && !plaqueSection?.section.text.includes(highlight)) {
            highlight = highlight.substring(1);
        }

        return html`<div class="flex flex-col gap-2 p-4 border border-divider rounded-md">
            <section-header
                .date=${item.date}
                .period=${item.period}
                .session=${item.session}
                .section=${item.section}
                .highlights=${highlight.length > 0 ? [highlight] : undefined}
            ></section-header>
            <div class="italic">${item.text}</div>
        </div>`;
    }
}

@customElement("section-list")
export class SectionList extends ExpandableList<SessionSection> {
    @property()
    person!: Person;

    @property()
    highlights = new Set<string>();

    itemId(item: SessionSection): string {
        return item.period + "-" + item.session;
    }

    renderItem(item: SessionSection): TemplateResult {
        const persons: Record<string, Person> = {};
        persons[this.person.id] = this.person;
        return renderSectionCard(item.section, item.date, item.period, item.session, item.sectionIndex, persons, Array.from(this.highlights));
    }

    setSections(sections: SessionSection[], highlights = new Set<string>()) {
        this.numVisible = 5;
        this.highlights = highlights;
        this.list = sections;
    }
}

@customElement("rollcall-list")
export class RollcallList extends ExpandableList<Rollcall> {
    @property()
    person!: Person;

    constructor() {
        super();
        this.stepSize = 5;
        this.numVisible = 3;
    }

    itemId(item: Rollcall): string {
        return item.period + "-" + item.sourceSection.session + "-" + item.sourceSection.sectionIndex;
    }

    renderItem(item: Rollcall): TemplateResult {
        const renderPerson = (person: Person) => html`<a href="/person/${person.id}" class="flex gap-2 items-center text-blue-400">
            <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${person.imageUrl} />
            <span>${person.name}</span>
            <div class="flex items-center gap-2">${repeat(person.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}</div>
        </a>`;

        const personsHtml = repeat(item.persons, (person) => renderPerson(person));

        const votedYes = item.yesVotes.find((item) => item && item.id == this.person.id) != undefined;

        return html`<div class="flex flex-col gap-4 p-4 border border-divider rounded-md shadow-lg">
            <span class="font-semibold">Abstimmung ${item.date.split("T")[0]}, GP ${item.period}, Sitzung ${item.sourceSection.session + 1}</span>
            <a class="text-blue-400" href="${item.url}">${item.title}</a>
            <p>${item.description.replaceAll("<br>", " ")}</p>
            ${
                item.persons.length > 0
                    ? html`<span class="font-semibold">Abstimmungsgegenstand von</span>
                          <div class="flex flex-col gap-2">${personsHtml}</div>`
                    : nothing
            }</p>
            <span class="font-semibold flex items-center gap-2">Votum von ${renderPerson(this.person)}</span>
            ${
                votedYes
                    ? html`<div class="self-start bg-green-400 text-[#eee] p-1 px-2 rounded">JA</div>`
                    : html`<div class="self-start bg-red-400 text-[#fff] p-1 px-2 rounded">NEIN</div>`
            }
            <span class="font-semibold">Votum Quellennachweis</span>
            <section-header .date=${item.date} .period=${item.period} .session=${item.sourceSection.session} .section=${
            item.sourceSection.sectionIndex
        } .highlights=${[this.person.familyName]}></section-header>
        </div>`;
    }
}

@customElement("section-view")
export class SectionView extends BaseElement {
    @property()
    date = "";

    @property()
    period = "";

    @property()
    session = 0;

    @property()
    section = 0;

    @property()
    highlights?: string[];

    @state()
    text?: TemplateResult;

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
            this.text = html`<div>Konnte Redebeitrag nicht laden</div>`;
        } finally {
            this.loading = false;
        }
    }

    render() {
        // prettier-ignore
        return html`<div id="section" class="p-4 border border-divider rounded-md whitespace-pre-wrap">${this.loading ? html`<loading-spinner></loading-spinner>` : this.text}</div>`;
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
            <section-header .date=${item.date} .period=${item.period} .session=${item.session} .section=${item.section} .highlights=${item.texts}></section-header>
            <div class="flex items-center gap-2">
                <a href="/person/${from.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${from.imageUrl}/>
                    ${item.direction == "from" ? html`
                        <span>${from.name}</span>
                        <div class="flex items-center gap-2">${repeat(from.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}</div>`: nothing}
                </a>
                <i class="icon w-6 h-6">${arrowRightIcon}</i>
                <a href="/person/${to.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${to.imageUrl}/>
                    ${item.direction != "from" ? html`
                        <span>${to.name}</span>
                        <div class="flex items-center gap-2">${repeat(to.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}</div>` :nothing}
                </a>
            </div>
            ${repeat(item.texts, (text) => html`<div class="italic">"${text}"</div>`)}
            <button class="self-start button-muted" @click=${(ev: Event) => toggleSectionText(ev.target as HTMLButtonElement)}>
            Redebeitrag anzeigen
            </button>
            <section-view id="section" class="hidden" .date=${item.date} .period=${item.period} .session=${item.session} .section=${item.section} .highlights=${item.texts}></section-view>
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
                              <div class="flex items-center gap-2">
                                  ${repeat(from.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}
                              </div>`
                        : nothing}
                </a>
                <i class="icon w-6 h-6">${arrowRightIcon}</i>
                <a href="/person/${to.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${to.imageUrl} />
                    ${direction != "from"
                        ? html` <span>${to.name}</span>
                              <div class="flex items-center gap-2">
                                  ${repeat(to.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}
                              </div>`
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

@customElement("person-page")
export class PersonPage extends BaseElement {
    @state()
    loading = true;

    @state()
    person?: Person;

    @state()
    sections: SessionSection[] = [];
    numActualSections = 0;

    @state()
    wasSessionPresident = false;

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
    ordercalls: Ordercall[] = [];

    @state()
    rollcalls: Rollcall[] = [];

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

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
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
            let ordercalls: Ordercall[];
            let rollcalls: Rollcall[];
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
                this;
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
            {
                const result = await Api.personOrdercalls(person.id);
                if (result instanceof Error) throw result;
                ordercalls = result;
            }
            {
                const result = await Api.personRollcalls(person.id);
                if (result instanceof Error) throw result;
                rollcalls = result;
            }

            this.person = person;
            this.sections = sections;
            this.searchResults = sections.filter((item) => !item.section.isPresident);
            this.plaques = plaques;
            this.missing = missing;
            this.screams = screams;
            this.screamsAt = screamsAt;
            this.ordercalls = ordercalls;
            this.rollcalls = rollcalls;

            // Sections per period chart
            const periods = new Set<string>();
            const sectionsPerPeriod: Map<string, { period: string; num: number }> = new Map();
            for (const section of sections) {
                periods.add(section.period);
                const period = sectionsPerPeriod.get(section.period) ?? { period: section.period, num: 0 };
                if (section.section.isPresident) {
                    this.wasSessionPresident = true;
                    continue;
                }
                period.num++;
                this.numActualSections++;
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

            // Ordercalls chart
            const ordercallsPerPeriod: Map<string, { period: string; num: number }> = new Map();
            for (const ordercall of this.ordercalls) {
                const period = ordercallsPerPeriod.get(ordercall.period) ?? { period: ordercall.period, num: 0 };
                period.num++;
                ordercallsPerPeriod.set(ordercall.period, period);
            }
            data = Array.from(ordercallsPerPeriod.values()).reverse();
            renderBarChart(
                this,
                "#ordercalls",
                data.map((item) => item.period),
                data.map((item) => item.num),
                "Gesetzsgebungsperiode",
                "Ordnungsrufe"
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
            // HACKL abwesenheiten "Als verhindert gemeldet" reicht nicht um alle verhinderungen zu erwischen
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
        const name = this.person ? this.person.givenName + " " + this.person.familyName : "";

        const calloutsDetails = html`<div class="flex flex-col gap-4">
            <h3>Zwischenrufe von ${name} (chronologisch absteigend)</h3>
            <section-screams-list .list=${this.screams} .person=${this.person}></section-screams-list>
        </div> `;

        const calloutsAtDetails = html`<div class="flex flex-col gap-4">
            <h3>Zwischenrufe an ${name} (chronologisch absteigend)</h3>
            <section-screams-list .list=${this.screamsAt} .person=${this.person}></section-screams-list>
        </div> `;

        const missingDetails = this.missing
            ? html`<div class="flex flex-col gap-4">
                  <missing-list .list=${this.missing.missing} .person=${this.person}></missing-list>
              </div>`
            : nothing;

        const plaquesDetails = html`<div class="flex flex-col gap-4">
            <plaque-list .list=${this.plaques} .sections=${this.sections}></plaque-list>
        </div>`;

        const ordercallsDetails = html`<div class="flex flex-col gap-4">
            <ordercall-list .list=${this.ordercalls} .person=${this.person}></ordercall-list>
        </div>`;

        const rollcallsDetails = html`<div class="flex flex-col gap-4">
            <rollcall-list .list=${this.rollcalls} .person=${this.person}></rollcall-list>
        </div>`;

        return html`<div class="${pageContainerStyle} min-h-[100vh]">
            <div class="${pageContentStyle} h-[100vh]">
                <div class="flex-grow flex flex-col w-full mt-4 gap-4 px-4">
                    <div class="flex">
                        <a href="/" class="flex items-center gap-2 font-semibold"><i class="icon w-6">${logoIcon}</i> Wos wor mei Leistung?</a>
                        <theme-toggle class="ml-auto"></theme-toggle>
                    </div>
                    ${this.loading ? html`<loading-spinner></loading-spinner>` : nothing}
                    ${this.person
                        ? html`<person-header class="mt-8" .person=${this.person}></person-header>
                              <h2 class="flex gap-2 mt-8">
                                  Zwischenrufe von ${this.person.name} (${this.numScreams})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-zwischenrufe"}
                                      .obj=${this.screams}
                                      api="/api/screams/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${
                                  this.numScreams == 0
                                      ? nothing
                                      : html`<div class="flex flex-col gap-4 p-4 border border-divider rounded-md">
                                            <canvas id="screams"></canvas><canvas id="screamsPerParty"></canvas>
                                        </div>`
                              }
                              ${
                                  this.numScreams == 0
                                      ? html`<span>Keine Zwischenrufe</span>`
                                      : html`<div class="flex flex-col gap-4 p-4 border border-divider rounded-md">
                                                <h3>Zwischenrufe von ${name} (absteigend)</h3>
                                                <per-person-screams-list
                                                    .list=${this.screamsPerPerson}
                                                    .person=${this.person}
                                                ></per-person-screams-list>
                                            </div>
                                            <expandable-details .details=${calloutsDetails}></expandable-details> `
                              }

                              <h2 class="flex gap-2 mt-8">
                                  Zwischenrufe an ${this.person.name} (${this.numScreamsAt})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-zwischenrufe-an"}
                                      .obj=${this.screamsAt}
                                      api="/api/screamsat/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${
                                  this.numScreamsAt == 0
                                      ? nothing
                                      : html`<div class="flex flex-col gap-4 p-4 border border-divider rounded-md">
                                            <canvas id="screamsAt"></canvas><canvas id="screamsAtPerParty"></canvas>
                                        </div>`
                              }
                              ${
                                  this.numScreamsAt == 0
                                      ? html`<span>Keine Zwischenrufe</span>`
                                      : html`
                                            <div class="flex flex-col gap-4 p-4 border border-divider rounded-md">
                                                <h3>Zwischenrufe an ${name} (absteigend)</h3>
                                                <per-person-screams-list
                                                    .list=${this.screamsAtPerPerson}
                                                    .person=${this.person}
                                                ></per-person-screams-list>
                                            </div>
                                            <expandable-details .details=${calloutsAtDetails}></expandable-details>
                                        `
                              }
                              <h2 class="flex gap-2 mt-8">
                                  Abwesenheiten (${this.missing.missing.length})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-abwesenheiten"}
                                      .obj=${this.missing.missing}
                                      api="/api/missing/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${
                                  this.missing.missing.length == 0
                                      ? nothing
                                      : html`<div class="flex flex-col gap-4 p-4 border border-divider rounded-md">
                                            <canvas id="missing"></canvas>
                                        </div>`
                              }
                              ${
                                  this.missing.missing.length == 0
                                      ? html`<span>Nie abwesend</span>`
                                      : html`<expandable-details .details=${missingDetails}></expandable-details>`
                              }
                              <h2 class="flex gap-2 mt-8">
                                  Taferl (${this.plaques.length})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-taferl"}
                                      .obj=${this.plaques}
                                      api="/api/plaques/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${this.plaques.length == 0 ? nothing : html`<canvas id="plaques"></canvas>`}
                              ${
                                  this.plaques.length == 0
                                      ? html`<span>Keine Taferl</span>`
                                      : html`<expandable-details .details=${plaquesDetails}></expandable-detail>`
                              }
                              <h2 class="flex gap-2 mt-8">
                                  Ordnungsrufe (${this.ordercalls.length})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-ordercalls"}
                                      .obj=${this.ordercalls}
                                      api="/api/ordercalls/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              ${this.ordercalls.length == 0 ? nothing : html`<canvas id="ordercalls"></canvas>`}
                              ${
                                  this.ordercalls.length == 0
                                      ? html`<span>Keine Ordnungsrufe</span>`
                                      : html`<expandable-details .details=${ordercallsDetails}></expandable-details>`
                              }
                            <h2 class="flex gap-2 mt-8">
                                  Namentliche Abstimmungen (${this.rollcalls.length})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-rollcalls"}
                                      .obj=${this.rollcalls}
                                      api="/api/rollcalls/${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              <div class="text-red-400 text-center">Die Extraktion dieser Daten aus den stenographischen Protokollen ist noch in Arbeit. Dementsprechend können die angezeigten Informationen fehlerhaft sein. Mit den Links zum Gegenstand, sowie dem Link zum Redebeitrag können die Informationen mit den Quelldaten verglichen werden.</div>
                              ${this.rollcalls.length == 0 ? html`<span>Keine namentlichen Abstimmungen</span>` : rollcallsDetails}
                              <h2 class="flex gap-2 mt-8">
                                  Redebeiträge (${this.numActualSections})
                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-redebeiträge"}
                                      .obj=${this.sections}
                                      api="/api/sections?person=${this.person.id}"
                                  ></json-api-boxes>
                              </h2>
                              <canvas id="sectionsPerPeriod"></canvas>
                              <div class="flex gap-4 px-4 py-2 border border-[#777] dark:border-[#ccc] rounded-full bg-transparent">
                                <i class="icon w-6 h-6">${searchIcon}</i>
                                <input
                                    class="flex-grow bg-transparent"
                                    id="query"
                                    placeholder="Reden nach Stichwörtern durchsuchen ..."
                                    @input=${() => this.handleQuery()}
                                    @keyup=${() => this.handleQuery()}
                                />
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
                              ${
                                  this.wasSessionPresident
                                      ? html`<div class="flex justify-center items-center">
                                            <label
                                                ><input type="checkbox" id="includeSessionPresident" @change=${() => this.handleQuery()} />
                                                Redebeiträge als Parlamentspräsident:in inkludieren</label
                                            >
                                        </div>`
                                      : nothing
                              }
                              </div>
                              <div class="text-xs text-center italic">
                                  Um ein Wort aus- bzw. unbedingt einzuschließen, <code>'-'</code> oder <code>'+'</code> voransetzen. Z.B.
                                  '+Fristenlösung +Abtreibung' um nur Redebeiträge anzuzeigen, die beide Worte beinhalten. Zur Suche ganzer Phrasen,
                                  die Phrase in Anführungszeichen setzen. Z.B. "Wer schafft die Arbeit?".
                              </div>
                              <div class="text-xs text-center italic">
                                  Auf Gesetzgebungsperioden klicken, um Redebeiträge aus der Periode ein- bzw. auszuschließen.
                              </div>
                              <div class="font-bold flex gap-2 items-center">
                                  Ergebnisse
                                  (${
                                      this.sections.length == this.searchResults.length
                                          ? this.sections.length
                                          : `${this.searchResults.length}/${this.sections.length}`
                                  })

                                  <json-api-boxes
                                      .prefix=${this.person?.name + "-reden-sucheergebnis"}
                                      .obj=${this.searchResults}
                                      api="/api/sections?person=${this.person.id}&${this.periods
                              .filter((period) => period.selected)
                              .map((period) => `period=${period.name}`)
                              .join("&")}&query=${this.querySelector<HTMLInputElement>("#query")?.value.trim() ?? ""}"
                                  ></json-api-boxes>
                              </div>
                              ${this.searching ? html`<loading-spinner></loading-spinner>` : nothing}
                              <section-list .person=${this.person} .list=${this.searchResults}></section-list>`
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
            const includePresidentSection = this.querySelector<HTMLInputElement>("#includeSessionPresident")?.checked ?? true;
            const sectionList = this.querySelector<SectionList>("section-list")!;
            this.searchResults = [
                ...this.sections
                    .filter((item) => this.periods.some((period) => period.selected && period.name == item.period))
                    .filter((item) => {
                        if (item.section.isPresident && !includePresidentSection) return false;
                        return true;
                    }),
            ];
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
