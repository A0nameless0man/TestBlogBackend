import { createHmac } from "crypto"

function sign(obj: Object, salt: string): string {
    let s = ''
    switch (typeof obj) {
        case "object":
            const keys: Array<string> = []
            const values: Array<string> = []
            for (const k in obj) {
                keys.push(k)
            }
            keys.sort()
            for (const k of keys) {
                values.push(sign(obj[k], salt))
            }
            s = `{${keys.join("$")}:${values.join("$")}}`
            break;
        case "undefined":
            s = "undefined"
            break;
        default:
            s = JSON.stringify(obj)
            break;
    }
    const sig = createHmac("sha256", salt).update(s).digest("base64url")
    return sig
}

// ucs-2 string to base64 encoded ascii
function utoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
// base64 encoded ascii to ucs-2 string
function atou(str) {
    return decodeURIComponent(escape(atob(str)));
}

function Sign(obj: Object, salt: string): string {
    obj = JSON.parse(JSON.stringify(obj))
    const time = Date.now().toString()
    return `${utoa(JSON.stringify({ obj, time }))}:${sign({ obj, time }, salt)}`
}

function Extract<T>(signStr: string, salt: string, expire: number = 0): T | undefined {
    const part = signStr.split(":")
    if (part.length != 2) {
        return undefined
    }
    try {
        const payload = JSON.parse(atou(part[0]))
        const newSign = sign(payload, salt)
        if (newSign != part[1]) {
            console.log(newSign)
            return undefined
        }
        if (typeof payload.time !== "string") {
            return undefined
        }
        const time = parseInt(payload.time)
        if (isNaN(time)) {
            return undefined
        }
        const curTime = Date.now()
        if (expire !== 0 && (curTime - time) > expire) {
            return undefined
        }
        return payload.obj
    } catch (_) {
        return undefined
    }
}

export { Sign, Extract }