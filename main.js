const DEFAULT_IMG_URL = "https://avatars.mds.yandex.net/i?id=f64710d1da958f2fc884be6cb109e1faa58442e8ddd00328-5268818-images-thumbs&n=13"

const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

function medianFilter(size = 3) {
  var width = canvas.width;
  var height = canvas.height;

  var half = Math.floor(size / 2);

  var inputData = context.getImageData(0, 0, width, height).data;

  var output = context.createImageData(width, height);
  var outputData = output.data;

  for (var pixelY = 0; pixelY < height; pixelY++) {
    for (var pixelX = 0; pixelX < width; pixelX++) {
      var r = 0, g = 0, b = 0, a = 0;;

      let pixels = [];
      

      for (var filterY = 0; filterY < size; filterY++) {
        for (var filterX = 0; filterX < size; filterX++) {          

          var neighborY = Math.min(
            height - 1, Math.max(0, pixelY + filterY - half)
          );
          var neighborX = Math.min(
            width - 1, Math.max(0, pixelX + filterX - half)
          );
          
          
          var inputIndex = (neighborY * width + neighborX) * 4;
          r = inputData[inputIndex];
          g = inputData[inputIndex + 1];
          b = inputData[inputIndex + 2];
          a = inputData[inputIndex + 3];
          
          
          pixels.push([r, g, b, a, Math.round(0.299 * r + 0.5876 * g + 0.114 * b)]);
        }
      }

      
      pixels.sort((a, b) => {return a[4] - b[4]});
     
      let median = pixels[Math.floor(size * size / 2)];
      
      
      var outputIndex = (pixelY * width + pixelX) * 4;
      outputData[outputIndex] = median[0];
      outputData[outputIndex + 1] = median[1];
      outputData[outputIndex + 2] = median[2];
      outputData[outputIndex + 3] = median[3];
    }
  }
  
  context.putImageData(output, 0, 0);
}

function convolve(filter, offset = 0) {
    var width = canvas.width;
    var height = canvas.height;
  
    var size = Math.sqrt(filter.length);
    var half = Math.floor(size / 2);
  
    var inputData = context.getImageData(0, 0, width, height).data;
  
    var output = context.createImageData(width, height);
    var outputData = output.data;

    
    for (var pixelY = 0; pixelY < height; pixelY++) {
      for (var pixelX = 0; pixelX < width; pixelX++) {
        var r = 0, g = 0, b = 0;
        
       
        for (var filterY = 0; filterY < size; filterY++) {
          for (var filterX = 0; filterX < size; filterX++) {
            var weight = filter[filterY * size + filterX];
            
           
            var neighborY = Math.min(
              height - 1, Math.max(0, pixelY + filterY - half)
            );
            var neighborX = Math.min(
              width - 1, Math.max(0, pixelX + filterX - half)
            );
            
            
            var inputIndex = (neighborY * width + neighborX) * 4;
            r += inputData[inputIndex] * weight;
            g += inputData[inputIndex + 1] * weight;
            b += inputData[inputIndex + 2] * weight;
          }
        }
        
        
        var outputIndex = (pixelY * width + pixelX) * 4;
        outputData[outputIndex] = r + offset;
        outputData[outputIndex + 1] = g + offset;
        outputData[outputIndex + 2] = b + offset;
        outputData[outputIndex + 3] = 255;
      }
    }
    
    context.putImageData(output, 0, 0);
}

function uniformFilter() {
    let filter = [
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9,
    ];

    convolve(filter);
}

function sharpness() {
  let filter = [
    -0.25, -0.25, -0.25,
    -0.25, 3, -0.25,
    -0.25, -0.25, -0.25
  ];

  convolve(filter, 0);
}

function embossing() {
    let filter = [
        1, 0, 0,
        0, 0, 0,
        0, 0, -1
    ];
    
    convolve(filter, 128);
}

function simpleNoise() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (var i = 0; i < data.length; i += 4) {
        if(Math.random() > 0.95) {
            data[i] = 255;     // red
            data[i + 1] = 255; // green
            data[i + 2] = 255; // blue
        }
    }

    context.putImageData(imageData, 0, 0);
}


function drawRandomLines(count = 10) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < count; i++) {
        const x1 = Math.floor(Math.random() * canvas.width);
        const y1 = Math.floor(Math.random() * canvas.height);
        const x2 = Math.floor(Math.random() * canvas.width);
        const y2 = Math.floor(Math.random() * canvas.height);

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random()})`;
        context.lineWidth = Math.random() * 1;
        context.stroke();
    }
}


function main() {
    
    const loadButton = document.getElementById("loadButton");
    
    loadButton.addEventListener("click", () => {
        
        
        var url = urlInput.value;
        
        let image = document.createElement("img");
        
        image.onload = function() {
            canvas.setAttribute("width", canvas.offsetWidth);
            canvas.setAttribute("height", canvas.offsetHeight);

            context.drawImage(image, 0, 0, image.width, image.height,
                 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        }

        image.setAttribute("src", url);
        image.setAttribute("crossOrigin", "");
    })

    const lineNoiseButton = document.getElementById("lineNoiseButton");

    lineNoiseButton.addEventListener("click", () => {
        drawRandomLines();
    });


    
    const urlInput = document.getElementById("urlInput");
    urlInput.setAttribute("value", DEFAULT_IMG_URL);


    
    const noiseButton = document.getElementById("noiseButton");
    
    noiseButton.addEventListener("click", () => {
        simpleNoise();
    });


    
    const uniformButton = document.getElementById("uniformButton");
    
    uniformButton.addEventListener("click", () => {
        uniformFilter();
    });

    
    const medianButton = document.getElementById("medianButton");
    
    medianButton.addEventListener("click", () => {
      medianFilter();
    });

    
    const sharpnessButton = document.getElementById("sharpnessButton");
    
    sharpnessButton.addEventListener("click", () => {
        sharpness();
    });

    
    const embossingButton = document.getElementById("embossingButton");
    
    embossingButton.addEventListener("click", () => {
        embossing();
    });

    loadButton.click();
}

main()