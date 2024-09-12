import colors from "colors";

// Logs de solicitudes HTTP
export function logHttpRequest(
  reqMethod: string,
  reqUrl: string,
  statusCode: number,
  duration: number
) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  const statusColor = statusCode >= 400 ? colors.red : colors.green;

  console.log(
    `[${colors.blue(formattedDate)}] ` +
      `HTTP Request: ${colors.yellow(reqMethod)} ${colors.cyan(reqUrl)} - ` +
      `Status: ${statusColor(statusCode.toString())} - ` +
      `Time: ${colors.magenta(duration + "ms")}`
  );
}

// Logs de errores
export function logError(error: Error) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  // Asignamos un valor por defecto en caso de que message o stack sean undefined
  const errorMessage = error.message || "No error message available";
  const errorStack = error.stack || "No stack trace available";

  console.error(
    `[${colors.blue(formattedDate)}] ` +
      `Error: ${colors.red(errorMessage)}\nStack: ${colors.gray(errorStack)}`
  );
}

// Logs de depuración
export function logDebug(message: string) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  console.log(
    `[${colors.blue(formattedDate)}] ` + `Debug: ${colors.magenta(message)}`
  );
}

// Logs de información
export function logInfo(message: string) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  console.log(
    `[${colors.blue(formattedDate)}] ` + `Info: ${colors.green(message)}`
  );
}

// Logs de advertencia
export function logWarning(message: string) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  console.warn(
    `[${colors.blue(formattedDate)}] ` + `Warning: ${colors.yellow(message)}`
  );
}

// Logs de eventos del sistema
export function logSystem(message: string) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  console.log(
    `[${colors.blue(formattedDate)}] ` + `System: ${colors.cyan(message)}`
  );
}
