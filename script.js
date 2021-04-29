const screen = document.getElementById('screen');
const width = window.screen.width;
const height = window.screen.height;

const long = width > height ? width : height;
const bottomBorder = Math.round(long * 0.0104) + 'px';
const sideBorder = Math.round(long * 0.0026) + 'px';


let sliders = {

    alignment: 2,
    cohesion: 100,
    seperation: 50,
    range: 50,
    max: 10,
    min: 5,

    bg: {
        h: 20,
        s: 20,
        l: 20
    },

    bd: {
        h: 200,
        s: 200,
        l: 200
    },

    cdVisible: false,

    check() {
        this.alignment = document.getElementById('alignment').value;
        this.cohesion = document.getElementById('cohesion').value;
        this.seperation = document.getElementById('seperation').value;
        this.range = document.getElementById('perception').value;
        this.min = parseInt(document.getElementById('speed').value);
        this.max = this.min *2;
    },

    colors () {
        this.bg.h = document.getElementById('bgHue').value;
        this.bg.s = document.getElementById('bgSat').value;
        this.bg.l = document.getElementById('bgLit').value;
        this.bd.h = document.getElementById('bdHue').value;
        this.bd.s = document.getElementById('bdSat').value;
        this.bd.l = document.getElementById('bdLit').value;

        document.body.style = `--bg: hsl(${this.bg.h}, ${this.bg.s}%, ${this.bg.l}%); 
                                --bd: hsl(${this.bd.h}, ${this.bd.s}%, ${this.bd.l}%); 
                                --bgh: ${this.bg.h}; 
                                --bdh: ${this.bd.h}; 
                                --bgs: ${this.bg.s}%;
                                --bds: ${this.bd.s}%;
                                --bgl: ${this.bg.l}%;
                                --bdl: ${this.bd.l}%;
                                --bott: ${bottomBorder};
                                --side: ${sideBorder};`;
    }
}


document.getElementById('colors').addEventListener('click', () => {
    let check = sliders.cdVisible ? 'none' : 'block';
    document.getElementById('hslSliders').style.display = check;
    sliders.cdVisible = !sliders.cdVisible;
});



class Boid {

    constructor(name) {
        
        this.name = name;
        let div = document.createElement('div');
        div.className = 'boid';
        div.id = this.name;
        screen.appendChild(div);
        this.elem = document.getElementById(this.name);

        this.x = {
            pos: Math.random() * width,
            vec: Boid.vector(sliders.max, sliders.min)
        };

        this.y = {
            pos: Math.random() * height,
            vec: Boid.vector(sliders.max, sliders.min)
        };
    }

    static vector(max, min) {
        
        let minFix = arguments[1] === undefined ? 0 : min;
        
        let vec = Math.random() * (max - minFix) + minFix;
        if (Math.random() < 0.5) vec -= (vec * 2);
        return vec;
    }


    // handles all positioning functions
    update() {
        this.maxSpeed();
        this.minSpeed();
        this.move();
        this.rotate();
        if (this.x.pos > width) this.x.pos = 0;
        if (this.x.pos < 0) this.x.pos = width;
        if (this.y.pos > height) this.y.pos = 0;
        if (this.y.pos < 0) this.y.pos = height;
        this.elem.style.top = `${this.y.pos}px`;
        this.elem.style.left = `${this.x.pos}px`;
        this.elem.title = 'xvec:' + this.x.vec + ', yvec:' + this.y.vec;
    }


    // limits vectors to min speed
    minSpeed() {
        let x = Math.abs(this.x.vec);
        let y = Math.abs(this.y.vec);
        if (x >= sliders.min || y >= sliders.min) return;
        let ratio = x / y, adj;

        if (x < y) {
            adj = sliders.min * ratio;
            this.x.vec = this.x.vec >= 0 ? adj : 0 - adj;
            this.y.vec = this.y.vec >= 0 ? sliders.min : 0 - sliders.min;
        } else {
            adj = sliders.min / ratio;
            this.y.vec = this.y.vec >= 0 ? adj : 0 - adj;
            this.x.vec = this.x.vec >= 0 ? sliders.min : 0 - sliders.min;
        }
    }


    // limits vectors to max speed
    maxSpeed() {
        let x = Math.abs(this.x.vec);
        let y = Math.abs(this.y.vec);
        if (x <= sliders.max && y <= sliders.max) return;
        let ratio = x / y, adj;

        if (x < y) {
            adj = sliders.max * ratio;
            this.x.vec = this.x.vec >= 0 ? adj : 0 - adj;
            this.y.vec = this.y.vec >= 0 ? sliders.max : 0 - sliders.max;
        } else {
            adj = sliders.max / ratio;
            this.y.vec = this.y.vec >= 0 ? adj : 0 - adj;
            this.x.vec = this.x.vec >= 0 ? sliders.max : 0 - sliders.max;
        }
    }


    // reposition body to match vector
    move() {
        this.x.pos += this.x.vec;
        this.y.pos += this.y.vec;
    }


    // rotate body to match vector
    rotate() {
        let x, y, quadrant, deg = 0;
        if (this.x.vec >= 0 && this.y.vec >= 0) quadrant = 'a';
        if (this.x.vec >= 0 && this.y.vec <= 0) quadrant = 'b';
        if (this.x.vec <= 0 && this.y.vec <= 0) quadrant = 'c';
        if (this.x.vec <= 0 && this.y.vec >= 0) quadrant = 'd';

        switch(quadrant) {
            case 'a':
                x = Math.abs(this.x.vec);
                y = Math.abs(this.y.vec);
                break;
            case 'b':
                x = Math.abs(this.y.vec);
                y = Math.abs(this.x.vec);
                deg += 90;
                break;
            case 'c':
                x = Math.abs(this.x.vec);
                y = Math.abs(this.y.vec);
                deg += 180;
                break;
            case 'd':
                x = Math.abs(this.y.vec);
                y = Math.abs(this.x.vec);
                deg += 270;
                break;
        }
        deg += ( x / (x + y) ) * 90;
        deg -= deg * 2
        this.elem.style.transform = `rotate(${deg}deg)`;
        this.deg = deg;
    }


