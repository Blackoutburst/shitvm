package dev.blackoutburst.shitvm;

import java.util.ArrayList;
import java.util.List;

public class VClass {
    int signature;
    short minor;
    short major;
    String name;
    String superClass;
    int flags;
    List<Constant> constants = new ArrayList<>();
    List<String> interfaces = new ArrayList<>();
    List<Field> fields = new ArrayList<>();
    List<Method> methods = new ArrayList<>();
    List<Attribute> attributes = new ArrayList<>();

}
