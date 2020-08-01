
var Demo = {
    CANVAS_WIDTH: 200,
    REDUCED_WIDTH: 20,
    BLOCK_WIDTH: 10,
    BATCH_SIZE: 1,

    // server coordinates:
    PORT: "8000",
    HOST: "http://localhost",

    // colors:
    BLACK: "#000000",
    GREEN: "#00ff00",
    WHITE: "#ffffff",

    trainingArray: [],
    trainingRequestCount: 0,

    onLoadFunction: function() {
        this.resetCanvas();
    },

    resetCanvas: function(){
        var canvas = document.getElementById('canvasID');
        var ctx = canvas.getContext('2d');

        this.data = [];
        ctx.fillStyle  = this.BLACK;
        ctx.fillRect(0,0, this.CANVAS_WIDTH, this.CANVAS_WIDTH);
        var matrixSize = 400;
        // fill up data with pixel values for the 200 x 200 canvas:
        while(matrixSize--)
            this.data.push(0);
        
        // draw the grid:
        this.drawGrid(ctx);

        // register mouse acitivites we are interested in to capture:
        this.mouseClicked = false;
        canvas.onmousedown = function(e) { this.mouseDown(e, ctx, canvas)}.bind(this);
        canvas.onmousemove = function(e) { this.mouseMove(e, ctx, canvas)}.bind(this);
        canvas.onmouseup = function(e) { this.mouseUp(e, ctx, canvas)}.bind(this);
    },
    
    drawGrid: function(ctx) {
        for(var x= this.BLOCK_WIDTH, y = this.BLOCK_WIDTH; 
            x < this.CANVAS_WIDTH; x += this.BLOCK_WIDTH, y += this.BLOCK_WIDTH){
                ctx.strokeStyle = this.GREEN;
                // draw one horizontal line and one vertical line of the grid:
                // first vertical line:
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.CANVAS_WIDTH);
                ctx.stroke();
                // next horizontal line:
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.CANVAS_WIDTH, y);
                ctx.stroke();
            }
    },

    mouseDown: function(e, ctx, canvas) {
      //  console.log("Mouse down pressed");
        //this.mouseClicked = true;
        canvas.isDrawing = true;
        this.fillSquare(ctx, e.clientX-canvas.offsetLeft, e.clientY - canvas.offsetTop);
    },

    mouseMove: function(e, ctx, canvas){
        if(canvas.isDrawing)
        {
           // console.log("Mouse is moving while clicked down!");
           this.fillSquare(ctx, e.clientX-canvas.offsetLeft, e.clientY - canvas.offsetTop);
        }

    },

    mouseUp: function(e, ctx, canvas){
        console.log("Mouse is released!");
        canvas.isDrawing = false;
    },

    fillSquare: function(ctx, x, y) {
        var xBlockIndex =  Math.floor(x / this.BLOCK_WIDTH);
        var yBlockIndex = Math.floor(y / this.BLOCK_WIDTH);
        this.data[((yBlockIndex-1) * this.REDUCED_WIDTH + xBlockIndex) - 1] = 1;

        ctx.fillStyle = this.WHITE;
        ctx.fillRect(xBlockIndex*this.BLOCK_WIDTH, yBlockIndex*this.BLOCK_WIDTH, this.BLOCK_WIDTH, this.BLOCK_WIDTH);
    },
    
    // grabs the digit from text area, as well as the image from canvas and sent it for training
    train: function() {
        var digitValue = document.getElementById("digit").value;
        //console.log("index of 1 is " + this.data.indexOf(1));
        if(!digitValue || this.data.indexOf(1) < 0)
        {
            alert("Please type a digit in input area, and draw in the draw area. Then press train.");
            return;
        }
        
        // now send the training bach to the server
        this.trainingArray.push({"image":this.data, "label": parseInt(digitValue)});
        this.trainingRequestCount += 1;

        // because our batchsize is 1, I won't check for it, and just send the data to server for training
        console.log("Sending " + this.trainingRequestCount + " training data to server");
        var jsonData = {
            trainArray: this.trainingArray,
            train: true
        };
        this.sendData(jsonData);
        this.trainingRequestCount = 0;
        this.trainingArray = [];
    },

    test: function() {
        // leave it to students to check for error here: main error is not drawing anything
        var jsonData = {
            data : this.data,
            predict : true
        };
        
        this.sendData(jsonData);
    },

    sendData: function(json) {
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open('POST', this.HOST + ":" + this.PORT, false);
        xmlHttpReq.onload = function() { this.receiveResponse(xmlHttpReq)}.bind(this);
        xmlHttpReq.onerror = function() { this.onError(xmlHttpReq)}.bind(this);
        var msg = JSON.stringify(json);
        xmlHttpReq.send(msg);
    },

    onError : function(e) {
        alert("Error while connecting to server: " + e.target.statusText);
    },

    receiveResponse : function(e) {
        if(e.status != 200 ) {
            alert("Server returned status " + e.status);
            return;
        }
        // take care of response for the 'test' case.
        var responseJSON = JSON.parse(e.responseText);
        if(e.responseText && responseJSON.type == "test") {
            alert("The NN predictions is \'" + responseJSON.result + "\'");
        }
    }    
}