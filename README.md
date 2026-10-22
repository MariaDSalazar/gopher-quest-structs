# Gopher Quest

Juego para practicar structs en Go dentro de un juego de rol: cada personaje es un struct.

## Niveles

Cada nivel trae 6 retos:

| Nivel | Lo que se practica |
|---|---|
| 1 · La ficha del héroe | Por qué un struct, literales con nombres y en orden, valor cero, `%+v` |
| 2 · El clon y el control | Asignar copia, punteros `&` y `*`, funciones que reciben copias o punteros, puntero `nil` |
| 3 · El mapa del reino | Structs dentro de structs, comparar con `==`, structs como clave de un map |
| 4 · El gremio | Slices de structs y la trampa del `range`, maps de structs: sacar, cambiar y guardar |

Los retos son de seis tipos: tocar en el texto lo que se pide, elegir la respuesta, predecir lo que imprime un programa, elegir el código que funciona, encontrar la línea que falla y tocar en la memoria el campo que cambia, el que se lee o el que queda en cero. El panel **Memoria** muestra los structs, punteros, slices y maps tal como los deja Go. Si la respuesta no es correcta, se explica por qué esa elección no sirve, sin mostrar la correcta, y se vuelve a intentar. El código se compiló y ejecutó con Go 1.27: las salidas, los errores, la línea que falla y la memoria salen de esa ejecución.

Al terminar aparece un informe de entendimiento por tema (primer intento de cada reto) y un certificado con el nombre del jugador. Solo se pide nombre y apellido; el progreso se guarda en el propio dispositivo.

Todo el contenido va cifrado y en cadena: cada reto se abre solo después de resolver bien el anterior.

## Ejecutar en local

Es un sitio estático. Desde la carpeta del repositorio:

```
python -m http.server 8000
```

y abrir `http://localhost:8000`.