    //utility for checking distance
    distance(xPos, yPos) {
        let x = Math.abs(this.x.pos - xPos);
        let y = Math.abs(this.y.pos - yPos);

        return Math.hypot(x, y);
    }


    //returns and saves array of local boids
    perception(flock) {

        let locals = [];

        flock.forEach(boid => {
            //ignore self when checking all boids
            if (boid.name === this.name) return;

            let dist = this.distance(boid.x.pos, boid.y.pos);
            
            if (dist <= sliders.range) locals.push(boid);
        });

        if (sliders.range < 5) sliders.range = 0;
        if (locals.length === 0 || sliders.range === 0) {
            this.elem.style.opacity = '0.05';
        } else if (locals.length >= (sliders.range) / 10 ){
            this.elem.style.opacity = '1';
        } else {
            this.elem.style.opacity = `0.${locals.length * Math.round(100 / (sliders.range / 10))}`;
        }

        return locals;
    }


    // averages x and y vectors with locals 
    align(locals) {
        if (locals.length < 1 || sliders.alignment === 0) return;
        let avgX = 0, avgY = 0;
        locals.forEach(local => {
            avgX += local.x.vec;
            avgY += local.y.vec;
        })

        avgX = avgX / locals.length;
        avgY = avgY / locals.length;

        let slideFix = Math.abs(sliders.alignment - 101);
        
        let x = (avgX + this.x.vec) / slideFix;
        let y = (avgY + this.y.vec) / slideFix;

        return [x, y];
    }


    // returns center of mass interpreted as vectors
    cohere(locals) {
        if (locals.length < 1 || sliders.cohesion === 0) return;
        
        let avgX = 0, avgY = 0;
        locals.forEach(local => {
            avgX += local.x.pos;
            avgY += local.y.pos;
        })

        avgX = avgX / locals.length;
        avgY = avgY / locals.length;
        
        let vecX = Math.abs(avgX - this.x.pos);
        let vecY = Math.abs(avgY - this.y.pos);

        if (avgX < this.x.pos) vecX -= vecX * 2;
        if (avgY < this.y.pos) vecY -= vecY * 2;

        let slideFix = Math.abs(sliders.cohesion - 101);

        let x = (vecX + this.x.vec) / slideFix;
        let y = (vecY + this.y.vec) / slideFix;

        return [x, y];
    }


    // finds best vector for moving away from flock mates
    seperate(locals) {
        if (locals.length < 1 || sliders.seperation === 0) return;

        let avgX = [];
        let avgY = [];

        locals.forEach(local => {
            let dist = this.distance(local.x.pos, local.y.pos);

            let sepVal = (1 / dist) * sliders.seperation;

            let xRat = Math.abs(local.x.pos - this.x.pos) / dist;
            let yRat = Math.abs(local.y.pos - this.y.pos) / dist;

            let x = sepVal * xRat;
            let y = sepVal * yRat;

            if (local.x.pos > this.x.pos) x -= x * 2;
            if (local.y.pos > this.y.pos) y -= y * 2;

            avgX.push(x);
            avgY.push(y);
        });

        let x = avgX.reduce((a, b) => a + b) / locals.length;
        let y = avgY.reduce((a, b) => a + b) / locals.length;

        return [x, y];
    }


    // averages all returned vectors
    avgerage(locals) {

        if (locals.length < 1) return;

        let alignment, cohesion, seperation;
        let total = 0;

        if (sliders.alignment > 0) {
            alignment = this.align(locals);
            total++;
        }

        if (sliders.cohesion > 0) {
            cohesion = this.cohere(locals);
            total++;
        }

        if (sliders.seperation > 0) {
            seperation = this.seperate(locals);
            total++;
        }

        if (total === 0) return;

        let parameters = [alignment, cohesion, seperation].filter(parameter => parameter !== undefined);


        let avgVec;

        if (total > 1) {
                
            avgVec = parameters.reduce((a, b) => {

                let x = a[0] + b[0];
                let y = a[1] + b[1];

                return [x, y];
            })

        } else {
            avgVec = parameters[0];
        }

        let x = avgVec[0] / total;
        let y = avgVec[1] / total;

        if (total > 0) {    
            this.x.vec = x;
            this.y.vec = y;
        }
    }


    static flockGen(num) {
        let boids = [];
        for (let i = 0; i < num; i++) {
            let boid = new Boid(`b${i}`);
            boids.push(boid);
        }
        return boids;
    }


}

let ratio = Math.round(long / 6) < 300 ? Math.round(long / 6) : 300;

let boids = Boid.flockGen(ratio);
console.log(boids.length);


let vecMap;


let cycle;
function loop() {

    sliders.check();
    sliders.colors();

    vecMap = boids.map(boid => {
        return {
            name: boid.name,
            x: boid.x,
            y: boid.y
        }
    })

    //console.log('before' ,boids[0].x, vecMap[0].x); 

    for (let boid of boids) {
        let perception = boid.perception(vecMap);

        boid.avgerage(perception);

        boid.update();

        if (boid.x.vec === 'NaN' || boid.y.vec === 'NaN') boid.elem.style.display = 'none';

    }
    


    cycle = requestAnimationFrame(loop);
}
loop();