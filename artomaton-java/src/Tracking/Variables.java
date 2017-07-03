package Tracking;

/**
 * Created by ludwigfrank on 08/02/2017.
 */
import processing.core.*;
import processing.core.PApplet;


class Variables extends PApplet{


    int distThreshold;
    int maxLife;
    int threshold;
    int trackColor;
    int minSize;

    float minThresh;
    float maxThresh;

    private int recordDistance;

    Variables() {
        this.distThreshold =        20;
        this.threshold =            40;
        this.maxLife =              4;
        this.trackColor =           color(183,12,83);
        this.minThresh =            1200;
        this.maxThresh =            2500;
        this.recordDistance =       1000;
        this.minSize =              1000;
    }

    public int getDistThreshold() {
        return distThreshold;
    }

    public int getMaxLife() {
        return maxLife;
    }

    public int getThreshold() {
        return threshold;
    }

    public int getTrackColor() {
        return trackColor;
    }

    public float getMinThresh() {
        return minThresh;
    }

    public float getMaxThresh() {
        return maxThresh;
    }

    public int getMinSize() {
        return minSize;
    }

    public int getRecordDistance() {
        return recordDistance;
    }

}
