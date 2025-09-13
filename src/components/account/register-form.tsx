"use client";

import { useState, FormEvent } from "react";
import AddressAutocomplete from "@/components/account/address-autocomplete";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function RegisterForm() {
  const { signUp, error: authError, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [useAsBilling, setUseAsBilling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [subscribeToEmails, setSubscribeToEmails] = useState(true);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [address1Touched, setAddress1Touched] = useState(false);
  const [provinceTouched, setProvinceTouched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const [zipTouched, setZipTouched] = useState(false);
  const [countryTouched, setCountryTouched] = useState(false);
  const isFirstNameValid = firstName.trim().length >= 3;
  const firstNameStatus = !firstNameTouched
    ? null
    : firstName.length === 0
    ? "empty"
    : isFirstNameValid
    ? "valid"
    : "invalid";

  const isLastNameValid = lastName.trim().length >= 3;
  const lastNameStatus = !lastNameTouched
    ? null
    : lastName.length === 0
    ? "empty"
    : isLastNameValid
    ? "valid"
    : "invalid";

  const isPhoneValid = /^\d{10,}$/.test(phone);
  const phoneStatus = !phoneTouched
    ? null
    : phone.length === 0
    ? "empty"
    : isPhoneValid
    ? "valid"
    : "invalid";

  const isEmailValid = /^[^\s@]+@[^\s@]+\.com$/.test(email);
  const emailStatus = !emailTouched
    ? null
    : email.length === 0
    ? "empty"
    : isEmailValid
    ? "valid"
    : "invalid";

  const isPasswordValid = password.length >= 8;
  const passwordStatus = !passwordTouched
    ? null
    : password.length === 0
    ? "empty"
    : isPasswordValid
    ? "valid"
    : "invalid";

  const isConfirmPasswordValid =
    confirmPassword === password && confirmPassword.length >= 8;
  const confirmPasswordStatus = !confirmPasswordTouched
    ? null
    : confirmPassword.length === 0
    ? "empty"
    : isConfirmPasswordValid
    ? "valid"
    : "invalid";

  const isAddress1Valid = address1.trim().length >= 3;
  const address1Status = !address1Touched
    ? null
    : address1.length === 0
    ? "empty"
    : isAddress1Valid
    ? "valid"
    : "invalid";

  const isProvinceValid = province.trim().length >= 3;
  const provinceStatus = !provinceTouched
    ? null
    : province.length === 0
    ? "empty"
    : isProvinceValid
    ? "valid"
    : "invalid";

  const isCityValid = city.trim().length >= 3;
  const cityStatus = !cityTouched
    ? null
    : city.length === 0
    ? "empty"
    : isCityValid
    ? "valid"
    : "invalid";

  const isZipValid = zip.trim().length >= 3;
  const zipStatus = !zipTouched
    ? null
    : zip.length === 0
    ? "empty"
    : isZipValid
    ? "valid"
    : "invalid";

  const isCountryValid = country.trim().length >= 3;
  const countryStatus = !countryTouched
    ? null
    : country.length === 0
    ? "empty"
    : isCountryValid
    ? "valid"
    : "invalid";

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isPhoneValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid;
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    const success = await signUp({
      firstName,
      lastName,
      phone,
      email,
      password,
      subscribeToEmails,
      address1,
      address2,
      province,
      city,
      zip,
      country,
      useAsBilling,
    });
    if (!success) {
      const message = authError || "No se pudo crear la cuenta.";
      setError(message);
      setEmailTaken(message === "El email ya está registrado.");
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    }
  };

  const handleInputChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    if (error) setError(null);
  };

  return (
    <form className="space-y-10 pb-12" onSubmit={handleRegister}>
      <div className="space-y-1">
        <div className="space-y-2 relative">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => handleInputChange(setFirstName, e.target.value)}
            onBlur={() => setFirstNameTouched(true)}
            placeholder="Nombre"
            className={cn(
              "pr-10",
              firstNameStatus === "valid"
                ? "text-text-success-default"
                : firstNameStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {firstNameStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {firstNameStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !firstNameTouched && "invisible",
              firstNameTouched &&
                (firstNameStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {firstNameTouched &&
              (firstNameStatus === "empty"
                ? "Requerido"
                : firstNameStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => handleInputChange(setLastName, e.target.value)}
            onBlur={() => setLastNameTouched(true)}
            placeholder="Apellido"
            className={cn(
              "pr-10",
              lastNameStatus === "valid"
                ? "text-text-success-default"
                : lastNameStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {lastNameStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {lastNameStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !lastNameTouched && "invisible",
              lastNameTouched &&
                (lastNameStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {lastNameTouched &&
              (lastNameStatus === "empty"
                ? "Requerido"
                : lastNameStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => handleInputChange(setPhone, e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            placeholder="Celular"
            className={cn(
              "pr-10",
              phoneStatus === "valid"
                ? "text-text-success-default"
                : phoneStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {phoneStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {phoneStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !phoneTouched && "invisible",
              phoneTouched &&
                (phoneStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {phoneTouched &&
              (phoneStatus === "empty"
                ? "Requerido"
                : phoneStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              handleInputChange(setEmail, e.target.value);
              setEmailTaken(false);
            }}
            onBlur={() => setEmailTouched(true)}
            placeholder="Email"
            className={cn(
              "pr-10",
              emailStatus === "valid" && !emailTaken
                ? "text-text-success-default"
                : emailStatus === "invalid" || emailTaken
                ? "text-text-danger-default"
                : ""
            )}
          />{" "}
          {emailStatus === "valid" && !emailTaken && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {emailStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !emailTouched && "invisible",
              emailTouched &&
                (emailStatus === "valid" && !emailTaken
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {emailTouched &&
              (emailStatus === "empty"
                ? "Requerido"
                : emailStatus === "valid" && !emailTaken
                ? "Bien hecho!"
                : emailTaken
                ? "Este email ya está registrado"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => handleInputChange(setPassword, e.target.value)}
            onFocus={() => setPasswordTouched(true)}
            className={cn(
              "pr-10",
              passwordStatus === "valid"
                ? "text-text-success-default"
                : passwordStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
            placeholder="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className={cn(
              "absolute inset-y-0 right-0 -top-9 flex items-center px-3",
              passwordStatus === "valid"
                ? "text-icon-success-default"
                : passwordStatus === "invalid"
                ? "text-icon-danger-default"
                : "text-icon-primary-default"
            )}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !passwordTouched && "invisible",
              passwordTouched &&
                (passwordStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {passwordTouched &&
              (passwordStatus === "valid"
                ? "Bien hecho!"
                : "Mínimo 8 caracteres")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) =>
              handleInputChange(setConfirmPassword, e.target.value)
            }
            onFocus={() => setConfirmPasswordTouched(true)}
            className={cn(
              "pr-10",
              confirmPasswordStatus === "valid"
                ? "text-text-success-default"
                : confirmPasswordStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
            placeholder="Repetir contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className={cn(
              "absolute inset-y-0 right-0 -top-9 flex items-center px-3",
              confirmPasswordStatus === "valid"
                ? "text-icon-success-default"
                : confirmPasswordStatus === "invalid"
                ? "text-icon-danger-default"
                : "text-icon-primary-default"
            )}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !confirmPasswordTouched && "invisible",
              confirmPasswordTouched &&
                (confirmPasswordStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {confirmPasswordTouched &&
              (confirmPasswordStatus === "valid"
                ? "Bien hecho!"
                : confirmPasswordStatus === "empty"
                ? "Requerido"
                : "No coincide")}
          </p>
        </div>

        <div className="flex items-start gap-2 py-2">
          <Checkbox
            id="subscribeToEmails"
            name="subscribeToEmails"
            checked={subscribeToEmails}
            onCheckedChange={(checked: boolean) =>
              setSubscribeToEmails(checked)
            }
          />
          <label htmlFor="subscribeToEmails" className="body-02-regular">
            Quiero recibir novedades e información de Munay vía email
          </label>
        </div>
        <div className="space-y-2 relative">
          <AddressAutocomplete
            value={address1}
            onChange={(val) => handleInputChange(setAddress1, val)}
            onBlur={() => setAddress1Touched(true)}
            placeholder="Dirección"
            className={cn(
              "pr-10",
              address1Status === "valid"
                ? "text-text-success-default"
                : address1Status === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
            onSelect={(data) => {
              handleInputChange(setAddress1, data.formatted_address);
              setProvince(data.province);
              setCity(data.city);
              setZip(data.zip);
              setCountry(data.country);
              setPlaceId(data.place_id);
              setLat(data.lat);
              setLng(data.lng);
              setAddress1Touched(true);
            }}
          />
          {address1Status === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {address1Status === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !address1Touched && "invisible",
              address1Touched &&
                (address1Status === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {address1Touched &&
              (address1Status === "empty"
                ? "Requerido"
                : address1Status === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 pb-7">
          <Input
            id="address2"
            name="address2"
            type="text"
            value={address2}
            onChange={(e) => handleInputChange(setAddress2, e.target.value)}
            placeholder="Departamento o lote (opcional)"
          />
        </div>
        <div className="space-y-2 relative">
          {" "}
          <Input
            id="province"
            name="province"
            type="text"
            value={province}
            onChange={(e) => handleInputChange(setProvince, e.target.value)}
            onBlur={() => setProvinceTouched(true)}
            placeholder="Provincia"
            className={cn(
              "pr-10",
              provinceStatus === "valid"
                ? "text-text-success-default"
                : provinceStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {provinceStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {provinceStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !provinceTouched && "invisible",
              provinceTouched &&
                (provinceStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {provinceTouched &&
              (provinceStatus === "empty"
                ? "Requerido"
                : provinceStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          {" "}
          <Input
            id="city"
            name="city"
            type="text"
            value={city}
            onChange={(e) => handleInputChange(setCity, e.target.value)}
            onBlur={() => setCityTouched(true)}
            placeholder="Ciudad"
            className={cn(
              "pr-10",
              cityStatus === "valid"
                ? "text-text-success-default"
                : cityStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {cityStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {cityStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !cityTouched && "invisible",
              cityTouched &&
                (cityStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {cityTouched &&
              (cityStatus === "empty"
                ? "Requerido"
                : cityStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          {" "}
          <Input
            id="zip"
            name="zip"
            type="text"
            value={zip}
            onChange={(e) => handleInputChange(setZip, e.target.value)}
            onBlur={() => setZipTouched(true)}
            placeholder="Código Postal"
            className={cn(
              "pr-10",
              zipStatus === "valid"
                ? "text-text-success-default"
                : zipStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {zipStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {zipStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !zipTouched && "invisible",
              zipTouched &&
                (zipStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {zipTouched &&
              (zipStatus === "empty"
                ? "Requerido"
                : zipStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          {" "}
          <Input
            id="country"
            name="country"
            type="text"
            value={country}
            onChange={(e) => handleInputChange(setCountry, e.target.value)}
            onBlur={() => setCountryTouched(true)}
            placeholder="País"
            className={cn(
              "pr-10",
              countryStatus === "valid"
                ? "text-text-success-default"
                : countryStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {countryStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {countryStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !countryTouched && "invisible",
              countryTouched &&
                (countryStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {countryTouched &&
              (countryStatus === "empty"
                ? "Requerido"
                : countryStatus === "valid"
                ? "Bien hecho!"
                : "Incorrecto")}
          </p>
        </div>
        <div className="flex items-start gap-2 py-2">
          <Checkbox
            id="useAsBilling"
            name="useAsBilling"
            checked={useAsBilling}
            onCheckedChange={(checked: boolean) => setUseAsBilling(checked)}
          />
          <label htmlFor="useAsBilling" className="body-02-regular">
            Usar como dirección de facturación
          </label>
        </div>
        {error && (
          <p className="text-red-600 body-03-regular text-center">{error}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isLoading || !isFormValid || emailTaken}
        className="w-full py-3"
        variant="primary"
        size="lg"
      >
        {isLoading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
}
