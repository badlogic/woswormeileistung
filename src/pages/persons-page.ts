import { html, nothing } from "lit";
import { repeat } from "lit-html/directives/repeat.js";
import { customElement, state } from "lit/decorators.js";
import { Api } from "../api";
import { BaseElement } from "../app";
import { Person } from "../common/common";
import { arrowLeftIcon } from "../utils/icons";
import { router } from "../utils/routing";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";

@customElement("persons-page")
export class PersonsPage extends BaseElement {
    @state()
    searchResults: { score: number; person: Person }[] = [];

    @state()
    searching = false;

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
                    <h1 class="text-center">Personen Recherche</h1>
                    <input
                        id="query"
                        class="px-4 py-2 border border-divider rounded-full bg-transparent"
                        placeholder="Person per Name suchen ..."
                        @input=${() => this.handleQuery()}
                        @keyup=${() => this.handleQuery()}
                    />
                    ${this.searching ? html`<loading-spinner></loading-spinner>` : nothing}
                    <div class="flex flex-col gap-8">
                        ${repeat(
                            this.searchResults,
                            (result) => result.person.id,
                            (result) => html`
                                <a class="flex items-center" href="/person/${result.person.id}">
                                    ${result.person.imageUrl
                                        ? html`<img
                                              src=${result.person.imageUrl}
                                              class="flex-shrink-0 w-24 h-24 rounded-full object-cover object-center shadow-md"
                                          />`
                                        : nothing}
                                    <div class="flex flex-col px-4">
                                        <h2>${result.person.name}</h2>
                                        <span>${result.person.parties.join(", ")}</span>
                                        <span class="text-xs">Gesetzgebungs-Perioden: ${result.person.periods.join(", ")}</span>
                                    </div>
                                </a>
                            `
                        )}
                    </div>
                </div>
                <span class="text-xs text-center text-fg-muted pb-4 mt-8"
                    >Mit Spucke und Tixo gebaut von <a href="https://twitter.com/badlogicgames" class="text-blue-400">Mario Zechner</a><br />Es werden
                    keine Daten gesammelt, nicht einmal deine IP Adresse</span
                >
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
            if (query.length == 0) {
                this.searchResults = [];
            }
            const response = await Api.person(query);
            if (response instanceof Error) {
                alert("Sorry, da ist etwas schief gelaufen");
                return;
            }
            this.searchResults = response;
        } finally {
            this.searching = false;
        }
    }
}
