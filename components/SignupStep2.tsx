"use client"
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SignupStep2Props {
  registrationData: any;
  onSuccess: () => void;
}

export default function SignupStep2({ registrationData, onSuccess }: SignupStep2Props) {
  const [dni, setDni] = useState("");
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    if (e.target.files && e.target.files[0]) {
      if (side === "front") setDniFront(e.target.files[0]);
      else setDniBack(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    if (!dniFront || !dniBack) {
      setError("Debes subir ambas imágenes del DNI");
      setIsVerifying(false);
      return;
    }

    const formData = new FormData();
    formData.append("userId", registrationData.userId);
    formData.append("dni", dni);
    formData.append("dniFront", dniFront);
    formData.append("dniBack", dniBack);

    try {
      const response = await fetch("/api/auth/verify-dni", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al verificar DNI");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al verificar DNI");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <Link href="/" className="flex items-center text-emerald-600 mb-8 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Home
      </Link>
      <h1 className="text-2xl font-bold text-center mb-6">Verificación de DNI</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}
      <p className="text-sm text-gray-700 mb-4">
        Ingresa tu DNI argentino y sube las fotos del anverso y reverso para completar el registro.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
            DNI
          </label>
          <input
            type="text"
            id="dni"
            name="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="dniFront" className="block text-sm font-medium text-gray-700 mb-1">
            Foto del Anverso del DNI
          </label>
          <input
            type="file"
            id="dniFront"
            name="dniFront"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "front")}
            required
            className="block w-full"
          />
        </div>
        <div>
          <label htmlFor="dniBack" className="block text-sm font-medium text-gray-700 mb-1">
            Foto del Reverso del DNI
          </label>
          <input
            type="file"
            id="dniBack"
            name="dniBack"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "back")}
            required
            className="block w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isVerifying}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium disabled:opacity-70"
        >
          {isVerifying ? "Verificando..." : "Verificar DNI"}
        </button>
      </form>
    </div>
  );
}
