import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export function ProductoTerminado() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [productionOpen, setProductionOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
  });
  const [productionDetails, setProductionDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productosPerPage] = useState(3);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  useEffect(() => {
    filterProductos();
  }, [search, productos]);

  const filterProductos = () => {
    const filtered = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProductos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleProductionOpen = () => setProductionOpen(!productionOpen);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProducto({
      nombre: "",
      descripcion: "",
      precio: "",
    });
    setEditMode(false);
    setErrors({});
    handleOpen();
  };

  const handleProductionCreate = () => {
    setProductionDetails([{ id_producto: "", cantidad: "" }]);
    handleProductionOpen();
  };

  const handleDelete = async (producto) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto ${producto.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/productos/${producto.id_producto}`);
        fetchProductos(); // Refrescar la lista de productos
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: 'success',
          title: 'El producto ha sido eliminado correctamente.'
        });
      } catch (error) {
        console.error("Error deleting producto:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: 'El producto no se puede eliminar ya que se encuentra asociado a una venta y/o a una orden de producción.',
          confirmButtonText: 'Aceptar',
          background: '#ffff',
          iconColor: '#A62A64',
          confirmButtonColor: '#000000',
          customClass: {
            title: 'text-lg font-semibold',
            icon: 'text-2xl',
            confirmButton: 'px-4 py-2 text-white'
          }
        });
      }
    }
  };
  

  const validateForm = () => {
    const newErrors = {};
  
    // Validación de nombre
    if (!selectedProducto.nombre) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/.test(selectedProducto.nombre)) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres y solo puede contener letras, tildes y espacios";
    }
  
    // Validación de descripción
    if (!selectedProducto.descripcion) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,}$/.test(selectedProducto.descripcion)) {
      newErrors.descripcion = "La descripción debe tener al menos 5 caracteres y solo puede contener letras, tildes y espacios";
    }
  
    // Validación de precio
    if (!selectedProducto.precio) {
      newErrors.precio = "El precio es requerido";
    } else if (!/^\d+$/.test(selectedProducto.precio)) {
      newErrors.precio = "El precio solo puede contener números";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      if (editMode) {
        // Asegúrate de que `selectedProducto` tenga `id_producto` si es necesario para la actualización
        await axios.put(`http://localhost:3000/api/productos/${selectedProducto.id_producto}`, selectedProducto);
        Toast.fire({
          icon: 'success',
          title: 'El producto ha sido actualizado correctamente.'
        });
      } else {
        await axios.post("http://localhost:3000/api/productos", selectedProducto);
        Toast.fire({
          icon: 'success',
          title: 'El producto ha sido creado correctamente.'
        });
      }
      fetchProductos(); // Refrescar la lista de productos
      handleOpen();
    } catch (error) {
      console.error("Error saving producto:", error);
      Toast.fire({
        icon: 'error',
        title: 'Hubo un problema al guardar el producto.'
      });
    }
  };
  

  

  const validateProductionForm = () => {
    const newErrors = {};
  
    productionDetails.forEach((detalle, index) => {
      if (!detalle.id_producto) {
        newErrors[`producto_${index}`] = "El producto es requerido";
      }
      if (!detalle.cantidad) {
        newErrors[`cantidad_${index}`] = "La cantidad es requerida";
      } else if (!/^\d+$/.test(detalle.cantidad)) {
        newErrors[`cantidad_${index}`] = "La cantidad solo puede contener números";
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleProductionSave = async () => {
    if (!validateProductionForm()) {
      return;
    }
  
    try {
      const productionDetailsNumerics = productionDetails.map(detalle => ({
        ...detalle,
        cantidad: Number(detalle.cantidad) // Convertir cantidad a número
      }));
      await axios.post("http://localhost:3000/api/productos/producir", { productosProduccion: productionDetailsNumerics });
      Toast.fire({
        icon: "success",
        title: "Producción realizada correctamente",
      });
      fetchProductos(); // Refrescar la lista de productos
      handleProductionOpen(); // Cerrar el modal de producción
    } catch (error) {
      console.error("Error al realizar la producción:", error);
      Toast.fire({
        icon: "error",
        title: "Hubo un problema al realizar la producción",
      });
    }
  };
  



  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProducto({ ...selectedProducto, [name]: value });
  };

  const handleProductionChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...productionDetails];
    detalles[index][name] = name === 'cantidad' ? Number(value) : value; // Convertir cantidad a número
    setProductionDetails(detalles);
};


  const handleAddProductionDetalle = () => {
    setProductionDetails([...productionDetails, { id_producto: "", cantidad: "" }]);
  };

  const handleRemoveProductionDetalle = (index) => {
    const detalles = [...productionDetails];
    detalles.splice(index, 1);
    setProductionDetails(detalles);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (producto) => {
    setSelectedProducto(producto);
    handleDetailsOpen();
  };

  const indexOfLastProducto = currentPage * productosPerPage;
  const indexOfFirstProducto = indexOfLastProducto - productosPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstProducto, indexOfLastProducto);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProductos.length / productosPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Producto Terminado
          </Button>
          <Button 
  onClick={handleProductionCreate} 
  className="btnagregar" 
  size="sm" 
  startIcon={<PlusIcon />} 
  style={{ marginLeft: '10px' }} // Ajusta el valor según tus necesidades
>
  Producción
</Button>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Productos terminados
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Editar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProductos.map((producto) => (
                    <tr key={producto.id_producto}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{producto.nombre}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.descripcion}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.precio}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.stock}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-1">
                        <IconButton className="btnedit" size="sm" color="blue" onClick={() => handleEdit(producto)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="cancelar" size="sm" color="red" onClick={() => handleDelete(producto)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(producto)}>
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <ul className="flex justify-center items-center space-x-2">
                {pageNumbers.map((number) => (
                  <Button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`pagination ${number === currentPage ? 'active' : ''}`}               
                  size="sm"
                >
                  {number}
                </Button>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      <Dialog open={open} handler={handleOpen} className="max-w-md w-11/12 p-6 bg-white rounded-lg shadow-lg" size="xs">
  <DialogHeader className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-4">
    {editMode ? "Editar Producto Terminado" : "Crear Producto Terminado"}
  </DialogHeader>
  <DialogBody divider className="space-y-4">
    <div>
      <Input
        name="nombre"
        label="Nombre"
        required
        value={selectedProducto.nombre}
        onChange={handleChange}
        error={errors.nombre}
        className="rounded-lg border-gray-300"
      />
      {errors.nombre && <Typography className="text-red-500 mt-1 text-sm">{errors.nombre}</Typography>}
    </div>
    <div>
      <Input
        name="descripcion"
        label="Descripción"
        value={selectedProducto.descripcion}
        error={errors.descripcion}
        required
        onChange={handleChange}
        className="rounded-lg border-gray-300"
      />
      {errors.descripcion && <Typography className="text-red-500 mt-1 text-sm">{errors.descripcion}</Typography>}
    </div>
    <div>
      <Input
        name="precio"
        label="Precio"
        type="number"
        value={selectedProducto.precio}
        onChange={handleChange}
        required
        error={errors.precio}
        className="rounded-lg border-gray-300"
      />
      {errors.precio && <Typography className="text-red-500 mt-1 text-sm">{errors.precio}</Typography>}
    </div>
  </DialogBody>
  <DialogFooter className="flex justify-end pt-4">
    <Button variant="text" className="btncancelarm" size="sm" onClick={handleOpen}>
      Cancelar
    </Button>
    <Button variant="gradient" className="btnagregarm" size="sm" color="green" onClick={handleSave}>
      {editMode ? "Guardar Cambios" : "Crear Producto Terminado"}
    </Button>
  </DialogFooter>
</Dialog>



<Dialog open={productionOpen} handler={handleProductionOpen} className="custom-modal max-w-4xl">
  <DialogHeader className="text-black p-2 text-lg">Producción</DialogHeader>
  <DialogBody divider className="flex max-h-[60vh] p-4 gap-6">
    {/* Sección para agregar productos */}
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
      <Typography variant="h6" color="blue-gray" className="mb-4 text-sm">
        Añadir Productos a Producción
      </Typography>
      {productionDetails.map((detalle, index) => (
        <div key={index} className="mb-4 flex items-center">
          <div className="flex-1 flex flex-col gap-4">
          <div className="w-full max-w-xs">
            <Select
              label="Producto"
              name="id_producto"
              required
              
              value={detalle.id_producto}
              error={errors.id_producto}
              onChange={(e) => {
                handleProductionChange(index, { target: { name: 'id_producto', value: e } });
                setErrors({ ...errors, [`producto_${index}`]: "" });
              }}
              className="w-full text-sm"
            >
              {productos.map((producto) => (
                <Option key={producto.id_producto} value={producto.id_producto}>
                  {producto.nombre}
                </Option>
              ))}
            </Select>
            {errors[`producto_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`producto_${index}`]}</p>
                )}
                 </div>
                 <div className="w-full max-w-xs">
            <Input
              label="Cantidad"
              name="cantidad"
              type="number"
              required
              value={detalle.cantidad}
              error={errors.cantidad}
              onChange={(e) => {
                handleProductionChange(index, e);
                setErrors({ ...errors, [`cantidad_${index}`]: "" });
              }}
              className="w-full text-sm"
            />
            {errors[`cantidad_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`cantidad_${index}`]}</p>
            )}
          </div>
          </div>

          <div className="flex items-center ml-4">
            <IconButton  className="btncancelarm"
                  size="sm"cf onClick={() => handleRemoveProductionDetalle(index)}>
              <TrashIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      ))}
      <div className="mt-2 flex justify-end">
        <Button className="btnmas" size="sm" onClick={handleAddProductionDetalle}>
        <PlusIcon className="h-4 w-4 mr-1" />
        </Button>
      </div>
    </div>

    {/* Sección para listar productos seleccionados */}
    <div className="w-full max-w-xs bg-gray-100 p-4 rounded-lg shadow-md max-h-[60vh] overflow-y-auto">
      <Typography variant="h6" color="blue-gray" className="mb-4 text-lg">
        Productos Seleccionados
      </Typography>
      <ul className="list-disc pl-4 text-sm">
        {productionDetails.map((detalle, index) => {
          const productoSeleccionado = productos.find(p => p.id_producto === detalle.id_producto);
          return (
            <li key={index} className="mb-2">
              <span className="font-semibold text-gray-800">
                {productoSeleccionado ? productoSeleccionado.nombre : 'Producto no encontrado'}:
              </span>
              Cantidad {detalle.cantidad}
            </li>
          );
        })}
      </ul>
    </div>
  </DialogBody>
  <DialogFooter className="bg-white p-4 flex justify-end gap-2">
    <Button variant="text" color="red" className="btncancelarm" size="sm" onClick={handleProductionOpen}>
      Cancelar
    </Button>
    <Button variant="gradient" className="btnagregarm" size="sm" onClick={handleProductionSave}>
      Guardar Producción
    </Button>
  </DialogFooter>
</Dialog>



      
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Producto</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedProducto.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Descripción:</td>
                <td>{selectedProducto.descripcion}</td>
              </tr>
              <tr>
                <td className="font-semibold">Precio:</td>
                <td>{selectedProducto.precio}</td>
              </tr>
              <tr>
                <td className="font-semibold">Stock:</td>
                <td>{selectedProducto.stock}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{selectedProducto.createdAt ? new Date(selectedProducto.createdAt).toLocaleString() : "N/A"}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedProducto.updatedAt).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="blue-gray" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
