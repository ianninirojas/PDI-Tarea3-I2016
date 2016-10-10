function handleFiles(e) { 
	var file = e.target.files[0];
	var reader = new FileReader();  
	reader.addEventListener("load",processimage, false);  
	reader.readAsArrayBuffer(file); 
	name = file.name;
}

function processimage(e) { 
	var buffer = e.target.result; 
	var bitmap = getBMP(buffer); 
	var imageData = convertToImageData(bitmap); 
	info = bitmap;	
	ImagenOriginal = imageData;
	Imagen = imageData;	
	factorZoom = 1;
	anguloD = 0;
	resetear();
	undo.push(imageData);
	undoAngulos.push(0);
	pintar(imageData,imageData.width,imageData.height);
}

function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

function RGB(pixel) {
	var maskR = 0xFF0000,
		maskG = 0x00FF00,
		maskB = 0x0000FF;
		
	return {r: (pixel & maskR)>>16, g: (pixel & maskG)>>8, b: (pixel & maskB)};
} 

function getBMP(buffer) { 

	var datav = new DataView(buffer); 
	var bitmap = {};

	bitmap.fileheader = {}; 
	bitmap.fileheader.bfType 	  = datav.getUint16(0, true); 
	bitmap.fileheader.bfSize 	  = datav.getUint32(2, true); 
	bitmap.fileheader.bfReserved1 = datav.getUint16(6, true); 
	bitmap.fileheader.bfReserved2 = datav.getUint16(8, true); 
	bitmap.fileheader.bfOffBits   = datav.getUint32(10, true);

	bitmap.infoheader = {};
	bitmap.infoheader.biSize 	      = datav.getUint32(14, true);
	bitmap.infoheader.biWidth 	      = datav.getUint32(18, true); 
	bitmap.infoheader.biHeight 	      = datav.getUint32(22, true); 
	bitmap.infoheader.biPlanes 	      = datav.getUint16(26, true); 
	bitmap.infoheader.biBitCount 	  = datav.getUint16(28, true); 
	bitmap.infoheader.biCompression   = datav.getUint32(30, true); 
	bitmap.infoheader.biSizeImage 	  = datav.getUint32(34, true); 
	bitmap.infoheader.biXPelsPerMeter = datav.getUint32(38, true); 
	bitmap.infoheader.biYPelsPerMeter = datav.getUint32(42, true); 
	bitmap.infoheader.biClrUsed 	  = datav.getUint32(46, true); 
	bitmap.infoheader.biClrImportant  = datav.getUint32(50, true);

	var startData = bitmap.fileheader.bfOffBits;  
	bitmap.stride = Math.floor((bitmap.infoheader.biBitCount*bitmap.infoheader.biWidth +31) / 32) * 4;
	bitmap.pixels = new Uint8Array(buffer, startData);					

	if ( bitmap.infoheader.biBitCount == 24 ) {

		bitmap.PC = false;			
	} 
	else {	
		
		bitmap.PC = true;
		
		var startPaleta = 54,
			colores = [],
			k = 0;
		
		for ( startPaleta; startPaleta < startData; startPaleta = startPaleta+4 ){
				colores[k] = datav.getUint32(startPaleta,true);
				k++;
		}
	}
	
	bitmap.paleta = colores;
	
	return bitmap; 
}

function ReadData(bitmap, x, y) {
      
      var byteToRead,
		  bitToRead;
	
		switch(bitmap.infoheader.biBitCount) {

			case 1: 
			  byteToRead = Math.ceil(y * bitmap.stride + x / 8);
			  bitToRead = (7 - (x % 8));
			  return (0x1 & (bitmap.pixels[byteToRead] >> bitToRead));

			case 4:
			  byteToRead = Math.ceil(y * bitmap.stride + x / 2);
			  bitesToRead = ((x % 2) == 0) ? 4 : 0;
			  return (0xF & (bitmap.pixels[byteToRead] >> bitesToRead));

			case 8:
			  byteToRead = (y * bitmap.stride) + x;
			  return (0xFF & bitmap.pixels[byteToRead]);
		  }
    }

function convertToImageData(bitmap) { 
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"); 
	var Width = bitmap.infoheader.biWidth; 
	var Height = bitmap.infoheader.biHeight; 
	var imageData = ctx.createImageData(Width, Height);
	var data = imageData.data;
	var bmpdata = bitmap.pixels; 
	var stride = bitmap.stride;
	var pixel;

	if ( bitmap.PC) {
		
		for (var y = 0; y < Height; ++y) { 
			for (var x = 0; x < Width; ++x) {
				var index1 = (x+Width*(Height-y))*4; 
				
				pixel = ReadData(bitmap,x,y);
				color = bitmap.paleta[pixel];
				M_RGB = RGB(color);
				
				data[index1] = M_RGB.r;
				data[index1 + 1] = M_RGB.g; 
				data[index1 + 2] = M_RGB.b;
				data[index1 + 3] = 255;
			} 
		}                    
	}
	else {
		for (var y = 0; y < Height; ++y) { 
			for (var x = 0; x < Width; ++x) { 
				var index1 = (x+Width*(Height-y))*4; 
				var index2 = x * 3 + stride * y;
				data[index1] = bmpdata[index2 + 2];
				data[index1 + 1] = bmpdata[index2 + 1];
				data[index1 + 2] = bmpdata[index2];
				data[index1 + 3] = 255;
			} 
		}
	}
	return imageData;
}

