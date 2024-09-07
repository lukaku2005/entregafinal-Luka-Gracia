const main = document.getElementById("main")
const carrito = document.getElementById("carrito")
let carritoArray = JSON.parse(localStorage.getItem("carrito")) || []



const tarjetas = (nombre, imagen, descripcion, precio) => {
    main.innerHTML += `
        <div class="contenedorTarjetas">
            <h3 class="nombre">${nombre}</h3>
            <img class="img1" src="${imagen}" alt="">
            <p class="desc">${descripcion}</p>
            <p>${"$" + precio}</p>
            <button class="botonCompra" data-nombre="${nombre}" data-precio="${precio}">Comprar</button>
        </div>`
        seleccionBotonCompra()
        
}

const llamarTarjetas = async () => {
    let resp = await fetch ("./info.json")
    let data = await resp.json()
    data.forEach(el => {
        tarjetas(el.nombre, el.imagen, el.descripcion, el.precio)
    });
    
}

llamarTarjetas()

const seleccionBotonCompra = () => {
    const botonesCompra = document.querySelectorAll(".botonCompra")
    botonesCompra.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const nombreProducto = e.target.getAttribute("data-nombre")
            const precioProducto = e.target.getAttribute("data-precio")
            Swal.fire({
                toast: true,
                title: "Producto agregado al carrito!",
                position: "top-start",
                timer: 2000,
                timerProgressBar: "true"
        })
            agregarAlCarrito(nombreProducto, precioProducto)
        })
    })
}

const tarjetasCarrito = (nombre, precio, cantidad) => {
    return `
        <div class="contenedorTarjetasCarrito">
            <h3 class="nombreCarrito">${nombre}</h3>
            <button class="mas" data-nombre="${nombre}">+</button>
            <p class="cantidad">${cantidad}</p>
            <button class="menos" data-nombre="${nombre}">-</button>
            <button class="vaciar" data-nombre="${nombre}">Vaciar</button>
            <p class="pCarrito">${"$" + precio}</p>
        </div>`
}
const botonMas = () => {
    const botonesMas = document.querySelectorAll(".mas") 
    botonesMas.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const nombre = e.target.getAttribute('data-nombre')
            sumarAlCarrito(nombre)
        })
    })
}
const botonMenos = () => {
    const botonMenos = document.querySelectorAll(".menos")
    botonMenos.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const nombre = e.target.getAttribute('data-nombre')
            restarAlCarrito(nombre)
        })
    })
}


const restarAlCarrito = (nombre) => {
        const itemCarrito = carritoArray.find(el => {
            return el.nombre === nombre
        })
        if(itemCarrito.cantidad <= 1){
            let arrayNombres = carritoArray.map(el => {
                return el.nombre
            })
            let index = arrayNombres.indexOf(nombre)
            carritoArray.splice(index, 1)
        }else{
            itemCarrito.cantidad -= 1
        }
        actualizarCarrito()
}

const sumarAlCarrito = (nombre) => {
    const itemCarrito = carritoArray.find(el => {
        return el.nombre === nombre
    })
    itemCarrito.cantidad += 1
    
    actualizarCarrito()
}

const agregarAlCarrito = (nombre, precio) => {
    const item = carritoArray.some(el => {
        return el.nombre === nombre
    })
    precio = parseFloat(precio)
    if(item){
        const itemCarrito = carritoArray.find(el => {
            return el.nombre === nombre
        })
        itemCarrito.cantidad += 1
    }else{
        carritoArray.push({
            nombre,
            precio,
            cantidad: 1
        })
    }
    
    actualizarCarrito()
}
const actualizarCarrito = () => {
    carrito.innerHTML = ""
    
    carritoArray.forEach(el => {
        carrito.innerHTML += tarjetasCarrito(el.nombre, el.precio, el.cantidad)
    })
    botonVaciar()
    botonMas()
    botonMenos()
    totalCarrito()
}

