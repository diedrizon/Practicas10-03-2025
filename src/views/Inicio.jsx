import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import ModalInstalacionIOS from "../components/inicio/ModalInstalacionIOS";

const Inicio = () => {
  const navigate = useNavigate();

  // Variables de estado
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  // Detectar dispositivo iOS
  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  // Escuchar el evento beforeinstallprompt
  useEffect(() => {
    const manejarSolicitudInstalacion = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener("beforeinstallprompt", manejarSolicitudInstalacion);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarSolicitudInstalacion);
    };
  }, []);

  // Función para lanzar el prompt de instalación
  const instalacion = async () => {
    if (!solicitudInstalacion) return;
    try {
      await solicitudInstalacion.prompt();
      const { outcome } = await solicitudInstalacion.userChoice;
      console.log(
        outcome === "accepted" ? "Instalación aceptada" : "Instalación rechazada"
      );
    } catch (error) {
      console.error("Error al intentar instalar la PWA:", error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  // Abrir/cerrar modal de instrucciones
  const abrirModalInstrucciones = () => setMostrarModalInstrucciones(true);
  const cerrarModalInstrucciones = () => setMostrarModalInstrucciones(false);

  // Función de navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Container className="my-4">
      <h1>Inicio</h1>

      <Button className="m-2" onClick={() => handleNavigate("/categorias")}>Ir a Categorías</Button>
      <Button className="m-2" onClick={() => handleNavigate("/productos")}>Ir a Productos</Button>
      <Button className="m-2" onClick={() => handleNavigate("/catalogo")}>Ir a Catálogo</Button>
      <Button className="m-2" onClick={() => handleNavigate("/libros")}>Ir a Libros</Button>
      <Button className="m-2" onClick={() => handleNavigate("/clima")}>Ir a Clima</Button>
      <Button className="m-2" onClick={() => handleNavigate("/estadisticas")}>Ir a Estadísticas</Button>

      <br />

      {/* Botón de instalación solo si NO es iOS */}
      {!esDispositivoIOS && mostrarBotonInstalacion && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={instalacion}>
            Instalar app Nebula Store <i className="bi bi-download"></i>
          </Button>
        </div>
      )}

      {/* Botón de instrucciones si ES iOS */}
      {esDispositivoIOS && (
        <div className="text-center my-4">
          <Button className="sombra" variant="primary" onClick={abrirModalInstrucciones}>
            Cómo instalar Nebula Store en iPhone <i className="bi bi-phone"></i>
          </Button>
        </div>
      )}

      {/* Modal de instrucciones */}
      <ModalInstalacionIOS
        mostrar={mostrarModalInstrucciones}
        cerrar={cerrarModalInstrucciones}
      />
    </Container>
  );
};

export default Inicio;
