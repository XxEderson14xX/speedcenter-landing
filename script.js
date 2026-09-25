// ============================================================================
// Landing SpeedCenter · script.js
// ============================================================================
// Se conecta a la misma base de Supabase de SpeedCenter, pero SOLO puede
// insertar en la tabla "prospectos_landing" (rol "anon", política de
// solo INSERT que ya creamos en la Fase 1). No puede leer ni modificar
// nada más de tu sistema.
// ============================================================================
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("anio-actual").textContent = new Date().getFullYear();

// Animación sutil de aparición al hacer scroll (secciones con clase .reveal)
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visto");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((elReveal) => observador.observe(elReveal));

// Menú móvil simple: al hacer clic en el botón ☰, muestra/oculta los links
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle?.addEventListener("click", () => {
  const visible = navLinks.style.display === "flex";
  navLinks.style.display = visible ? "none" : "flex";
  navLinks.style.flexDirection = "column";
  navLinks.style.position = "absolute";
  navLinks.style.top = "68px";
  navLinks.style.left = "0";
  navLinks.style.right = "0";
  navLinks.style.background = "#F7F4EF";
  navLinks.style.padding = "22px 24px";
  navLinks.style.borderBottom = "1px solid #E7E1D8";
  navLinks.style.gap = "18px";
});

// ============================================================================
// Acordeón de Preguntas Frecuentes
// ============================================================================
document.querySelectorAll(".faq-pregunta").forEach((boton) => {
  boton.addEventListener("click", () => {
    const item = boton.closest(".faq-item");
    const yaAbierto = item.classList.contains("abierto");
    document.querySelectorAll(".faq-item.abierto").forEach((otro) => otro.classList.remove("abierto"));
    if (!yaAbierto) item.classList.add("abierto");
  });
});

// ============================================================================
// Envío del formulario de cotización -> tabla "prospectos_landing"
// ============================================================================
const form = document.getElementById("form-prospecto");
const mensajeForm = document.getElementById("mensaje-form");
const btnEnviar = document.getElementById("btn-enviar-form");

function mostrarMensajeForm(texto, tipo) {
  mensajeForm.textContent = texto;
  mensajeForm.className = tipo; // "ok" o "error"
}

form?.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const nombre = document.getElementById("f-nombre").value.trim();
  const telefono = document.getElementById("f-telefono").value.trim();
  const correo = document.getElementById("f-correo").value.trim();
  const servicio = document.getElementById("f-servicio").value;
  const marca = document.getElementById("f-marca").value.trim();
  const modelo = document.getElementById("f-modelo").value.trim();
  const anio = document.getElementById("f-anio").value;
  const mensaje = document.getElementById("f-mensaje").value.trim();

  if (!nombre || !telefono) {
    mostrarMensajeForm("Por favor completa tu nombre y teléfono para poder contactarte.", "error");
    return;
  }

  const registro = {
    nombre,
    telefono,
    correo: correo || null,
    servicio_interes: servicio || null,
    marca: marca || null,
    modelo: modelo || null,
    anio: anio ? Number(anio) : null,
    mensaje: mensaje || null,
    origen: "landing"
  };

  const textoOriginal = btnEnviar.textContent;
  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";

  const { error } = await sb.from("prospectos_landing").insert(registro);

  btnEnviar.disabled = false;
  btnEnviar.textContent = textoOriginal;

  if (error) {
    console.error("Error al enviar la solicitud:", error);
    mostrarMensajeForm("No pudimos enviar tu solicitud. Por favor intenta de nuevo o llámanos directamente.", "error");
    return;
  }

  mostrarMensajeForm("¡Listo! Recibimos tu solicitud. Te contactaremos muy pronto por WhatsApp o llamada.", "ok");
  form.reset();
});
