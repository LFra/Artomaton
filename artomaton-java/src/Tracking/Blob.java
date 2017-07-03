package Tracking;
/**
 * Created by ludwigfrank on 08/02/2017.
 */
import processing.core.PApplet;
import processing.core.PConstants;
import processing.core.PImage;
import processing.core.PVector;
import java.util.ArrayList;
import java.util.List;

class Blob {
    private PApplet p;
    private Variables variables = new Variables();

    private float minx;
    private float miny;
    private float maxx;
    private float maxy;

    int id = 0;
    ArrayList<PVector> positionValues = new ArrayList<>();

    int lifespan = variables.getMaxLife();

    boolean taken = false;

    Blob(float x, float y, PApplet parent) {
        this.minx = x;
        this.miny = y;
        this.maxx = x;
        this.maxy = y;

        p = parent;
    }

    boolean checkLife() {
        lifespan--;
        return lifespan < 0;
    }


    void show() {
        p.stroke(100);
        p.fill(255, lifespan);
        p.strokeWeight(2);
        p.rectMode(PConstants.CORNERS);
        p.rect(minx, miny, maxx, maxy);

        p.textAlign(PConstants.CENTER);
        p.textSize(64);
        p.fill(100);
        int minmax = (int) (minx + (maxx-minx)*0.5);

        p.text(id, minmax, maxy - 10);
        p.textSize(32);
        p.text(lifespan, minmax, miny - 10);
    }


    void add(float x, float y) {
        minx = PApplet.min(minx, x);
        miny = PApplet.min(miny, y);
        maxx = PApplet.max(maxx, x);
        maxy = PApplet.max(maxy, y);
    }

    void become(Blob other) {
        minx = other.minx;
        maxx = other.maxx;
        miny = other.miny;
        maxy = other.maxy;
        lifespan = variables.getMaxLife();
    }

    float size() {
        return (maxx-minx)*(maxy-miny);
    }

    PVector getCenter() {
        double x = (maxx - minx)* 0.5 + minx;
        double y = (maxy - miny)* 0.5 + miny;

        float xFloat = (float) x;
        float yFloat = (float) y;
        return new PVector(xFloat, yFloat);
    }

    // TODO: pixel is near even if there is nothing in between
    boolean isNear(float x, float y) {

        float cx = PApplet.max(PApplet.min(x, maxx), minx);
        float cy = PApplet.max(PApplet.min(y, maxy), miny);
        float d = Utils.distSq(cx, cy, x, y);

        return d < variables.getDistThreshold() * variables.getDistThreshold();
    }
}
