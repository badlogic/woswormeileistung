import { html, nothing } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { customElement, state } from "lit/decorators.js";
import { Api } from "../api";
import { BaseElement, renderSectionText } from "../app";
import { Person, SessionSection } from "../common/common";
import { arrowLeftIcon, arrowRightIcon, logoIcon } from "../utils/icons";
import { router } from "../utils/routing";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";
import { downloadFile } from "../utils/utils";
import { repeat } from "lit-html/directives/repeat.js";

@customElement("section-page")
export class SectionPage extends BaseElement {
    @state()
    loading = true;

    @state()
    period!: string;

    @state()
    session!: number;

    @state()
    sectionNumber!: number;

    @state()
    section!: SessionSection;

    @state()
    numSections = 0;

    @state()
    highlights: string[] = [];

    constructor() {
        super();
        this.highlights = new URLSearchParams(document.location.search).getAll("hl") ?? [];
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.load();
    }

    async load() {
        try {
            const period = router.getCurrentParams()?.get("period");
            if (!period) throw new Error();
            const session = router.getCurrentParams()?.get("session");
            if (!session) throw new Error();
            const section = router.getCurrentParams()?.get("section");
            if (!section) throw new Error();

            let sectionResult: SessionSection | undefined;
            {
                const response = await Api.section(period, session, section);
                if (response instanceof Error) throw response;
                sectionResult = response;
            }

            {
                const response = await Api.numSections(period, session);
                if (response instanceof Error) throw response;
                this.numSections = response;
            }

            this.section = sectionResult;
            this.session = parseInt(session);
        } catch (e) {
            alert("Sorry, das ist etwas schief gelaufen");
        } finally {
            this.loading = false;
        }
    }

    render() {
        const text = this.section
            ? html`<div id="section" class="p-4 border border-divider rounded-md">
                  ${renderSectionText(this.section.section, new Set<string>(this.highlights))}
              </div>`
            : nothing;
        const speaker = this.section ? (this.section.section.speaker as Person) : undefined;

        const scrollToHighlight = (target: EventTarget | null, hl: string) => {
            for (const span of Array.from(document.querySelectorAll("span"))) {
                if (span.innerText.toLowerCase() == hl.toLowerCase() && span != target) {
                    span.scrollIntoView({ behavior: "smooth", block: "center" });
                    return;
                }
            }
        };

        return html`<div class="${pageContainerStyle} min-h-[100vh]">
            <div class="${pageContentStyle} h-[100vh]">
                <div class="flex-grow flex flex-col w-full mt-4 gap-4 px-4">
                    <div class="flex">
                        <a href="/" class="flex items-center gap-2 font-semibold"><i class="icon w-6">${logoIcon}</i> Wos wor mei Leistung?</a>
                        <theme-toggle class="ml-auto"></theme-toggle>
                    </div>
                    ${this.loading ? html`<loading-spinner></loading-spinner>` : nothing}
                    ${!this.loading
                        ? html`<div class="flex flex-col gap-4">
                              <div class="flex items-center">
                                  ${this.section.sectionIndex > 0
                                      ? html`<a
                                            href="/section/${this.section.period}/${this.section.session}/${this.section.sectionIndex - 1}"
                                            class="cursor-pointer button-muted px-2 py-1 border border-divider rounded text-sm font-semibold flex gap-2 items-center"
                                            ><i class="icon w-4 h-4">${arrowLeftIcon}</i>Vorige Rede</a
                                        >`
                                      : nothing}
                                  ${this.section.sectionIndex < this.numSections - 1
                                      ? html`<a
                                            href="/section/${this.section.period}/${this.section.session}/${this.section.sectionIndex + 1}"
                                            class="ml-auto cursor-pointer button-muted px-2 py-1 border border-divider rounded text-sm font-semibold flex gap-2 items-center"
                                            >Nächste Rede<i class="icon w-4 h-4">${arrowRightIcon}</i></a
                                        >`
                                      : nothing}
                              </div>
                              <h2 class="flex gap-2">
                                  Redebeitrag
                                  <json-api-boxes
                                      .prefix=${speaker?.name + "-redebeitrag"}
                                      .obj=${this.section}
                                      api="/api/section/${this.section.period}/${this.section.session}/${this.section.sectionIndex}"
                                  ></json-api-boxes>
                              </h2>
                              <person-header .person=${this.section.section.speaker} .link=${true}></person-header>
                              <section-header
                                  .date=${this.section.date}
                                  .period=${this.section.period}
                                  .session=${this.section.session}
                                  .section=${this.section.sectionIndex}
                              ></section-header>
                              ${this.highlights.length > 0
                                  ? html` <h3>Highlights im Text</h3>
                                        <div class="flex flex-col gap-2">
                                            ${repeat(
                                                this.highlights,
                                                (hl) =>
                                                    html`<span
                                                        class="cursor-pointer px-4 p-1 border hover:border-primary shadow-md rounded-md italic"
                                                        @click=${(ev: Event) => scrollToHighlight(ev.target, hl)}
                                                        >${hl}</span
                                                    >`
                                            )}
                                        </div>`
                                  : nothing}
                              ${text}
                          </div>`
                        : nothing}
                </div>
                <page-footer></page-footer>
            </div>
        </div>`;
    }

    download(suffix: string, obj: any) {
        const person = this.section.section.speaker as Person;
        const prefix = person.name.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
        downloadFile(prefix + "-" + suffix + ".json", JSON.stringify(obj, null, 2));
    }
}
