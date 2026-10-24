PRUEBA TECNICA QA - AUTOMATIZACION E2E Y APIS
==============================================

Un solo proyecto Cypress 13 con los dos ejercicios:
  - E2E:  Opcion 2 - Flujo de compra en https://www.saucedemo.com/
  - APIs: Opcion 3 - Ciclo de vida de un usuario en https://petstore.swagger.io/

Las pruebas de API usan cy.request. Hallazgos y conclusiones en
conclusiones.txt.


1. REQUISITOS
-------------
  - Node.js 18 o superior (probado con Node 22) y npm.
  - Git y conexion a internet (las pruebas usan los sitios publicos).
  - Opcional: Postman o newman para la coleccion de collections/.


2. INSTALACION
--------------
  git clone https://github.com/MrMeowdyRowdy/devsutest.git
  cd devsutest
  npm install      (descarga Cypress y activa el hook de pre-commit)


3. EJECUCION
------------
  npm test            todas las pruebas, modo consola
  npm run test:e2e    solo E2E (saucedemo)
  npm run test:api    solo API (Petstore usuarios)
  npm run cy:open     interfaz de Cypress: E2E Testing -> navegador -> spec
  npm run zip         empaqueta el entregable en devsutest.zip
                      (requiere zip: Linux, macOS o WSL)

  Terminal de VS Code en Linux/WSL: VS Code define ELECTRON_RUN_AS_NODE y
  Cypress falla con "bad option: --no-sandbox". Ejecutar con:
    env -u ELECTRON_RUN_AS_NODE npm test

  Coleccion Postman: importar collections/petstore-user.postman_collection.json
  y ejecutarla en orden, o:
    npx newman run collections/petstore-user.postman_collection.json


4. REPORTES Y EVIDENCIAS
------------------------
  npm test genera el reporte completo; test:e2e y test:api lo sobrescriben
  solo con su parte.

  - reports/html/index.html
      Reporte HTML (mochawesome) de todos los casos, con la captura de la
      confirmacion. Abrir con cualquier navegador.
  - reports/api-evidence/*.json
      Entrada y salida de cada llamada: metodo, URL, body enviado, status y
      body recibido.
  - cypress/screenshots/.../orden-confirmada.png
      Captura de "Thank you for your order!".


5. CASOS AUTOMATIZADOS
----------------------
  E2E - cypress/e2e/saucedemo/purchase.cy.js
  Datos: cypress/fixtures/checkout.json
    1. Autenticarse con standard_user / secret_sauce.
    2. Agregar dos productos al carrito (Sauce Labs Backpack y Sauce Labs Bolt
       T-Shirt); valida el boton "Remove" y el contador = 2.
    3. Visualizar el carrito; valida que contenga exactamente esos productos.
    4. Completar el formulario (John / Doe / 90210); valida que
       total = subtotal + impuesto.
    5. Finalizar la compra; valida "THANK YOU FOR YOUR ORDER".

  API - cypress/e2e/api/petstore-user.cy.js
  Datos: cypress/fixtures/user.json
  Variables: apiUrl en cypress.config.js; id y username aleatorios por corrida.
    1. Crear un usuario            POST   /user             -> 200, message = id
    2. Buscar el usuario creado    GET    /user/{username}  -> 200, datos creados
    3. Actualizar nombre y correo  PUT    /user/{username}  -> 200
    4. Buscar usuario actualizado  GET    /user/{username}  -> 200, datos nuevos
    5. Eliminar el usuario         DELETE /user/{username}  -> 200, message = username
       Verificar eliminacion       GET    /user/{username}  -> 404 "User not found"


6. INTEGRACION CONTINUA
-----------------------
  - .githooks/pre-commit: ejecuta todas las pruebas antes de cada commit
    (git commit --no-verify para omitir).
  - .github/workflows/cypress.yml: GitHub Actions ejecuta las pruebas en cada
    push y pull request a main y publica los reportes como artefacto.


7. ESTRUCTURA
-------------
  cypress.config.js              configuracion, URLs y reporter
  cypress/e2e/saucedemo/         prueba E2E
  cypress/e2e/api/               pruebas de API
  cypress/fixtures/              datos de prueba
  cypress/support/commands.js    comando cy.login
  collections/                   coleccion Postman
  reports/                       reportes y evidencias generados
  README.md                      instrucciones (formato Markdown)
  readme.txt                     este archivo (texto plano)
  conclusiones.txt               hallazgos y conclusiones
