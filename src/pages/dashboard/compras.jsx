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
  import { PlusIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
  import { useState, useEffect } from "react";
  import axios from "../../utils/axiosConfig";
  import Swal from 'sweetalert2';
  
  // Configuración de Toast
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
  
  export function Compras() {
    const [compras, setCompras] = useState([]);
    const [filteredCompras, setFilteredCompras] = useState([]);
    const [open, setOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [selectedCompra, setSelectedCompra] = useState({
      id_proveedor: "",
      fecha_compra: "",
      estado: "Completado",
      detalleCompras: [],
      proveedorCompra: { nombre: "", contacto: "" },
      detalleComprasCompra: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [comprasPerPage] = useState(6);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      fetchCompras();
      fetchProveedores();
      fetchInsumos();
    }, []);
  
    const fetchCompras = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/compras");
        setCompras(response.data);
        setFilteredCompras(response.data);
      } catch (error) {
        console.error("Error fetching compras:", error);
      }
    };
  
    const fetchProveedores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/proveedores");
        setProveedores(response.data);
      } catch (error) {
        console.error("Error fetching proveedores:", error);
      }
    };
  
    const fetchInsumos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/insumos");
        setInsumos(response.data);
      } catch (error) {
        console.error("Error fetching insumos:", error);
      }
    };
  
    useEffect(() => {
      filterCompras();
    }, [search, compras]);
  
    const filterCompras = () => {
      const filtered = compras.filter((compra) =>
        compra.proveedorCompra?.nombre?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCompras(filtered);
    };
  
    const handleOpen = () => setOpen(!open);
    const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);
  
    const handleCreate = () => {
      setSelectedCompra({
        id_proveedor: "",
        fecha_compra: "",
        estado: "Completado",
        detalleCompras: [],
        proveedorCompra: { nombre: "", contacto: "" },
        detalleComprasCompra: []
      });
      setErrors({});
      handleOpen();
    };
  
    const validateForm = () => {
      const newErrors = {};
      
      if (!selectedCompra.id_proveedor) {
        newErrors.id_proveedor = "El proveedor es obligatorio";
      }
      if (!selectedCompra.fecha_compra) {
        newErrors.fecha_compra = "La fecha de compra es obligatoria";
      }
      if (!selectedCompra.estado) {
        newErrors.estado = "El estado es obligatorio";
      }
      if (selectedCompra.detalleCompras.length === 0) {
        newErrors.detalleCompras = "Debe agregar al menos un detalle de compra";
      }
      selectedCompra.detalleCompras.forEach((detalle, index) => {
        if (!detalle.id_insumo) {
          newErrors[`insumo_${index}`] = "El insumo es obligatorio";
        }
        if (!detalle.cantidad || detalle.cantidad <= 0) {
          newErrors[`cantidad_${index}`] = "La cantidad debe ser mayor a 0";
        }
        if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
          newErrors[`precio_${index}`] = "El precio unitario debe ser mayor a 0";
        }
      });
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSave = async () => {
      if (!validateForm()) {
        Toast.fire({
          icon: 'error',
          title: 'Por favor, corrija los errores en el formulario.'
        });
        return;
      }
  
      // Validación de insumos duplicados
      const insumosSeleccionados = selectedCompra.detalleCompras.map(detalle => detalle.id_insumo);
      const insumosUnicos = new Set(insumosSeleccionados);
      if (insumosSeleccionados.length !== insumosUnicos.size) {
        Toast.fire({
          icon: 'error',
          title: 'No se pueden seleccionar insumos duplicados.'
        });
        return;
      }
  
      const compraToSave = {
        id_proveedor: parseInt(selectedCompra.id_proveedor),
        fecha_compra: selectedCompra.fecha_compra,
        estado: selectedCompra.estado,
        detalleCompras: selectedCompra.detalleCompras.map(detalle => ({
          id_insumo: parseInt(detalle.id_insumo),
          cantidad: parseInt(detalle.cantidad),
          precio_unitario: parseFloat(detalle.precio_unitario)
        }))
      };
  
      try {
        await axios.post("http://localhost:3000/api/compras", compraToSave);
        Toast.fire({
          icon: 'success',
          title: 'La compra ha sido creada correctamente.'
        });
        fetchCompras();
        handleOpen();
      } catch (error) {
        console.error("Error saving compra:", error);
        Toast.fire({
          icon: 'error',
          title: 'Hubo un problema al guardar la compra.'
        });
      }
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setSelectedCompra({ ...selectedCompra, [name]: value });
      setErrors({ ...errors, [name]: '' });
    };
  
    const handleDetalleChange = (index, e) => {
      const { name, value } = e.target;
      const detalles = [...selectedCompra.detalleCompras];
  
      if (name === "cantidad") {
        detalles[index][name] = value.replace(/\D/, ""); // Solo permite dígitos
      } else if (name === "precio_unitario") {
        detalles[index][name] = value.replace(/[^\d.]/, ""); // Permite dígitos y un punto decimal
      } else {
        detalles[index][name] = value;
      }
  
      setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
      setErrors({ ...errors, [`${name}_${index}`]: '' });
    };
  
    const handleAddDetalle = () => {
      setSelectedCompra({
        ...selectedCompra,
        detalleCompras: [...selectedCompra.detalleCompras, { id_insumo: "", cantidad: "", precio_unitario: "" }]
      });
    };
  
    const handleRemoveDetalle = (index) => {
      const detalles = [...selectedCompra.detalleCompras];
      detalles.splice(index, 1);
      setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
    };
  
    const handleSearchChange = (e) => {
      setSearch(e.target.value);
    };
  
    const handleViewDetails = (compra) => {
      setSelectedCompra({
        ...compra,
        detalleCompras: compra.detalleComprasCompra || [],
        proveedorCompra: compra.proveedorCompra || { nombre: "", contacto: "" },
        fecha_compra: compra.fecha_compra.split('T')[0]
      });
      handleDetailsOpen();
    };
  
    const getInsumoName = (id_insumo) => {
      const insumo = insumos.find((ins) => ins.id_insumo === id_insumo);
      return insumo ? insumo.nombre : "Desconocido";
    };
  
    const indexOfLastCompra = currentPage * comprasPerPage;
    const indexOfFirstCompra = indexOfLastCompra - comprasPerPage;
    const currentCompras = filteredCompras.slice(indexOfFirstCompra, indexOfLastCompra);
  
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredCompras.length / comprasPerPage); i++) {
      pageNumbers.push(i);
    }
  
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
    return (
      <>
        <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
          <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
        </div>
        <Card className="mx-2 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
          <CardBody className="p-4">
            <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
              Crear Compra
            </Button>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Buscar por proveedor..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="mb-1">
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Lista de Compras
              </Typography>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {currentCompras.map((compra) => (
                  <Card key={compra.id_compra} className="p-4">
                    <Typography variant="h6" color="blue-gray">
                      Proveedor: {compra.proveedorCompra?.nombre || "Desconocido"}
                    </Typography>
                    <Typography color="blue-gray">
                      Fecha de Compra: {compra.fecha_compra.split('T')[0]}
                    </Typography>
                    <Typography color="blue-gray">
                      Estado: {compra.estado}
                    </Typography>
                    <div className="mt-4 flex gap-2">
                      <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(compra)}>
                        <EyeIcon className="h-5 w-5" />
                      </IconButton>
                    </div>
                  </Card>
                ))}
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
  
        <Dialog open={open} handler={handleOpen} className="custom-modal">
          <DialogHeader className="text-black p-1">Crear Compra</DialogHeader>
          <DialogBody divider className="overflow-auto max-h-[60vh] p-4 flex gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="w-[300px]">
                <Select
                  label="Proveedor"
                  name="id_proveedor"
                  value={selectedCompra.id_proveedor}
                  onChange={(e) => {
                    setSelectedCompra({ ...selectedCompra, id_proveedor: e });
                    setErrors({ ...errors, id_proveedor: '' });
                  }}
                  className={`w-full ${errors.id_proveedor ? 'border-red-500' : ''}`}
                  required
                >
                  {proveedores.map((proveedor) => (
                    <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                      {proveedor.nombre}
                    </Option>
                  ))}
                </Select>
                {errors.id_proveedor && <p className="text-red-500 text-xs mt-1">{errors.id_proveedor}</p>}
              </div>
              <div className="w-[300px]">
                <Input
                  label="Fecha de Compra"
                  name="fecha_compra"
                  type="date"
                  value={selectedCompra.fecha_compra}
                  onChange={handleChange}
                  className={`w-full ${errors.fecha_compra ? 'border-red-500' : ''}`}
                  required
                />
                {errors.fecha_compra && <p className="text-red-500 text-xs mt-1">{errors.fecha_compra}</p>}
              </div>
              <div className="w-[300px]">
              <Select
  label="Estado"
  name="estado"
  required
  value={selectedCompra.estado}
  onChange={(e) => {
    setSelectedCompra({ ...selectedCompra, estado: e.target.value });
    setErrors({ ...errors, estado: "" });
  }}
  className={`w-full text-sm ${errors.estado ? 'border-red-500' : ''}`}
