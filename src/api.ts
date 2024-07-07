import {
    MissingPerson,
    Person,
    Plaque,
    PlaqueCallout,
    SessionSection,
    SpeakerSection,
    SectionScreams,
    Ordercall,
    Session,
    Rollcall,
    PeriodScream,
} from "./common/common.js";
import { error } from "./utils/utils.js";

export interface JsonValue {
    [key: string]: any;
}

function apiBaseUrl() {
    if (typeof location === "undefined") return "http://localhost:3333/api/";
    return location.href.includes("localhost") || location.href.includes("192.168.1") ? `http://${location.hostname}:3333/api/` : "/api/";
}

export async function apiGet<T>(endpoint: string) {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return (await result.json()) as T;
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export async function apiGetBlob(endpoint: string): Promise<Blob | Error> {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return await result.blob();
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export async function apiGetText(endpoint: string): Promise<string | Error> {
    try {
        const result = await fetch(apiBaseUrl() + endpoint);
        if (!result.ok) throw new Error();
        return await result.text();
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export async function apiPost<T>(endpoint: string, params: URLSearchParams | FormData) {
    let headers: HeadersInit = {};
    let body: string | FormData;

    if (params instanceof URLSearchParams) {
        headers = { "Content-Type": "application/x-www-form-urlencoded" };
        body = params.toString();
    } else {
        body = params;
    }
    try {
        const result = await fetch(apiBaseUrl() + endpoint, {
            method: "POST",
            headers: headers,
            body: body,
        });
        if (!result.ok) throw new Error();
        return (await result.json()) as T;
    } catch (e) {
        return error(`Request /api/${endpoint} failed`, e);
    }
}

export function toUrlBody(params: JsonValue) {
    const urlParams = new URLSearchParams();
    for (const key in params) {
        const value = params[key];
        const type = typeof value;
        if (type == "string" || type == "number" || type == "boolean") {
            urlParams.append(key, value.toString());
        } else if (typeof value == "object") {
            urlParams.append(key, JSON.stringify(value));
        } else {
            throw new Error("Unsupported value type: " + typeof value);
        }
    }
    return urlParams;
}

export class Api {
    static async person(idOrQuery: string) {
        return await apiGet<{ score: number; person: Person }[]>("persons/" + encodeURIComponent(idOrQuery));
    }

    static async personSections(id: string, periods: string[]) {
        const params = new URLSearchParams();
        params.append("person", id);
        for (const period of periods) {
            params.append("period", period);
        }
        return await apiGet<{ sections: SessionSection[] }>("sections?" + params.toString());
    }

    static async personPlaques(id: string) {
        return await apiGet<PlaqueCallout[]>("plaques/" + encodeURIComponent(id));
    }

    static async personMissing(id: string) {
        return await apiGet<MissingPerson>("missing/" + +encodeURIComponent(id));
    }

    static async screamers() {
        return await apiGet<{ person: Person; screams: PeriodScream[] }[]>("screams");
    }

    static async personScreams(id: string) {
        const params = new URLSearchParams();
        params.append("person", id);
        return await apiGet<SectionScreams[]>("screams/" + +encodeURIComponent(id));
    }

    static async personScreamsAt(id: string) {
        const params = new URLSearchParams();
        params.append("person", id);
        return await apiGet<SectionScreams[]>("screamsat/" + +encodeURIComponent(id));
    }

    static async personOrdercalls(id: string) {
        return await apiGet<Ordercall[]>("ordercalls/" + +encodeURIComponent(id));
    }

    static async personRollcalls(id: string) {
        return await apiGet<Rollcall[]>("rollcalls/" + +encodeURIComponent(id));
    }

    static async section(period: string, session: number | string, section: number | string) {
        return await apiGet<SessionSection>(`section/${period}/${session}/${section}`);
    }

    static async numSections(period: string, session: number | string) {
        return await apiGet<number>(`sessions/${period}/${session}?numSections=true`);
    }

    static async session(period: string, session: number | string) {
        const result = await apiGet<{ persons: Record<string, Person>; session: Session }>(`session/${period}/${session}`);
        if (result instanceof Error) return result;
        return result;
    }
}
