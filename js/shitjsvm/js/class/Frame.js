export class Frame {
    constructor(jClass, code) {
        this.jClass = jClass
        this.ip = 0
        this.code = code
        this.locals = []
        this.stack = []
    }
}
