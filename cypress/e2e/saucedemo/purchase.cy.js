describe('Saucedemo - flujo de compra', () => {
  beforeEach(function () {
    cy.fixture('checkout').as('data');
  });

  it('completa una compra de dos productos', function () {
    const { username, password } = this.data;

    // 1. Autenticarse
    cy.login(username, password);
    cy.url().should('include', '/inventory.html');
    cy.get('[data-test="title"]').should('have.text', 'Products');
  });
});