function pintar(imagedata, w, h){
	canvas1.width = w;
	canvas1.height= h;	
	ctx1.clearRect(0, 0, canvas1.width, canvas1.height);	
	ctx1.putImageData(imagedata, 0, 0);
}

function resetear(){
	document.getElementById('angulo').value = null;
	document.getElementById("newWidht").value = null;
	document.getElementById("newHeight").value = null;
	document.getElementById("Threshold").value = null;
	document.getElementById("ValueBrillo").value = 0;
	document.getElementById("ValueContrast").value = 0;
}

function setPixel(imagedata, x, y, r, g, b, a) {
	var i = (y * imagedata.width + x) * 4;
	imagedata.data[i++] = r;
	imagedata.data[i++] = g;
	imagedata.data[i++] = b;
	imagedata.data[i] = a;
}

function getPixel(imagedata, x, y) {
	var i = (y * imagedata.width + x) * 4;
	return {r: imagedata.data[i], g: imagedata.data[i+1], b: imagedata.data[i+2], a: imagedata.data[i+3]};
}

function Controlador(opcion) {
	if (opcion == "Negativo") {
		Negativo(Imagen);
	}
	else if (opcion == "Original") {
		Original(Imagen);		
	}
	else if (opcion == "Gris") {
		Gris(Imagen);
	}	
	else if (opcion == "Scale") {
		Scale(Imagen);
	}		
	else if (opcion == "EspejoH") {
		EspejoH(Imagen);
	}
	else if (opcion == "EspejoV") {
		EspejoV(Imagen);
	}	
	else if (opcion == "Umbralizar") {
		Umbralizacion(Imagen);
	}
	else if (opcion == "Ecualizar") {
		Ecualizar(Imagen);
	}
	undo.push(Imagen);
	factorZoom = 1;
	if 	(rotar) {Rotar(0);}
	else 		{pintar(Imagen,Imagen.width, Imagen.height);}
}

function Original(imagedata){
	Imagen = ImagenOriginal;	
	anguloD = 0;
}

function Negativo(imagedata) {
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenNeg = ctx.createImageData(Width, Height);

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = 0 ; x < Width; x++ ) {
		  RGBA = getPixel(imagedata,x,y);
 		  setPixel(ImagenNeg, x, y, 255-RGBA.r, 255-RGBA.g, 255-RGBA.b, RGBA.a);
	  }
	}
	
	Imagen = ImagenNeg;	
}

function Gris(imagedata) {
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenGris = ctx.createImageData(Width, Height);
		

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = 0 ; x < Width; x++ ) {
		  RGBA = getPixel(imagedata,x,y);		  
		  var Gris = Math.round(0.299*RGBA.r+0.587*RGBA.g+0.114*RGBA.b);
		  setPixel(ImagenGris, x, y, Gris, Gris, Gris, RGBA.a);
	  }
	}

	Imagen = ImagenGris;
}

function Rotar(angulo){
	rotar = true;
    anguloD = anguloD + (angulo * Math.PI / 180);
	if (anguloD > 360*Math.PI/180) {		
		anguloD = anguloD - 360*Math.PI/180
	}
	
	if (anguloD < (-1*360)*Math.PI/180) {
		anguloD = anguloD - (-1*360)*Math.PI/180
	}
	
    var Width = Imagen.width,
    	Height = Imagen.height,
    	coseno = Math.cos(anguloD),
    	seno = Math.sin(anguloD),
		x1 = 0, y1 = 0,
		x2 = Math.floor((Width - 1) * coseno),                       y2 = Math.floor(-(Width - 1) * seno),
		x3 = Math.floor((Height - 1) * seno),                        y3 = Math.floor((Height - 1) * coseno),
		x4 = Math.floor((Width - 1) * coseno + (Height - 1) * seno), y4 = Math.floor(-(Width - 1) * seno + (Height - 1) * coseno),
		minX = Math.min(x1, x2, x3, x4), 							 minY = Math.min(y1, y2, y3, y4),
		maxX = Math.max(x1, x2, x3, x4), 							 maxY = Math.max(y1, y2, y3, y4),
		newWidth = maxX - minX + 1, 								 newHeight = maxY - minY + 1,
		dx = minX, 													 dy = minY;
    
    canvas = document.createElement("canvas"); 
    var ctx = canvas.getContext("2d"),
        ImagenRotate = ctx.createImageData(newWidth,newHeight),
        coseno = Math.cos(-anguloD),
        seno = Math.sin(-anguloD);
    
    for (var y = 0; y < newHeight; y++) {
        for (var x = 0; x < newWidth; x++) {
            var newx = (x + dx) * coseno + (y + dy) * seno;
            var newy = -(x + dx) * seno + (y + dy) * coseno;
            if ( ((newx > 0) && (newx <= Width)) && ((newy >= 0) && (newy <= Height))) {
				RGBA = Interpolation(Imagen, newx, newy);
                setPixel(ImagenRotate, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
            }
            else {
                setPixel(ImagenRotate, x, y, 255, 255, 255, 255);
            }
        }
    }
    pintar(ImagenRotate, ImagenRotate.width, ImagenRotate.height);
}

function RotacionD() {
	var angulo = document.getElementById("angulo").value;
	undoAngulos.push(-1*angulo * Math.PI / 180);
	console.log(undoAngulos);
	Rotar(-1*angulo);
}

function RotacionI() {
	var angulo = document.getElementById("angulo").value;	
	undoAngulos.push(angulo * Math.PI / 180);
	console.log(undoAngulos);
	Rotar(angulo);
}

function ZoomIn(){
	factorZoom = factorZoom*2;
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,	
		ZoomIn = ctx.createImageData(Width,Height);

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = 0 ; x < Width; x++ ) {	
		  RGBA = Interpolation(Imagen, x/factorZoom, y/factorZoom);
		  
		  setPixel(ZoomIn, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
	  }
	}	
	
	pintar(ZoomIn,ZoomIn.width, ZoomIn.height);
}

