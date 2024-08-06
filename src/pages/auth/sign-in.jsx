import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/context/authContext";


export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { login, updatePermissions } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();

    // Limpiar errores anteriores
    setEmailError("");
    setPasswordError("");

    // Validaciones
    let valid = true;
    if (!email) {
      setEmailError("El campo de correo electrónico es obligatorio.");
      valid = false;
    } else if (email.length < 4 || !email.includes("@")) {
      setEmailError("Ingrese un correo electrónico válido.");
      valid = false;
    }

    if (!password) {
      setPasswordError("El campo de contraseña es obligatorio.");
      valid = false;
    } else if (password.length < 4) {
      setPasswordError("La contraseña debe tener al menos 4 caracteres.");
      valid = false;
    }

    if (!valid) {
      return;
    }

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
            title: "Acceso concedido."
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
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl mx-auto">
        <div className="lg:w-1/2 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <img src="/img/delicremlogo.png" alt="Logo" className="mx-auto mb-4" style={{ width: '250px' }} />
            <Typography variant="h4" className="text-gray-800 font-semibold mb-2">Iniciar Sesión</Typography>
            <Typography variant="body1" className="text-gray-600">Ingrese su correo electrónico y contraseña para iniciar sesión.</Typography>
          </div>
          <Card className="shadow-none p-4">
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <Typography variant="small" color="blue-gray" className="block font-medium mb-1">
                  Email
                </Typography>
                <Input
                  size="md"
                  placeholder="usuario@gmail.com"
                  className="w-full border-gray-300 rounded-lg focus:border-pink-200 focus:ring-1"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                />
                <Typography className={`error-message ${emailError ? 'show' : ''}`}>{emailError}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="block font-medium mb-1">
                  Contraseña
                </Typography>
                <Input
                  type="password"
                  size="md"
                  placeholder="********"
                  className="w-full border-gray-300 rounded-lg focus:border-pink-200 focus:ring-1"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                />
                <Typography className={`error-message ${passwordError ? 'show' : ''}`}>{passwordError}</Typography>
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition duration-300">
                Iniciar Sesión
              </Button>
            </form>
          </Card>
        </div>
        <div className="lg:w-1/2 hidden lg:block bg-gradient-to-br from-blue-100 to-blue-300 rounded-lg overflow-hidden">
          <img
            src="/img/imalogin.jpeg"
            className="h-full w-full object-cover rounded-lg"
            alt="Background"
          />
        </div>
      </div>
    </section>
  );
}

export default SignIn;
