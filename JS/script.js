// script.js

function like(boton){

    if(boton.innerHTML === "💖 Like"){

        boton.innerHTML = "💘 Te gusta";

    }else{

        boton.innerHTML = "💖 Like";

    }

}

function crearPost(){

    let texto = document.getElementById("textoPost").value;

    if(texto.trim() === ""){

        alert("escribe algo primero 😭");
        return;

    }

    let nuevoPost = document.createElement("div");

    nuevoPost.classList.add("post");

    nuevoPost.innerHTML = `

        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200">

        <div class="contenido-post">

            <h2>Nuevo drama desbloqueado ✨</h2>

            <p>${texto}</p>

            <div class="acciones">

                <button onclick="like(this)">
                    💖 Like
                </button>

                <button>
                    💬 Comentarios
                </button>

                <button>
                    ✨ Compartir
                </button>

            </div>

        </div>

    `;

    document.getElementById("posts").prepend(nuevoPost);

    document.getElementById("textoPost").value = "";

}