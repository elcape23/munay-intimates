export interface FetchJsonOptions extends RequestInit {
  /** Lista de claves de nivel superior que deben existir en la respuesta */
  expectedKeys?: string[];
  /** Nombre legible del endpoint para logs */
  endpointName?: string;
}

function getEndpointLabel(input: RequestInfo | URL, explicit?: string) {
  if (explicit) return explicit;
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.url;
  }
  return "<unknown>";
}

export async function fetchJson<T = unknown>(
  input: RequestInfo | URL,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { expectedKeys = [], endpointName, ...init } = options;
  const label = getEndpointLabel(input, endpointName);

  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (error) {
    const errorDetails: Record<string, unknown> = {
      endpoint: label,
      error:
        error instanceof Error ? error.stack || error.message : String(error),
    };
    console.error("[fetchJson] Network error", errorDetails);
    throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.");
  }

  const contentType = response.headers.get("content-type") || "";
  let data: unknown;

  if (contentType.includes("application/json")) {
    try {
      const raw = await response.text();
      data = raw.trim() === "" ? null : JSON.parse(raw);
    } catch (error) {
      const errorDetails: Record<string, unknown> = {
        endpoint: label,
        status: response.status,
        error:
          error instanceof Error ? error.stack || error.message : String(error),
      };
      console.error("[fetchJson] Invalid JSON response", errorDetails);
      throw new Error("La respuesta del servidor es inválida.");
    }
  } else {
    const preview = await response.text();
    const errorDetails: Record<string, unknown> = {
      endpoint: label,
      status: response.status,
      contentType,
      preview: preview.slice(0, 200),
    };
    console.error("[fetchJson] Unexpected content-type", errorDetails);
    throw new Error(
      "El servidor devolvió una respuesta inesperada. Intenta nuevamente más tarde."
    );
  }

  if (!response.ok) {
    const body = data as Record<string, unknown> | undefined;
    const bodyMessage =
      typeof body?.error === "string"
        ? body.error
        : typeof body?.message === "string"
        ? body.message
        : undefined;
    const message = bodyMessage ?? `Error ${response.status}`;

    const errorDetails: Record<string, unknown> = {
      endpoint: label,
      status: response.status,
    };
    if (body !== undefined) {
      errorDetails.body = body;
    }

    console.error("[fetchJson] Error response", errorDetails);

    throw new Error(message);
  }

  if (expectedKeys.length > 0) {
    const body = data as Record<string, unknown> | undefined;
    const missing = expectedKeys.filter((key) => {
      if (!body) return true;
      const value = body[key];
      return value === undefined || value === null || value === "";
    });
    if (missing.length > 0) {
      const errorDetails: Record<string, unknown> = {
        endpoint: label,
        missing,
      };
      if (body !== undefined) {
        errorDetails.body = body;
      }

      console.error("[fetchJson] Missing expected keys", errorDetails);
      const [first] = missing;
      throw new Error(
        missing.length === 1
          ? `La respuesta del servidor no incluye "${first}".`
          : "La respuesta del servidor está incompleta."
      );
    }
  }

  return data as T;
}