function ZoomOut(){
	factorZoom = factorZoom/2;
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,	
		ZoomOut = ctx.createImageData(Width,Height);

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = 0 ; x < Width; x++ ) {	
		  RGBA = Interpolation(Imagen, x/factorZoom, y/factorZoom);
		setPixel(ZoomOut, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
	  }
	}					
	pintar(ZoomOut,Imagen.width, Imagen.height);
}

function Scale(imagedata){
	
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,	
		scalew = document.getElementById("newWidht").value,
		scaleh = document.getElementById("newHeight").value,		
		widthScaled = scalew / imagedata.width,
		heightScaled = scaleh / imagedata.height,
		ImageScale = ctx.createImageData(scalew, scaleh);


	for( var y = 0 ; y < scaleh; y++ ) {
	  for( var x = 0 ; x < scalew; x++ ) {		  
		  RGBA = Interpolation(Imagen, Math.floor(x / widthScaled), Math.floor(y / heightScaled));
		  setPixel(ImageScale, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
	  }
	}
	
	Imagen = ImageScale;		
}

function Brillo(valor) {
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenBrillo = ctx.createImageData(Width, Height);

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = 0 ; x < Width; x++ ) {
		  RGBA = getPixel(ImagenOriginal,x,y);
		  
		  if ( RGBA.r != 255 ) 
			  RGBA.r = RGBA.r + valor;
		  
		  if ( RGBA.g != 255 ) 
			  RGBA.g = RGBA.g + valor;
		  
		  if ( RGBA.b != 255 ) 
			  RGBA.b = RGBA.b + valor;
		  
		  setPixel(ImagenBrillo, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
	  }
	}
	
	Imagen = ImagenBrillo;
	if 	(rotar) {Rotar(0);}
	else 		{pintar(Imagen,Imagen.width, Imagen.height);}
}

function Contraste(value){
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenContrast = ctx.createImageData(Width, Height),
	
	factor = (259*(value+255))/(255*(259-value));
	for ( y = 0; y < Height; y++) {
		for ( x = 0; x < Width; x++) {
			RGBA = getPixel(ImagenOriginal, x, y);
			RGBA.r = clamp((factor*(RGBA.r-128)+128));
			RGBA.g = clamp((factor*(RGBA.g-128)+128));
			RGBA.b = clamp((factor*(RGBA.b-128)+128));
			
			setPixel(ImagenContrast, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
		}
	}
	
	Imagen = ImagenContrast;
	if 	(rotar) {Rotar(0);}
	else 		{pintar(Imagen,Imagen.width, Imagen.height);}
} 

function EspejoH(imagedata) {

	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenEsp = ctx.createImageData(Width, Height),
		p = 0;

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = Width-1 ; x >= 0 ; x-- ) {
		  RGBA = getPixel(imagedata,x,y);
		  setPixel(ImagenEsp, p, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
		  p++;
	  }
		p = 0;
	}
	
	Imagen = ImagenEsp;	
}

