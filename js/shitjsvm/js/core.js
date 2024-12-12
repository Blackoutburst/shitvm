import { Frame } from "./class/Frame"
import { iload_0, iload_1, iload_2, iload_3, iadd, ireturn } from "./const/instructionName"

export function createFrame(jClass, method, ...args) {
    for (const m of jClass.methods) {
        if (m.name !== method) continue
        for (const a of m.attributes) {
            if (a.name === "Code" && a.data.length > 8) {
                const view = new DataView(a.data.buffer)
                const maxStack = view.getInt16(0, false)
                const maxLocal = view.getInt16(2, false)
                const codeLength = view.getInt32(4, false)
                const frame = new Frame(
                    maxStack,
                    maxLocal,
                    codeLength,
                    jClass,
                    a.data.slice(8, 8 + codeLength)
                )
                frame.locals = args
                return frame
            }
        }
    }
    return null
}

export function execute(frame) {
    while (true) {
        const op = frame.code[frame.ip]
        switch (op) {
            case iload_0:
                frame.stack.push(frame.locals[0])
                break
            case iload_1:
                frame.stack.push(frame.locals[1])
                break
            case iload_2:
                frame.stack.push(frame.locals[2])
                break
            case iload_3:
                frame.stack.push(frame.locals[3])
                break
            case iadd:
                const a = frame.stack.pop()
                const b = frame.stack.pop()
                frame.stack.push(a + b)
                break
            case ireturn:
                return frame.stack.pop()
        }
        frame.ip++
    }
}
