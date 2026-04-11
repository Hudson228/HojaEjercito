document.addEventListener("DOMContentLoaded", () => {

let datos = {};

 mostrarEstadoVacio();


// =========================
// CARGAR JSON
// =========================
/*fetch("datos.json")*/
fetch("datos.json?t=" + Date.now())
  .then(response => response.json())
  .then(data => {
    datos = data;

    cargarEjercitos();
    actualizarPMC(null);

    limpiarSelect("tropa");
    limpiarSelect("equipo");
    limpiarSelect("opciones");

    document.getElementById("btnAdd").addEventListener("click", añadirFila);
    document.getElementById("btnGuardar").addEventListener("click", guardarEjercito);

    document.getElementById("btnCargar").addEventListener("click", cargarEjercito);
    document.getElementById("btnBorrar").addEventListener("click", borrarEjercito);
    document.getElementById("btnPDF").addEventListener("click", exportarPDF); //Ojito    
    prepararBotonBorrarTodo();
    rellenarFilasVacias();
  });


// =========================
// RESET INPUTS (NO BORRA Nº)
// =========================
function resetInputs() {
  document.getElementById("coste").value = "";

  document.getElementById("checkP").checked = false;
  document.getElementById("checkM").checked = false;
  document.getElementById("checkC").checked = false;
}


// =========================
// BOTÓN BORRAR TODO
// =========================
function prepararBotonBorrarTodo() {
  const ths = document.querySelectorAll(".army-table th");
  const thX = ths[8];

  thX.innerHTML = "";

  const btn = document.createElement("span");
  btn.textContent = "❌";
  btn.classList.add("borrar");
  btn.style.filter = "brightness(0) invert(1)";
  btn.style.cursor = "pointer";
  btn.title = "Borrar toda la tabla";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("tablaUnidades").innerHTML = "";
    actualizarTotal();
    rellenarFilasVacias();
    mostrarEstadoVacio();
  });

  thX.appendChild(btn);
}


// =========================
// EJÉRCITOS
// =========================
function cargarEjercitos() {
  const select = document.getElementById("ejercito");
  select.innerHTML = "";

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "-- Selecciona ejército --";
  select.appendChild(def);

  datos.ejercitos.forEach(e => {
    const op = document.createElement("option");
    op.value = e.IDejercito;
    op.textContent = e.EJERCITOS;
    select.appendChild(op);
  });
}


// =========================
// EVENTO EJÉRCITO
// =========================
document.getElementById("ejercito").addEventListener("change", function () {

  resetInputs();

  if (!this.value) {
    limpiarSelect("tropa");
    limpiarSelect("equipo");
    limpiarSelect("opciones");
    actualizarPMC(null);
    return;
  }

  cargarTropas(parseInt(this.value));
});


// =========================
// TROPAS
// =========================
function cargarTropas(idEjercito) {
  const select = document.getElementById("tropa");
  select.innerHTML = "";
  select.disabled = false;

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "-- Selecciona tropa --";
  select.appendChild(def);

  const filtradas = datos.tropas.filter(t => t.IDejercito === idEjercito);

  filtradas.forEach(t => {
    const op = document.createElement("option");
    op.value = t.IDtropa;
    op.textContent = t.TROPA;
    select.appendChild(op);
  });

  limpiarSelect("equipo");
  limpiarSelect("opciones");
}


// =========================
// EVENTO TROPA
// =========================
document.getElementById("tropa").addEventListener("change", function () {

  resetInputs();

  if (!this.value) {
    limpiarSelect("equipo");
    limpiarSelect("opciones");
    actualizarPMC(null);
    return;
  }

  const idTropa = parseInt(this.value);

  // 🔥 AUTOCOMPLETAR NÚMERO
  const tropa = datos.tropas.find(t => t.IDtropa === idTropa);

  if (tropa && tropa.NUMERO) {
    document.getElementById("numero").value = tropa.NUMERO;
  } else {
    document.getElementById("numero").value = "";
  }

  cargarEquipo(idTropa);
  cargarOpciones(idTropa);
  actualizarPMC(idTropa);
  calcularCoste();
});