const totalCarrito = () => {
    const totalDOM = document.createElement("h3")
    totalDOM.classList.add("precio-carrito")
    const pagarDOM = document.createElement("button")
    pagarDOM.classList.add("boton-pagar")

    const total = carritoArray.reduce((acc, el)=>{
        return acc + el.cantidad * el.precio
    },0)

    pagarDOM.addEventListener("click", () => {
        pagarAnimacion()
    })

    totalDOM.innerText = "$" + total
    pagarDOM.innerText = "Pagar"
    carrito.appendChild(totalDOM)
    carrito.appendChild(pagarDOM)
    localStorage.setItem("carrito",JSON.stringify(carritoArray))
}

const despuesCompra = () => {
    const carrito = document.getElementById("carrito");
    carritoArray.innerHTML = "";

    if (carritoArray.length === 0) {
        carrito.innerHTML = "<p>El carrito está vacío.</p>";
    } else {
        carritoArray.forEach(item => {
            carrito.innerHTML += `<div>${item.nombre} - ${item.precio}</div>`;
        });
    }
}

const pagarAnimacion = () => {
    if (carritoArray.length === 0) {
        Swal.fire({
            title: "Error",
            text: "El carrito está vacío, no puedes proceder al pago.",
            icon: "error",
            confirmButtonText: "OK"
        })
        return
    }
    Swal.fire({
        title: "Quieres pasar al pago?",
        icon: "info",
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:"Si",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Ingresa tu Email",
                input: "email",
                inputPlaceholder: "Ingresa tu Email aquí",
                showCancelButton: true,
                confirmButtonText: "Confirmar",
                cancelButtonText: "Cancelar",
                preConfirm: (email) => {
                    if (!email || !email.includes("@")) {
                        Swal.showValidationMessage("Por favor ingresa un email válido")
                        return false
                    }
                    return email
                }
            }).then(() => {
                const { value: pago } = Swal.fire({
                    title: "Selecciona un metodo de pago",
                    input: "select",
                    inputOptions: {
                      Metodos: {
                        Mercado: "Mercado Pago",
                        Credito: "Tarjeta de Credito",
                        Debito: "Trajeta de Debito",
                        Efectivo: "Efectivo"
                      },
                    },
                    inputPlaceholder: "Selecciona un metodo de pago",
                    showCancelButton: true,
                  }).then((resultadoPago) =>{
                    if(resultadoPago.isConfirmed){
                        const metodoPago = resultadoPago.value
                        if(metodoPago) {
                            carritoArray = []
                            despuesCompra()
                            Swal.fire({
                                title: "Pago realizado",
                                    text: "Tu pago ha sido procesado con éxito.",
                                    icon: "success",
                                    confirmButtonText: "OK"
                            })
                        }
                    }
                  })
            
            });
        }
    });
}


const carritoImg = document.querySelector(".carritoImg")

carritoImg.addEventListener("click", () => {
    if (carrito.style.display === "none" || carrito.style.display === "") {
        carrito.style.display = "block"
    } else {
        carrito.style.display = "none" 
    }
})

const eliminarCarrito = (nombre) => {
    const index = carritoArray.findIndex(el => el.nombre === nombre)
    if (index !== -1) {
        carritoArray.splice(index, 1)
    }
    actualizarCarrito()
}

const botonVaciar = () => {
    const botonVaciar = document.querySelectorAll(".vaciar")
    botonVaciar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const nombre = e.target.getAttribute('data-nombre')
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: "btn btn-success",
                  cancelButton: "btn btn-danger"
                },
                buttonsStyling: false
              });
              swalWithBootstrapButtons.fire({
                title: "Seguro que quieres eliminar el producto?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Si, borralo",
                cancelButtonText: "No lo borres",
                reverseButtons: true
              }).then((result) => {
                if (result.isConfirmed) {
                    eliminarCarrito(nombre)
                   swalWithBootstrapButtons.fire({
                    title: "Producto eliminado",
                    icon: "success"
                  });
                } else if (
                  result.dismiss === Swal.DismissReason.cancel
                ) {
                  swalWithBootstrapButtons.fire({
                    title: "Producto no borrado",
                    icon: "error"
                  });
                }
              });
        })
    })
}
