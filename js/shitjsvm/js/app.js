import { printBuffer, printCode } from "./utils"
import { decode } from "./classLoader"
import { createFrame, execute } from "./core"

const fileInput = document.getElementById('fileInput')
const fileOutput = document.getElementById('fileOutput')
const code = document.getElementById('code')
const input = document.getElementById('input')
const output = document.getElementById('output')

fileInput.addEventListener('change', () => {
    const selectedFile = fileInput.files[0]
    if (!selectedFile) return

    const reader = new FileReader()
    reader.onload = (event) => {
        const fileContents = event.target.result
        if (!(fileContents instanceof  ArrayBuffer)) {
            console.log('Invalid data')
            fileOutput.textContent = 'Invalid data'
        }
        const data = new DataView(fileContents)
        const stringifiedBuffer = printBuffer(data.buffer)
        const jClass = decode(data)
        console.log(jClass)
        const frame = createFrame(jClass, "sub", "7", 3)
        console.log(frame)
        const frameOutput = execute(frame)
        const stringifiedCode = printCode(frame.code)

        fileOutput.textContent = "Class data:\n"+stringifiedBuffer
        code.textContent = "Code:\n"+stringifiedCode
        input.textContent = "Input:\nsub, \"7\", 3"
        output.textContent = "Output:\n"+frameOutput
    }

    reader.readAsArrayBuffer(selectedFile)
})
