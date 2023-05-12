var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var svgWidth = 300;
var svgHeight = 300;
var svgCanvas = document.createElement('canvas');
svgCanvas.width = svgWidth;
svgCanvas.height = svgHeight;
var svgCtx = svgCanvas.getContext('2d');

var particles = [];

var lastStamp = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  clearCanvas();
}

function clearCanvas() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas, false);

function mouseDownHandler(e) {
  var x = e.clientX;
  var y = e.clientY;

  createFireworks(x, y);
}

document.addEventListener('mousedown', mouseDownHandler);

function tick(opt = 0) {
  if (opt - lastStamp > 2000) {
    lastStamp = opt;
    createFireworks(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
  }

  context.globalCompositeOperation = 'destination-out';
  context.fillStyle = 'rgba(0,0,0,' + 10 / 100 + ')';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'lighter';

  drawFireworks();

  requestAnimationFrame(tick);
}

tick();

function createFireworks(x, y) {
  var hue = Math.random() * 360;
  var hueVariance = 30;
  var gap = 6;

  var image = new Image();
  image.src = getSvg();

  image.onload = function () {
    svgCanvas.width = this.width;
    svgCanvas.height = this.height;
    svgCtx.clearRect(0, 0, this.width, this.height);
    svgCtx.drawImage(this, 0, 0);
    var rabbitData = svgCtx.getImageData(0, 0, svgWidth, svgHeight);

    svgCtx.fillStyle = '#fff';
    svgCtx.fillRect(0, 0, svgCanvas.width, svgCanvas.height);

    for (var h = 0; h < svgHeight; h += gap) {
      for (var w = 0; w < svgWidth; w += gap) {
        var position = (svgWidth * h + w) * 4;
        var a = rabbitData.data[position + 3];

        if (!a) continue;

        var p = {};
        p.x = x;
        p.y = y;

        p.fx = x + w - svgWidth / 2;
        p.fy = y + h - svgHeight / 2;

        p.size = Math.floor(Math.random() * 2) + 1;
        p.speed = 1;

        setupColors(p, hue, hueVariance);

        particles.push(p);
      }
    }
  };
}

function setupColors(p, hue, hueVariance) {
  // 色相 0 到 360 - 0 (或 360) 为红色, 120 为绿色, 240 为蓝色
  p.hue = hue - Math.floor(Math.random() * hueVariance);
  // 亮度 0% 为暗, 50% 为普通, 100% 为白
  p.brightness = Math.floor(Math.random() * 21) + 50;
  // 透明度 0（透完全明） 1（完全不透明）
  p.alpha = (Math.floor(Math.random() * 61) + 40) / 100;
}

function drawFireworks() {
  clearCanvas();

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    p.x += (p.fx - p.x) / 10;
    p.y += (p.fy - p.y) / 10 - (p.alpha - 1) * p.speed;

    p.alpha -= 0.006;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    context.beginPath();
    context.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
    context.closePath();

    context.fillStyle = `hsla(${p.hue},100%,${p.brightness}%,${p.alpha})`;
    context.fill();
  }
}

