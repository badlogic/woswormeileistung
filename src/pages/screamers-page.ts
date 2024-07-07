import { PropertyValueMap, TemplateResult, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElement, ExpandableList } from "../app";
import { logoIcon } from "../utils/icons";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";
import { MissingEntry, PeriodScream, Person, periodDates } from "../common/common";
import { repeat } from "lit-html/directives/repeat.js";
import { Api } from "../api";
import { filter } from "compression";

@customElement("screamers-page")
export class ScreamersPage extends BaseElement {
    @state()
    loading = true;

    @state()
    periods = periodDates.map((period) => {
        return { ...period, selected: true };
    });

    @state()
    personScreams: { person: Person; screams: PeriodScream[] }[] = [];

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        this.periods.forEach((p, i) => (p.selected = i == this.periods.length - 1));
        this.load();
    }

    async load() {
        try {
            {
                const result = await Api.screamers();
                if (result instanceof Error) throw result;
                this.personScreams = result;
            }
        } catch (e) {
            alert("Sorry, das ist etwas schief gelaufen");
        } finally {
            this.loading = false;
        }
    }

    filterPersonScreams(personScreams: { person: Person; screams: PeriodScream[] }, periods: Set<string>) {
        const filteredScreams = personScreams.screams.filter((scream) => periods.has(scream.period));
        const numScreams = filteredScreams.reduce((sum, scream) => sum + scream.numScreams, 0);
        return { person: personScreams.person, numScreams };
    }

    render() {
        const selectedPeriods = new Set(this.periods.filter((period) => period.selected).map((period) => period.name));
        const filteredScreams = this.personScreams
            .map((scream) => this.filterPersonScreams(scream, selectedPeriods))
            .filter((scream) => scream.numScreams > 0)
            .sort((a, b) => b.numScreams - a.numScreams);
        const maxScreams = filteredScreams.reduce((max, scream) => Math.max(max, scream.numScreams), -Infinity);

        return html`<div class="${pageContainerStyle} min-h-[100vh]">
            <div class="${pageContentStyle} h-[100vh]">
                <div class="flex-grow flex flex-col w-full mt-4 gap-4 px-4 pb-4">
                    <div class="flex">
                        <a href="/" class="flex items-center gap-2 font-semibold"><i class="icon w-6">${logoIcon}</i> Wos wor mei Leistung?</a>
                        <theme-toggle class="ml-auto"></theme-toggle>
                    </div>
                    ${this.loading ? html`<loading-spinner></loading-spinner>` : nothing}
                    ${this.personScreams.length > 0
                        ? html`
                        <h2>Zwischenrufe von Personen</h2>
                        <div class="text-xs text-center italic">
                            Personen sortiert nach Zahl der Zwischenrufe, die sie in den selektierten Gesetzgebungsperioden getätigt haben.
                            Gesetzgebungsperiode anklicken, um sie aus- bzw. einzuschließen. Auf "Anzeige" im Balken für eine Person klicken, um Details
                            und Quellennachweise anzuzeigen.
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
                                        }}
                                    >
                                        <span class="text-center">${item.name}</span
                                        ><span class="text-center" style="font-size: 8px;">${item.dates}</span>
                                    </div>`
                            )}
                        </div>
                        <person-screams-list .list=${filteredScreams} .maxScreams=${maxScreams}></persons-screams-list>
                          `
                        : nothing}
                </div>
            </div>
        </div> `;
    }
}

@customElement("person-screams-list")
export class PersonScreamsList extends ExpandableList<{ person: Person; numScreams: number }> {
    @property()
    person!: Person;

    @property()
    maxScreams: number = 0;

    constructor() {
        super();
        this.numVisible = 10;
        this.stepSize = 10;
    }

    itemId(item: { person: Person; numScreams: number }): string {
        return item.person.id;
    }

    renderItem(item: { person: Person; numScreams: number }): TemplateResult {
        return html`<div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <a href="/person/${item.person.id}" class="flex gap-2 items-center text-blue-400">
                    <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${item.person.imageUrl} />
                    <span>${item.person.name}</span>
                    <div class="flex items-center gap-2">
                        ${repeat(item.person.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}
                    </div>
                </a>
            </div>
            <div
                class="px-4 h-8 flex items-center rounded-md border gap-2 cursor-pointer"
                style="background-color: rgba(54, 162, 235, 0.2); border-color: rgba(54, 162, 235, 1); width: ${(
                    (100 * item.numScreams) /
                    this.maxScreams
                ).toFixed(0)}%;"
            >
                <a href="/person/${item.person.id}#screams">Anzeigen</a>
                <span class="ml-auto">${item.numScreams}</span>
            </div>
        </div>`;
    }
}
