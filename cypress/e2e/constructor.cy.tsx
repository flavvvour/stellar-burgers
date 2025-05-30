/// <reference types="cypress" />

const LABELS = {
  FILLING: 'Соус Spicy-X',
  BREAD: 'Флюоресцентная булка R2-D3'
} as const;

const ING_IDS = {
  FILLING: '60d3b41abdacab0026a733cc',
  BREAD: '643d69a5c3f7b9001cfa093d'
} as const;

const SELECTORS = {
  ITEM: '[data-testid="ingredient-item"]',
  MAIN_AREA: '[data-testid="constructor-main-ingredients"]',
  BUN_TOP: '[data-testid="constructor-bun-top"]',
  BUN_BOTTOM: '[data-testid="constructor-bun-bottom"]',
  MODAL: '[data-testid="modal"]',
  MODAL_CLOSE: '[data-testid="modal-close"]',
  FILLING_ITEM: '[data-testid="constructor-ingredient"]',
  EMPTY: '[data-testid="empty-constructor"]',
  CONSTRUCTOR_AREA: '[data-testid="constructor-main-ingredients"]'
} as const;

const clickToAdd = (label: string) => {
  cy.get(SELECTORS.ITEM).contains(label).parents('li').find('button').click();
};

const moveIngredient = (from: number, to: number) => {
  cy.get(SELECTORS.FILLING_ITEM).eq(from).trigger('dragstart', { force: true });
  cy.get(SELECTORS.FILLING_ITEM).eq(to).trigger('drop', { force: true });
};

beforeEach(() => {
  cy.setCookie('refreshToken', 'mock.refresh.token');

  cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as(
    'getUser'
  );
  cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as(
    'getIngredients'
  );
  cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as(
    'createOrder'
  );

  cy.visit('/');
  cy.wait('@getIngredients');
});

afterEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

describe('Сборка и оформление бургера', () => {
  it('проверяет отображение ингредиентов', () => {
    cy.contains('Соберите бургер');
    cy.get(SELECTORS.ITEM).contains(LABELS.FILLING);
    cy.get(SELECTORS.ITEM).contains(LABELS.BREAD);
  });

  context('Добавление ингредиентов', () => {
    it('добавляет начинку через кнопку', () => {
      cy.get(SELECTORS.MAIN_AREA).should('contain', 'Выберите начинку');
      clickToAdd(LABELS.FILLING);
      cy.get(SELECTORS.FILLING_ITEM)
        .should('have.length.at.least', 1)
        .and('contain', LABELS.FILLING);
    });

    it('добавляет булку через кнопку', () => {
      cy.get(SELECTORS.BUN_TOP).should('contain', 'Выберите булки');
      clickToAdd(LABELS.BREAD);
      cy.get(SELECTORS.BUN_TOP).should('contain', `${LABELS.BREAD} (верх)`);
      cy.get(SELECTORS.BUN_BOTTOM).should('contain', `${LABELS.BREAD} (низ)`);
    });

    it('перетаскивает начинку внутри конструктора', () => {
      clickToAdd(LABELS.FILLING);
      clickToAdd(LABELS.FILLING);
      cy.get(SELECTORS.FILLING_ITEM).should('have.length.at.least', 2);
      moveIngredient(1, 0);
      cy.get(SELECTORS.FILLING_ITEM).eq(0).should('contain', LABELS.FILLING);
    });

    it('добавляет ингредиенты через drag-and-drop', () => {
      cy.get(SELECTORS.ITEM)
        .contains(LABELS.BREAD)
        .trigger('dragstart', { force: true });

      cy.get(SELECTORS.CONSTRUCTOR_AREA)
        .first()
        .trigger('drop', { force: true });

      cy.get(SELECTORS.BUN_TOP).should('contain', LABELS.BREAD);
    });
  });

  context('Модальное окно ингредиента', () => {
    beforeEach(() => {
      window.localStorage.setItem('accessToken', 'mock.access.token');
      cy.setCookie('refreshToken', 'mock.refresh.token');
    });

    it('открывает, показывает и закрывает модалку', () => {
      cy.get(SELECTORS.ITEM)
        .contains(LABELS.FILLING)
        .parents('li')
        .find('a')
        .click({ force: true });

      cy.url().should('include', `/ingredients/${ING_IDS.FILLING}`);
      cy.get(SELECTORS.MODAL).should('exist');
      cy.contains('Калории,').parent().contains('30');
      cy.contains('Белки,').parent().contains('30');
      cy.contains('Жиры,').parent().contains('20');
      cy.contains('Углеводы,').parent().contains('40');
      cy.get(SELECTORS.MODAL_CLOSE).click();
      cy.get(SELECTORS.MODAL).should('not.exist');
    });

    it('закрывает модалку по клику на оверлей', () => {
      cy.get(SELECTORS.ITEM)
        .contains(LABELS.FILLING)
        .parents('li')
        .find('a')
        .click({ force: true });

      cy.url().should('include', `/ingredients/${ING_IDS.FILLING}`);
      cy.get(SELECTORS.MODAL).should('exist');
      cy.get('body').click(0, 0);
      cy.get(SELECTORS.MODAL).should('not.exist');
    });
  });
});

describe('Регистрация пользователя и оформление заказа', () => {
  it('успешно регистрирует нового пользователя и оформляет заказ', () => {
    const email = `test-${Date.now()}@example.com`;
    const password = '123456';

    cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as(
      'createOrder'
    );
    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as(
      'getUser'
    );

    cy.visit('/register');
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.contains('button', 'Зарегистрироваться').click();
    cy.url().should('not.include', '/register');

    cy.visit('/');
    cy.wait('@getUser');
    cy.wait('@getIngredients');

    clickToAdd(LABELS.BREAD);
    clickToAdd(LABELS.FILLING);

    cy.contains('button', 'Оформить заказ').click();
    cy.wait('@createOrder');

    cy.get(SELECTORS.MODAL).should('contain', '79456');
    cy.get(SELECTORS.MODAL_CLOSE).click();
    cy.get(SELECTORS.MODAL).should('not.exist');

    cy.get(SELECTORS.BUN_TOP).should('contain', 'Выберите булки');
    cy.get(SELECTORS.BUN_BOTTOM).should('contain', 'Выберите булки');
    cy.get(SELECTORS.EMPTY).should('exist');
  });
});
