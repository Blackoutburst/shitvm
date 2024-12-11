import { printBuffer } from "./utils"
import { decode } from "./classLoader"

const fileInput = document.getElementById('fileInput')
const fileOutput = document.getElementById('fileOutput')

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
        const stringified = printBuffer(data.buffer)
        const vClass = decode(data)
        console.log(vClass)

        fileOutput.textContent = stringified
    }

    reader.readAsArrayBuffer(selectedFile)
})
