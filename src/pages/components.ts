import { TemplateResult, html, nothing } from "lit";
import { Person, SpeakerSection, partyColors } from "../common/common";
import { repeat } from "lit-html/directives/repeat.js";
import { customElement, property } from "lit/decorators.js";
import { BaseElement } from "../app";
import { arrowRightIcon } from "../utils/icons";
import { download } from "../utils/utils";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

@customElement("section-header")
export class SectionHeader extends BaseElement {
    @property()
    date!: string;

    @property()
    period!: string;

    @property()
    session!: string | number;

    @property()
    section: string | number | undefined;

    @property()
    highlights: string[] = [];

    render() {
        const section = typeof this.section == "string" ? parseInt(this.section) : this.section;
        const hls = new URLSearchParams();
        for (const hl of this.highlights) {
            hls.append("hl", hl);
        }
        return html` <div class="flex items-center">
            <a class="text-blue-400" href="/period/${this.period}">${this.date.split("T")[0]} GP ${this.period}</a>
            <i class="icon w-6 h-6">${arrowRightIcon}</i>
            <a class="text-blue-400" href="/session/${this.period}/${this.session}">Sitzung ${this.session.toString()}</a>
            ${section != undefined
                ? html`<i class="icon w-6 h-6">${arrowRightIcon}</i
                      ><a class="text-blue-400" href="/section/${this.period}/${this.session}/${this.section}?${hls.toString()}"
                          >Redebeitrag ${section + 1}</a
                      >`
                : nothing}
        </div>`;
    }
}

@customElement("session-header")
export class SessionHeader extends BaseElement {
    @property()
    date!: string;

    @property()
    period!: string;

    @property()
    session!: string | number;

    render() {
        return html` <div class="flex gap-2">
            <a class="text-blue-400" href="/session/${this.period}/${this.session}">${this.date.split("T")[0]} GP ${this.period}</a>
        </div>`;
    }
}

export function renderSectionText(section: SpeakerSection, highlights = new Set<string>()) {
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let text = section.text;
    for (const callout of section.callouts.filter((item) => !item.caller)) {
        text = text.replaceAll(callout.text, /*html*/ `<span class="text-violet-700 dark:text-green-500 italic">${callout.text}</span>`);
    }

    for (const callout of section.callouts.filter((item) => item.caller)) {
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
    }

    for (const highlight of highlights) {
        text = text.replaceAll(new RegExp(escapeRegExp(highlight), "gi"), /*html*/ `<span class="bg-red-500 p-[2px] text-[#fff] italic">$&</span>`);
    }

    // FIXME
    // for (const link of section.links) {
    //    text = text.replaceAll(link.label, /*html*/ `<a class="text-blue-400 italic" href="${link.url}">${link.label}</a>`);
    // }
    return html`<div class="whitespace-pre-wrap">${unsafeHTML(text)}</div>`;
}

export function renderSection(
    section: SpeakerSection,
    date: string,
    period: string,
    session: number,
    sectionNumber: number,
    persons: Record<string, Person>,
    highlights: string[]
) {
    const person = typeof section.speaker == "string" ? persons[section.speaker as string] : section.speaker;

    const scrollToHighlight = (target: EventTarget | null, hl: string) => {
        for (const span of Array.from(document.querySelectorAll("span"))) {
            if (span.innerText.toLowerCase() == hl.toLowerCase() && span != target) {
                span.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }
        }
    };

    /*const pagesText = section.pages.length > 1 ? section.pages[0] + "-" + section.pages[section.pages.length - 1] : section.pages[0];
    const pageId = section.pages[0].toString().padStart(4, "0");
    const pageHtml = html` <a
        class="text-blue-400 font-semibold"
        href="https://parlament.gv.at/dokument/${period}/NRSITZ/${session}/SEITE_${pageId}.html"
        >Seiten ${pagesText}</a
    >`;*/

    return html`<div class="flex flex-col gap-4">
        <section-header .date=${date} .period=${period} .session=${session} .section=${sectionNumber}></section-header>
        ${person
            ? html`<a href="/person/${person.id}" class="flex gap-2 items-center text-blue-400">
                  <img class="w-8 h-8 rounded-full shadow-lg object-cover object-center" src=${person.imageUrl} />
                  <span>${person.name}</span>
                  <div class="flex items-center gap-2">${repeat(person.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}</div>
              </a>`
            : nothing}
        ${highlights.length > 0
            ? html` <h3>Highlights im Text</h3>
                  <div class="flex flex-col gap-2">
                      ${repeat(
                          highlights,
                          (hl) =>
                              html`<span
                                  class="cursor-pointer px-4 p-1 border hover:border-primary shadow-md rounded-md italic"
                                  @click=${(ev: Event) => scrollToHighlight(ev.target, hl)}
                                  >${hl}</span
                              >`
                      )}
                  </div>`
            : nothing}
        ${renderSectionText(section, new Set<string>(highlights))}
    </div>`;
}

export function renderSectionCard(
    section: SpeakerSection,
    date: string,
    period: string,
    session: number,
    sectionNumber: number,
    persons: Record<string, Person>,
    highlights: string[]
) {
    return html`<div class="p-4 border border-divider rounded shadow flex flex-col">
        ${renderSection(section, date, period, session, sectionNumber, persons, highlights)}
    </div>`;
}

@customElement("party-badge")
export class PartyBadge extends BaseElement {
    @property()
    party!: string;

    render() {
        const color = partyColors[this.party] ?? "0, 0, 0";
        return html`<div class="p-1 rounded text-xs" style="background-color: rgb(${color}); color: #eee">${this.party}</div>`;
    }
}

@customElement("person-header")
export class PersonHeader extends BaseElement {
    @property()
    person!: Person;

    @property()
    link = false;

    render() {
        return html`<div class="flex items-center">
            ${this.person.imageUrl
                ? html`<img src=${this.person.imageUrl} class="flex-shrink-0 w-24 h-24 rounded-full object-cover object-center shadow-md" />`
                : nothing}
            <div class="flex flex-col px-4">
                <h2 class="flex gap-2">
                    ${this.link ? html`<a href="/person/${this.person.id}" class="text-blue-400">${this.person.name}</a>` : this.person.name}
                    <json-api-boxes .prefix=${this.person.name + "-person"} .obj=${this.person} api="/api/persons/${this.person.id}"></json-api-boxes>
                </h2>
                <div class="flex items-center gap-2">${repeat(this.person.parties, (party) => html`<party-badge .party=${party}></party-badg>`)}</div>
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

@customElement("expandable-details")
export class ExpandableDetails extends BaseElement {
    @property()
    details!: TemplateResult;

    @property()
    shownLabel = "Details verbergen";

    @property()
    hiddenLabel = "Mehr Details anzeigen";

    render() {
        const toggle = (ev: Event) => {
            const target = ev.target as HTMLElement;
            const details = target.parentElement?.querySelector("div")!;
            details.classList.toggle("hidden");
            target.innerText = details.classList.contains("hidden") ? this.hiddenLabel : this.shownLabel;
        };

        return html`<div class="flex flex-col gap-4">
            <button class="button self-center" @click=${(ev: Event) => toggle(ev)}>${this.hiddenLabel}</button>
            <div class="hidden">${this.details}</div>
        </div>`;
    }
}
