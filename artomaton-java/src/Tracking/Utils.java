package Tracking;

/**
 * Created by ludwigfrank on 08/02/2017.
 */

class Utils {
    static float distSq(float x1, float y1, float x2, float y2) {
        return (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
    }
    static float distSq(float x1, float y1, float z1, float x2, float y2, float z2) {
        return (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) +(z2-z1)*(z2-z1);
    }


}
