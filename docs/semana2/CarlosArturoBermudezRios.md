# Historias de usuario individuales

**Nombre:** Carlos Arturo Bermudez Rios

**Usuario de GitHub:** Cearjeyou

---

## Mis historias de usuario

> Entre 5 y 7 historias en formato "como [rol] quiero [acción] para [beneficio]", pensadas desde distintos roles o necesidades del producto que el equipo está diseñando. Si escribes menos de 7, borra las líneas que no uses (mínimo 5).

1. Como **analista de cartera de la fintech** quiero **conectar la plataforma con nuestro sistema de cartera** para **que la información de los créditos se mantenga actualizada**.
2. Como **administrador de la fintech** quiero **configurar las condiciones de cada fondeador (mora máxima, límites de concentración y plazo de sustitución)** para **que la plataforma controle su cumplimiento**.
3. Como **analista de cartera de la fintech** quiero **asignar créditos a un fondeador y que quede registrada la asignación** para **demostrar a qué fondeador pertenece cada crédito**.
4. Como **fondeador** quiero **confirmar que un crédito asignado a mí no está asignado a otro fondeador** para **evitar el doble fondeo**.
5. Como **analista de cartera de la fintech** quiero **recibir una alerta cuando un crédito supere la mora permitida por un fondeador** para **sustituirlo dentro del plazo acordado**.
6. Como **analista de cartera de la fintech** quiero **que la plataforma me sugiera créditos que cumplan las condiciones del fondeador** para **facilitar las sustituciones**.
7. Como **fondeador** quiero **ver en qué créditos está mi dinero y su estado actual** para **conocer la situación de mi inversión en cualquier momento**.
8. Como **fondeador** quiero **consultar el historial de sustituciones con su fecha y motivo** para **comprobar que se hicieron dentro del plazo acordado**.
9. Como **fondeador** quiero **comparar la huella de un registro con la publicada en la red** para **confirmar que la información no fue modificada después de registrada**.
10. Como **gerente de la fintech** quiero **compartir con fondeadores potenciales un historial verificable del comportamiento de la cartera** para **respaldar nuestras solicitudes de fondeo**.
11. Como **auditor externo** quiero **consultar el historial inalterable de asignaciones, mora y sustituciones** para **respaldar mi revisión de la cartera**.
12. Como **responsable de cumplimiento de la fintech** quiero **revisar qué información se publica en la red por cada evento** para **verificar que no incluya datos personales de los deudores**.

## La más importante y por qué

> Organiza las historias de mayor a menor importancia: en la primera fila va la más importante. En cada fila indica el número de la historia y por qué la ubicaste en esa posición. Si usaste menos de 7 historias, borra las filas que sobren.

| Orden de importancia | Historia # | Por qué |
| :---: | :---: | --- |
| 1 | 3 | Registrar la asignación de cada crédito a un fondeador es la base del producto: sin este registro no hay nada que el fondeador pueda verificar ni controlar. |
| 2 | 4 | Responde directamente a una de las dos fricciones priorizadas: la posible asignación de un mismo crédito a más de un fondeador. Es donde el registro compartido aporta un valor que una base de datos de una sola parte no ofrece. |
| 3 | 9 | Responde a la otra fricción priorizada: que el fondeador pueda verificar por su cuenta que la información no fue modificada. Es la prueba central de la hipótesis. |
| 4 | 2 | Configurar las condiciones de cada fondeador es necesario para controlar su cumplimiento; las alertas y las sustituciones dependen de ella. |
| 5 | 5 | La alerta de mora permite actuar a tiempo cuando un crédito incumple, que es la situación más frecuente en la relación con el fondeador. |
| 6 | 8 | El historial de sustituciones permite comprobar que se cumplió el plazo acordado, lo que reduce disputas. Depende de que existan las historias anteriores. |
| 7 (la menos importante) | 7 | Ver los créditos y su estado es útil, pero el fondeador puede obtener información similar por otros medios; su valor aumenta cuando se combina con la verificación de las historias 4 y 9. |