>
  <Option value="pendiente">Pendiente</Option>
  <Option value="en preparación">En preparación</Option>
  <Option value="completado">Completado</Option>
</Select>
{errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}

  <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
</div>


              <Typography variant="h6" color="blue-gray" className="mt-1">
                Insumos a comprar
              </Typography>
            <div className="bg-gray-100 p-4 rounded-lg shadow-lg flex-2 overflow-y-auto max-h-[500px]">

                {selectedCompra.detalleCompras.map((detalle, index) => (
                    <div key={index} className="mb-4 flex items-center">
                        <div className="flex-1 flex flex-col gap-4 mb-2">
                            <div className="w-[300px]">
                                <Select
                                    
                                    label="Insumo"
                                    name="id_insumo"
                                    value={detalle.id_insumo}
                                    onChange={(e) => {
                                        handleDetalleChange(index, { target: { name: 'id_insumo', value: e } });
                                        setErrors({ ...errors, [`insumo_${index}`]: "" });
                                      }}
                                    className="w-full text-sm"
                                >
                                    {insumos.map((insumo) => (
                                        <Option key={insumo.id_insumo} value={insumo.id_insumo}>
                                            {insumo.nombre}
                                        </Option>
                                    ))}
                                </Select>
                                {errors[`insumo_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`insumo_${index}`]}</p>
                )}
                            </div>
                            <div className="w-full max-w-xs">
                <Input
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  required
                  value={detalle.cantidad}
                  onChange={(e) => {
                    handleDetalleChange(index, e);
                    setErrors({ ...errors, [`cantidad_${index}`]: "" });
                  }}
                  className="w-full text-sm"
                />
                {errors[`cantidad_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`cantidad_${index}`]}</p>
                )}
              </div>
              <div className="w-full max-w-xs">
                <Input
                  label="Precio Unitario"
                  name="precio_unitario"
                  type="number"
                  step="0.01"
                  required
                  value={detalle.precio_unitario}
                  onChange={(e) => {
                    handleDetalleChange(index, e);
                    setErrors({ ...errors, [`precio_${index}`]: "" });
                  }}
                  className="w-full text-sm"
                />
                {errors[`precio_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`precio_${index}`]}</p>
                )}
              </div>
                        </div>
                        <div className="flex items-center ml-2">
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
                <div className="mt-2">
                    <Button className="btnmas" size="sm" onClick={handleAddDetalle}>
                        <PlusIcon className="h-5 w-6 mr-0" />
                    </Button>
                </div>
            </div>
        </div>
        <div className="w-[300px] bg-gray-100 p-4 rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Insumos Seleccionados
            </Typography>
            <ul className="list-disc pl-4">
                {selectedCompra.detalleCompras.map((detalle, index) => (
                    <li key={index} className="mb-2">
                        <span className="font-semibold text-gray-800">
                            {insumos.find(insumo => insumo.id_insumo === detalle.id_insumo)?.nombre || 'Desconocido'}:
                        </span> 
                        Cantidad {detalle.cantidad}, Precio Unitario ${parseFloat(detalle.precio_unitario).toFixed(2)}
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
            Crear Compra
        </Button>
    </DialogFooter>
</Dialog>




<Dialog open={detailsOpen} handler={handleDetailsOpen} className="overflow-auto max-h-[90vh]">
    <DialogHeader className="text-black p-4">Detalles de la Compra</DialogHeader>
    <DialogBody divider className="overflow-auto max-h-[60vh] p-4">
        {selectedCompra.proveedorCompra && (
            <div className="mb-4">
                <Typography variant="h5" color="blue-gray">
                    Información del Proveedor
                </Typography>
                <table className="min-w-full mt-2">
                    <tbody>
                        <tr>
                            <td className="font-semibold">ID Proveedor:</td>
                            <td>{selectedCompra.proveedorCompra.id_proveedor}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Nombre:</td>
                            <td>{selectedCompra.proveedorCompra.nombre}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Contacto:</td>
                            <td>{selectedCompra.proveedorCompra.contacto}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Creado:</td>
                            <td>{new Date(selectedCompra.proveedorCompra.createdAt).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Actualizado:</td>
                            <td>{new Date(selectedCompra.proveedorCompra.updatedAt).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )}
        <div className="mt-4">
            <Typography variant="h5" color="blue-gray">
                Detalles de la Compra
            </Typography>
            <table className="min-w-full mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2 text-left font-semibold">ID de Compra</th>
                        <th className="px-4 py-2 text-left font-semibold">Nombre Insumo</th>
                        <th className="px-4 py-2 text-left font-semibold">Cantidad</th>
                        <th className="px-4 py-2 text-left font-semibold">Precio Unitario</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedCompra.detalleCompras.map((detalle) => (
                        <tr key={detalle.id_detalle_compra} className="border-b border-gray-400">
                            <td className="px-4 py-2">{detalle.id_detalle_compra}</td>
                            <td className="px-4 py-2">{getInsumoName(detalle.id_insumo)}</td>
                            <td className="px-4 py-2">{detalle.cantidad}</td>
                            <td className="px-4 py-2">{detalle.precio_unitario}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </DialogBody>
    <DialogFooter className="bg-white p-4 flex justify-end">
        <Button variant="gradient" className="btncancelarm" onClick={handleDetailsOpen}>
            Cerrar
        </Button>
    </DialogFooter>
</Dialog>


	</>
  );
}

