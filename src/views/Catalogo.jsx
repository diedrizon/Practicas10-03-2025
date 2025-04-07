import React, { useState, useEffect } from "react";
import { Container, Row, Form, Col } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import TarjetaProducto from "../components/catalogo/TarjetaProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import Paginacion from "../components/ordenamiento/Paginacion"; // ✅ Importar paginación

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // Estados para edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const fetchData = async () => {
    try {
      const productosData = await getDocs(productosCollection);
      const fetchedProductos = productosData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(fetchedProductos);

      const categoriasData = await getDocs(categoriasCollection);
      const fetchedCategorias = categoriasData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  },);

  const productosFiltrados = productos
    .filter((producto) =>
      categoriaSeleccionada === "Todas"
        ? true
        : producto.categoria === categoriaSeleccionada
    )
    .filter((producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ✅ Aplicar paginación sobre productos filtrados
  const paginatedProductos = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({
          ...prev,
          imagen: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, productoEditado);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  return (
    <Container className="mt-5">
      <br />
      <h4>Catálogo de Productos</h4>

      <Row>
        <Col lg={3} md={3} sm={6}>
          <Form.Group className="mb-3">
            <Form.Label>Filtrar por categoría:</Form.Label>
            <Form.Select
              value={categoriaSeleccionada}
              onChange={(e) => {
                setCategoriaSeleccionada(e.target.value);
                setCurrentPage(1); // Reiniciar a la primera página al filtrar
              }}
            >
              <option value="Todas">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nombre}>
                  {categoria.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col lg={3} md={3} sm={6}>
          <Form.Group className="mb-3">
            <Form.Label>Buscar producto:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el nombre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reiniciar a la primera página al buscar
              }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Catálogo de productos paginados */}
      <Row>
        {paginatedProductos.length > 0 ? (
          paginatedProductos.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              openEditModal={openEditModal}
            />
          ))
        ) : (
          <p>No hay productos en esta categoría o que coincidan con la búsqueda.</p>
        )}
      </Row>

      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={productosFiltrados.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Modal de edición */}
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
    </Container>
  );
};

export default Catalogo;
