import { mappings } from "./const/instructionName"

export function printBuffer(data) {
    let output = ""
    new Uint8Array(data).forEach((b, i) => {
        let c = b.toString(16).toUpperCase()
        if (c.length === 1) c = 0+c
        output += c + ' '
        if (!((i+1) % 16)) output += '\n'
    })

    return output
}

export function printCode(data) {
    let output = ""
    data.forEach(c => {
        output += mappings.get(c) + '\n'
    })

    return output
}
