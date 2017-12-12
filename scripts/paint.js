var menus = document.getElementsByClassName('dropdown-menu');
var curMenu = menus[0].getElementsByTagName('a');       // файл
curMenu[0].onclick = createCanvas;
curMenu[1].onclick = save;
curMenu[2].onclick = clear;

curMenu = menus[1].getElementsByTagName('a');           // фильтры
curMenu[0].onclick = embossFilter;
curMenu[1].onclick = sharpenFilter;
curMenu[2].onclick = edgesFilter;
curMenu[3].onclick = smoothFilter;
curMenu[4].onclick = rotateLeft;
curMenu[5].onclick = rotateRight;
curMenu[6].onclick = flipH;
curMenu[7].onclick = flipV;

curMenu = menus[2].getElementsByTagName('a');           // окна
curMenu[0].onclick = vertically;
curMenu[1].onclick = horizontally;
curMenu[2].onclick = cascady;

menus = document.querySelector('.tools');               // инструменты
curMenu = menus.getElementsByTagName('button');
curMenu[0].onclick = function () {              // выбор инструмента кисть
    toolOptions.drawTool = drawBrush;
};
curMenu[1].onclick = function () {
    toolOptions.drawTool = drawErase;           // выбор инструмента ластик
};
curMenu[2].onclick = function () {
    toolOptions.drawTool = drawStar;
};
curMenu[3].onclick = function () {
    toolOptions.drawTool = drawLine;
};
curMenu[4].onclick = function () {
    toolOptions.drawTool = drawCircle;
};
curMenu[5].onclick = zoomPlus;
curMenu[6].onclick = zoomMinus;
curMenu[7].onclick = zoomNormalize;

var downloader = document.forms[0].elements[0];         // загрузка из файла
downloader.onchange = function () {
    if (!downloader.files) return;
    if (downloader.files.length === 0) return;
    var reader = new FileReader();
    reader.addEventListener('load', function () {
        loadImageURL(reader.result);
    });
    reader.readAsDataURL(downloader.files[0]);
};
curMenu = document.forms[1].elements[0];
curMenu.onchange = function () {                // выбор цвета
    toolOptions.color = event.currentTarget.value;
};
curMenu = document.forms[1].elements[1];
curMenu.onchange = function () {                // выбор толщины
    if (isNumeric(event.currentTarget.value) && (+event.currentTarget.value > 0))
        toolOptions.width = +event.currentTarget.value;
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}                   // проверка на число - вспомогательная функция

var toolOptions = {
    width: 5,
    drawTool: drawBrush,
    color: '#000000'
};
var cursorState = {
    isMousePressed: false,
    currentPoint: {x:0, y:0},
    previousPoint: {x:0, y:0},
    lastCanvas: null,
    lastSecondLayer: null
};
var scaleOption = 1;
var scaleMemory = document.createElement('canvas');