function getSvg() {
  return `
  data:image/svg+xml;charset=utf-8,
  <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 1024 1024" width="${svgWidth}" height="${svgHeight}">
   <path d="M696.7296 754.4832h-83.5584c-14.336 0-41.5744-10.8544-41.5744-52.224v-0.8192l0.2048-0.8192 25.8048-155.648H377.6512c-12.6976 17.8176-61.8496 86.4256-98.304 135.5776 9.4208 2.6624 16.384 7.7824 21.0944 15.1552 12.9024 20.6848-1.024 49.9712-2.6624 53.248l-2.8672 5.7344H200.4992l-3.072-3.072c-31.9488-31.9488-16.9984-78.4384-16.384-80.2816l0.2048-0.6144 0.4096-0.6144c0.2048-0.6144 28.4672-56.9344 83.5584-181.0432 2.2528-5.12 8.3968-7.5776 13.5168-5.12 5.12 2.2528 7.5776 8.3968 5.12 13.5168-51.8144 116.5312-80.0768 173.8752-83.5584 181.0432-1.2288 4.5056-9.0112 34.6112 8.8064 55.7056h72.4992c2.8672-7.9872 5.7344-20.48 1.2288-27.648-3.2768-5.12-10.6496-7.7824-22.3232-7.7824h-20.48l12.288-16.384c41.3696-55.0912 110.7968-152.3712 111.4112-153.3952l3.072-4.3008h254.7712L591.872 703.2832c0.4096 28.8768 17.8176 30.9248 21.2992 30.9248h62.2592c-4.7104-34.6112-32.3584-42.3936-33.5872-42.8032l-13.1072-3.4816 6.9632-11.6736 104.8576-174.8992c1.2288-1.8432 31.3344-46.4896 78.4384-46.4896 38.0928 0 70.0416 26.624 78.0288 62.2592l65.1264-43.4176c-1.4336-21.7088-10.8544-102.6048-76.5952-124.7232l-3.2768-1.024-25.3952-38.2976c-0.8192-1.024-1.8432-1.8432-3.2768-1.8432-0.8192 0-2.2528 0-3.4816 1.2288l-40.7552 40.7552h-464.896c-64.1024 0-94.0032 68.608-122.88 134.7584-28.0576 64.512-57.1392 131.072-119.1936 131.072-3.2768 0-6.7584-0.2048-10.4448-0.6144l-1.024-0.2048-1.024-0.4096C41.5744 598.2208 40.96 564.224 40.96 562.7904h20.48c0 0.6144 1.2288 20.48 33.9968 31.5392 53.6576 5.3248 79.872-54.8864 107.52-118.3744 30.1056-69.0176 64.1024-147.0464 141.7216-147.0464H800.768l34.6112-34.6112c5.3248-5.3248 12.4928-7.7824 19.8656-7.168 7.3728 0.6144 14.1312 4.7104 18.432 10.8544l21.7088 32.5632c86.4256 31.744 87.4496 143.36 87.4496 148.2752v5.5296l-104.2432 69.632v-19.0464c0-32.768-26.8288-59.5968-59.5968-59.5968-34.816 0-59.392 34.6112-61.2352 37.2736l-98.304 164.0448c16.9984 9.216 37.2736 30.1056 37.2736 67.7888v10.0352z" fill="" p-id="6524"></path>
   <path d="M478.208 754.4832h-96.0512l-3.072-3.072c-29.0816-28.8768-30.9248-45.2608-42.5984-152.9856l-2.2528-20.6848c-0.6144-5.5296 3.4816-10.6496 9.0112-11.264 5.5296-0.6144 10.6496 3.4816 11.264 9.0112l2.2528 20.6848c11.0592 101.376 12.6976 115.9168 33.792 137.6256h70.656c0.6144-7.168 0-17.8176-5.9392-25.3952-5.3248-6.5536-14.336-10.0352-27.2384-10.0352h-4.096l-3.072-3.072c-3.072-3.072-3.072-3.072-3.072-26.2144v-41.3696-60.0064c0-5.7344 4.5056-10.24 10.24-10.24s10.24 4.5056 10.24 10.24c0 37.0688-0.2048 89.4976 0 110.592 14.5408 1.8432 25.6 7.5776 33.1776 17.408 15.7696 20.2752 8.8064 49.3568 8.3968 50.7904l-1.6384 7.9872zM896.8192 754.4832H800.768l-3.072-3.072c-28.0576-28.2624-68.608-82.3296-111.616-139.4688l-1.024-1.2288c-3.4816-4.5056-2.4576-10.8544 2.048-14.336 4.5056-3.4816 10.8544-2.4576 14.336 2.048l1.024 1.2288c39.1168 52.224 79.6672 106.0864 106.9056 134.3488h70.656c0.6144-7.168 0-17.8176-5.9392-25.3952-5.3248-6.5536-14.336-10.0352-27.2384-10.0352h-5.9392l-2.8672-5.12c-55.296-97.4848-76.8-159.1296-77.6192-161.792-1.8432-5.3248 1.024-11.264 6.3488-12.9024 5.3248-1.8432 11.264 1.024 13.1072 6.3488 0.2048 0.6144 20.8896 60.416 73.1136 153.1904 16.384 1.2288 29.0816 7.168 37.2736 17.8176 15.7696 20.2752 8.8064 49.3568 8.3968 50.7904l-1.8432 7.5776zM923.4432 405.504c-4.5056 8.3968-15.1552 11.4688-23.552 6.9632-8.3968-4.5056-11.4688-15.1552-6.9632-23.552l30.5152 16.5888zM414.3104 419.4304h-0.4096c-5.7344-0.2048-10.0352-4.9152-9.8304-10.6496l2.2528-69.8368c0.2048-5.7344 4.9152-10.0352 10.6496-9.8304 5.7344 0.2048 10.0352 4.9152 9.8304 10.6496l-2.2528 69.8368c-0.2048 5.5296-4.7104 9.8304-10.24 9.8304zM494.1824 489.0624c-5.7344 0-10.24-4.5056-10.24-10.24v-139.4688c0-5.7344 4.5056-10.24 10.24-10.24s10.24 4.5056 10.24 10.24v139.4688c0 5.7344-4.5056 10.24-10.24 10.24zM571.8016 419.4304h-0.4096c-5.7344-0.2048-10.0352-4.9152-9.8304-10.6496l2.2528-69.8368c0.2048-5.7344 4.9152-10.0352 10.6496-9.8304 5.7344 0.2048 10.0352 4.9152 9.8304 10.6496l-2.2528 69.8368c-0.2048 5.5296-4.7104 9.8304-10.24 9.8304zM651.6736 489.0624c-5.7344 0-10.24-4.5056-10.24-10.24v-139.4688c0-5.7344 4.5056-10.24 10.24-10.24s10.24 4.5056 10.24 10.24v139.4688c0 5.7344-4.5056 10.24-10.24 10.24z" fill="" p-id="6525"></path>
  </svg>
`;
}
