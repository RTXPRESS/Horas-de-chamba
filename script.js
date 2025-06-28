const calendar = document.getElementById('calendar');
const fechaInput = document.getElementById('fecha');
const form = document.getElementById('registroForm');
const tabla = document.getElementById('tablaRegistros').querySelector('tbody');

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

let fechaActual = new Date();
let hoy = new Date();

// 👉 Asegurate de que esta URL es tu implementación activa
const API_URL = 'https://script.google.com/macros/s/AKfycbwSTKMnBiPI1I9jaFi0KHtC9hNz7iKxij7zVLaxbfMUctbl0DOalJK-3NX3N7utXjj1/exec';

function generarCalendario(fecha) {
  calendar.innerHTML = '';

  const año = fecha.getFullYear();
  const mes = fecha.getMonth();
  const primerDiaMes = new Date(año, mes, 1);
  const ultimoDiaMes = new Date(año, mes + 1, 0);
  const diasEnMes = ultimoDiaMes.getDate();
  const diaInicio = primerDiaMes.getDay();

  const header = document.createElement('div');
  header.className = 'calendar-header';

  const mesAnio = document.createElement('div');
  mesAnio.innerHTML = `<strong>${meses[mes]} ${año}</strong>`;

  const prev = document.createElement('button');
  prev.textContent = '<';
  prev.onclick = () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    generarCalendario(fechaActual);
  };

  const next = document.createElement('button');
  next.textContent = '>';
  next.onclick = () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    generarCalendario(fechaActual);
  };

  header.appendChild(prev);
  header.appendChild(mesAnio);
  header.appendChild(next);
  calendar.appendChild(header);

  const diasNombres = document.createElement('div');
  diasNombres.className = 'calendar-grid day-names';
  dias.forEach(d => {
    const dia = document.createElement('div');
    dia.textContent = d;
    diasNombres.appendChild(dia);
  });
  calendar.appendChild(diasNombres);

  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  for (let i = 0; i < diaInicio; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const celda = document.createElement('div');
    celda.textContent = dia;

    const esHoy = (
      dia === hoy.getDate() &&
      mes === hoy.getMonth() &&
      año === hoy.getFullYear()
    );

    const diaFormateado = dia.toString().padStart(2, '0');
    const mesFormateado = (mes + 1).toString().padStart(2, '0');
    const fechaFormateada = `${año}-${mesFormateado}-${diaFormateado}`;

    if (esHoy) {
      celda.classList.add('selected');
      fechaInput.value = fechaFormateada;
    }

    celda.onclick = () => {
      document.querySelectorAll('.calendar-grid div').forEach(el => el.classList.remove('selected'));
      celda.classList.add('selected');
      fechaInput.value = fechaFormateada;
    };

    grid.appendChild(celda);
  }

  calendar.appendChild(grid);
}

generarCalendario(fechaActual);

async function cargarRegistros() {
  try {
    const response = await fetch(API_URL);
    const registros = await response.json();

    tabla.innerHTML = '';
    registros.forEach(reg => {
      const fechaObj = new Date(reg.fecha);
      const fechaFormateada = fechaObj.toISOString().slice(0, 10);

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${reg.horas}</td>
        <td>${reg.feriado ? '✅' : '❌'}</td>
        <td>${reg.horaInicio || '-'}</td>
        <td>${reg.horaFin || '-'}</td>
      `;
      tabla.appendChild(fila);
    });
  } catch (err) {
    console.error("Error cargando registros:", err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("fecha", document.getElementById('fecha').value);
  formData.append("horas", document.getElementById('horas').value);
  formData.append("feriado", document.getElementById('feriado').checked);
  formData.append("horaInicio", document.getElementById('horaInicio').value);
  formData.append("horaFin", document.getElementById('horaFin').value);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      form.reset();
      fechaInput.value = "";
      cargarRegistros();
    } else {
      console.error('Error al enviar los datos:', response.statusText);
    }
  } catch (err) {
    console.error('Error en fetch POST:', err);
  }
});

document.getElementById('limpiarRegistros').addEventListener('click', async () => {
  if (confirm('¿Estás seguro de que deseas borrar todos los registros?')) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        body: new URLSearchParams({ borrar: true })
      });
      cargarRegistros();
    } catch (err) {
      console.error("Error al borrar registros:", err);
    }
  }
});

cargarRegistros();