function EspejoV(imagedata) {

	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		p = Height-1,
		ImagenEsp = ctx.createImageData(Width, Height);

	for( var y = 0 ; y < Height; y++ ) {
	  for( var x = 0 ; x < Width; x++ ) {
		  RGBA = getPixel(imagedata,x,y);
		  setPixel(ImagenEsp, x, p, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
	  }
		p--;
	}

	Imagen = ImagenEsp;	
}

function Umbralizacion(imagedata) {
	
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenUmbra = ctx.createImageData(Width, Height);
	
	var threshold = document.getElementById("Threshold").value;
	
	for( var y = 0 ; y < Imagen.height; y++ ) {
		for( var x = 0 ; x < Imagen.width; x++ ) {
			RGBA = getPixel(Imagen,x,y);		  
			if ( RGBA.r < threshold) {
				RGBA.r = 0; RGBA.g = 0; RGBA.b = 0; 
			}
			else {
				RGBA.r = 255; RGBA.g = 255; RGBA.b = 255; 
			}			
			
			setPixel(ImagenUmbra, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a);
		}
	}
	
	Imagen = ImagenUmbra;	
}

function Ecualizar(imagedata) {	
	
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenEQ = ctx.createImageData(Width, Height),
		HR = [255],
		HG = [255],
		HB = [255],
		HRE = [255],
		HGE = [255],
		HBE = [255],
		acumR = 0,
		acumG = 0,
		acumB = 0,
		factorEcualizador = 255/(Width*Height);
  
	for ( var i = 0; i < 256; i++ ) {
		HR[i] = 0;
		HG[i] = 0;
		HB[i] = 0;
		HRE[i] = 0;
		HGE[i] = 0;
		HBE[i] = 0;
	}
  
	for( var y = 0 ; y < Height; y++ ) {
		for( var x = 0 ; x < Width; x++ ) {
			RGBA = getPixel(imagedata,x,y);
			HR[RGBA.r]++;
			HG[RGBA.g]++;
			HB[RGBA.b]++;
		}
	}
	
	for ( var i = 0; i < 256; i++ ) {
		acumR += HR[i];
		HRE[i] = (acumR * factorEcualizador);

		if(HRE[i] > 255)
			HRE[i] = 255;

		acumG += HG[i];
		HGE[i] = (acumG * factorEcualizador);

		if(HGE[i] > 255)
			HGE[i] = 255;

		acumB += HB[i];
		HBE[i] = (acumB * factorEcualizador);

		if(HBE[i] > 255)
			HBE[i] = 255;
	}
	
	for( var y = 0 ; y < Height; y++ ) {
		for( var x = 0 ; x < Width; x++ ) {
			RGBA = getPixel(imagedata,x,y);
			RGBA.r = HRE[RGBA.r];
			RGBA.g = HGE[RGBA.g];
			RGBA.b = HBE[RGBA.b];
			setPixel(ImagenEQ, x, y, RGBA.r, RGBA.g, RGBA.b, RGBA.a)
		}
	}
	Imagen = ImagenEQ;
}

function Histograma(){
	while ( document.getElementById("ModalHistograma").childElementCount != 0 ) {
		var node = document.getElementById("ModalHistograma").firstChild;		
		document.getElementById("ModalHistograma").removeChild(node);
	}
		
	var div = document.createElement('div');
	div.style.width = "85%";
	div.style.height = "450px";
	
	TESTER = div;
	var Width = Imagen.width,
		Height = Imagen.height,
		HR = [255],
		HG = [255],
		HB = [255],
		Ex = [255];

	for ( var i = 0; i < 256; i++ ) {
		HR[i] = 0;
		HG[i] = 0;
		HB[i] = 0;
		Ex[i] = i;
	}

	for( var y = 0 ; y < Height; y++ ) {
		for( var x = 0 ; x < Width; x++ ) {
			RGBA = getPixel(Imagen,x,y);
			HR[RGBA.r]++;
			HG[RGBA.g]++;
			HB[RGBA.b]++;
		}
	}

	estaGris=true;

	for ( var i = 0; i < 256; i++ ) {
		if (HR[i]!=HG[i]){
			estaGris=false;
		}
	}

	if (estaGris) {
		Plotly.newPlot( TESTER, [{
			x: Ex,
			y: HR,
			marker: {
			color: 'rgb(0, 0, 0)'
		}
		}], 
		{margin: { t: 25}});

		console.log( Plotly.BUILD );
	}
	else {

		Plotly.newPlot( TESTER, [{
			x: Ex,
			y: HR,
			name: 'Rojo',
			marker: {
				color: 'rgb(255, 0, 0)'
			}
		}], 
		{margin: { t: 25}});

		Plotly.plot( TESTER, [{
			x: Ex,
			y: HG,
			name: 'Verde',
			marker: {
				color: 'rgb(0, 255, 0)'
			}
		}], 
		{margin: { t: 25} });

		Plotly.plot( TESTER, [{
			x: Ex,
			y: HB,
			name: 'Azul',
			marker: {
				color: 'rgb(0, 0, 255)'
			}
		}], 
		{margin: { t: 25} });

		console.log( Plotly.BUILD );        
	}
	
	
	var canvasImage = document.createElement('canvas'),
		ctxcanvasImage = canvasImage.getContext('2d');	
	
	canvasImage.style.width = "500px";
	canvasImage.style.height = "400px";
	canvasImage.style.margin = "0 100px";	
	
	canvasImage.width = Imagen.width;
	canvasImage.height= Imagen.height;	
	ctxcanvasImage.clearRect(0, 0, canvasImage.width, canvasImage.height);	
	ctxcanvasImage.putImageData(Imagen, 0, 0);
	
	document.getElementById("ModalHistograma").appendChild(div); 
	document.getElementById("ModalHistograma").appendChild(canvasImage); 
}

function MostrarInforBMP() {
	
	while ( document.getElementById("InfoBMP").childElementCount != 0 ) {
		var node = document.getElementById("InfoBMP").firstChild;		
		document.getElementById("InfoBMP").removeChild(node);
	}
		
	var nombre 			= document.createElement('p'),
		bfType			= document.createElement('p'),
		bfSize 			= document.createElement('p'),
		biSize 			= document.createElement('p'),
		biWidth 		= document.createElement('p'),
		biHeight 		= document.createElement('p'),
		biPlanes 		= document.createElement('p'),
		biBitCount 		= document.createElement('p'),
		biCompression 	= document.createElement('p'),
		biSizeImage 	= document.createElement('p'),
		biXPelsPerMeter = document.createElement('p'),
		biYPelsPerMeter = document.createElement('p'),
		biClrUsed 		= document.createElement('p'),
		biClrImportant	= document.createElement('p');
	
	var textnode = document.createTextNode('Nombre: '); 
	nombre.appendChild(textnode);	
	textnode = document.createTextNode(name); 
	nombre.appendChild(textnode);
	document.getElementById("InfoBMP").appendChild(nombre); 
	
	textnode = document.createTextNode('Numero Magico: '); 
	bfType.appendChild(textnode);
	textnode = document.createTextNode(info.fileheader.bfType); 
	bfType.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(bfType); 
	
	textnode = document.createTextNode('Tamaño total del archivo: '); 
	bfSize.appendChild(textnode);
	textnode = document.createTextNode(info.fileheader.bfSize); 
	bfSize.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(bfSize); 
	
	textnode = document.createTextNode('Tamaño de encabezado: '); 
	biSize.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biSize); 
	biSize.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biSize); 
	
	textnode = document.createTextNode('Ancho de imagen: '); 
	biWidth.appendChild(textnode);
	textnode = document.createTextNode(Imagen.width); 
	biWidth.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biWidth); 
	
	textnode = document.createTextNode('Alto de imagen: '); 
	biHeight.appendChild(textnode);
	textnode = document.createTextNode(Imagen.height); 
	biHeight.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biHeight); 
	
	textnode = document.createTextNode('Número de planos: '); 
	biPlanes.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biPlanes); 
	biPlanes.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biPlanes); 
	
	textnode = document.createTextNode('Profundidad: '); 
	biBitCount.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biBitCount); 
	biBitCount.appendChild(textnode);
	document.getElementById("InfoBMP").appendChild(biBitCount); 	
	
	textnode = document.createTextNode('Metodo de compresión: '); 
	biCompression.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biCompression); 
	biCompression.appendChild(textnode);
	document.getElementById("InfoBMP").appendChild(biCompression); 	
	
	textnode = document.createTextNode(' Tamaño total de la imagen: '); 
	biSizeImage.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biSizeImage); 
	biSizeImage.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biSizeImage); 
	
	textnode = document.createTextNode('Resolución horizontal: '); 
	biXPelsPerMeter.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biXPelsPerMeter); 
	biXPelsPerMeter.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biXPelsPerMeter); 
	
	textnode = document.createTextNode('Resolución vertical: '); 
	biYPelsPerMeter.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biYPelsPerMeter); 
	biYPelsPerMeter.appendChild(textnode);	
	document.getElementById("InfoBMP").appendChild(biYPelsPerMeter); 
	
	textnode = document.createTextNode('Número de colores de la paleta: '); 
	biClrUsed.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biClrUsed); 
	biClrUsed.appendChild(textnode);
	document.getElementById("InfoBMP").appendChild(biClrUsed); 
	
	textnode = document.createTextNode('Número de colores importantes de la paleta: '); 
	biClrImportant.appendChild(textnode);
	textnode = document.createTextNode(info.infoheader.biClrImportant); 
	biClrImportant.appendChild(textnode);
	document.getElementById("InfoBMP").appendChild(biClrImportant); 
}