// =========================
// EQUIPO
// =========================
function cargarEquipo(idTropa) {
  const select = document.getElementById("equipo");
  select.innerHTML = "";

  const rel = datos.equipo_tropas.filter(r => r.IDtropa === idTropa);
  const ids = rel.map(r => r.IDequipo);

  const filtrado = datos.equipo.filter(e => ids.includes(e.IDequipo));

  if (filtrado.length === 0) {
    select.disabled = true;
    select.innerHTML = "<option>-- Sin equipo --</option>";
    return;
  }

  select.disabled = false;

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "-- Selecciona equipo --";
  select.appendChild(def);

  filtrado.forEach(e => {
    const op = document.createElement("option");
    op.value = e.IDequipo;
    op.textContent = e.EQUIPO;
    select.appendChild(op);
  });
}


// =========================
// OPCIONES
// =========================
function cargarOpciones(idTropa) {
  const select = document.getElementById("opciones");
  select.innerHTML = "";

  const rel = datos.unidad_tropas.filter(r => r.IDtropa === idTropa);
  const ids = rel.map(r => r.IDunidad);

  const filtrado = datos.unidad.filter(u => ids.includes(u.IDunidad));

  if (filtrado.length === 0) {
    select.disabled = true;
    select.innerHTML = "<option>-- Sin opciones --</option>";
    return;
  }

  select.disabled = false;

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "-- Selecciona opción --";
  select.appendChild(def);

  filtrado.forEach(u => {
    const op = document.createElement("option");
    op.value = u.IDunidad;
    op.textContent = u.UNIDAD;
    select.appendChild(op);
  });
}


// =========================
// LIMPIAR SELECT
// =========================
function limpiarSelect(id) {
  const select = document.getElementById(id);
  select.innerHTML = "<option>-- Selecciona --</option>";
  select.disabled = true;
}


// =========================
// P M C
// =========================
/*function actualizarPMC(idTropa) {
  const checkP = document.getElementById("checkP");
  const checkM = document.getElementById("checkM");
  const checkC = document.getElementById("checkC");

  const p = datos.portaestandarte.find(x => x.IDtropa === idTropa);
  const m = datos.musico.find(x => x.IDtropa === idTropa);
  const c = datos.campeon.find(x => x.IDtropa === idTropa);

  checkP.disabled = !p;
  checkM.disabled = !m;
  checkC.disabled = !c;

  if (!p) checkP.checked = false;
  if (!m) checkM.checked = false;
  if (!c) checkC.checked = false;
}*/

function actualizarPMC(idTropa) {
  const checkP = document.getElementById("checkP");
  const checkM = document.getElementById("checkM");
  const checkC = document.getElementById("checkC");

  const p = datos.portaestandarte.find(x => x.IDtropa === idTropa);
  const m = datos.musico.find(x => x.IDtropa === idTropa);
  const c = datos.campeon.find(x => x.IDtropa === idTropa);

  // HABILITAR / DESHABILITAR
  checkP.disabled = !p;
  checkM.disabled = !m;
  checkC.disabled = !c;

  // 👇 OCULTAR SOLO EL CHECKBOX
  checkP.style.visibility = p ? "visible" : "hidden";
  checkM.style.visibility = m ? "visible" : "hidden";
  checkC.style.visibility = c ? "visible" : "hidden";

  // DESMARCAR si no existen
  if (!p) checkP.checked = false;
  if (!m) checkM.checked = false;
  if (!c) checkC.checked = false;
}


