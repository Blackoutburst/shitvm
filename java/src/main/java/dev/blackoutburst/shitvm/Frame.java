package dev.blackoutburst.shitvm;

import java.util.ArrayList;
import java.util.List;

public class Frame {
    VClass vclass;
    int ip;
    byte[] code;
    List<Object> locals;
    List<Object> stack;

    public Frame(VClass vclass, int ip, byte[] code) {
        this.vclass = vclass;
        this.ip = ip;
        this.code = code;
        this.locals = new ArrayList<>();
        this.stack = new ArrayList<>();
    }
}