function get_rgb_bilinear(x, y, imagedata) {
	var x0 = Math.floor(x),
		y0 = Math.floor(y),
		dx = x-x0,
		dy = y-y0,
		
		RGBA0 = getPixel(imagedata, x0  ,y0  ),
		RGBA1 = getPixel(imagedata, x0+1,y0  ),
		RGBA2 = getPixel(imagedata, x0+1,y0+1),
		RGBA3 = getPixel(imagedata, x0  ,y0+1),

		r = lerp (lerp (RGBA0.r, RGBA1.r, dx), lerp (RGBA3.r, RGBA2.r, dx), dy),
		g = lerp (lerp (RGBA0.g, RGBA1.g, dx), lerp (RGBA3.g, RGBA2.g, dx), dy),
		b = lerp (lerp (RGBA0.b, RGBA1.b, dx), lerp (RGBA3.b, RGBA2.b, dx), dy);

	return {r: r, g: g, b: b, a: 255};
}

function lerp(v1,v2,ratio) {
	return v1*(1-ratio)+v2*ratio;
}

function clamp(value) {
	if(value < 0) return 0;
	else if(value > 255) return 255;
	return value;
}

function NearestNeighbor(x,y,imagedata) {
	RGBA = getPixel(imagedata, Math.floor(x), Math.floor(y));
	return {r: RGBA.r, g: RGBA.g, b: RGBA.b, a: RGBA.a};
}

