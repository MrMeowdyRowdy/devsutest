# Prueba técnica QA: automatización E2E y APIs

[![Cypress](https://github.com/MrMeowdyRowdy/devsutest/actions/workflows/cypress.yml/badge.svg)](https://github.com/MrMeowdyRowdy/devsutest/actions/workflows/cypress.yml)

Un solo proyecto **Cypress 13** con los dos ejercicios:

| Ejercicio | Opción | Sitio |
|---|---|---|
| E2E | 2: flujo de compra | https://www.saucedemo.com/ |
| APIs | 3: ciclo de vida de un usuario | https://petstore.swagger.io/ |

Las pruebas de API usan `cy.request`. Hallazgos y conclusiones en [`conclusiones.txt`](conclusiones.txt).

## Requisitos

- Node.js 18 o superior (probado con Node 22) y npm
- Git y conexión a internet (las pruebas usan los sitios públicos)
- Opcional: Postman o newman para la colección de `collections/`

## Instalación

```bash
git clone https://github.com/MrMeowdyRowdy/devsutest.git
cd devsutest
npm install   # descarga Cypress y activa el hook de pre-commit
```

## Ejecución

```bash
npm test            # todas las pruebas, modo consola
npm run test:e2e    # solo E2E (saucedemo)
npm run test:api    # solo API (Petstore usuarios)
npm run cy:open     # interfaz de Cypress: E2E Testing -> navegador -> spec
```

> **Terminal de VS Code en Linux/WSL:** VS Code define `ELECTRON_RUN_AS_NODE` y Cypress falla con `bad option: --no-sandbox`. Ejecutar con `env -u ELECTRON_RUN_AS_NODE npm test`.

Colección Postman: importar `collections/petstore-user.postman_collection.json` y ejecutarla en orden, o:

```bash
npx newman run collections/petstore-user.postman_collection.json
```

## Reportes y evidencias

`npm test` genera el reporte completo; `test:e2e` y `test:api` lo sobrescriben solo con su parte.

| Archivo | Contenido |
|---|---|
| `reports/html/index.html` | Reporte HTML (mochawesome) de todos los casos, con la captura de la confirmación |
| `reports/api-evidence/*.json` | Entrada y salida de cada llamada: método, URL, body enviado, status y body recibido |
| `cypress/screenshots/.../orden-confirmada.png` | Captura de "Thank you for your order!" |

## Casos automatizados

### E2E: [`purchase.cy.js`](cypress/e2e/saucedemo/purchase.cy.js)

Datos en [`checkout.json`](cypress/fixtures/checkout.json).

1. Autenticarse con `standard_user` / `secret_sauce`
2. Agregar dos productos al carrito (Sauce Labs Backpack y Sauce Labs Bolt T-Shirt); valida el botón "Remove" y el contador = 2
3. Visualizar el carrito; valida que contenga exactamente esos productos
4. Completar el formulario (John / Doe / 90210); valida que total = subtotal + impuesto
5. Finalizar la compra; valida "THANK YOU FOR YOUR ORDER"

### API: [`petstore-user.cy.js`](cypress/e2e/api/petstore-user.cy.js)

Datos en [`user.json`](cypress/fixtures/user.json). Variables: `apiUrl` en `cypress.config.js`; `id` y `username` aleatorios por corrida.

| # | Caso | Request | Resultado esperado |
|---|---|---|---|
| 1 | Crear un usuario | `POST /user` | 200, `message` = id |
| 2 | Buscar el usuario creado | `GET /user/{username}` | 200, datos creados |
| 3 | Actualizar nombre y correo | `PUT /user/{username}` | 200 |
| 4 | Buscar el usuario actualizado | `GET /user/{username}` | 200, datos nuevos |
| 5 | Eliminar el usuario | `DELETE /user/{username}` | 200, `message` = username |
| | Verificar eliminación | `GET /user/{username}` | 404 "User not found" |

## Integración continua

- `.githooks/pre-commit`: ejecuta todas las pruebas antes de cada commit (`git commit --no-verify` para omitir)
- `.github/workflows/cypress.yml`: GitHub Actions ejecuta las pruebas en cada push y pull request a `main` y publica los reportes como artefacto

## Estructura

```
cypress.config.js              configuración, URLs y reporter
cypress/e2e/saucedemo/         prueba E2E
cypress/e2e/api/               pruebas de API
cypress/fixtures/              datos de prueba
cypress/support/commands.js    comando cy.login
collections/                   colección Postman
reports/                       reportes y evidencias generados
conclusiones.txt               hallazgos y conclusiones
```
