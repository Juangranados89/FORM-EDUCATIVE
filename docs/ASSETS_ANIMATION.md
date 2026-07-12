# Spec de assets para animación (móvil)

Todo va en `public/assets/mobile/`. **PNG con fondo transparente.**
Mientras un archivo no exista, la app usa un fallback y no se rompe.

---

## 1) Home animado por capas → `home/`

Exportá la escena de bienvenida **separada en capas** (una por PNG transparente),
todas del **mismo tamaño de lienzo** para que calcen apiladas.
Tamaño recomendado del lienzo: **1080 × 1350 px** (vertical).

| Archivo | Contenido | Animación que le aplico |
|---|---|---|
| `sky.png` | Cielo + degradé de fondo (sin nada más) | fija |
| `clouds.png` | Solo las nubes | deriva horizontal lenta |
| `sun.png` | Sol (arriba a la derecha) | latido suave |
| `plane.png` | Avión de papel + estela | vuelo (sube/baja/rota) |
| `trees_back.png` | Árboles y arbustos del fondo | balanceo suave |
| `school.png` | Edificio del colegio | fija (o micro-flote) |
| `character_girl.png` | Solo la niña (recortada) | flote/respiración (idle) |
| `character_boy.png` | Solo el niño (recortado) | flote/respiración (desfasado) |
| `foreground.png` | Pasto y flores del frente | balanceo de flores |
| `decor.png` *(opcional)* | Corazones/estrellas sueltos | flote + latido |

> Clave: **cada personaje en su propio PNG, recortado**, sin fondo. Eso es lo que
> permite que se muevan independientes. Si me pasás solo la escena entera plana,
> no se puede animar por partes.

Si preferís, también sirve un único **Lottie (`.json`)** o **Rive (`.riv`)** de la
escena; decime y adapto el componente.

---

## 2) Iconos por opción → `icons/`

Cuadrados, **256 × 256 px**, transparentes, estilo consistente entre sí.

### Escala de frecuencia (compartida en 6 preguntas)
| Archivo | Opción | Idea |
|---|---|---|
| `ic_freq_nunca.png` | Nunca | escudo / check verde |
| `ic_freq_pocas.png` | Pocas veces | gota / una marca |
| `ic_freq_casi.png` | Casi siempre | reloj / varias marcas |
| `ic_freq_siempre.png` | Siempre | llama / lleno |

### Pregunta de estrés
| Archivo | Opción |
|---|---|
| `ic_estres_nada.png` | Nada |
| `ic_estres_poco.png` | Poco |
| `ic_estres_moderado.png` | Moderado |
| `ic_estres_mucho.png` | Mucho |
| `ic_estres_demasiado.png` | Demasiado |

### Disposición de apoyo
| Archivo | Opción |
|---|---|
| `ic_apoyo_si.png` | Sí, lo necesito pronto |
| `ic_apoyo_talvez.png` | Tal vez más adelante |
| `ic_apoyo_no.png` | No por ahora |

### Pregunta "¿Cómo te sientes en el colegio?"
Ya usa tus caritas existentes (`emotion_01…05`). Si querés otras, reemplazá esos PNG.

---

## 3) Ilustraciones de pregunta (opcional, ya referenciadas)
`interest.png` (perdiste interés) y `thanks_group.png` (pantalla Gracias).
Las preguntas sensibles (dormir/no despertar, ausencia, dolor) **a propósito no
llevan ilustración**, para no banalizarlas.
