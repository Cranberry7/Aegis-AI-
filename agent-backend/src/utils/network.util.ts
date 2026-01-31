import { Environments, RequestProtocols } from '@app/common/enums/common.enum';

const environment = process.env.ENVIRONMENT;
const port = process.env.BACKEND_PORT;
const prodServerUrl = process.env.PROD_SERVER_URL;

export function getProtocolByEnv() {
  return environment === Environments.DEV
    ? RequestProtocols.HTTP
    : RequestProtocols.HTTPS;
}

export function getDomainByEnv() {
  return environment === Environments.DEV
    ? `localhost:${port}`
    : `${prodServerUrl}`;
}
