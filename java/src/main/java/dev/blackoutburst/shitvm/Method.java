package dev.blackoutburst.shitvm;

import java.util.List;

public class Method {
    short flags;
    String name;
    String descriptor;
    List<Attribute> attributes;

    public Method(short flags, String name, String descriptor, List<Attribute> attributes) {
        this.flags = flags;
        this.name = name;
        this.descriptor = descriptor;
        this.attributes = attributes;
    }
}