// =========================
// CALCULAR COSTE
// =========================
function calcularCoste() {
  const idTropa = parseInt(document.getElementById("tropa").value);
  const idEquipo = parseInt(document.getElementById("equipo").value);
  const idUnidad = parseInt(document.getElementById("opciones").value);
  const numero = parseInt(document.getElementById("numero").value) || 0;

  if (!idTropa || numero === 0) {
    document.getElementById("coste").value = "";
    return;
  }

  const costeTropa = parseInt(datos.tropas.find(t => t.IDtropa === idTropa)?.COSTE) || 0;
  const costeEquipo = idEquipo ? parseInt(datos.equipo.find(e => e.IDequipo === idEquipo)?.COSTE) || 0 : 0;
  const costeUnidad = idUnidad ? parseInt(datos.unidad.find(u => u.IDunidad === idUnidad)?.COSTE) || 0 : 0;

  const costeP = document.getElementById("checkP").checked
    ? parseInt(datos.portaestandarte.find(p => p.IDtropa === idTropa)?.COSTE) || 0 : 0;

  const costeM = document.getElementById("checkM").checked
    ? parseInt(datos.musico.find(m => m.IDtropa === idTropa)?.COSTE) || 0 : 0;

  const costeC = document.getElementById("checkC").checked
    ? parseInt(datos.campeon.find(c => c.IDtropa === idTropa)?.COSTE) || 0 : 0;

  const total =
    (numero * (costeTropa + costeEquipo)) +
    costeUnidad + costeP + costeM + costeC;

  document.getElementById("coste").value = total;
}


// =========================
// EVENTOS COSTE
// =========================
["equipo", "opciones", "numero", "checkP", "checkM", "checkC"]
.forEach(id => {
  document.getElementById(id).addEventListener("change", calcularCoste);
  document.getElementById(id).addEventListener("input", calcularCoste);
});


// =========================
// AÑADIR FILA
// =========================
function añadirFila() {
  const numero = document.getElementById("numero").value;
  const tropaSelect = document.getElementById("tropa");
  const equipoSelect = document.getElementById("equipo");
  const opcionesSelect = document.getElementById("opciones");
  const checkP = document.getElementById("checkP");  /*20260408*/
  const checkM = document.getElementById("checkM");  /*20260408*/
  const checkC = document.getElementById("checkC");  /*20260408*/
  const coste = document.getElementById("coste").value;

  if (!numero || !tropaSelect.value || !coste) return;

  const idTropa = parseInt(tropaSelect.value);

  const textoEquipo = (!equipoSelect.value || equipoSelect.disabled)
    ? "--"
    : equipoSelect.options[equipoSelect.selectedIndex].text;

  const textoOpciones = (!opcionesSelect.value || opcionesSelect.disabled)
    ? "--"
    : opcionesSelect.options[opcionesSelect.selectedIndex].text;

    const idEquipo = equipoSelect.value || "";
    const idOpciones = opcionesSelect.value || "";
    

  const fila = document.createElement("tr");

  // 🔥 CLAVE PARA PDF
  fila.dataset.idTropa = idTropa;
  fila.dataset.idEquipo = idEquipo;
  fila.dataset.idOpciones = idOpciones;

  fila.innerHTML = `
    <td>${numero}</td>
    <td>${tropaSelect.options[tropaSelect.selectedIndex].text}</td>
    <td>${textoEquipo}</td>
    <td>${textoOpciones}</td>
    <td>${checkP.checked ? "✔" : ""}</td>
    <td>${checkM.checked ? "✔" : ""}</td>
    <td>${checkC.checked ? "✔" : ""}</td>
    <td class="costeFila">${coste}</td>
    <td class="borrar">❌</td>
  `;

fila.addEventListener("click", function () {

  document.querySelectorAll("#tablaUnidades tr")
    .forEach(f => f.classList.remove("selected"));

  fila.classList.add("selected");

  const id = parseInt(fila.dataset.idTropa);

  if (id) {
    mostrarPanelDerecho();

    mostrarFicha(id);
    mostrarReglas(id);
    mostrarImagen(id);
    mostrarCostesUnidad(id, fila);
  }
});

  fila.querySelector(".borrar").addEventListener("click", (e) => {
    e.stopPropagation();
    fila.remove();
    actualizarTotal();
    rellenarFilasVacias();
  });

  document.getElementById("tablaUnidades").appendChild(fila);

  actualizarTotal();
  rellenarFilasVacias();

  resetInputs(); /*20260408*/
  document.getElementById("numero").value = ""; /*20260408*/
  document.getElementById("tropa").value = ""; /*20260408*/
  limpiarSelect("equipo"); /*20260408*/
  limpiarSelect("opciones"); /*20260408*/

}



