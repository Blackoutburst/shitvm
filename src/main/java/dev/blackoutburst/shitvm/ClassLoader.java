package dev.blackoutburst.shitvm;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ClassLoader {

    private String resolve(List<Constant> constants, int index) {
        Constant c = constants.get(index);
        if (c == null) return "unknown";
        if (c.tag == 0x01) {
            return (String) c.value;
        } else {
            return "unknown";
        }
    }


    private List<Constant> constants(ByteBuffer data) throws Exception {
        short constantCount = data.getShort();
        List<Constant> constants = new ArrayList<>(Collections.nCopies(constantCount, null));
        for (int i = 1; i < constantCount; i++) {
            byte tag = data.get();
            switch (tag) {
                case 0x01:
                    byte[] stringData = new byte[data.getShort() & 0xFFFF];
                    data.get(stringData);
                    constants.set(i,new Constant(tag, new String(stringData)));
                    break;
                case 0x03:
                    constants.set(i,new Constant(tag, data.getInt()));
                    break;
                case 0x04:
                    constants.set(i,new Constant(tag, data.getFloat()));
                    break;
                case 0x05:
                    constants.set(i,new Constant(tag, data.getLong()));
                    i++;
                    if (i < constantCount) {
                        constants.set(i, null);
                    }
                    break;
                case 0x06:
                    constants.set(i,new Constant(tag, data.getDouble()));
                    i++;
                    if (i < constantCount) {
                        constants.set(i, null);
                    }
                    break;
                case 0x07, 0x08:
                    constants.set(i,new Constant(tag, data.getShort() & 0xFFFF));
                    break;
                case 0x09, 0x0A, 0x0B:
                    int classIndex = data.getShort() & 0xFFFF;
                    int nameAndTypeIndex = data.getShort() & 0xFFFF;
                    constants.set(i,new Constant(tag, new int[]{classIndex, nameAndTypeIndex}));
                    break;
                case 0x0C:
                    int nameIndex = data.getShort() & 0xFFFF;
                    int descriptorIndex = data.getShort() & 0xFFFF;
                    constants.set(i,new Constant(tag, new int[]{nameIndex, descriptorIndex}));
                    break;
                default:
                    throw new Exception("Unknown constant pool tag: " + tag);
            }
        }

        return constants;
    }

    private List<String> interfaces(ByteBuffer data, List<Constant> constants) {
        List<String> interfaces = new ArrayList<>();
        short interfaceCount = data.getShort();
        for (int i = 0; i < interfaceCount; i++) {
            interfaces.add(resolve(constants, data.getShort()));
        }

        return interfaces;
    }

    private List<Field> fields(ByteBuffer data, List<Constant> constants) {
        List<Field> fields = new ArrayList<>();
        short fieldCount = data.getShort();
        for (int i = 0; i < fieldCount; i++) {
            fields.add(new Field(
                    data.getShort(),
                    resolve(constants, data.getShort()),
                    resolve(constants, data.getShort()),
                    attributes(data, constants)
            ));
        }

        return fields;
    }

    private List<Attribute> attributes(ByteBuffer data, List<Constant> constants) {
        short attributeCount = data.getShort();
        List<Attribute> attribs = new ArrayList<>();
        for (int i = 0; i < attributeCount; i++) {
            String name = resolve(constants, data.getShort());
            byte[] value = new byte[data.getInt()];
            data.get(value);

            attribs.add(new Attribute(
                    name,
                    value
            ));
        }

        return attribs;
    }

    private List<Method> methods(ByteBuffer data, List<Constant> constants) {
        List<Method> methods = new ArrayList<>();
        short methodCount = data.getShort();
        for (int i = 0; i < methodCount; i++) {
            short accessFlags = data.getShort();
            String name = resolve(constants, data.getShort());
            String descriptor = resolve(constants, data.getShort());
            List<Attribute> attributes = attributes(data, constants);

            methods.add(new Method(accessFlags, name, descriptor, attributes));
        }
        return methods;
    }


    private Frame createFrame(VClass vClass, String method, Object... args) {
        for (Method m : vClass.methods) {
            if (!m.name.equals(method)) continue;
            for (Attribute a : m.attributes) {
                if (a.name.equals("Code") && a.data.length > 8) {
                    Frame frame = new Frame(
                            vClass,
                            0,
                            Arrays.copyOfRange(a.data, 8, a.data.length)
                    );
                    frame.locals.addAll(Arrays.asList(args));
                    return frame;
                }
            }
        }
        return null;
    }

    private Object execute(Frame frame) {
        while (true) {
            byte op = frame.code[frame.ip];
            System.out.println(op);
            switch (op) {
                case 26:
                    frame.stack.add(frame.locals.get(0));
                    break;
                case 27:
                    frame.stack.add(frame.locals.get(1));
                    break;
                case 96:
                    int a = (int) frame.stack.getLast();
                    frame.stack.removeLast();
                    int b = (int) frame.stack.getLast();
                    frame.stack.removeLast();
                    frame.stack.add(a + b);
                    break;
                case 100:
                    int a2 = (int) frame.stack.getLast();
                    frame.stack.removeLast();
                    int b2 = (int) frame.stack.getLast();
                    frame.stack.removeLast();
                    frame.stack.add(a2 - b2);
                    break;
                case -84:
                    Object v = frame.stack.getLast();
                    frame.stack.removeLast();
                    return v;
            }
            frame.ip++;
        }
    }

    public VClass decode(ByteBuffer data) throws Exception {
        VClass vClass = new VClass();
        vClass.signature = data.getInt();
        if (vClass.signature != 0xCAFEBABE) throw new Exception();
        vClass.minor = data.getShort();
        vClass.major = data.getShort();
        vClass.constants = constants(data);
        vClass.flags = data.getShort();
        vClass.name = resolve(vClass.constants, data.getShort());
        vClass.superClass = resolve(vClass.constants, data.getShort());
        vClass.interfaces = interfaces(data, vClass.constants);
        vClass.fields = fields(data, vClass.constants);
        vClass.methods = methods(data, vClass.constants);
        vClass.attributes = attributes(data, vClass.constants);

        System.out.println("Signature: " + vClass.signature);
        System.out.println("Minor: " + vClass.minor);
        System.out.println("Major: " + vClass.major);
        System.out.println("Name: " + vClass.name);
        System.out.println("Super: " + vClass.superClass);
        System.out.println("Flags: " + vClass.flags);
        System.out.print("Fields: ");
        for (Field m : vClass.fields) {
            System.out.print(m.name + ", ");
        }
        System.out.println();
        System.out.println("Methods: ");
        for (Method m : vClass.methods) {
            System.out.println(m.name);
            System.out.println("Methods Attributes: ");
            for (Attribute a : m.attributes) {
                System.out.print(a.name + ", ");
            }
        }
        System.out.println();
        System.out.print("Class Attributes: ");
        for (Attribute m : vClass.attributes) {
            System.out.print(m.name + ", ");
        }
        System.out.println();

        Frame frame = createFrame(vClass, "sub", 30, 24);
        int result = (int) execute(frame);
        System.out.println("Result:" + result);
        return vClass;
    }

    public ByteBuffer loadClass(String className) throws IOException {
        return ByteBuffer.wrap(Files.readAllBytes(Path.of(className)));
    }
}
