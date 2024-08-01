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
  Option
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
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export function FichasTecnicas() {
  const [fichas, setFichas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [filteredFichas, setFilteredFichas] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState({
    id_producto: "",
    descripcion: "",
    insumos: "",
    detallesFichaTecnicat: [{ id_insumo: "", cantidad: "" }],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [fichasPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFichas();
    fetchProductos();
    fetchInsumos();
  }, []);

  const fetchFichas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/fichastecnicas");
      setFichas(response.data);
      setFilteredFichas(response.data);
    } catch (error) {
      console.error("Error fetching fichas:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  const fetchInsumos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/insumos");
      setInsumos(response.data);
      console.log("Insumos:", response.data); // Verifica que los datos están bien cargados
    } catch (error) {
      console.error("Error fetching insumos:", error);
    }
  };
  

  useEffect(() => {
    filterFichas();
  }, [search, fichas]);

  const filterFichas = () => {
    const filtered = fichas.filter((ficha) =>
      ficha.descripcion.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFichas(filtered);
  };

  useEffect(() => {
    if (fichaSeleccionada) {
      setSelectedFicha({
        id_producto: fichaSeleccionada.id_producto,
        descripcion: fichaSeleccionada.descripcion,
        insumos: fichaSeleccionada.insumos,
        detallesFichaTecnicat: fichaSeleccionada.detallesFichaTecnicat.map(detalle => ({
          id_insumo: detalle.id_insumo,
          cantidad: detalle.cantidad
        })),
      });
    }
  }, [fichaSeleccionada]);

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (ficha) => {
    setSelectedFicha(ficha);
    setEditMode(true);
    setErrors({});
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedFicha({
      id_producto: "",
      descripcion: "",
      insumos: "",
      detallesFichaTecnicat: [{ id_insumo: "", cantidad: "" }],
    });
    setEditMode(false);
    setErrors({});
    handleOpen();
  };

  const handleDelete = async (ficha) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la ficha técnica ${ficha.descripcion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/fichastecnicas/${ficha.id_ficha}`);
        fetchFichas();
        Toast.fire({
          icon: 'success',
          title: '¡Eliminado! La ficha técnica ha sido eliminada.'
        });
      } catch (error) {
        console.error("Hubo un problema al eliminar el usuario:", error);
        Toast.fire({
          icon: 'error',
          title: 'Error al eliminar usuario. Por favor, inténtalo de nuevo.'
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedFicha.id_producto) newErrors.id_producto = "El producto es requerido";
    if (!selectedFicha.descripcion) newErrors.descripcion = "La descripción es requerida";
    if (!selectedFicha.insumos) newErrors.insumos = "Los insumos son requeridos";
    
    selectedFicha.detallesFichaTecnicat.forEach((detalle, index) => {
      if (!detalle.id_insumo) newErrors[`id_insumo_${index}`] = "El insumo es requerido";
      if (!detalle.cantidad) newErrors[`cantidad_${index}`] = "La cantidad es requerida";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validateForm(selectedFicha);
    if (!isValid) {
      Toast.fire({
        icon: 'error',
        title: 'Por favor, completa todos los campos correctamente.'
      });
      return;
    }

  const fichaToSave = {
    ...selectedFicha,
    detallesFichaTecnica: selectedFicha.detallesFichaTecnicat,
  };

  try {
    if (editMode) {
      await axios.put(`http://localhost:3000/api/fichastecnicas/${selectedFicha.id_ficha}`, fichaToSave);
      Swal.fire('¡Actualización exitosa!', 'La ficha técnica ha sido actualizada correctamente.', 'success');
      fetchFichas();
      handleOpen();
    } else {
      await axios.post("http://localhost:3000/api/fichastecnicas", fichaToSave);
      Swal.fire('¡Creación exitosa!', 'La ficha técnica ha sido creada correctamente.', 'success');
      fetchFichas();
      handleOpen();
    }
  } catch (error) {
    console.error("Error saving ficha:", error);
    // Mostrar errores de validación del servidor si existen
    if (error.response && error.response.data && error.response.data.errors) {
      setErrors(error.response.data.errors);
    } else {
      // Si no hay errores específicos del servidor, mostrar un mensaje general
      setErrors({ general: "Hubo un problema al guardar la ficha técnica." });
    }
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedFicha({ ...selectedFicha, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles[index][name] = value;
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
    setErrors({ ...errors, [`${name}_${index}`]: "" });
  };

const handleAddDetalle = () => {
  // Verifica si ya hay insumos duplicados
  const insumosIds = selectedFicha.detallesFichaTecnicat.map(detalle => detalle.id_insumo);
  const hasDuplicate = insumosIds.some((id, index) => insumosIds.indexOf(id) !== index);

  if (hasDuplicate) {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: 'No se pueden agregar insumos duplicados.',
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  // Agrega un nuevo detalle si no hay duplicados
  // Asegúrate de que el id_insumo y cantidad no estén vacíos
  if (!selectedFicha.detallesFichaTecnicat.some(detalle => detalle.id_insumo === "" || detalle.cantidad === "")) {
    setSelectedFicha({
      ...selectedFicha,
      detallesFichaTecnicat: [...selectedFicha.detallesFichaTecnicat, { id_insumo: "", cantidad: "" }]
    });
  } else {
    Swal.fire({
      position: 'top-end',
      icon: 'warning',
      title: 'Completa todos los campos antes de agregar.',
      showConfirmButton: false,
      timer: 1500
    });
  }
};

  

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles.splice(index, 1);
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (ficha) => {
    setSelectedFicha(ficha);
    handleDetailsOpen();
  };

  const handleFichaChange = (e) => {
    const fichaId = e.target.value;
    const ficha = fichas.find(f => f.id_ficha === parseInt(fichaId));
    setFichaSeleccionada(ficha);
  };

  const handleProductoChange = (e) => {
    const productoId = e.target.value;
    setSelectedFicha({ ...selectedFicha, id_producto: productoId });
    setErrors({ ...errors, id_producto: "" });
  };

  const handleInsumoChange = (index, e) => {
    const insumoId = e.target.value;
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles[index].id_insumo = insumoId;
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
    setErrors({ ...errors, [`id_insumo_${index}`]: "" });
  };

  // Obtener fichas actuales
  const indexOfLastFicha = currentPage * fichasPerPage;
  const indexOfFirstFicha = indexOfLastFicha - fichasPerPage;
  const currentFichas = filteredFichas.slice(indexOfFirstFicha, indexOfLastFicha);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredFichas.length / fichasPerPage); i++) {
    pageNumbers.push(i);
  }

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Ficha Técnica
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por descripción..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-1">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Fichas Técnicas
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-20 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insumos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentFichas.map((ficha) => (
                    <tr key={ficha.id_ficha}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-sm text-gray-900">{ficha.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-sm text-gray-900">{ficha.insumos}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"></td>
                      <td className="flex space-x-1">
                        <IconButton className="btnedit" size="sm" onClick={() => handleEdit(ficha)}>
                          <PencilIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton className="cancelar" size="sm" onClick={() => handleDelete(ficha)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(ficha)}>
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
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
      
      <Dialog open={open} handler={handleOpen} className="custom-modal max-w-4xl">
        <DialogHeader className="text-black p-2 text-lg">
          {editMode ? "Editar Ficha Técnica" : "Crear Ficha Técnica"} </DialogHeader>
        <DialogBody divider className="flex max-h-[60vh] p-4 gap-6">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="w-[300px]">
              <label className="block text-xs font-medium text-gray-700">Cargar Ficha Técnica Existente 'Opcional':</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                onChange={handleFichaChange}
                value={fichaSeleccionada ? fichaSeleccionada.id_ficha : ''}
              >
                <option value="">Seleccione una ficha técnica</option>
                {fichas.map(ficha => (
                  <option key={ficha.id_ficha} value={ficha.id_ficha}>
                    {ficha.descripcion}
                    </option>
            ))}
          </select>
        </div>
        <div className="w-[300px]">
          <label className="block text-xs font-medium text-gray-700">Producto:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            name="id_producto"
            required
            value={selectedFicha.id_producto}
            onChange={handleProductoChange}
          >
            <option value="">Seleccione un producto</option>
            {productos.map(producto => (
              <option key={producto.id_producto} value={producto.id_producto}>
                {producto.nombre}
              </option>
            ))}
          </select>
          {errors.id_producto && <p className="text-red-500 text-xs mt-1">{errors.id_producto}</p>}
        </div>
        <div className="w-[300px]">
          <Input
            label="Descripción de la ficha técnica"
            name="descripcion"
            required
            value={selectedFicha.descripcion}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg text-xs"
          />
          {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
        </div>
        <div className="w-[300px]">
          <Input
            label="Descripción detallada de los insumos"
            name="insumos"
            required
            value={selectedFicha.insumos}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg text-xs"
          />
          {errors.insumos && <p className="text-red-500 text-xs mt-1">{errors.insumos}</p>}
        </div>
        <Typography variant="h6" color="blue-gray" className="mt--1 text-sm">
          Detalles de Insumos
        </Typography>
        <div className="bg-gray-100 p-4 rounded-xs shadow-md flex-1 mt-2 mb-4">
          {selectedFicha.detallesFichaTecnicat.map((detalle, index) => (
            <div key={index} className="flex flex-col gap-4 mb-2">
              <div className="w-[300px]">
              
                <label className="block font-medium text-gray-700">Insumo:</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-500"
                  name="id_insumo"
                  value={detalle.id_insumo}
                  required
                  onChange={(e) => handleInsumoChange(index, e)}
                >
                  <option value="">Seleccione un insumo</option>
                  {insumos.map(insumo => (
                    <option key={insumo.id_insumo} value={insumo.id_insumo}>
                      {insumo.nombre}
                    </option>
                  ))}
                </select>
                {errors[`id_insumo_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`id_insumo_${index}`]}</p>}
              </div>
              <div className="w-[300px] text-sm ">
                <Input
                  label="Cantidad"
                  name="cantidad"
                  required
                  type="number"
                  value={detalle.cantidad}
                  onChange={(e) => handleDetalleChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-lg "
                />
                {errors[`cantidad_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`cantidad_${index}`]}</p>}
              </div>
              <div className="w-[300px]">
                <IconButton
                  color="red"
                  onClick={() => handleRemoveDetalle(index)}
                  className="btncancelarm"
                  size="sm"
                >
                  <TrashIcon className="h-5 w-5" />
                </IconButton>
              </div>
            </div>
          ))}
          <Button className="btnmas" size="sm" onClick={handleAddDetalle}>
            <PlusIcon className="h-5 w-6 mr-0" />
          </Button>
        </div>
      </div>
      {/* Sección derecha: Lista de insumos seleccionados */}
      <div className="w-[300px] bg-gray-100 p-4 rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          Insumos Seleccionados
        </Typography>
        <ul className="list-disc pl-4">
          {selectedFicha.detallesFichaTecnicat.map((detalle, index) => (
            <li key={index} className="mb-2">
              <span className="font-semibold text-gray-800">
                {insumos.find(insumo => insumo.id_insumo === detalle.id_insumo)?.nombre || 'Desconocido'}:
              </span> 
              Cantidad {detalle.cantidad}
            </li>
          ))}
        </ul>
      </div>
    </DialogBody>
    <DialogFooter className="bg-white p-4 flex justify-end gap-2">
      <Button variant="text" className="btncancelarm" size="sm" onClick={handleOpen}>
        Cancelar
      </Button>
      <Button variant="gradient" className="btnagregarm" size="sm" onClick={handleSave}>
        {editMode ? "Guardar Cambios" : "Crear Ficha Técnica"}
      </Button>
    </DialogFooter>
  </Dialog>

  <Dialog open={detailsOpen} handler={handleDetailsOpen} className="overflow-auto max-h-[90vh]">
    <DialogHeader className="text-black p-4">Detalles de la Ficha Técnica</DialogHeader>
    <DialogBody divider className="overflow-auto max-h-[60vh] p-4">
      <div className="mb-4">
        <Typography variant="h5" color="blue-gray">
          Información de la Ficha Técnica
        </Typography>
        <table className="min-w-full mt-2">
          <tbody>
            <tr>
              <td className="font-semibold">Producto:</td>
              <td>{productos.find(producto => producto.id_producto === selectedFicha.id_producto)?.nombre || 'Desconocido'}</td>
            </tr>
            <tr>
              <td className="font-semibold">Descripción:</td>
              <td>{selectedFicha.descripcion}</td>
            </tr>
            <tr>
              <td className="font-semibold">Insumos:</td>
              <td>{selectedFicha.insumos}</td>
            </tr>
            <tr>
              <td className="font-semibold">Creado:</td>
              <td>{new Date(selectedFicha.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="font-semibold">Actualizado:</td>
              <td>{new Date(selectedFicha.updatedAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Typography variant="h5" color="blue-gray">
          Detalles de Insumos
        </Typography>
        <table className="min-w-full mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left font-semibold">Insumo</th>
              <th className="px-4 py-2 text-left font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {selectedFicha.detallesFichaTecnicat && selectedFicha.detallesFichaTecnicat.map((detalle) => (
              <tr key={detalle.id_detalle_ficha} className="border-b border-gray-400">
                <td className="px-4 py-2">{insumos.find(insumo => insumo.id_insumo === detalle.id_insumo)?.nombre || 'Desconocido'}</td>
                <td className="px-4 py-2">{detalle.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DialogBody>
    <DialogFooter className="bg-white p-4 flex justify-end">
      <Button variant="gradient" color="blue-gray" className="btncancelarm" onClick={handleDetailsOpen}>
        Cerrar
      </Button>
    </DialogFooter>
  </Dialog>
</>
);
}