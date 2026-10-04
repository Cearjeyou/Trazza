# Problem Brief

## Decisión del problema

### Problema elegido

> El problema ganador en una frase, sin mencionar blockchain, y quién lo propuso.

Los fondeadores que financian la cartera de fintechs y cooperativas suelen depender de reportes manuales del originador para saber en qué créditos está su dinero y si se cumplen sus condiciones (mora máxima, límites de concentración y sustitución de créditos vencidos), lo que dificulta verificar esa información y puede hacer el fondeo más lento y costoso.

**Propuesto por:** Carlos Arturo Bermudez Rios

### Por qué elegimos este

> Qué inclinó al equipo por este problema frente a los demás, según los criterios de la Sesión 1.

Elegí este problema frente a otras ideas que exploré porque cumple con claridad los tres criterios de la Sesión 1:

1. **Partes que no confían entre sí comparten un registro:** la fintech y sus fondeadores tienen intereses distintos, y cuando hay varios fondeadores, también compiten por la misma cartera. Todos necesitan una sola versión de qué crédito está asignado a quién.
2. **Histórico inalterable:** las asignaciones, los cambios de mora y las sustituciones de créditos son justo el tipo de información que una de las partes podría tener incentivos para modificar después.
3. **Intermediario que concentra la confianza:** hoy la confianza depende de la palabra del originador o de auditorías externas.

### Propuestas descartadas

> Cada propuesta considerada, quién la propuso y el motivo del descarte.

Escriban aquí su respuesta.

### Cómo tomamos la decisión

> Cómo llegó el equipo al acuerdo: votación, consenso tras debate u otro.

| Propuesta | Propuesta por | Motivo del descarte |
|---|---|---|
| **Paz y salvo y estados de cuenta verificables** | Carlos Bermudez Rios | Resuelve un problema real, pero existen alternativas más simples (firma digital y estampado cronológico) y plataformas de certificación de documentos que ya lo ofrecen. Se considera una posible extensión futura, no el problema principal. |
| **Mercado de la deuda de las EPS con hospitales** | Carlos Bermudez Rios | El problema es enorme, pero depende de la regulación del sector salud, del riesgo de impago de las EPS y de entidades públicas difíciles de involucrar. Su viabilidad hoy es baja. |
| **Financiación de patentes científicas (DeSci con IP-NFTs)** | Carlos Bermudez Rios | Requiere mucho capital y años para obtener retorno. |
| **Billeteras para agentes de inteligencia artificial** | Carlos Bermudez Rios | La demanda real todavía es incipiente. |
| **Dispersión de pagos a comercios de una fintech** | Carlos Rios | Implica manejar dinero de terceros, lo que exige licencias o aliados regulados, integración bancaria y una operación compleja. Es una posible extensión de la funcionalidad. |

---

## Problem Brief

### Encabezado

> Nombre del proyecto y una frase que describa el problema. Extensión: breve.

**Trazza**

Los fondeadores de cartera de fintechs y cooperativas suelen depender de informes para saber en qué créditos está su dinero y si se cumplen sus condiciones.

### Equipo y roles

> Integrantes con su usuario de GitHub, rol asumido por cada persona, responsable de las entregas y canal de coordinación interna. Extensión: breve.

| Integrante | Usuario de GitHub | Rol |
|---|---|---|
| Carlos Rios | Cearjeyou | Dirección, producto, investigación con usuarios y desarrollo |

**Responsable de las entregas:** Carlos Bermudez Rios 

**Canal de coordinación interna:** repositorio de GitHub, Jira

### Problema y evidencia

> Enunciado del problema en una frase, sin mencionar blockchain. Contexto, frecuencia y alcance. Evidencia mínima de que el problema existe: observación directa, experiencia propia, conversaciones o fuentes consultadas, con enlace o cita cuando aplique. Extensión: 150–300 palabras.

**Enunciado:** los fondeadores de cartera de fintechs y cooperativas suelen depender de informes del originador para saber en qué créditos está su dinero y si se cumplen sus condiciones de mora, concentración y sustitución.

**Contexto:** las fintechs y cooperativas de crédito necesitan capital externo (fondos de deuda privada, family offices, otras entidades) para seguir prestando. Cada fondeador impone condiciones propias, por ejemplo mora máxima de 30 días o reemplazo de créditos vencidos en un plazo definido.

