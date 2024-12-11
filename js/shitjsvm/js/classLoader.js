import { JClass } from "./class/JClass"
import { Constant } from "./class/Constant"
import { Field } from "./class/Field"
import { Attribute } from "./class/Attribute"
import { Method } from "./class/Method"
import {
    CONSTANT_Class,
    CONSTANT_Double, CONSTANT_Fieldref,
    CONSTANT_Float,
    CONSTANT_Integer, CONSTANT_InterfaceMethodref,
    CONSTANT_Long, CONSTANT_Methodref, CONSTANT_NameAndType, CONSTANT_String,
    CONSTANT_Utf8
} from "./const/constNames"

let index = 0

function resolve(constants, i) {
    const c = constants[i]
    if (c == null) throw Error("Invalid constant index: " + i)
    if (c.tag === CONSTANT_Utf8) return c.value.toString()
    if (c.tag === CONSTANT_Class || c.tag === CONSTANT_String) return resolve(constants, c.value)
        throw Error("Invalid constant tag: 0x0" + c.tag.toString(16).toUpperCase())
}

function signature(data) {
    const signature = data.getUint32(index, false)
    index += 4
    if (signature !== 0xCAFEBABE) throw Error("Invalid signature")

    return signature
}

function minor(data) {
    const minor = data.getUint16(index, false)
    index += 2

    return minor
}

function major(data) {
    const major = data.getUint16(index, false)
    index += 2

    return major
}

function constants(data) {
    const constantCount = data.getUint16(index, false)
    index += 2
    const constants = new Array(constantCount)
    for (let i = 1; i < constantCount; i++) {
        const tag = data.getUint8(index)
        index += 1
        switch (tag) {
            case CONSTANT_Utf8:
                const length = data.getUint16(index, false)
                index += 2
                const stringData = new Uint8Array(length)
                for (let j = 0; j < length; j++) {
                    stringData[j] = data.getUint8(index + j)
                }
                index += length

                const decoder = new TextDecoder()
                const stringValue = decoder.decode(stringData)

                constants[i] = new Constant(tag, stringValue)
                break
            case CONSTANT_Integer:
                constants[i] = new Constant(tag, data.getInt32(index, false))
                index += 4
                break
            case CONSTANT_Float:
                constants[i] = new Constant(tag, data.getFloat32(index, false))
                index += 4
                break
            case CONSTANT_Long:
                constants[i] = new Constant(tag, data.getBigInt64(index, false))
                index += 8
                i++
                if (i < constantCount)
                    constants[i] = null
                break
            case CONSTANT_Double:
                constants[i] = new Constant(tag, data.getFloat64(index, false))
                index += 8
                i++
                if (i < constantCount)
                    constants[i] = null
                break
            case CONSTANT_Class: case CONSTANT_String:
                constants[i] = new Constant(tag, data.getUint16(index, false))
                index += 2
                break
            case CONSTANT_Fieldref: case CONSTANT_Methodref: case CONSTANT_InterfaceMethodref:
                const classIndex = data.getUint16(index, false)
                index += 2
                const nameAndTypeIndex = data.getUint16(index, false)
                index += 2
                constants[i] = new Constant(tag, [classIndex, nameAndTypeIndex])
                break
            case CONSTANT_NameAndType:
                const nameIndex = data.getUint16(index, false)
                index += 2
                const descriptorIndex = data.getUint16(index, false)
                index += 2
                constants[i] = new Constant(tag, [nameIndex, descriptorIndex])
                break
            default:
                throw Error("Unknown constant: " + tag.toString(16).toUpperCase())
        }
    }

    return constants
}

function flags(data) {
    const flags = data.getInt16(index)
    index += 2

    return flags
}

function interfaces(data, constants) {
    const interfaceCount = data.getUint16(index, false)
    index += 2
    const interfaces = []
    for (let i = 0; i < interfaceCount; i++) {
        interfaces.push(resolve(constants, data.getUint16(index, false)))
        index += 2
    }

    return interfaces
}

function fields(data, constants) {
    const fieldCount = data.getUint16(index, false)
    index += 2
    const fields = []
    for (let i = 0; i < fieldCount; i++) {
        const flags = data.getUint16(index, false)
        index += 2
        const name = resolve(constants, data.getUint16(index, false))
        index += 2
        const descriptor = resolve(constants, data.getUint16(index, false))
        index += 2
        const attribs = attributes(data, constants)

        fields.push(new Field(flags, name, descriptor, attribs))
    }

    return fields
}

function attributes(data, constants) {
    const attributeCount = data.getUint16(index, false)
    index += 2
    const attributes = []
    for (let i = 0; i < attributeCount; i++) {
        const name = resolve(constants, data.getUint16(index, false))
        index += 2
        const length = data.getInt32(index, false)
        index += 4
        const value = new Uint8Array(length)
        for (let j = 0; j < length; j++) {
            value[j] = data.getUint8(index + j)
        }
        index += length

        attributes.push(new Attribute(
            name,
            value
        ))
    }

    return attributes
}

function methods(data, constants) {
    const methodCount = data.getUint16(index, false)
    index += 2
    const methods = []
    for (let i = 0; i < methodCount; i++) {
        const flags = data.getUint16(index, false)
        index += 2
        const name = resolve(constants, data.getUint16(index, false))
        index += 2
        const descriptor = resolve(constants, data.getUint16(index, false))
        index += 2
        const attribs = attributes(data, constants)

        methods.push(new Method(flags, name, descriptor, attribs))
    }

    return methods
}

export function decode(data) {
    index = 0

    const vClass = new JClass()

    vClass.signature = signature(data)
    vClass.minor = minor(data)
    vClass.major = major(data)
    vClass.constants = constants(data)
    vClass.flags = flags(data)
    vClass.name = resolve(vClass.constants, data.getUint16(index, false))
    index += 2
    vClass.superClass = resolve(vClass.constants, data.getUint16(index, false))
    index += 2
    vClass.interfaces = interfaces(data, vClass.constants)
    vClass.fields = fields(data, vClass.constants)
    vClass.methods = methods(data, vClass.constants)
    vClass.attributes = attributes(data, vClass.constants)

    return vClass
}
