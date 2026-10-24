// Pruebas de la API de usuarios de https://petstore.swagger.io
// Los casos van en orden y comparten el usuario creado en el primero.
describe('Petstore API - ciclo de vida de un usuario', () => {
  const api = Cypress.env('apiUrl');
  // id y username unicos por corrida: los datos del servidor publico son compartidos
  const id = Math.floor(Math.random() * 2 ** 31);
  const username = `qa_${id}`;
  let user;
  let changes;

  // El servidor publico tarda en reflejar las escrituras: reintenta el GET hasta que cumpla la condicion
  const getUserUntil = (condition, attempts = 10) =>
    cy.request({ url: `${api}/user/${username}`, failOnStatusCode: false }).then((res) => {
      if (condition(res) || attempts <= 1) return res;
      cy.wait(1000);
      return getUserUntil(condition, attempts - 1);
    });

  // Guarda entrada y salida de cada llamada como evidencia en reports/api-evidence/
  const evidence = (name, method, input, res) => {
    cy.log(`${method} ${name}`, JSON.stringify(res.body));
    cy.writeFile(`reports/api-evidence/${name}.json`, {
      request: { method, url: `${api}/user/${username}`, body: input },
      response: { status: res.status, body: res.body },
    });
  };

  before(() => {
    cy.fixture('user').then(({ update, ...data }) => {
      user = { id, username, ...data };
      changes = update;
    });
  });

  it('1. Crear un usuario', () => {
    cy.request('POST', `${api}/user`, user).then((res) => {
      evidence('1-crear-usuario', 'POST', user, res);
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq({ code: 200, type: 'unknown', message: String(id) });
    });
  });

  it('2. Buscar el usuario creado', () => {
    getUserUntil((res) => res.status === 200).then((res) => {
      evidence('2-buscar-usuario', 'GET', null, res);
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.include({
        id,
        username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    });
  });

  it('3. Actualizar el nombre y el correo del usuario', () => {
    const updated = { ...user, ...changes };
    cy.request('PUT', `${api}/user/${username}`, updated).then((res) => {
      evidence('3-actualizar-usuario', 'PUT', updated, res);
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq({ code: 200, type: 'unknown', message: String(id) });
    });
  });

  it('4. Buscar el usuario actualizado', () => {
    getUserUntil((res) => res.body.firstName === changes.firstName).then((res) => {
      evidence('4-buscar-usuario-actualizado', 'GET', null, res);
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.include({
        id,
        username,
        firstName: changes.firstName,
        email: changes.email,
        lastName: user.lastName, // lo que no se actualiza se conserva
      });
    });
  });

  it('5. Eliminar el usuario', () => {
    cy.request('DELETE', `${api}/user/${username}`).then((res) => {
      evidence('5-eliminar-usuario', 'DELETE', null, res);
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq({ code: 200, type: 'unknown', message: username });
    });

    // Verificacion: el usuario ya no existe
    getUserUntil((res) => res.status === 404).then((res) => {
      evidence('5-verificar-eliminado', 'GET', null, res);
      expect(res.status).to.eq(404);
      expect(res.body).to.deep.eq({ code: 1, type: 'error', message: 'User not found' });
    });
  });
});
