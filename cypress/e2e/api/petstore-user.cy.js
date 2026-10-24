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

  before(() => {
    cy.fixture('user').then(({ update, ...data }) => {
      user = { id, username, ...data };
      changes = update;
    });
  });

  it('1. Crear un usuario', () => {
    cy.request('POST', `${api}/user`, user).then((res) => {
      cy.log('Entrada', JSON.stringify(user));
      cy.log('Salida', JSON.stringify(res.body));
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq({ code: 200, type: 'unknown', message: String(id) });
    });
  });

  it('2. Buscar el usuario creado', () => {
    getUserUntil((res) => res.status === 200).then((res) => {
      cy.log('Salida', JSON.stringify(res.body));
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
      cy.log('Entrada', JSON.stringify(updated));
      cy.log('Salida', JSON.stringify(res.body));
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq({ code: 200, type: 'unknown', message: String(id) });
    });
  });

  it('4. Buscar el usuario actualizado', () => {
    getUserUntil((res) => res.body.firstName === changes.firstName).then((res) => {
      cy.log('Salida', JSON.stringify(res.body));
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
      cy.log('Salida', JSON.stringify(res.body));
      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq({ code: 200, type: 'unknown', message: username });
    });

    // Verificacion: el usuario ya no existe
    getUserUntil((res) => res.status === 404).then((res) => {
      cy.log('Salida', JSON.stringify(res.body));
      expect(res.status).to.eq(404);
      expect(res.body).to.deep.eq({ code: 1, type: 'error', message: 'User not found' });
    });
  });
});
