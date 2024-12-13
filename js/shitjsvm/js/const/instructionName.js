export const nop = 0x00
export const iload_0 = 0x1A
export const iload_1 = 0x1B
export const iload_2 = 0x1C
export const iload_3 = 0x1D
export const iadd = 0x60
export const ireturn = 0xAC
export const iconst_m1 = 0x02
export const iconst_0 = 0x03
export const iconst_1 = 0x04
export const iconst_2 = 0x05
export const iconst_3 = 0x06
export const iconst_4 = 0x07
export const iconst_5 = 0x08
export const lconst_0 = 0x09
export const lconst_1 = 0x0A
export const aconst_null = 0x01
export const isub = 0x64


export const mappings = new Map()
mappings.set(0x00, "nop")
mappings.set(0x1A, "iload_0")
mappings.set(0x1B, "iload_1")
mappings.set(0x1C, "iload_2")
mappings.set(0x1D, "iload_3")
mappings.set(0x60, "iadd")
mappings.set(0xAC, "ireturn")
mappings.set(0x02, "iconst_m1")
mappings.set(0x03, "iconst_0")
mappings.set(0x04, "iconst_1")
mappings.set(0x05, "iconst_2")
mappings.set(0x06, "iconst_3")
mappings.set(0x07, "iconst_4")
mappings.set(0x08, "iconst_5")
mappings.set(0x09, "lconst_0")
mappings.set(0x0A, "lconst_1")
mappings.set(0x01, "aconst_null")
mappings.set(0x64, "isub")
