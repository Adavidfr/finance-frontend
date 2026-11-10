import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../context/AuthContext";

// El backend responde { campo: ["mensaje", ...] }. Se aplana en una lista de mensajes legibles.
function extractErrors(error: unknown): string[] {
  if (isAxiosError(error) && error.response) {
    if (error.response.status === 429) {
      return ["Demasiados intentos. Espera un rato e inténtalo de nuevo."];
    }
    const data = error.response.data;
    if (data && typeof data === "object") {
      const messages = Object.values(data as Record<string, unknown>)
        .flat()
        .filter((m): m is string => typeof m === "string");
      if (messages.length > 0) return messages;
    }
  }
  return ["No se pudo crear la cuenta. Inténtalo de nuevo."];
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (password !== confirm) {
      setErrors(["Las contraseñas no coinciden."]);
      return;
    }

    setLoading(true);
    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Registra tus gastos y deja que la app los categorice por ti.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Mínimo 8 caracteres. Evita contraseñas comunes o parecidas a tu
              usuario o correo.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Repite la contraseña
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              required
            />
          </div>

          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((message) => (
                <p
                  key={message}
                  className="text-sm text-red-600"
                >
                  {message}
                </p>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-slate-800 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
