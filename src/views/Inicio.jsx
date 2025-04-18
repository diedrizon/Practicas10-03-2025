
import { useNavigate } from "react-router-dom";

const Inicio = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Inicio</h1>
      <button onClick={() => handleNavigate("/categorias")} >Ir a Categorías</button>
      <button onClick={() => handleNavigate("/productos")} >Ir a Productos</button>
      <button onClick={() => handleNavigate("/catalogo")} >Ir a Catalogo</button>
      <button onClick={() => handleNavigate("/libros")} >Ir a Libros</button>
    </div>
  )
}

export default Inicio;