// =========================
// FILAS FANTASMA
// =========================
function rellenarFilasVacias() {

  const tabla = document.getElementById("tablaUnidades");

  // 🔥 borrar filas vacías anteriores
  tabla.querySelectorAll(".fila-vacia").forEach(f => f.remove());

  // 🔥 contar SOLO filas con contenido real (tropa)
  const filasReales = Array.from(tabla.querySelectorAll("tr"))
    .filter(f => {
      const celdas = f.querySelectorAll("td");
      return celdas.length > 1 && celdas[1].textContent.trim() !== "";
    }).length;

  const TOTAL_FILAS = 21;
  const faltan = TOTAL_FILAS - filasReales;

  for (let i = 0; i < faltan; i++) {

    const fila = document.createElement("tr");
    fila.classList.add("fila-vacia");

    fila.innerHTML = `
      <td>&nbsp;</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    `;

    tabla.appendChild(fila);
  }
}



// =========================
// TOTAL
// =========================
function actualizarTotal() {
  let total = 0;
  document.querySelectorAll(".costeFila").forEach(c => {
    total += parseInt(c.textContent) || 0;
  });
  document.getElementById("puntos").value = total;
}

// =========================
// MOSTRAR PARTE DERECHA
// =========================
function mostrarPanelDerecho() {
  document.querySelector(".photo-box").style.display = "block";
  document.querySelector(".ficha-container").style.display = "block";
  document.querySelector(".rules").style.display = "block";
  document.querySelector(".info-unidad").style.display = "block";

  document.querySelector(".empty-state").style.display = "none";
}

// =========================
// MOSTRAR VACIO
// =========================
function mostrarEstadoVacio() {
  document.querySelector(".photo-box").style.display = "none";
  document.querySelector(".ficha-container").style.display = "none";
  document.querySelector(".rules").style.display = "none";
  document.querySelector(".info-unidad").style.display = "none";

  document.querySelector(".empty-state").style.display = "block";
}


// =========================
// REGLAS
// =========================
function mostrarReglas(idTropa) {
  const lista = document.querySelector(".rules ul");
  lista.innerHTML = "";

  const relaciones = datos.reglas_tropas.filter(r => r.IDtropa === idTropa);

  relaciones.forEach(r => {
    const regla = datos.reglas.find(reg => reg.IDRegla === r.IDRegla);
    if (regla) {
      const li = document.createElement("li");
      li.textContent = regla.REGLA;
      lista.appendChild(li);
    }
  });

  if (relaciones.length === 0) {
    lista.innerHTML = "<li>-</li>";
  }
}


// =========================
// FICHA
// =========================
function mostrarFicha(idTropa) {

  const filas = document.querySelectorAll(".stats-table tbody tr");

  // =========================
  // 🟢 TROPA
  // =========================
  const tropa = datos.tropas.find(t => t.IDtropa === idTropa);

  const ficha = obtener("ficha", "ficha_tropas", "IDficha", idTropa);

  // 👉 nombre en primera columna
  filas[0].querySelector("td").textContent = tropa ? tropa.TROPA : "Unidad";

  rellenarFila(0, ficha);


  // =========================
  // 🟡 MONTURA
  // =========================
  const relMontura = datos.montura_tropas.find(m => m.IDtropa === idTropa);
  const montura = relMontura
    ? datos.montura.find(m => m.IDmontura === relMontura.IDmontura)
    : null;

  filas[1].querySelector("td").textContent =
    montura ? montura.MONTURA_DOTACION : "Montura/Dotación";

  rellenarFila(1, montura);
  toggleFila(1, !!montura);


  // =========================
  // 🔴 CARRO
  // =========================
  const relCarro = datos.carro_tropas.find(c => c.IDtropa === idTropa);
  const carro = relCarro
    ? datos.carro.find(c => c.IDcarro === relCarro.IDcarro)
    : null;

  filas[2].querySelector("td").textContent =
    carro ? carro.CARRO : "Carro";

  rellenarFila(2, carro);
  toggleFila(2, !!carro);
}


  // =========================
  //  COSTES DE LA UNIDAD
  // =========================


