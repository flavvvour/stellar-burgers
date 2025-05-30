import React, { FC } from 'react';
import {
  Button,
  ConstructorElement,
  CurrencyIcon
} from '@zlden/react-developer-burger-ui-components';
import styles from './burger-constructor.module.css';
import { BurgerConstructorUIProps } from './type';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorElement, Modal } from '@components';
import { Preloader, OrderDetailsUI } from '@ui';

export const BurgerConstructorUI: FC<BurgerConstructorUIProps> = ({
  constructorItems,
  orderRequest,
  price,
  orderModalData,
  onOrderClick,
  closeOrderModal
}) => {
  const safeIngredients = constructorItems.ingredients.filter(
    (item): item is TConstructorIngredient =>
      !!item &&
      typeof item._id === 'string' &&
      typeof item.id === 'string' &&
      typeof item.uniqueId === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number'
  );

  return (
    <section className={styles.burger_constructor}>
      {constructorItems.bun ? (
        <div
          className={`${styles.element} mb-4 mr-4`}
          data-testid='constructor-bun-top'
        >
          <ConstructorElement
            type='top'
            isLocked
            text={`${constructorItems.bun.name} (верх)`}
            price={constructorItems.bun.price}
            thumbnail={constructorItems.bun.image}
          />
        </div>
      ) : (
        <div
          className={`${styles.noBuns} ${styles.noBunsTop} ml-8 mb-4 mr-5 text text_type_main-default`}
          data-testid='constructor-bun-top'
        >
          Выберите булки
        </div>
      )}

      <ul
        className={styles.elements}
        data-testid='constructor-main-ingredients'
      >
        {safeIngredients.length > 0 ? (
          safeIngredients.map((item, index) => (
            <BurgerConstructorElement
              ingredient={item}
              index={index}
              totalItems={safeIngredients.length}
              key={item.uniqueId}
            />
          ))
        ) : (
          <li
            className={`${styles.noBuns} ml-8 mb-4 mr-5 text text_type_main-default`}
            data-testid='empty-constructor'
          >
            Выберите начинку
          </li>
        )}
      </ul>

      {constructorItems.bun ? (
        <div
          className={`${styles.element} mt-4 mr-4`}
          data-testid='constructor-bun-bottom'
        >
          <ConstructorElement
            type='bottom'
            isLocked
            text={`${constructorItems.bun.name} (низ)`}
            price={constructorItems.bun.price}
            thumbnail={constructorItems.bun.image}
          />
        </div>
      ) : (
        <div
          className={`${styles.noBuns} ${styles.noBunsBottom} ml-8 mb-4 mr-5 text text_type_main-default`}
          data-testid='constructor-bun-bottom'
        >
          Выберите булки
        </div>
      )}

      <div className={`${styles.total} mt-10 mr-4`}>
        <div className={`${styles.cost} mr-10`}>
          <p className={`text ${styles.text} mr-2`}>{price}</p>
          <CurrencyIcon type='primary' />
        </div>
        <Button
          htmlType='button'
          type='primary'
          size='large'
          onClick={onOrderClick}
          disabled={safeIngredients.length === 0 || !constructorItems.bun}
        >
          Оформить заказ
        </Button>
      </div>

      {orderRequest && (
        <Modal onClose={closeOrderModal} title='Оформляем заказ...'>
          <Preloader />
        </Modal>
      )}

      {orderModalData && (
        <Modal
          onClose={closeOrderModal}
          title={orderRequest ? 'Оформляем заказ...' : ''}
        >
          <OrderDetailsUI orderNumber={orderModalData.number} />
        </Modal>
      )}
    </section>
  );
};