function InterpolationMethod(method) {
	if ( method == "Bilinear" ) {
		bl = true;
	}
	else {
		bl = false;
	}	
}

function Interpolation( imagedata, x, y) {
	if (bl) {
		RGBA = get_rgb_bilinear(x, y, imagedata)
	}
	else {
		RGBA = NearestNeighbor(x, y, imagedata);
	}	
	
	return {r: RGBA.r, g: RGBA.g, b: RGBA.b, a: RGBA.a};
}

function Filtros(opcion){
    
    tam = document.getElementById("tamanioKernel").value
    
    if (opcion == "Sobel") {
		Sobel(tam);
	}
	else if (opcion == "Laplace") {
		Laplace(tam);
	}
	else if (opcion == "Perfilado") {
		Perfilado(tam);
	}
	else if (opcion == "Media") {
		Media(tam);
	}    
	else if (opcion == "Gauss") {
		Gauss(tam);
	} 
	else if (opcion == "Propio") {
		Propio(tam);
	}
	undo.push(Imagen);
	factorZoom = 1;
	if 	(rotar) {Rotar(0);}
	else 		{pintar(Imagen,Imagen.width, Imagen.height);}
       
}

function Sobel(tam) { 
    
    var Kernel_X = new Array(tam),
        Kernel_Y = new Array(tam),
        half = Math.floor(tam/2);
    
    for (var i = 0; i < tam; i++) {
        Kernel_X[i] = new Array(tam);
        for (var j = 0; j < tam; j++) {
            if ( j < half) {
                Kernel_X[i][j] = -1;   
            }
            else { 
                Kernel_X[i][j] = 1;    
            }
            
            if ( i == half && j < half) {
                Kernel_X[i][j] = -2;
            }
            else if ( i == half && j > half) {
                Kernel_X[i][j] = 2;
            }
            
            if ( j == half) {
                Kernel_X[i][j] = 0;  
            }
        }   
    }
    
    for (var i = 0; i < tam; i++) {
        Kernel_Y[i] = new Array(tam);
        for (var j = 0; j < tam; j++) {
            if ( i < half) {        
                Kernel_Y[i][j] = -1;
            }
            else {       
                Kernel_Y[i][j] = 1;
            }
            
            if ( j == half && i < half) {
                Kernel_Y[i][j] = -2;
            }
            else if ( j == half && i > half) {
                Kernel_Y[i][j] = 2;
            }
            
            if ( i == half) { 
                Kernel_Y[i][j] = 0; 
            }
        }   
    }
    
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenSobel = ctx.createImageData(Width, Height);
        
    for(var y = 0; y < Height; y++)
    {
        for( var x = 0; x < Width; x++)
        {            
            var resXr = 0, resXg = 0, resXb = 0, resXa = 0,
                resYr = 0, resYg = 0, resYb = 0, resYa = 0,
                    r = 0 ,    g = 0,     b = 0,     a = 0;
            
            for(var i = 0; i < tam; i++)
            {
                for(var j = 0; j < tam; j++)
                {
                    pixel = getPixel(Imagen, x+j, y+i);
                    
                    resXr += Kernel_X[i][j] * pixel.r;
                    resXg += Kernel_X[i][j] * pixel.g;
                    resXb += Kernel_X[i][j] * pixel.b;
                    
                    resYr += Kernel_Y[i][j] * pixel.r;
                    resYg += Kernel_Y[i][j] * pixel.g;
                    resYb += Kernel_Y[i][j] * pixel.b;
                }
            }
        
            r = Math.sqrt( Math.pow(resXr,2) + Math.pow(resYr,2) );
            g = Math.sqrt( Math.pow(resXg,2) + Math.pow(resYg,2) );
            b = Math.sqrt( Math.pow(resXb,2) + Math.pow(resYb,2) );
            
            setPixel(ImagenSobel, x, y, r, g, b, 255);
        }
    }
    
    Imagen = ImagenSobel;
}

function Laplace(tam) {
    
    var kernel = new Array(tam);
    var half = Math.floor(tam/2);
    
    for (var i = 0; i < tam; i++) {
        kernel[i] = new Array(tam);
        for (var j = 0; j < tam; j++) {
            kernel[i][j] = -1;
        }   
    }
    
    kernel[half][half] = tam*tam-1;
    
    
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenMedia = ctx.createImageData(Width, Height);
        
    for(var y = 0; y < Height; y++)
    {
        for( var x = 0; x < Width; x++)
        {            
            var resr = 0,
                resg = 0,
                resb = 0,
                resa = 0,
                sy = y,
                sx = x;
            
            for(var i = 0; i < tam; i++)
            {
                for(var j = 0; j < tam; j++)
                {
                    pixel = getPixel(Imagen, x+j, y+i);
                    
                    resr = resr + kernel[i][j] * pixel.r;
                    resg = resg + kernel[i][j] * pixel.g;
                    resb = resb + kernel[i][j] * pixel.b;
                    resa = resa + kernel[i][j] * pixel.a;
                }
            }
            resr = clamp(resr);
            resg = clamp(resg);
            resb = clamp(resb);
            resa = clamp(resa);
            setPixel(ImagenMedia, x, y, resr, resg, resb,255);
        }
    }
    Imagen = ImagenMedia;
    
}

