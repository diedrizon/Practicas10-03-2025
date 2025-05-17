// Productos.jsx

import React, { useState, useEffect } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import Paginacion from "../components/ordenamiento/Paginacion";

const Productos = () => {
  // Estados
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchData = () => {
    const unsubscribeProductos = onSnapshot(
      productosCollection,
      (snapshot) => {
        const fetchedProductos = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setProductos(fetchedProductos);
        if (isOffline) {
          console.log("Offline: Productos cargados desde caché local.");
        }
      },
      (error) => {
        console.error("Error al escuchar productos:", error);
        if (isOffline) {
          console.log("Offline: Mostrando productos desde caché local.");
        } else {
          alert("Error al cargar productos: " + error.message);
        }
      }
    );

    const unsubscribeCategorias = onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
        if (isOffline) {
          console.log("Offline: Categorías cargadas desde caché local.");
        }
      },
      (error) => {
        console.error("Error al escuchar categorías:", error);
        if (isOffline) {
          console.log("Offline: Mostrando categorías desde caché local.");
        } else {
          alert("Error al cargar categorías: " + error.message);
        }
      }
    );

    return () => {
      unsubscribeProductos();
      unsubscribeCategorias();
    };
  };

  useEffect(() => {
    const cleanupListener = fetchData();
    return () => cleanupListener();
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProducto = async () => {
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio ||
      !nuevoProducto.categoria
    ) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    setShowModal(false);

    const tempId = `temp_${Date.now()}`;
    const productoConId = { ...nuevoProducto, id: tempId };

    try {
      setProductos((prev) => [...prev, productoConId]);

      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });

      await addDoc(productosCollection, {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        categoria: nuevoProducto.categoria,
        imagen: nuevoProducto.imagen,
      });

      if (isOffline) {
        console.log("Producto agregado localmente (sin conexión).");
      } else {
        console.log("Producto agregado exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
      if (isOffline) {
        console.log("Offline: Producto almacenado localmente.");
      } else {
        setProductos((prev) => prev.filter((prod) => prod.id !== tempId));
        alert("Error al agregar el producto: " + error.message);
      }
    }
  };

  const handleEditProducto = async () => {
    if (
      !productoEditado?.nombre ||
      !productoEditado?.precio ||
      !productoEditado?.categoria
    ) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (productoEditado.id.startsWith("temp_")) {
      alert(
        "Este producto todavía no se ha sincronizado con la nube. Intenta más tarde."
      );
      return;
    }

    setShowEditModal(false);

    const productoRef = doc(db, "productos", productoEditado.id);

    try {
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: parseFloat(productoEditado.precio),
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });

      if (isOffline) {
        setProductos((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id
              ? {
                  ...productoEditado,
                  precio: parseFloat(productoEditado.precio),
                }
              : prod
          )
        );
        console.log("Producto actualizado localmente (sin conexión).");
        alert(
          "Sin conexión: Producto actualizado localmente. Se sincronizará al reconectar."
        );
      } else {
        console.log("Producto actualizado exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setProductos((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id ? { ...prod } : prod
        )
      );
      alert("Error al actualizar el producto: " + error.message);
    }
  };

  const handleDeleteProducto = async () => {
    if (!productoAEliminar) return;

    if (productoAEliminar.id.startsWith("temp_")) {
      alert(
        "Este producto todavía no se ha sincronizado con la nube. Intenta más tarde."
      );
      return;
    }

    setShowDeleteModal(false);

    try {
      setProductos((prev) =>
        prev.filter((prod) => prod.id !== productoAEliminar.id)
      );

      const productoRef = doc(db, "productos", productoAEliminar.id);
      await deleteDoc(productoRef);

      if (isOffline) {
        console.log("Producto eliminado localmente (sin conexión).");
      } else {
        console.log("Producto eliminado exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      if (isOffline) {
        console.log("Offline: Eliminación almacenada localmente.");
      } else {
        setProductos((prev) => [...prev, productoAEliminar]);
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const handleCopy = (producto) => {
    const texto = `Nombre: ${producto.nombre}, Precio: C$${producto.precio}, Categoría: ${producto.categoria}`;
    navigator.clipboard.writeText(texto).then(() => {
      alert("Datos copiados al portapapeles.");
    });
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProductos = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Productos</h4>

      <Form.Group className="mb-3" controlId="formSearchProducto">
        <Form.Control
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar producto
      </Button>

      <>
        <TablaProductos
          productos={paginatedProductos}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
          handleCopy={handleCopy}
        />
        <Paginacion
          itemsPerPage={itemsPerPage}
          totalItems={productosFiltrados.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </>

      <ModalRegistroProducto
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoProducto={nuevoProducto}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleAddProducto={handleAddProducto}
        categorias={categorias}
      />
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
      <ModalEliminacionProducto
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteProducto={handleDeleteProducto}
      />
    </Container>
  );
};

export default Productos;