function mostrarCostesUnidad(idTropa, fila) {

  const tropa = datos.tropas.find(t => t.IDtropa === idTropa);
  if (!tropa) return;

  // =========================
  // 🟡 TIPO (Básica, Especial…)
  // =========================
  const tipoDiv = document.querySelector(".tipo-unidad");

  let tipoTexto = "";

  if (tropa.IDtipo === 1) tipoTexto = "Básica";
  if (tropa.IDtipo === 2) tipoTexto = "Especial";
  if (tropa.IDtipo === 3) tipoTexto = "Singular";

  tipoDiv.textContent = tipoTexto;

  // =========================
  // 💰 COSTES BASE
  // =========================
  const costeTropa = parseInt(tropa.COSTE) || 0;

  // Equipo
  let costeEquipo = 0;
  const idEquipo = parseInt(fila.dataset.idEquipo);

  if (idEquipo) {
    const eq = datos.equipo.find(e => e.IDequipo === idEquipo);
    if (eq) costeEquipo = parseInt(eq.COSTE) || 0;
  }

  // Opciones
// Opciones
  let costeOpciones = 0;
  const idOpciones = parseInt(fila.dataset.idOpciones);

  if (idOpciones) {
    const op = datos.unidad.find(u => u.IDunidad === idOpciones);
    if (op) costeOpciones = parseInt(op.COSTE) || 0;
  }

  // PMC
  let costePMC = 0;

  if (fila.children[4].textContent) {
    costePMC += parseInt(datos.portaestandarte.find(p => p.IDtropa === idTropa)?.COSTE) || 0;
  }

  if (fila.children[5].textContent) {
    costePMC += parseInt(datos.musico.find(m => m.IDtropa === idTropa)?.COSTE) || 0;
  }

  if (fila.children[6].textContent) {
    costePMC += parseInt(datos.campeon.find(c => c.IDtropa === idTropa)?.COSTE) || 0;
  }

  // =========================
  // 🖊️ PINTAR
  // =========================
document.getElementById("costeTropa").textContent = costeTropa || "-";
document.getElementById("costeEquipo").textContent = costeEquipo || "-";
document.getElementById("costeOpciones").textContent = costeOpciones || "-";
document.getElementById("costePMC").textContent = costePMC || "-";
}







// =========================
// HELPERS
// =========================
function obtener(tabla, rel, campo, idTropa) {
  const r = datos[rel].find(x => x.IDtropa === idTropa);
  return r ? datos[tabla].find(x => x[campo] === r[campo]) : null;
}

function rellenarFila(index, data) {
  const filas = document.querySelectorAll(".stats-table tbody tr");
  const fila = filas[index];
  const celdas = fila.querySelectorAll("td");

  if (!data) {
    for (let i = 1; i < celdas.length; i++) celdas[i].textContent = "";
    return;
  }

  ["M","Ha","Hp","F","R","H","I","A","L"].forEach((k, i) => {
    celdas[i + 1].textContent = data[k] || "";
  });
}

function toggleFila(index, visible) {
  const fila = document.querySelectorAll(".stats-table tbody tr")[index];
  fila.style.display = visible ? "" : "none";
}


// =========================
// IMAGEN
// =========================
function mostrarImagen(idTropa) {

  const tropa = datos.tropas.find(t => t.IDtropa === idTropa);
  if (!tropa) return;

  const ejercito = datos.ejercitos.find(e => e.IDejercito === tropa.IDejercito);
  if (!ejercito) return;

  const contenedor = document.querySelector(".photo-box");
  if (!contenedor) return;

  // Limpia contenido anterior
  contenedor.innerHTML = "";

  // Si tienes IMAGEN en JSON
  if (ejercito.IMAGEN) {
    const img = document.createElement("img");
    img.src = "img/" + ejercito.IMAGEN;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    contenedor.appendChild(img);
  }
}