function Perfilado(tam) {
    
    a = document.getElementById("peso").value;
    var kernel = new Array(tam);
    var half = Math.floor(tam/2);
    var factor = 0;
    
    for (var i = 0; i < tam; i++) {
        kernel[i] = new Array(tam);
        for (var j = 0; j < tam; j++) {
            if (i==half || j==half) {
                kernel[i][j] = -a;
                factor++;
            }
            else
                kernel[i][j] = 0;
        }   
    }
    
    kernel[half][half] = (factor-1)*a+1;
    
    
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenMedia = ctx.createImageData(Width, Height);
        
    for(var y = 0; y < Height; y++)
    {
        for( var x = 0; x < Width; x++)
        {            
            var resr = 0,
                resg = 0,
                resb = 0,
                resa = 0,
                sy = y,
                sx = x;
            
            for(var i = 0; i < tam; i++)
            {
                for(var j = 0; j < tam; j++)
                {
                    pixel = getPixel(Imagen, x+j, y+i);
                    
                    resr = resr + kernel[i][j] * pixel.r;
                    resg = resg + kernel[i][j] * pixel.g;
                    resb = resb + kernel[i][j] * pixel.b;
                    resa = resa + kernel[i][j] * pixel.a;
                }
            }
            resr = clamp(resr);
            resg = clamp(resg);
            resb = clamp(resb);
            resa = clamp(resa);
            setPixel(ImagenMedia, x, y, resr, resg, resb,255);
        }
    }
    Imagen = ImagenMedia;
    
}

function Media(tam) {    
    
    var kernel = new Array(tam);
    var half = Math.floor(tam/2);
    
    for (var i = 0; i < tam; i++) {
        kernel[i] = new Array(tam);
        for (var j = 0; j < tam; j++) {
            kernel[i][j] = 1;
        }   
    }
    
    factor = 1/(tam*tam);
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenMedia = ctx.createImageData(Width, Height);
        
    for(var y = 0; y < Height; y++)
    {
        for( var x = 0; x < Width; x++)
        {            
            var resr = 0,
                resg = 0,
                resb = 0,
                resa = 0;
            
            for(var i = 0; i < tam; i++)
            {
                for(var j = 0; j < tam; j++)
                {
                    pixel = getPixel(Imagen, x+j, y+i);
                    
                    resr = resr + kernel[i][j] * pixel.r;
                    resg = resg + kernel[i][j] * pixel.g;
                    resb = resb + kernel[i][j] * pixel.b;
                    resa = resa + kernel[i][j] * pixel.a;
                }
            }
            resr = clamp((factor)*resr);
            resg = clamp((factor)*resg);
            resb = clamp((factor)*resb);
            resa = clamp((factor)*resa);
            if ( x == 0 || y == 0 || x == Width-1 || y == Height-1 ) {                
                setPixel(ImagenMedia,x, y, 0, 0 , 0 , 0);
            } else {
                setPixel(ImagenMedia, x, y, resr, resg, resb,resa);
            }
            
        }
    }
    Imagen = ImagenMedia;
    
}

function factorial(p) {
    f = 1;
    for ( var i = 1; i <= p; i++ )
        f *= i;
    
    return f;
}

function combinaciones(m,n){
    if (n <= m) {
        var dividendo1 = factorial(m),
            divisor1 = factorial(m-n),
            divisor = factorial(n),
            dividendo = dividendo1 / divisor1;
            return Math.round( dividendo / divisor );
    }
    else {
        return;
    }
}

function Gauss(tam) {
    
    var pascal = new Array(tam);
    var valor, m = 0;
    for ( n = 0; n < tam ; n++ ) {
        pascal[m] = combinaciones(tam-1,n);
        m++
    }
    
    var kernel = new Array(tam);
    var half = Math.floor(tam/2);
    
    for (var i = 0; i < tam; i++) {
        kernel[i] = new Array(tam);
        for (var j = 0; j < tam; j++) {
            
            kernel[i][j] = pascal[i]*pascal[j];
        }   
    }
    
    factor = 1/Math.pow(Math.pow(2,tam-1),tam-1);
    
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenMedia = ctx.createImageData(Width, Height);
        
    for(var y = 0; y < Height; y++)
    {
        for( var x = 0; x < Width; x++)
        {            
            var resr = 0,
                resg = 0,
                resb = 0,
                resa = 0;
            
            for(var i = 0; i < tam; i++)
            {
                for(var j = 0; j < tam; j++)
                {
                    pixel = getPixel(Imagen, x+j, y+i);
                    
                    resr = resr + kernel[i][j] * pixel.r;
                    resg = resg + kernel[i][j] * pixel.g;
                    resb = resb + kernel[i][j] * pixel.b;
                    resa = resa + kernel[i][j] * pixel.a;
                }
            }
            resr = clamp((factor)*resr);
            resg = clamp((factor)*resg);
            resb = clamp((factor)*resb);
            resa = clamp((factor)*resa);
            if ( x == 0 || y == 0 || x == Width-1 || y == Height-1 ) {
                setPixel(ImagenMedia,x, y, 0, 0 , 0 , 0);
            } else {
                setPixel(ImagenMedia, x, y, resr, resg, resb,resa);
            }
            
        }
    }
    Imagen = ImagenMedia;
    
}

