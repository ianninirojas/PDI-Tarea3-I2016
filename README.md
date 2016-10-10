# PDI-Tarea3-I2016
Materia: Procesamiento Digital de Imágenes


----------


## Autores:
Nombre: Jose Francisco Iannini
C.I: 24.276.962

Nombre: Jeisson Ferreira
C.I: 18.003.702


----------


## Materia:
Procesamiento Digital de Imagen


----------


##Tarea 3
Operaciones a imágenes de formato .bmp


----------


##Lenguajes Empleados:
1. JavaScript: Manipulación de imagen
2. HTML: Interfaz gráfica
3. CSS: Estilo interfaz gráfica


----------


##Descripción
Manipulación de imágenes en formato .bmp


----------


##Ejecución
Abrir el documento index.html ubicado en la carpeta src. Este abrirá un navegador web, en donde se encuentra una interfaz la cual tiene una serie de botones.


----------


###Opciones a escoger 
 1. **Información**: Despliega un modal con la información mas importante de la imagen.
 2. **Original**: Muestra la imagen cargada originalmente.
 3. **Negativo**: Calculo el negativo de la imagen actual y la muestra.
 4. **Gris**: Convierte la imagen actual en escala de grises.
 5. **Espejo**: Despliega dos botones gráficos.
	1. **Horizontal**: Aplica espejo horizontal a la imagen.
	2. **Vertical**: Aplica el espejo vertical a la imagen.
 6. **Histograma**: Despliega un modal con el histograma de la imagen actual, acompañado de la imagen.
 7. **Ecualizar**: Ecualiza el histograma de la imagen aplicando ese efecto a la imagen. 
 8. **Zoom**: Despliega dos botones gráficos.
	1. **ZoomIN**: Acerca la imagen 2X.
	2. **ZoomOUT**: Aleja la imagen 2X.
 9. **Bilinear**: Al presionar se selecciona el método de interplacion bilineal para el cálculos en los que se requiera un interpolacion. Ese el método por defecto.
 10. **Neares Neighbor**: Escoge el método de interpolacion de vecino mas cercano.
 11. **Rotar**: Despliega los botones correspondientes para rotar una imagen.
1. **Grados**: Cuadro de texto donde se introduce la cantidad de grados que se quiera rotar la imagen.
	2. **Izquierda/Derecha**: Rota la imagen tantos grados ingresado hacia la izquierda o derecha según sea el caso.
 12. **Brillo** ("-","+"): Aumenta o disminuye el brillo a la imagen.
 13. **Contraste** ("-","+"): Aumenta o disminuye el contraste a la imagen.
 14. **Escalar**: Despliega los campos de texto para introducir las medidas a escalar la imagen.
	1. **Ancho**: Área de texto donde se ingresa una nueva medida en pixeles para el ancho de la imagen.
	2. **Alto**: Área de texto donde se ingresa una nueva medida en pixeles para el de la imagen.
	3. **Aplicar**: Redimensiona la imagen según las medidas introducidas.
 15. **Umbralizar**: Despliega el campo de texto para introducir el threshold.
	1. **Threshold**: Campo de texto para introducir el threshold.
	2. **Aplicar**: Umbraliza la imagen según el threshold ingresado
 16. **ctrl+y**: Rehace las ultimas imagenes creadas. 
 17.  **ctrl+z**: Deshace la imagen establecida.
 18. **Filtros**: Botón que despliega todos los filtros.
	 1. **Tamaño Kernel**: Numero que indica el tamaño del kernel.
	 2. **Borde**: Botón que despliega los operadores de bordes.
		 1. **Sobel**: Aplica el operador de borde "Sobel".
		 2. **Laplace**: Aplica el operador de borde "Laplace"
	 3. **Suavizado**: Botón que despliega los operadores de suavizado.
		 1. **Media**: Aplica el operador de suavizado "Media"
		 2. **Gauss**: Aplica el operador de suavizado "Gauss"
	 4.  **Crear Kernel**: Despliega un modal en el cual el usuario podra crear su propia matriz de convolucion. 
		 1.  **Crear**: Boton que crea la matriz del usuario.
	 5.  **Propio**: Aplica el kernel de convolucion creado por el usuario.
	 6.  **Peso**: Campo de texto para introducir el "Peso" para el filtro de perfilado.
	 7. **Perfilado**: Aplica el filtro de perfilado a la imagen.


----------


##Version
1.0