//GUARDAR
function guardarEjercito() {

  const filas = document.querySelectorAll("#tablaUnidades tr");

  let datosGuardar = [];

  filas.forEach(fila => {

    const celdas = fila.querySelectorAll("td");

    // 🚨 ignorar filas vacías o incompletas
    if (celdas.length < 8 || !celdas[1].textContent.trim()) return;

    datosGuardar.push({
      numero: celdas[0].textContent,
      tropa: celdas[1].textContent,
      equipo: celdas[2].textContent,
      opciones: celdas[3].textContent,
      p: celdas[4].textContent,
      m: celdas[5].textContent,
      c: celdas[6].textContent,
      coste: celdas[7].textContent,
      idTropa: fila.dataset.idTropa || null
    });

  });

  if (datosGuardar.length === 0) {
    alert("No hay unidades para guardar");
    return;
  }

  const nombre = prompt("Nombre del ejército:");
  if (!nombre) return;

  const blob = new Blob([JSON.stringify(datosGuardar, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre + ".json";
  a.click();
}


//CARGAR
function cargarEjercito() {
  document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function (event) {

  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const contenido = JSON.parse(e.target.result);

    const tabla = document.getElementById("tablaUnidades");
    tabla.innerHTML = "";

    contenido.forEach(item => {

      const fila = document.createElement("tr");

      let idTropa = item.idTropa ? parseInt(item.idTropa) : null;

      // 🔥 si no existe, lo buscamos por nombre
      if (!idTropa) {
        const tropaObj = datos.tropas.find(t =>
          t.TROPA.trim().toLowerCase() === item.tropa.trim().toLowerCase()
        );
        idTropa = tropaObj ? parseInt(tropaObj.IDtropa) : null;
      }

      // =========================
      // 🔥 EQUIPO (CORREGIDO)
      // =========================
      let idEquipo = null;

      if (item.equipo && item.equipo !== "--" && idTropa) {

        const rel = datos.equipo_tropas.filter(r => r.IDtropa === idTropa);
        const idsValidos = rel.map(r => r.IDequipo);

        const eq = datos.equipo.find(e =>
          idsValidos.includes(e.IDequipo) &&
          e.EQUIPO.trim().toLowerCase() === item.equipo.trim().toLowerCase()
        );

        idEquipo = eq ? eq.IDequipo : null;
      }

      // =========================
      // 🔥 OPCIONES (CORREGIDO)
      // =========================
      let idOpciones = null;

      if (item.opciones && item.opciones !== "--" && idTropa) {

        const rel = datos.unidad_tropas.filter(r => r.IDtropa === idTropa);
        const idsValidos = rel.map(r => r.IDunidad);

        const op = datos.unidad.find(u =>
          idsValidos.includes(u.IDunidad) &&
          u.UNIDAD.trim().toLowerCase() === item.opciones.trim().toLowerCase()
        );

        idOpciones = op ? op.IDunidad : null;
      }

      // =========================
      // DATASETS
      // =========================
      fila.dataset.idTropa = idTropa ? idTropa : "";
      fila.dataset.idEquipo = idEquipo ? idEquipo : "";
      fila.dataset.idOpciones = idOpciones ? idOpciones : "";

      // =========================
      // HTML FILA
      // =========================
      fila.innerHTML = `
        <td>${item.numero}</td>
        <td>${item.tropa}</td>
        <td>${item.equipo}</td>
        <td>${item.opciones}</td>
        <td>${item.p ? "✔" : ""}</td>
        <td>${item.m ? "✔" : ""}</td>
        <td>${item.c ? "✔" : ""}</td>
        <td class="costeFila">${item.coste}</td>
        <td class="borrar">❌</td>
      `;

      // =========================
      // CLICK FILA
      // =========================
      fila.addEventListener("click", function () {

        document.querySelectorAll("#tablaUnidades tr")
          .forEach(f => f.classList.remove("selected"));

        fila.classList.add("selected");

        const id = parseInt(fila.dataset.idTropa);

        if (id) {
          mostrarPanelDerecho();

          mostrarFicha(id);
          mostrarReglas(id);
          mostrarImagen(id);
          mostrarCostesUnidad(id, fila);
        }
      });

      // =========================
      // BORRAR FILA
      // =========================
      fila.querySelector(".borrar").addEventListener("click", (e) => {
        e.stopPropagation();
        fila.remove();
        actualizarTotal();
        rellenarFilasVacias();
      });

      tabla.appendChild(fila);
    });

    actualizarTotal();
    rellenarFilasVacias();
  };

  reader.readAsText(file);
});

//BORRAR
function borrarEjercito() {
  alert("Lo borras tu con tus pelotas.");
}





//PDF
function exportarPDF() {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 15;

  // =========================
  // CABECERA
  // =========================
  doc.setFillColor(50, 90, 160);
  doc.rect(10, y, 190, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");

  doc.text("Nº", 15, y + 7, { align: "center" });
  doc.text("Tropa", 25, y + 7, { align: "left" });
  doc.text("Equipo", 75, y + 7, { align: "left" });
  doc.text("Opciones", 115, y + 7, { align: "left" });
  doc.text("P", 155, y + 7, { align: "center" });
  doc.text("M", 165, y + 7, { align: "center" });
  doc.text("C", 175, y + 7, { align: "center" });
  doc.text("Coste", 190, y + 7, { align: "center" });

  y += 15;

  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");

  const filas = document.querySelectorAll("#tablaUnidades tr");

  filas.forEach(fila => {

    const celdas = fila.querySelectorAll("td");
    if (celdas.length < 8) return;

    const idTropa = fila.dataset.idTropa;

    // =========================
    // DATOS FILA
    // =========================
    const numero = celdas[0].textContent;
    const tropa = celdas[1].textContent;
    const equipo = celdas[2].textContent;
    const opciones = celdas[3].textContent;
    const coste = celdas[7].textContent;

    const p = celdas[4].textContent ? "x" : "";
    const m = celdas[5].textContent ? "x" : "";
    const c = celdas[6].textContent ? "x" : "";

    let bloqueInicioY = y;

    doc.setFontSize(9);

    doc.text(numero, 15, y, { align: "center" });
    doc.text(tropa, 25, y);
    doc.text(equipo, 75, y);
    doc.text(opciones, 115, y);
    doc.text(p, 155, y, { align: "center" });
    doc.text(m, 165, y, { align: "center" });
    doc.text(c, 175, y, { align: "center" });
    doc.text(coste, 190, y, { align: "right" });

    y += 5;

    // =========================
    // FICHA + MONTURA + CARRO
    // =========================
    const ficha = obtener("ficha", "ficha_tropas", "IDficha", parseInt(idTropa));

    let textoLinea = "";

    if (ficha) {
      textoLinea += formatearFicha(ficha);
    }

    const relMontura = datos.montura_tropas.find(m => m.IDtropa == idTropa);
    if (relMontura) {
      const montura = datos.montura.find(m => m.IDmontura === relMontura.IDmontura);
      if (montura) {
        textoLinea += "    " + montura.MONTURA_DOTACION + " " + formatearFicha(montura);
      }
    }

    const relCarro = datos.carro_tropas.find(c => c.IDtropa == idTropa);
    if (relCarro) {
      const carro = datos.carro.find(c => c.IDcarro === relCarro.IDcarro);
      if (carro) {
        textoLinea += "    " + carro.CARRO + " " + formatearFicha(carro);
      }
    }

    doc.setFontSize(8);
    doc.text(textoLinea, 25, y);

    y += 5;

    // =========================
    // REGLAS
    // =========================
    const relaciones = datos.reglas_tropas.filter(r => r.IDtropa == idTropa);

    let reglas = relaciones.map(r => {
      const regla = datos.reglas.find(reg => reg.IDRegla === r.IDRegla);
      return regla ? regla.REGLA : "";
    }).join(", ");

    doc.setFont(undefined, "italic");
    doc.text(reglas || "-", 25, y);
    doc.setFont(undefined, "normal");

    y += 4; // 👈 MENOS ESPACIO AQUÍ (ajuste fino)

    // =========================
    // BORDE DEL BLOQUE
    // =========================
    doc.rect(10, bloqueInicioY - 3, 190, y - bloqueInicioY + 2);

    y += 3;

    // salto de página
    if (y > 270) {
      doc.addPage();
      y = 15;
    }

  });

  doc.save("ejercito.pdf");
}


// =========================
// FORMATEAR FICHA
// =========================
function formatearFicha(data) {
  return `M${data.M || "-"} Ha${data.Ha || "-"} Hp${data.Hp || "-"} F${data.F || "-"} R${data.R || "-"} H${data.H || "-"} I${data.I || "-"} A${data.A || "-"} L${data.L || "-"}`;
}
});

