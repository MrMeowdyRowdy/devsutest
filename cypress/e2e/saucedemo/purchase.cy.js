describe('Saucedemo - flujo de compra', () => {
  beforeEach(function () {
    cy.fixture('checkout').as('data');
  });

  it('completa una compra de dos productos', function () {
    const { username, password, products, customer } = this.data;

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

    // 4. Completar el formulario de compra
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type(customer.firstName);
    cy.get('[data-test="lastName"]').type(customer.lastName);
    cy.get('[data-test="postalCode"]').type(customer.postalCode);
    cy.get('[data-test="continue"]').click();

    // Resumen: mismos productos y total = subtotal + impuesto
    cy.url().should('include', '/checkout-step-two.html');
    cy.get('[data-test="inventory-item"]').should('have.length', products.length);
    const amount = (sel) => cy.get(sel).invoke('text').then((t) => parseFloat(t.split('$')[1]));
    amount('[data-test="subtotal-label"]').then((subtotal) => {
      amount('[data-test="tax-label"]').then((tax) => {
        amount('[data-test="total-label"]').should('be.closeTo', subtotal + tax, 0.001);
      });
    });

    // 5. Finalizar la compra hasta la confirmacion
    cy.get('[data-test="finish"]').click();
    cy.url().should('include', '/checkout-complete.html');
    cy.get('[data-test="complete-header"]')
      .invoke('text')
      .should('match', /thank you for your order/i);
    cy.screenshot('orden-confirmada');
  });
});
