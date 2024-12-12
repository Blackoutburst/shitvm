export class Frame {
    constructor(maxStack, maxLocal, codeLength, jClass, code) {
        this.maxStack = maxStack
        this.maxLocal = maxLocal
        this.jClass = jClass
        this.codeLength = codeLength
        this.ip = 0
        this.code = code
        this.locals = []
        this.stack = []
    }
}
