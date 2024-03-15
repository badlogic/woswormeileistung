import { html, nothing } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { customElement, state } from "lit/decorators.js";
import { Api } from "../api";
import { BaseElement, renderSectionText } from "../app";
import { Person, SessionSection } from "../common/common";
import { arrowLeftIcon } from "../utils/icons";
import { router } from "../utils/routing";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";
import { downloadFile } from "../utils/utils";

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

            const response = await Api.section(period, session, section);
            if (response instanceof Error) throw response;
            this.section = response;
        } catch (e) {
            alert("Sorry, das ist etwas schief gelaufen");
        } finally {
            this.loading = false;
        }
    }

    render() {
        // prettier-ignore
        const text = this.section ? html`<div id="section" class="p-4 border border-divider rounded-md whitespace-pre-wrap">${unsafeHTML(renderSectionText(this.section.section))}</div>` : nothing;
        const speaker = this.section ? (this.section.section.speaker as Person) : undefined;

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
                    ${!this.loading
                        ? html`<div class="flex flex-col gap-4">
                              <h2 class="flex gap-2">
                                  Redebeitrag
                                  <json-api-boxes
                                      .prefix=${speaker?.name + "-redebeitrag"}
                                      .obj=${this.section}
                                      api="/api/section/${this.section.period}/${this.section.session}/${this.section.sectionIndex}"
                                  ></json-api-boxes>
                              </h2>
                              <section-header
                                  .date=${this.section.date}
                                  .period=${this.section.period}
                                  .session=${this.section.session}
                                  .section=${this.section.sectionIndex}
                              ></section-header>
                              <person-header .person=${this.section.section.speaker}></person-header>
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
