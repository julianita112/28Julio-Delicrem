import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/authContext";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, updatePermissions } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();

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

    console.log("Trying to log in with:", { email, password });

    try {
      const response = await axios.post("http://localhost:3000/api/usuarios/login", {
        email,
        password,
      });

      console.log("Login response:", response);

      if (response.status === 200) {
        const { token } = response.data;

        localStorage.setItem("token", token);

        // Obtener la información del usuario autenticado
        const userResponse = await axios.get("http://localhost:3000/api/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("User response:", userResponse);

        const user = userResponse.data.find(user => user.email === email);

        if (!user) {
          throw new Error("User data is undefined");
        }

        console.log("User data:", user);

        // Obtener el rol del usuario y los permisos asociados
        try {
          const roleResponse = await axios.get(`http://localhost:3000/api/roles/${user.id_rol}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Role response:", roleResponse);

          const permisosRol = roleResponse.data.permisosRol;

          if (!permisosRol) {
            throw new Error("Permissions data is undefined");
          }

          console.log("User permissions:", permisosRol);

          login(user, permisosRol.map(permiso => permiso.nombre_permiso));
          updatePermissions(permisosRol.map(permiso => permiso.nombre_permiso));

          Toast.fire({
            icon: "success",
            title: "Acceso concedido"
          });

          navigate("/dashboard/home");
        } catch (roleError) {
          console.error("Error fetching role:", roleError);
          Toast.fire({
            icon: "error",
            title: "Error al obtener los permisos del rol."
          });
        }
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (err) {
      console.error("Error during login:", err);
      Toast.fire({
        icon: "error",
        title: "Credenciales inválidas. Por favor, inténtelo de nuevo."
      });
    }
  };

  return (
    <section className="m-7 flex gap-4 bg-gradient-to-br from-white to-white">
      <div className="w-full lg:w-1/2 mt-">
        <Card className="p-12 shadow-xl rounded-lg bg-white">
          <div className="text-center mb-6">
            <img src="/img/delicremlogo.png" alt="Logo" className="mx-auto mb-1" style={{ width: '250px' }} />
            <Typography variant="h3" className="text-black font-bold mb-4">Iniciar Sesión</Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Ingrese su correo electrónico y contraseña para iniciar sesión.</Typography>
          </div>
          <form className="mt-8" onSubmit={handleSignIn}>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 block font-medium">
                Email
              </Typography>
              <Input
                size="lg"
                placeholder="usuario@gmail.com"
                className="w-full border-t-blue-gray-200 focus:border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Typography variant="small" color="blue-gray" className="mb-2 block font-medium">
                Contraseña
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                className="w-full border-t-blue-gray-200 focus:border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="mt-6" fullWidth>
              Iniciar Sesión
            </Button>
          </form>
        </Card>
      </div>
      <div className="w-1/2 h-full hidden lg:block shadow-xl">
        <img
          src="/img/imalogin.jpeg"
          className="h-full w-full object-cover rounded-lg"
          alt="Background"
        />
      </div>
    </section>
  );
}

export default SignIn;
