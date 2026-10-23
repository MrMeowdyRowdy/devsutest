describe('Saucedemo - flujo de compra', () => {
  beforeEach(function () {
    cy.fixture('checkout').as('data');
  });

  it('completa una compra de dos productos', function () {
    const { username, password, products } = this.data;

    // 1. Autenticarse
    cy.login(username, password);
    cy.url().should('include', '/inventory.html');
    cy.get('[data-test="title"]').should('have.text', 'Products');

    // 2. Agregar dos productos al carrito
    products.forEach((name) => {
      // el boton se reemplaza al hacer click, por eso se vuelve a buscar
      cy.contains('[data-test="inventory-item"]', name).find('button').should('have.text', 'Add to cart').click();
      cy.contains('[data-test="inventory-item"]', name).find('button').should('have.text', 'Remove');
    });
    cy.get('[data-test="shopping-cart-badge"]').should('have.text', String(products.length));

    // 3. Visualizar el carrito
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.url().should('include', '/cart.html');
    cy.get('[data-test="inventory-item"]').should('have.length', products.length);
    products.forEach((name) => {
      cy.contains('[data-test="inventory-item-name"]', name).should('be.visible');
    });
  });
});
