import { printBuffer, printCode } from "./utils"
import { decode } from "./classLoader"
import { createFrame, execute } from "./core"

const fileInput = document.getElementById('fileInput')
const fileOutput = document.getElementById('fileOutput')
const code = document.getElementById('code')
const buttonContainer = document.getElementById('methodButtons')
const buttonHeader = document.getElementById('methodButtonsHeader')
const inputContainer = document.getElementById('methodInputs')
const inputHeader = document.getElementById('methodInputsHeader')
const computeButton = document.getElementById('computeButton')
const outputText = document.getElementById('outputText')

let method = ""

fileInput.addEventListener('change', () => {
    const selectedFile = fileInput.files[0]
    if (!selectedFile) return

    const reader = new FileReader()
    reader.onload = (event) => {
        const fileContents = event.target.result
        if (!(fileContents instanceof  ArrayBuffer)) {
            alert('Invalid data')
            fileOutput.textContent = 'Invalid data'
        }
        const data = new DataView(fileContents)
        const stringifiedBuffer = printBuffer(data.buffer)
        fileOutput.textContent = "Class data:\n"+stringifiedBuffer

        const jClass = decode(data)

        buttonHeader.textContent = "Available methods in " + fileInput.files[0].name
        jClass.methods.forEach(m => {
            const button = document.createElement('button')
            button.textContent = m.name
            button.addEventListener('click', () => {
                method = m.name
                const descriptorReg = /\(([^)]+)\)/g
                const classReg = /L(.*?);/g
                const argsCount = descriptorReg
                    .exec(m.descriptor)?.[0]
                    ?.slice(1, -1)
                    ?.replace("[", "")
                    ?.replace(classReg, "L")
                    ?.length ?? 0

                const tmp = createFrame(jClass, m.name)
                code.textContent = m.name +" code:\n" + printCode(tmp.code)
                inputHeader.textContent = "Input:"
                inputContainer.innerHTML = ""
                for (let i = 0; i < argsCount; i++) {
                    const input = document.createElement('input')
                    input.type = "text"
                    inputContainer.appendChild(input)
                }
                computeButton.innerHTML = ""
                const compute = document.createElement('button')
                compute.textContent = "Compute"
                compute.addEventListener('click', () => {
                    const inputs = inputContainer.querySelectorAll('input')
                    const values = Array.from(inputs).map(input => Number(input.value))
                    const frame = createFrame(jClass, method, ...values)
                    outputText.textContent = execute(frame)
                })

                computeButton.appendChild(compute)
            })
            buttonContainer.appendChild(button)
        })

    }

    reader.readAsArrayBuffer(selectedFile)
})
