let libros = JSON.parse(localStorage.getItem('libros')) || [];

let editando = false;
let indiceEditar = null;
let ordenAscendente = true;

const agregarLibro = () => {
    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const anio = parseInt(document.getElementById('anio').value);
    const genero = document.getElementById('genero').value;
    const leido = document.getElementById('leido').checked;
    const anioActual = new Date().getFullYear();

    if (!titulo || !autor || !anio || !genero) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    if (anio < 1900 || anio > anioActual) {
        alert(`El año debe estar entre 1900 y ${anioActual}.`);
        return;
    }

    if (!editando && libros.some(libro =>
        libro.titulo.toLowerCase() === titulo.toLowerCase() &&
        libro.autor.toLowerCase() === autor.toLowerCase()
    )) {
        alert('El libro ya está registrado con ese título y autor.');
        return;
    }

    const nuevoLibro = { titulo, autor, anio, genero, leido };

    if (editando) {
        libros[indiceEditar] = nuevoLibro;
        editando = false;
        indiceEditar = null;
        document.querySelector('button[type="submit"]').innerText = 'Cargar Libro';
    } else {
        libros.push(nuevoLibro);
    }

    localStorage.setItem('libros', JSON.stringify(libros));
    limpiarFormulario();
    mostrarLibros();
    actualizarSelectGenero();
};

const mostrarLibros = (lista = libros) => {
    const tabla = document.getElementById('tablaLibros').querySelector('tbody');
    tabla.innerHTML = '';

    lista.forEach((libr, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${libr.titulo}</td>
            <td>${libr.autor}</td>
            <td>${libr.anio}</td>
            <td>${libr.genero}</td>
            <td>${libr.leido ? '✅' : '❌'}</td>
            <td>
                <div class="flex gap-2">
                    <button 
                        onclick="editarLibro(${libros.indexOf(libr)})"
                        class="bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded">
                        Editar
                    </button>
                    <button 
                        onclick="eliminarLibro(${libros.indexOf(libr)})"
                        class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded">
                        Eliminar
                    </button>
                </div>
            </td>
        `;

        tabla.appendChild(fila);
    });

    actualizarResumen();
};

const eliminarLibro = index => {
    libros.splice(index, 1);
    localStorage.setItem('libros', JSON.stringify(libros));
    mostrarLibros();
    actualizarSelectGenero();
};

const editarLibro = index => {
    const libro = libros[index];
    document.getElementById('titulo').value = libro.titulo;
    document.getElementById('autor').value = libro.autor;
    document.getElementById('anio').value = libro.anio;
    document.getElementById('genero').value = libro.genero;
    document.getElementById('leido').checked = libro.leido;

    editando = true;
    indiceEditar = index;
    document.querySelector('button[type="submit"]').innerText = 'Actualizar Libro';
};

const limpiarFormulario = () => {
    document.getElementById('titulo').value = '';
    document.getElementById('autor').value = '';
    document.getElementById('anio').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('leido').checked = false;
};

const actualizarResumen = () => {
    const total = libros.length;
    const promedio = total > 0
        ? Math.round(libros.reduce((sum, l) => sum + l.anio, 0) / total)
        : 0;
    const post2010 = libros.filter(l => l.anio > 2010).length;
    const masAntiguo = libros.length > 0
        ? libros.reduce((min, l) => l.anio < min.anio ? l : min)
        : null;
    const masReciente = libros.length > 0
        ? libros.reduce((max, l) => l.anio > max.anio ? l : max)
        : null;
    const leidos = libros.filter(l => l.leido).length;
    const noLeidos = total - leidos;

    document.getElementById('totalLibros').textContent = total;
    document.getElementById('promedioAnio').textContent = promedio;
    document.getElementById('librosPost2010').textContent = post2010;
    document.getElementById('libroAntiguo').textContent = masAntiguo
        ? `${masAntiguo.titulo} (${masAntiguo.anio})`
        : 'N/A';
    document.getElementById('libroReciente').textContent = masReciente
        ? `${masReciente.titulo} (${masReciente.anio})`
        : 'N/A';
    document.getElementById('leidos').textContent = leidos;
    document.getElementById('noLeidos').textContent = noLeidos;
};

const ordenarPorAnio = () => {
    libros.sort((a, b) => ordenAscendente ? a.anio - b.anio : b.anio - a.anio);
    ordenAscendente = !ordenAscendente;
    mostrarLibros();
};

const filtrarPorTitulo = () => {
    const texto = document.getElementById('busqueda').value.toLowerCase();
    const librosFiltrados = libros.filter(libro =>
        libro.titulo.toLowerCase().includes(texto)
    );
    mostrarLibros(librosFiltrados);
};

const actualizarSelectGenero = () => {
    const select = document.getElementById('filtroGenero');
    if (!select) return;
    const generosUnicos = [...new Set(libros.map(libro => libro.genero))];
    select.innerHTML = `<option value="todos">Todos</option>`;
    generosUnicos.forEach(genero => {
        const option = document.createElement("option");
        option.value = genero;
        option.text = genero;
        select.appendChild(option);
    });
};

const filtrarPorGenero = () => {
    const genero = document.getElementById('filtroGenero').value;
    if (genero === 'todos') {
        mostrarLibros();
    } else {
        const librosFiltrados = libros.filter(libro => libro.genero === genero);
        mostrarLibros(librosFiltrados);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mostrarLibros();
    actualizarSelectGenero();
});
