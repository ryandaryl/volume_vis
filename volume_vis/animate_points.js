/*     Example input for animate_points.
points = [{x: 10, y: 100, t: 10},
          {x: 20, y: 100, t: 20},
          {x: 70, y: 100, t: 70}]
duration = 4     // Total duration of the animation in seconds.
*/


xy = [0, 100]
t = 0


animate_points = function(points, width, height, duration) {
    console.log('animating')
    max_time = duration * 10
    t += 1
    xy[0] += 20
    // particle(xy, 10)
    if (t > max_time) {
        t = 0
        xy[0] = 0
    }
    for (i = 0; i < points.length; i++) {
        if (parseInt(points[i]['t'])
          == parseInt(100 * t / max_time)) {
            x = width * points[i]['x'] / 100
            y = height * points[i]['y'] / 100
            particle([x, y])       
        }
    }
}