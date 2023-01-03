
// Element names
// -- Story
currentStoryEl = "current-story";
oldStoryEl = "old-story-body";
oldStoryWrapperEl = "old-story";
// -- S0 meditation
meditateEl = "meditate";
powerFillEl = "m-power-fill";
powerValueEl = "m-power-value";
winCostEl = "win-cost";
// -- S1 flames
stageOneEl = "stage-1";
castSparkEl = "cast-spark";
sparkCountEl = "spark-count";
sparkUpgradeEl = "spark-upgrade";
flamesEl = "flames";
flameRateEl = "flame-rate";
convertFlamesEl = "spark-convert";
// -- S2 water
stageTwoEl = "stage-2";
summonWaterEl = "summon-water";
bucketValueEl = "bucket-value";
maxBucketValueEl = "max-buckets";
// -- S3 earth
stageThreeEl = "stage-3";

// Class names
notVisibleClass = "not-visible";
cssFadeWait = 500;

// ticks per second
tDiv = 20.0;


story = "";

// state variables
// Stage0 -- MP
fill = 0;
fillMax = 1000;
fillIncr = 1/100.0;
winCost = 1000 * fillMax;

// Stage1 -- sparks
sparks = 0;
sparkCasts = 1;
sparkCost = fillMax;
sparkConvertCost = 20;
sparkConversion = fillMax/(100 * tDiv);
flameRate = fillMax/(100 * tDiv);
flameRateMax = 20;

// Stage2 -- water
buckets = 0;
maxBuckets = 0;
bucketSize = 1000;
drainRate = bucketSize / (10.0 * tDiv);
scoopSize = bucketSize;
scoopCost = fillMax;

stages = []

function getEl(name) {
    return document.getElementById(name)
}

StoryText = {
    "discover-flame": "After a lot of meditation you discover you can summon small sparks with magic.",
    "buy-spark-speed": "You smother some of your sparks, but learn how to summon them using less magic.",
    "buy-spark-strength": "You smother more sparks, but now each time you summon a spark, more come.",
    "buy-flames": "You smother many sparks, but have discovered how to join them into a single flame that warms you with magical power.",
    "flame-complete": "You can't seem to make the flames any bigger than this.",
    "water-unlock": "Flames will not let you increase the power in the wizard's cap. <br >It seems you can also summon water, maybe that will help?",
    "bucket-drain": "As you fill it, the bucket slowly loses the water you've created.",
    "upgrade-drain": "You are able to reduce the speed the magic fades for your summoned water.",
    "lower-evap": "By putting magical caps on the bucket you reduce water loss through evaporation.",
    "increase-summon": "After summoning enough water you start to get better at it.",
    "water-upgrade-cost": "You are finally able to reduce the poewr requirement for the mastery spell, but that is all you can do with water right now."
}

