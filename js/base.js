
// Element names
currentStoryEl = "current-story";
oldStoryEl = "old-story-body";
oldStoryWrapperEl = "old-story";
powerFillEl = "m-power-fill";
powerValueEl = "m-power-value";
stageOneEl = "stage-1";
castSparkEl = "cast-spark";
sparkCountEl = "spark-count";
sparkUpgradeEl = "spark-upgrade";
flamesEl = "flames";
flameRateEl = "flame-rate";
convertFlamesEl = "spark-convert";
stageTwoEl = "stage-2";

// ticks per second
tDiv = 20.0;


story = "";

// state variables
// Stage0 -- MP
fill = 0;
fillMax = 1000;
fillIncr = 1; // #testing 1/100.0;

// Stage1 -- sparks
sparks = 0;
sparkCasts = 10; // #testing 1;
sparkCost = fillMax;
sparkConvertCost = 20;
sparkConversion = fillMax/(100 * tDiv);
flameRate = fillMax/(100 * tDiv);

stages = []

function getEl(name) {
    return document.getElementById(name)
}

function Story(newStory) {
    wrapper = getEl(oldStoryWrapperEl);
    if(wrapper.style.display == "none") {
        wrapper.style.display = "block";
    }

    currentStory = getEl(currentStoryEl).innerHTML;
    storyList = getEl(oldStoryEl);
    newItem = document.createElement("div");
    newItem.innerHTML = currentStory;
    newItem.classList.add("story-item");
    if(storyList.childNodes.length == 0) {
        storyList.appendChild(newItem);
    } else {
        newItem.appendChild(document.createElement("hr"));
        storyList.insertBefore(newItem, storyList.firstChild);
    }
    getEl(currentStoryEl).innerHTML = newStory;
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
                Story("After a lot of meditation you discover you can summon small sparks with magic.")
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
        let stage = this
        this.on = false;
        this.upgradesOn = false;
        this.flamesOn = false;
        this.upgrades = {
            "speed": {
                "el": "spark-speed",
                "cost": 10,
                "bought": false,
                "action": function() {
                    sparkCost /= 2;
                    Story("You smother some of your sparks, but learn how to summon them using less magic.");
                }
            },
            "strength": {
                "el": "spark-strength",
                "cost": 30,
                "bought": false,
                "action": function() {
                    sparkCasts *= 2;
                    Story("You somther more sparks, but now each time you summon a spark, more come.");
                }
            },
            "flames": {
                "el": "spark-flames",
                "cost": 100,
                "bought": false,
                "action": function() {
                    stage.flamesOn = true;
                    Story("You smother many sparks, but have discovered how to join them into a single flame that warms you with magical power.");
                }
            }
        };
    }

    tick() {
        if (this.flamesOn && fill < fillMax) {
            fill += flameRate;
        }
        if (!stages[2].active() && this.flamePct() >= 10) {
            stages[2].activate();
        }
    }

    render() {
        getEl(castSparkEl).disabled = (fill < sparkCost);
        getEl(sparkCountEl).innerHTML = sparks;
        if(!this.upgradesOn && sparks >= 2) {
            getEl(sparkUpgradeEl).style.display = "block";
            this.upgradesOn = true;
        }
        if(this.upgradesOn) {
            Object.values(this.upgrades).forEach(function(upg) {
                getEl(upg.el).disabled = upg.bought || (sparks < upg.cost); 
            })
        }
        if(this.flamesOn) {
            getEl(flamesEl).style.display = "block";
            getEl(convertFlamesEl).disabled = (sparks < sparkConvertCost) || this.flamePct() >= 20;
            getEl(flameRateEl).innerHTML = this.flamePct();
        }
    }

    flamePct() {
        return ((100 * flameRate * tDiv)/fillMax).toFixed(1);
    }

    buyUpgrade(name) {
        let upg = this.upgrades[name];
        if(upg.bought) {
            return;
        }
        upg.bought = true;
        sparks -= upg.cost;
        upg.action();
        let el = getEl(upg.el)
        el.value = el.value.split('(')[0] + "(bought)";
    }

    convert() {
        if(sparks < sparkConvertCost) {
            return;
        }
        sparks -= sparkConvertCost;
        flameRate += sparkConversion;
    }

    activate() {
        this.on = true;
        getEl(stageOneEl).style.display = "block";
    }
    
    active() {
        return this.on;
    }
}

class Stage2 extends Stage {
    constructor() {
        super();
        this.on = false;
    }

    tick() {

    }

    render() {

    }

    activate() {
        this.on = true;
        getEl(stageTwoEl).style.display = "block";
    }

    active() {
        return this.on;
    }
}

stages = [
    new Stage0(),
    new Stage1(),
    new Stage2()
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