function drawBrush(canvas) {
    scaleOption = 1;
    cursorState.lastCanvas = canvas;
    var ctx = canvas.getContext('2d');
    ctx.lineCap="round";
    if (cursorState.isMousePressed) {
        ctx.beginPath();
        ctx.lineWidth = toolOptions.width;
        ctx.strokeStyle = toolOptions.color;
        ctx.moveTo(cursorState.previousPoint.x, cursorState.previousPoint.y);
        ctx.lineTo(cursorState.currentPoint.x, cursorState.currentPoint.y);
        ctx.stroke();
        ctx.closePath();
    }

    cursorState.previousPoint={x:cursorState.currentPoint.x, y:cursorState.currentPoint.y};
}               // кисть
function drawErase(canvas) {
    scaleOption = 1;
    cursorState.lastCanvas = canvas;
    var ctx = canvas.getContext('2d');
    ctx.lineCap="round";
    if (cursorState.isMousePressed) {
        ctx.beginPath();
        ctx.lineWidth = toolOptions.width;
        ctx.strokeStyle = '#ffffff';
        ctx.moveTo(cursorState.previousPoint.x, cursorState.previousPoint.y);
        ctx.lineTo(cursorState.currentPoint.x, cursorState.currentPoint.y);
        ctx.stroke();
        ctx.closePath();
    }

    cursorState.previousPoint={x:cursorState.currentPoint.x, y:cursorState.currentPoint.y};
}               // ластик
function drawStar(canvas) {
    cursorState.lastCanvas = canvas;
    scaleOption = 1;

    canvas = canvas.nextElementSibling;
    var ctx = canvas.getContext('2d');

    ctx.lineJoin = 'round';

    if (cursorState.isMousePressed) {                       // очистка верхнего слоя для перерисовки
        ctx.clearRect(0, 0, canvas.width, canvas.height);   // если кнопка уже была зажата
    } else {                                                // иначе точка - центр
        cursorState.previousPoint=
            {
                x:cursorState.currentPoint.x,
                y:cursorState.currentPoint.y
            };
    }
    ctx.lineCap="round";

    ctx.beginPath();
    ctx.lineWidth = toolOptions.width;
    ctx.strokeStyle = toolOptions.color;

    var rad = Math.max(
        Math.abs(cursorState.previousPoint.x - cursorState.currentPoint.x),
        Math.abs(cursorState.previousPoint.y - cursorState.currentPoint.y));


    for (var j = 0; j < 1; j++) {
        for (var i = 0; i < 6; i++) {
            var xi = cursorState.previousPoint.x + rad * Math.cos(2*Math.PI / 5*(2*i + j));
            var yi = cursorState.previousPoint.y + rad * Math.sin(2*Math.PI / 5*(2*i + j));

            if (i === 0 && j === 0) ctx.moveTo(xi, yi);
            else ctx.lineTo(xi, yi);
        }
    }
    ctx.stroke();

}                // звезда
function drawLine(canvas) {
    cursorState.lastCanvas = canvas;
    scaleOption = 1;

    canvas = canvas.nextElementSibling;
    var ctx = canvas.getContext('2d');

    if (cursorState.isMousePressed) {                       // очистка верхнего слоя для перерисовки
        ctx.clearRect(0, 0, canvas.width, canvas.height);   // если кнопка уже была зажата
    } else {                                                // иначе точка - центр
        cursorState.previousPoint=
            {
                x:cursorState.currentPoint.x,
                y:cursorState.currentPoint.y
            };
    }
    ctx.lineCap="round";

    ctx.beginPath();
    ctx.lineWidth = toolOptions.width;
    ctx.strokeStyle = toolOptions.color;

    ctx.moveTo(cursorState.previousPoint.x, cursorState.previousPoint.y);
    ctx.lineTo(cursorState.currentPoint.x, cursorState.currentPoint.y);

    ctx.stroke();
}                // линия
function drawCircle(canvas) {
    cursorState.lastCanvas = canvas;
    scaleOption = 1;

    canvas = canvas.nextElementSibling;
    var ctx = canvas.getContext('2d');

    ctx.lineJoin = 'round';

    if (cursorState.isMousePressed) {                       // очистка верхнего слоя для перерисовки
        ctx.clearRect(0, 0, canvas.width, canvas.height);   // если кнопка уже была зажата
    } else {                                                // иначе точка - центр
        cursorState.previousPoint=
            {
                x:cursorState.currentPoint.x,
                y:cursorState.currentPoint.y
            };
    }
    ctx.lineCap="round";

    ctx.beginPath();
    ctx.lineWidth = toolOptions.width;
    ctx.strokeStyle = toolOptions.color;

    var centerX = cursorState.previousPoint.x;
    var centerY = cursorState.previousPoint.y;
    var valueX = 2*(cursorState.currentPoint.x - cursorState.previousPoint.x);    // ширина
    var valueY = 2*(cursorState.currentPoint.y - cursorState.previousPoint.y);    // высота

    ctx.moveTo(centerX, centerY - valueY/2);    // верхушка эллипса

    ctx.bezierCurveTo(
        centerX + valueX/2, centerY - valueY/2, // C1
        centerX + valueX/2, centerY + valueY/2, // C2
        centerX, centerY + valueY/2);           // нижняя часть эллипса

    ctx.bezierCurveTo(
        centerX - valueX/2, centerY + valueY/2, // C3
        centerX - valueX/2, centerY - valueY/2, // C4
        centerX, centerY - valueY/2); // A1

    ctx.stroke();
}              // эллипс