function Story(storyStage) {
    wrapper = getEl(oldStoryWrapperEl);
    if(wrapper.style.display == "none") {
        wrapper.style.display = "block";
    }

    newStory = StoryText[storyStage];
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
    getEl(currentStoryEl).classList.toggle(notVisibleClass);
    setTimeout( function() {
        getEl(currentStoryEl).innerHTML = newStory;
        getEl(currentStoryEl).classList.toggle(notVisibleClass);
    }, cssFadeWait);
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
                Story("discover-flame")
            }
        }
    }

    render() {
        var z = getEl(powerFillEl);
        z.style.width = `${Math.floor(fill/fillMax * 100)}%`;
        var x = getEl(powerValueEl);
        x.innerHTML = (fill/fillMax).toFixed(4);
        getEl(winCostEl).innerHTML = Math.ceil(winCost / fillMax);
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
                    Story("buy-spark-speed");
                }
            },
            "strength": {
                "el": "spark-strength",
                "cost": 30,
                "bought": false,
                "action": function() {
                    sparkCasts *= 2;
                    Story("buy-spark-strength");
                }
            },
            "flames": {
                "el": "spark-flames",
                "cost": 100,
                "bought": false,
                "action": function() {
                    stage.flamesOn = true;
                    Story("buy-flames");
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
            Story("water-unlock");
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
            getEl(convertFlamesEl).disabled = (sparks < sparkConvertCost) || this.flamePct() >= flameRateMax;
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
        if(sparks < sparkConvertCost || this.flamePct >= flameRateMax) {
            return;
        }
        sparks -= sparkConvertCost;
        flameRate += sparkConversion;
        if(this.flamePct() >= flameRateMax) {
            Story("flame-complete");

        }
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
        let stage = this;
        this.firstFill = true;
        this.upgrades = {
            "drain": {
                "cost": 10*bucketSize,
                "bought": false,
                "el": "upgrade-drain",
                "action": function() {
                    maxBuckets = 0;
                    buckets = 0;
                    drainRate *= 0.9;
                    Story("upgrade-drain");
                }
            },
            "evap": {
                "cost": 15*bucketSize,
                "bought": false,
                "el": "lower-evap",
                "action": function() {
                    maxBuckets = 0;
                    buckets = 0;
                    drainRate *= 0.7;
                    Story("lower-evap");
                }
            },
            "summon": {
                "cost": 20*bucketSize,
                "bought": false,
                "el": "increase-summon",
                "action": function() {
                    maxBuckets = 0;
                    buckets = 0;
                    scoopSize *= 3;
                    Story("increase-summon");
                }
            },
            "reduce-cost": {
                "cost": 25*bucketSize,
                "bought": false,
                "el": "water-upgrade-cost",
                "action": function() {
                    maxBuckets = 0;
                    buckets = 0;
                    winCost /= 2;
                    Story("water-upgrade-cost");
                    stages[3].activate();
                }
            }
        }
    }

    tick() {
        if(buckets > 0) {
            buckets -= drainRate;
            if(buckets < 0) {
                buckets = 0;
            }
        }
    }

    render() {
        getEl(bucketValueEl).innerHTML = (buckets / bucketSize).toFixed(3);
        getEl(maxBucketValueEl).innerHTML = (maxBuckets / bucketSize).toFixed(3);
        getEl(summonWaterEl).disabled = !this.active() || fill < scoopCost; 
        Object.values(this.upgrades).forEach( function(upg) {
            getEl(upg.el).disabled = upg.bought || (maxBuckets < upg.cost);
        });
    }


    summonWater() {
        if(!this.on || fill < scoopCost) {
            return;
        }
        if(this.firstFill) {
            Story("bucket-drain");
            this.firstFill = false;
        }
        buckets += scoopSize;
        if(buckets > maxBuckets) {
            maxBuckets = buckets;
        } 
        fill -= scoopCost;
    }

    activate() {
        this.on = true;
        getEl(stageTwoEl).style.display = "block";
    }

    upgrade(upgType) {
        let upg = this.upgrades[upgType];
        if(upg.bought || upg.cost > maxBuckets) {
            return;
        }
        upg.bought = true;
        upg.action();
    }

    active() {
        return this.on;
    }
}

class Stage3 extends Stage {
    constructor() {
        super();
        this.on = false;
    }

    render() {

    }

    tick() {

    }

    active() {
        return this.on;
    }

    activate() {
        this.on = true;
        getEl(stageThreeEl).style.display = "block";
    }
}

stages = [
    new Stage0(),
    new Stage1(),
    new Stage2(),
    new Stage3()
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


testing = true;
if(testing) {
    sparkCasts = 10;
    fillIncr = 1;
    sparkConversion *= 5;
    scoopSize *= 5;
}

addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'm':
            getEl(meditateEl).click();
            break;
        case 's':
            getEl(castSparkEl).click();
            break;
        case 'c':
            getEl(convertFlamesEl).click();
            break;
        case 'w':
            getEl(summonWaterEl).click();
            break;
    }
});