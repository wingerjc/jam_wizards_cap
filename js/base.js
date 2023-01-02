
// Element names
powerFillEl = "m-power-fill";
powerValueEl = "m-power-value";
stageOneEl = "stage-1";
castSparkEl = "cast-spark";
sparkCountEl = "spark-count";

// ticks per second
tDiv = 20;

// state variables
// Stage0 -- MP
fill = 0;
fillMax = 1000;
fillIncr = 1; // #testing 1/100.0;

// Stage1 -- sparks
sparks = 0;
sparkCasts = 1;
sparkCost = fillMax;

stages = []

function getEl(name) {
    return document.getElementById(name)
}

class Stage{
    tick() { }
    render() { }
    active() { return false; }
}

class Stage0 extends Stage {
    constructor() {
        super();
    }

    tick() {
        if(fill == fillMax) {
            if(!stages[1].active()) {
                stages[1].activate();
            }
        }
    }

    render() {
        var z = getEl(powerFillEl);
        z.style.width = `${Math.floor(fill/fillMax * 100)}%`;
        var x = getEl(powerValueEl);
        x.innerHTML = (fill/fillMax).toFixed(4);
    }

    active() {
        return true;
    }
}

class Stage1 extends Stage {
    constructor() {
        super();
        this.on = false;
    }

    tick() {

    }

    render() {
        getEl(castSparkEl).disabled = (fill < sparkCost);
        getEl(sparkCountEl).innerHTML = sparks;
    }

    activate() {
        this.on = true;
        getEl(stageOneEl).style.display = "block";
    }
    
    active() {
        return this.on;
    }
}

stages = [
    new Stage0(),
    new Stage1()
];

function Tick() {
    t0 = (new Date()).getTime();

    stages.forEach(function(stage){
        if(stage.active()){
            stage.tick();
        }
    })

    // update rendering of all active segments
    stages.forEach(function(stage){
        if(stage.active()){
            stage.render();
        } 
    });

    // Try to keep to set ticks per second.
    tTotal = (new Date()).getTime() - t0;
    tDelay = Math.max(0, (1000 / tDiv) - tTotal)
    setTimeout(Tick, tDelay)
}

function StartTick() {
    Tick()
}

function Meditate() {
    fill += fillMax * fillIncr;
    if(fill > fillMax) {
        fill = fillMax;
    }
}

function Spark() {
    if(fill < sparkCost) {
        return;
    }

    fill -= sparkCost;
    sparks += sparkCasts;
}

function Collapse(cb, body) {
    target = getEl(body)

    if(getEl(cb).checked) {
        target.style.display = "block";
    } else {
        target.style.display = "none";
    }
}