function zoomPlus() {
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    if (scaleOption === 1)
    {
        scaleMemory.width = canv.width;
        scaleMemory.height = canv.height;
        var tempCtx = scaleMemory.getContext('2d');
        tempCtx.drawImage(canv, 0, 0);
    }

    scaleOption *= 1.2;
    ctx.scale(scaleOption, scaleOption);
    ctx.drawImage(scaleMemory, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
}
function zoomMinus() {
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    if (scaleOption === 1)
    {
        scaleMemory.width = canv.width;
        scaleMemory.height = canv.height;
        var tempCtx = scaleMemory.getContext('2d');
        tempCtx.drawImage(canv, 0, 0);
    }

    scaleOption /= 1.2;
    ctx.scale(scaleOption, scaleOption);
    ctx.drawImage(scaleMemory, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
}
function zoomNormalize() {
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    if (scaleOption === 1) return;
    scaleOption = 1;

    ctx.scale(1, 1);
    ctx.drawImage(scaleMemory, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);

}

function createCanvas() {
    var userCanv = document.createElement('div');
    userCanv.className = 'draggable canvas-container';
    var handle = document.createElement('div');
    handle.className = 'draghandle';

    var closeIcon = document.createElement('span');
    closeIcon.className = 'glyphicon glyphicon-remove closeCanvas';
    closeIcon.onclick = closeCanvas;
    handle.appendChild(closeIcon);
    userCanv.appendChild(handle);

    var innerCanvas = document.createElement('canvas');
    innerCanvas.onmousedown = canvasDown;
    innerCanvas.onmousemove = canvasMove;
    innerCanvas.setAttribute('width','390');
    innerCanvas.setAttribute('height','318');

    userCanv.style.position = 'absolute';
    userCanv.appendChild(innerCanvas);

    var helpCanvas = document.createElement('canvas');
    helpCanvas.setAttribute('width','390');
    helpCanvas.setAttribute('height','318');
    helpCanvas.style = "background-color: transparent;";

    helpCanvas.onmousedown = function (e) {
        e.currentTarget = innerCanvas;
        innerCanvas.onmousedown(e, innerCanvas);
    };

    helpCanvas.onmousemove = function (e) {
        e.currentTarget = innerCanvas;
        innerCanvas.onmousemove(e, innerCanvas);
    };

    userCanv.appendChild(helpCanvas);

    document.getElementsByClassName('application')[0].appendChild(userCanv);
    var width = prompt('Ширина: ', 380);
    var height = prompt('Высота: ', 318);

    if (isNumeric(width) && isNumeric(height) && width > 0 && height > 0)
        setSize(helpCanvas, innerCanvas, width, height);

}                  // создать холст
function loadImageURL(url) {
    var userCanv = document.createElement('div');
    userCanv.className = 'draggable canvas-container';
    var handle = document.createElement('div');
    handle.className = 'draghandle';

    var closeIcon = document.createElement('span');
    closeIcon.className = 'glyphicon glyphicon-remove closeCanvas';
    closeIcon.onclick = closeCanvas;
    handle.appendChild(closeIcon);
    userCanv.appendChild(handle);

    var innerCanvas = document.createElement('canvas');
    innerCanvas.onmousedown = canvasDown;
    innerCanvas.onmousemove = canvasMove;
    innerCanvas.setAttribute('width','390');
    innerCanvas.setAttribute('height','318');

    userCanv.style.position = 'absolute';
    userCanv.appendChild(innerCanvas);

    var helpCanvas = document.createElement('canvas');
    helpCanvas.setAttribute('width','390');
    helpCanvas.setAttribute('height','318');
    helpCanvas.style = "background-color: transparent;";

    helpCanvas.onmousedown = function (e) {
        e.currentTarget = innerCanvas;
        innerCanvas.onmousedown(e, innerCanvas);
    };

    helpCanvas.onmousemove = function (e) {
        e.currentTarget = innerCanvas;
        innerCanvas.onmousemove(e, innerCanvas);
    };

    userCanv.appendChild(helpCanvas);

    document.getElementsByClassName('application')[0].appendChild(userCanv);

    var cx = innerCanvas.getContext('2d');
    var image = document.createElement("img");
    image.addEventListener("load", function() {
        setSize(helpCanvas, innerCanvas, image.width, image.height);

        cx.drawImage(image, 0, 0);
    });
    image.src = url;
}               // загрузить холст
function closeCanvas(event) {
    var userCanv = event.currentTarget.parentNode.parentNode;
    userCanv.remove();
}              // закрыть холст
function save() {
    var dt = cursorState.lastCanvas.toDataURL();
    this.href = dt;
}                          // сохранить холст
function clear() {
    scaleOption = 1;
    var canvas = cursorState.lastCanvas;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}                         // очистить холст
function setSize(helpCanvas, innerCanvas, width, height) {
    innerCanvas.parentElement.style.width = +width + 10 + 'px';
    innerCanvas.parentElement.style.height = +height + 31 + 'px';

    innerCanvas.width = +width;
    innerCanvas.height = +height;
    innerCanvas.style.width = +width + 'px';
    innerCanvas.style.height = +height + 'px';

    helpCanvas.width = +width;
    helpCanvas.height = +height;
    helpCanvas.style.width = +width + 'px';
    helpCanvas.style.height = +height + 'px';
}   // размер

// обработчики кликов на холст
document.body.onmouseup = function() {
    if (cursorState.isMousePressed) {
        cursorState.isMousePressed = false;

        var canv = cursorState.lastCanvas;
        var layer = canv.nextElementSibling;

        var ctx = canv.getContext('2d');
        ctx.drawImage(layer, 0, 0);

        ctx = layer.getContext('2d');
        ctx.clearRect(0,0,canv.width, canv.height);
    }
};

function canvasDown(event, canvas) {
    if (!event) return;
    setCoords(event.offsetX, event.offsetY);
    toolOptions.drawTool(canvas);
    cursorState.isMousePressed = true;
}
function canvasMove(event, canvas) {
    if (!event) return;
    setCoords(event.offsetX,event.offsetY);
    if(cursorState.isMousePressed)
        toolOptions.drawTool(canvas);
}
function setCoords(x,y) {
    cursorState.currentPoint = {x:x, y:y};
}                   // смена координат

// фильтры
function convolute(pixels, weights) {
    scaleOption = 1;
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var output = cursorState.lastCanvas.getContext('2d').createImageData(w, h);
    var dst = output.data;
    // go through the destination image pixels
    for (var y=0; y<h; y++) {
        for (var x=0; x<w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y*w+x)*4;
            // calculate the weighed sum of the source image pixels that
            // fall under the convolution matrix
            var r=0, g=0, b=0, a=0;
            for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                    var scy = sy + cy - halfSide;
                    var scx = sx + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        var srcOff = (scy*sw+scx)*4;
                        var wt = weights[cy*side+cx];
                        r += src[srcOff] * wt;          // NAN!!1
                        g += src[srcOff+1] * wt;
                        b += src[srcOff+2] * wt;
                        a += src[srcOff+3] * wt;
                    }
                }
            }
            dst[dstOff] = r;
            dst[dstOff+1] = g;
            dst[dstOff+2] = b;
            dst[dstOff+3] = a;
        }
    }
    return output;
}
function embossFilter() {
    var canvas = cursorState.lastCanvas;
    if (!canvas) return;
    var context = canvas.getContext('2d');
    var imgd = context.getImageData(0, 0, canvas.width, canvas.height);

    var kernel = [-2, -1, 0,   -1, 1, 1,    0, 1, 2];
    var filtered = convolute(imgd, kernel, 1);

    cursorState.lastCanvas.getContext('2d').putImageData(filtered, 0, 0);
}
function smoothFilter() {
    var canvas = cursorState.lastCanvas;
    if (!canvas) return;
    var context = canvas.getContext('2d');
    var imgd = context.getImageData(0, 0, canvas.width, canvas.height);

    var kernel = [1/16, 1/8, 1/16,   1/8, 1/4, 1/8,    1/16, 1/8, 1/16];
    var filtered = convolute(imgd, kernel);

    cursorState.lastCanvas.getContext('2d').putImageData(filtered, 0, 0);
}
function sharpenFilter() {
    var canvas = cursorState.lastCanvas;
    if (!canvas) return;
    var context = canvas.getContext('2d');
    var imgd = context.getImageData(0, 0, canvas.width, canvas.height);

    var kernel = [-1, -1, -1,   -1, 9, -1,   -1, -1, -1];
    var filtered = convolute(imgd, kernel);

    cursorState.lastCanvas.getContext('2d').putImageData(filtered, 0, 0);
}
function edgesFilter() {
    var canvas = cursorState.lastCanvas;
    if (!canvas) return;
    var context = canvas.getContext('2d');
    var imgd = context.getImageData(0, 0, canvas.width, canvas.height);

    var kernel = [1, -2, 1, -2, 4, -2, 1, -2, 1];
    var filtered = convolute(imgd, kernel);

    cursorState.lastCanvas.getContext('2d').putImageData(filtered, 0, 0);
}
function rotateLeft() {
    scaleOption = 1;
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    ctx.translate(canv.width/2, canv.height/2);
    ctx.rotate(90*Math.PI/180);
    ctx.drawImage(canv, -canv.width/2, -canv.height/2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);


    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
}
function rotateRight() {
    scaleOption = 1;
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    ctx.translate(canv.width/2, canv.height/2);
    ctx.rotate(270*Math.PI/180);
    ctx.drawImage(canv, -canv.width/2, -canv.height/2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
}
function flipV() {
    scaleOption = 1;
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    ctx.scale(1, -1);
    ctx.drawImage(canv, 0, -canv.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
}
function flipH() {
    scaleOption = 1;
    var canv = cursorState.lastCanvas;
    var layer = canv.nextElementSibling;
    var ctx = layer.getContext('2d');

    ctx.scale(-1, 1);
    ctx.drawImage(canv, -canv.width, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx = canv.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
    ctx.drawImage(layer, 0, 0);
    ctx = layer.getContext('2d');
    ctx.clearRect(0,0,canv.width, canv.height);
}

// окна
function vertically() {
    var canvases = document.getElementsByClassName('canvas-container');
    var top = 100;

    for (var i = 0; i < canvases.length; i++)
    {
        canvases[i].style.top = top + 'px';
        canvases[i].style.left = 0;
        top += 30;
    }
}
function horizontally() {
    var canvases = document.getElementsByClassName('canvas-container');
    var left = 0;

    for (var i = 0; i < canvases.length; i++)
    {
        canvases[i].style.top = '100px';
        canvases[i].style.left = left + 'px';
        left += 10;
    }
}
function cascady() {
    var canvases = document.getElementsByClassName('canvas-container');
    var left = 0;
    var top = 100;

    for (var i = 0; i < canvases.length; i++)
    {
        canvases[i].style.top = top + 'px';
        canvases[i].style.left = left + 'px';
        left += 10;
        top += 30;
    }
}