**Frecuencia y alcance:** el seguimiento es continuo (la mora cambia a diario) y los reportes suelen ser semanales o mensuales, con versiones distintas para cada fondeador. En Colombia operan 410 fintech activas, según la Superintendencia Financiera ([El País, sept. 2026](https://www.elpais.com.co/economia/superintendencia-financiera-anuncia-hoja-de-ruta-para-transformar-el-ecosistema-fintech-y-los-criptoactivos-en-colombia-1759.html)), además de cooperativas y fondos de empleados con cartera de crédito.

**Evidencia:**
- **Experiencia propia:** soy CTO de una fintech y conozco de primera mano cómo es la gestión de cartera para fondeadores, cómo se controlan sus condiciones y cómo se gestionan las sustituciones de créditos.
- En otros mercados existe software especializado en administrar líneas de fondeo de originadores de crédito (Cascade Debt, Finley, Setpoint en EE. UU.), lo que indica que el problema es reconocido.
- El crédito privado es una de las categorías de activos que más ha crecido en registros verificables, dentro de un mercado que pasó de unos US$6.000 millones a US$31.400 millones entre 2025 y 2026 ([Yellow Research](https://yellow.com/research/tokenized-rwas-31b-market-growth-real-race-starting)).
- La Superintendencia Financiera reconoce vacíos de protección y trabaja en tokenización de valores ([Portafolio](https://www.portafolio.co/economia/gobierno/superintendente-financiero-advierte-que-hay-consumidores-desprotegidos-por-falta-de-regulacion-de-activos-digitales-502761)).

### Usuario y actores

> Quién sufre el problema y qué necesita resolver. Cómo lo resuelve hoy y qué le cuesta en dinero, tiempo o esfuerzo. Demás actores que intervienen en el flujo, con el papel que cumple cada uno. Extensión: 150–300 palabras.

**Usuario principal: la fintech o cooperativa que origina los créditos.** Necesita un mecanismo que dé validez a la información que entrega a sus fondeadores: en qué créditos está el dinero de cada uno, el estado de su mora y las sustituciones realizadas.

**Usuario secundario: el fondeador** (fondos de deuda privada, family offices, otras entidades financieras). Necesita verificar que el originador cumple sus condiciones de mora máxima, límites de concentración y plazos de sustitución.

**Cómo se resuelve hoy:** la fintech extrae la cartera de su sistema, arma informes para cada fondeador, revisa las condiciones y gestiona las sustituciones. El fondeador revisa esos reportes, pide soportes y, en algunos casos, contrata auditorías o exige garantías adicionales.

**Qué cuesta:**
- **Tiempo:** horas de trabajo recurrentes en reportes, conciliaciones y respuestas a preguntas.
- **Dinero:** auditorías y personal dedicado; posiblemente tasas de fondeo más altas o más cartera como garantía para compensar la incertidumbre.
- **Riesgo:** errores en reportes, sustituciones tardías y disputas entre las partes.

**Otros actores:**

| Actor | Papel |
|---|---|
| **Deudores** | Pagan sus créditos; sus pagos determinan la mora. No interactúan con la plataforma y sus datos personales no se exponen. |
| **Sistema de cartera del originador** | Fuente de los datos de cada crédito (saldo, pagos, días de mora). |
| **Banco o pasarela de recaudo** | Recibe los pagos y permite contrastar el recaudo real con lo reportado. |
| **Auditor o revisor externo** | Verifica la información cuando el fondeador lo exige. |
| **Fiduciaria** (cuando aplica) | Administra los recursos o la cartera cedida en algunos esquemas de fondeo. |

### Flujo actual de valor

> Recorrido paso a paso de cómo se mueve hoy el dinero, la información o el activo, desde el origen hasta el destino. Diagrama o secuencia numerada, con los intermediarios explícitos. Señalar si algún paso responde a una obligación normativa. Extensión: 150–300 palabras.

```text
Fondeador ──$──> Fintech ──$──> Deudor
    ^              |   ^           |
    |              |   |   pagos   |
    └── informe ───┘   └── Banco <─┘
```

1. **Vinculación del fondeador.** Fondeador y fintech firman un contrato (cesión, participación o patrimonio autónomo en una fiduciaria) con las condiciones de elegibilidad: mora máxima, límites de concentración y plazos de sustitución. *Normativo: conocimiento del cliente y prevención de lavado (SARLAFT) cuando aplica.*
2. **Desembolso del fondeador.** El dinero llega por transferencia bancaria a la fintech o a la fiduciaria.
3. **Asignación de créditos.** La fintech selecciona en su sistema los créditos que cumplen las condiciones y los asigna al fondeador.
4. **Originación y desembolso al deudor.** La fintech evalúa, aprueba y desembolsa. *Normativo: autorización de tratamiento de datos (Ley 1581 de 2012) y consulta y reporte a centrales de riesgo (Ley 1266 de 2008).*
5. **Recaudo.** El deudor paga a través de un banco o pasarela; la fintech concilia los pagos en su sistema de cartera.
6. **Cobranza de créditos en mora.** *Normativo: límites de contacto de la Ley 2300 de 2023.*
7. **Control de condiciones.** La fintech verifica la mora y los límites de cada fondeador.
8. **Sustitución.** Si un crédito supera la mora permitida, la fintech lo reemplaza por otro que cumpla las condiciones, según el procedimiento acordado en el contrato con el fondeador.
9. **Reporte al fondeador.** La fintech envía reportes periódicos con créditos, saldos, mora y sustituciones.
10. **Validación y pago al fondeador.** El fondeador revisa, pide soportes o contrata auditoría, y recibe los recaudos que le corresponden.

**Intermediarios:** banco o pasarela de recaudo, fiduciaria (si aplica) y auditor externo.

### Fricciones identificadas

> Puntos concretos donde el flujo falla, se encarece o se demora. Cada fricción indica en qué paso ocurre, qué la causa y a quién afecta. Extensión: 150–300 palabras.

| # | Fricción | Paso | Causa | Afecta a |
|---|---|---|---|---|
| 1 | **El fondeador no puede verificar la información de forma independiente.** | 9 y 10 | Los reportes los genera la misma fintech, y el fondeador no tiene acceso directo a una fuente que pueda contrastar. | Fondeador y fintech |
| 2 | **Posible asignación de un mismo crédito a más de un fondeador.** | 3 | La asignación se registra en los sistemas internos de la fintech, sin un registro compartido que los fondeadores puedan consultar. | Fondeadores |
| 3 | **Desfase entre el estado real de la cartera y lo que ve el fondeador.** | 5, 7 y 9 | La mora cambia a diario, pero el fondeador recibe la información solo en los reportes periódicos. | Fondeador |
| 4 | **Sustituciones difíciles de comprobar.** | 8 | No siempre queda una prueba verificable de cuándo un crédito superó la mora permitida y cuándo se reemplazó. | Fondeador y fintech |
| 5 | **Carga operativa de reportes y control de condiciones.** | 7 y 9 | Cada fondeador tiene condiciones y formatos distintos, por lo que la fintech debe preparar y controlar cada caso por separado. | Fintech |
| 6 | **Costos adicionales para generar confianza.** | 1 y 10 | Ante la falta de verificación directa, el fondeador puede exigir auditorías, garantías adicionales o tasas más altas. | Fintech |
| 7 | **Disputas difíciles de resolver.** | 8 a 10 | Sin un historial común e inalterable, cada parte tiene su propia versión de los hechos. | Ambas partes |

### Oportunidad e hipótesis

> Oportunidad priorizada entre las fricciones identificadas, con el motivo de la elección. Hipótesis inicial de por qué blockchain podría mejorar ese punto, expresada en términos de qué cambiaría para el usuario. Extensión: 150–300 palabras.

**Oportunidad priorizada:** fricción 1, *el fondeador no puede verificar la información de forma independiente*, junto con la fricción 2, *posible asignación de un mismo crédito a más de un fondeador*.

**Motivo de la elección:**
- Es la fricción de la que dependen varias de las demás: si la información fuera verificable, las sustituciones serían comprobables (fricción 4), las disputas tendrían una fuente común (fricción 7) y el fondeador necesitaría menos garantías adicionales (fricción 6).
- Afecta a las dos partes: el fondeador no puede confirmar lo que recibe y la fintech no puede demostrar que su información es correcta.

**Hipótesis inicial:** si cada asignación de créditos, cambio de mora y sustitución quedara registrado con una huella inalterable en blockchain, sin exponer datos personales, entonces:

- **Para la fintech:** tendría un mecanismo para dar validez a su información frente a cualquier fondeador, sin depender únicamente de reportes propios o auditorías periódicas.
- **Para el fondeador:** podría comprobar por su cuenta en qué créditos está su dinero y cuándo se hizo cada sustitución, y confirmar que un crédito asignado a él no está asignado a otro fondeador.
- **Para ambos:** tendrían una misma versión de los hechos, lo que facilitaría resolver diferencias.

**Lo que debo validar:**
- Si los fondeadores valoran esta verificación lo suficiente como para cambiar sus condiciones (menos garantías, más fondeo o mejores tasas).
- Si un registro de huellas en blockchain genera más confianza que alternativas como el estampado cronológico certificado o la auditoría externa.

### Criterio de pertinencia

> Justificación de por qué el caso requiere un registro distribuido y no una base de datos tradicional o una integración entre sistemas existentes. Debe apoyarse en al menos uno de los criterios de la Sesión 1: varias partes que no confían entre sí necesitan compartir un mismo registro, el histórico no puede alterarse, o se elimina un intermediario que hoy concentra la confianza. Extensión: 150–300 palabras.

**Por qué no basta una base de datos tradicional:** toda base de datos tiene un administrador que puede modificar o borrar registros. Si la administra la fintech, el fondeador sigue dependiendo de su palabra, que es justamente el problema actual. Si la administra un tercero, la confianza se traslada a ese tercero, que se convierte en un nuevo intermediario.

**Por qué no basta una integración entre sistemas:** dar acceso al fondeador al sistema de cartera de la fintech le permite ver los datos actuales, pero no le garantiza que el historial no haya sido modificado antes de consultarlo. Además, cada fondeador solo vería su parte y no podría confirmar que un crédito no está asignado también a otro fondeador.

**Criterios de la Sesión 1 que aplican:**

1. **Varias partes que no confían entre sí comparten un mismo registro.** La fintech y sus fondeadores tienen intereses distintos, y los fondeadores pueden competir por la misma cartera. Un registro compartido les daría a todos la misma versión de qué crédito está asignado a quién.
2. **El histórico no puede alterarse.** Las asignaciones, los cambios de mora y las sustituciones deben poder comprobarse después, incluso en una disputa. Un registro donde nadie puede modificar lo ya escrito cumple esa condición.
3. **Se reduce la dependencia de un intermediario que concentra la confianza.** Hoy la verificación recae en la fintech o en auditorías periódicas. El registro permitiría una verificación continua e independiente.

**Alcance del uso de blockchain:** el registro distribuido se usaría solo para las huellas de los eventos clave (asignaciones, mora y sustituciones). Los datos detallados y personales seguirían en sistemas tradicionales con control de acceso.

### Supuestos y riesgos

> Dos o tres supuestos que tendrían que ser ciertos para que la hipótesis funcione, y qué podría invalidarla. Extensión: 150–300 palabras.

**Supuesto 1: los fondeadores valoran la verificación independiente.**
Para que la solución tenga sentido, los fondeadores tendrían que considerar que poder comprobar la información por su cuenta es valioso, al punto de ofrecer mejores condiciones (menos garantías, más fondeo o mejores tasas).
*Qué podría invalidarlo:* que los fondeadores confíen en sus mecanismos actuales (auditorías, contratos, relación de confianza) y no estén dispuestos a cambiar sus condiciones, o que prefieran alternativas que ya conocen, como el estampado cronológico certificado.

**Supuesto 2: los datos que entran al registro son correctos.**
El registro garantiza que nadie modifique la información después de registrada, pero no que sea verdadera al momento de registrarla. La hipótesis supone que los datos del sistema de cartera de la fintech reflejan la realidad.
*Qué podría invalidarlo:* que la fintech registre información incorrecta desde el origen, por error o intencionalmente. En ese caso, el registro solo haría inalterable un dato falso. Habría que contrastar con fuentes externas, como el recaudo bancario.

**Supuesto 3: las fintechs están dispuestas a adoptarlo.**
La fintech tendría que integrar su sistema de cartera y aceptar que sus fondeadores verifiquen su información de forma continua.
*Qué podría invalidarlo:* que la integración sea costosa o compleja, que la fintech prefiera mantener control sobre lo que reporta, o que surjan restricciones legales o de protección de datos que limiten lo que se puede registrar.