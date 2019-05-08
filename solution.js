{
    init: function(elevators, floors) {
        var i;
        for (i=0;i<floors.length;i++){
            (function () {
                var f = floors[i];
                f.upReq = false;
                f.downReq = false;
                f.on("up_button_pressed", function() {f.upReq = true;});
                f.on("down_button_pressed", function() {f.downReq = true;});
            }());
        }
        for (i=0;i<elevators.length;i++){
            (function () {
                var e = elevators[i];
                e.task = -1;
                e.on("idle", function() {
                    var j;
                    for (j=floors.length-1;j>=0;j--){
                        if (floors[j].upReq || floors[j].downReq){
                            floors[j].upReq = false;
                            floors[j].downReq = false;
                            e.task = j;
                            break;
                        }
                    }
                    if (j<0) {j=0;}
                    e.goToFloor(j);
                });
                e.on("passing_floor", function(f,d) {
                    if ((floors[f].upReq && d=="up" || floors[f].downReq && d=="down") && e.loadFactor()<0.7 || e.getPressedFloors().includes(f)){
                        e.destinationQueue.unshift(f);
                        e.checkDestinationQueue();
                    }
                });
                e.on("stopped_at_floor", function(f) {
                    if(e.task!=f&&e.task>=0){
                        if(floors[e.task].buttonStates.up)floors[e.task].upReq=true;
                        if(floors[e.task].buttonStates.down)floors[e.task].downReq=true;
                    }
                    e.task=-1;
                    e.destinationQueue = e.destinationQueue.filter(function(ele){return ele != f;});
                    e.checkDestinationQueue();
                    e.goingUpIndicator(true);
                    e.goingDownIndicator(true);
                    if (e.destinationQueue.length>0){
                        if (e.destinationQueue[0]>f){e.goingDownIndicator(false);}
                        if (e.destinationQueue[0]<f){e.goingUpIndicator(false);}
                    }
                    if (e.goingUpIndicator()) {floors[f].upReq=false;}
                    if (e.goingDownIndicator()) {floors[f].downReq=false;}
                });
                e.on("floor_button_pressed", function(f) {e.goToFloor(f);});
            }());
        }
    },
    update: function(dt, elevators, floors) {
        var i;
        for (i=0; i<elevators.length; i++){
            var e=elevators[i];
            if (e.task>=0 && !floors[e.task].buttonStates.up && !floors[e.task].buttonStates.down){e.task=-1;}
            if (e.loadFactor()==0.0 && e.task==-1) {
                var j;
                for (j=floors.length-1;j>=0;j--){
                    if (floors[j].upReq || floors[j].downReq){
                        floors[j].upReq = false;
                        floors[j].downReq = false;
                        e.task = j;
                        break;
                    }
                }
                if (j<0) {j=0;}
                e.stop();
                e.goToFloor(j);
            }
        }
    }
}
