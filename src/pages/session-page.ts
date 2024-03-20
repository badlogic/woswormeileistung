import { html, nothing } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { customElement, state } from "lit/decorators.js";
import { Api } from "../api";
import { BaseElement, renderSectionText } from "../app";
import { Person, Session, SessionSection, SpeakerSection } from "../common/common";
import { arrowLeftIcon, arrowRightIcon, logoIcon } from "../utils/icons";
import { router } from "../utils/routing";
import { pageContainerStyle, pageContentStyle } from "../utils/styles";
import { downloadFile } from "../utils/utils";
import { repeat } from "lit-html/directives/repeat.js";
import { renderSection, renderSectionCard } from "./components";

@customElement("session-page")
export class SessionPage extends BaseElement {
    @state()
    loading = true;

    @state()
    period!: string;

    @state()
    session!: { persons: Record<string, Person>; session: Session };

    @state()
    numSections = 0;

    @state()
    highlights: string[] = [];

    persons = new Map<string, Person>();

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

            const response = await Api.session(period, session);
            if (response instanceof Error) throw response;
            this.session = response;
        } catch (e) {
            alert("Sorry, das ist etwas schief gelaufen");
        } finally {
            this.loading = false;
        }
    }

    render() {
        const session = this.session?.session;
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
                              <h2 class="flex gap-2">
                                  ${session.date.split("T")[0]} GP ${session.period} Sitzung ${session.sessionNumber}
                                  <json-api-boxes
                                      .prefix=${session.date + "-" + session.period + "-" + session.sessionNumber + "-sitzung"}
                                      .obj=${this.session}
                                      api="/api/session/${session.period}/${session.sessionNumber}"
                                  ></json-api-boxes>
                              </h2>
                              <a
                                  class="text-blue-400 font-semibold"
                                  href="https://parlament.gv.at/gegenstand/${session.period}/NRSITZ/${session.sessionNumber}"
                                  >Parlamentsseite</a
                              >
                              ${repeat(session.sections, (section, index) =>
                                  renderSectionCard(section, session.date, session.period, session.sessionNumber, index, this.session.persons, [])
                              )}
                          </div>`
                        : nothing}
                </div>
                <page-footer></page-footer>
            </div>
        </div>`;
    }
}