function Crear_Kernel(){
    
	while ( document.getElementById("Modal_Kernel_Convulusion").childElementCount != 0 ) {
		var node = document.getElementById("Modal_Kernel_Convulusion").firstChild;		
		document.getElementById("Modal_Kernel_Convulusion").removeChild(node);
    }
    
    var div = document.createElement('div');
	div.style.width = "100%";

    
    var Matriz = document.createElement('table');
    Matriz.setAttribute("id","Kernel_Creado");
    
    tam = document.getElementById("tamanioKernel").value
    
    for(var i = 0; i < tam; i++) {
        var fila = document.createElement('tr');
        for(var j = 0; j < tam ; j++) {
            var entrada = document.createElement('input');
            entrada.setAttribute("type" , "number");
            var celda = document.createElement('td');
            celda.appendChild(entrada);
            fila.appendChild(celda);
        }
        Matriz.appendChild(fila);
    }	
    $("body").css("overflow", "hidden");
    div.appendChild(Matriz);
    document.getElementById('Modal_Kernel_Convulusion').appendChild(div);
    
}

function Propio(tam) {
    
    var kernel = new Array(tam);
    
    var filas = document.getElementById("Kernel_Creado").children;
    
    for (var i = 0; i < tam; i++) {
        kernel[i] = new Array(tam);
        var valores = filas[i];
        for (var j = 0; j < tam; j++) {
            kernel[i][j] = filas.item(i).children.item(j).firstChild.value;
        }   
    }
    
	canvas = document.createElement("canvas"); 
	var ctx = canvas.getContext("2d"),
		Width = Imagen.width,
		Height = Imagen.height,
		ImagenMedia = ctx.createImageData(Width, Height);
        
    for(var y = 0; y < Height; y++)
    {
        for( var x = 0; x < Width; x++)
        {            
            var resr = 0,
                resg = 0,
                resb = 0,
                resa = 0,
                sy = y,
                sx = x;
            
            for(var i = 0; i < tam; i++)
            {
                for(var j = 0; j < tam; j++)
                {
                    pixel = getPixel(Imagen, x+j, y+i);
                    
                    resr = resr + kernel[i][j] * pixel.r;
                    resg = resg + kernel[i][j] * pixel.g;
                    resb = resb + kernel[i][j] * pixel.b;
                    resa = resa + kernel[i][j] * pixel.a;
                }
            }
            resr = clamp(resr);
            resg = clamp(resg);
            resb = clamp(resb);
            resa = clamp(resa);
            setPixel(ImagenMedia, x, y, resr, resg, resb,255);
        }
    }
    Imagen = ImagenMedia;
    
}

function UNDO() {
	
	if(rotar) { 
		if(undoAngulos.length !== 0 ) {
			redoAngulos.push(undoAngulos.pop());
			anguloD = anguloD - undoAngulos[undoAngulos.length-1];
			if (undoAngulos[undoAngulos.length-1] === 0) {
				console.log("el valor es 0");
				anguloD = 0;
			}
		}
		if(undoAngulos.length === 0 ) {
			ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
		}
		else{			
			Rotar(0);
		}
	}
	else {		
		if(undo.length !== 0 ) {			
			redo.push(undo.pop());
			Imagen = undo[undo.length-1];
		}

		if (undo.length === 0 ) {
			ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
		}
		else {
			pintar(Imagen,Imagen.width, Imagen.height);	
		}		
	}	
}

function REDO() {	
	if (redo.length !== 0)	{
		Imagen = redo[redo.length-1];
		undo.push(redo.pop());	
	}	
	if (rotar) {
		if (redoAngulos.length !== 0)	{
			anguloD = anguloD + redoAngulos[redoAngulos.length-1];	
			undoAngulos.push(redoAngulos.pop());
			if (undoAngulos[undoAngulos.length-1] === 0) {
					console.log("el valor es 0");
					anguloD = 0;
				}	
			Rotar(0);
		}
	}
	else {
		pintar(Imagen,Imagen.width, Imagen.height);
	}
}

function KeyPress(e) {
      var evtobj = window.event? event : e
      if (evtobj.keyCode == 90 && evtobj.ctrlKey)  UNDO() ;
      if (evtobj.keyCode == 89 && evtobj.ctrlKey)  REDO() ;
}

document.onkeydown = KeyPress;