import { FC, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import { BurgerConstructorUI } from '@ui';
import { createOrderThunk } from '../../services/slices/orderSlice';
import { TIngredient } from '@utils-types';
import { clearOrder } from '../../services/slices/orderSlice';
import { clearConstructor } from '../../services/slices/constructorBurgerSlice';
import { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor: FC = () => {
  const constructorItems = useAppSelector((state) => state.constructorBurger);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orderRequest = useAppSelector((state) => state.order.loading);
  const orderModalData = useAppSelector((state) => state.order.currentOrder);

  const handleOrderClick = async () => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (!constructorItems.bun || orderRequest) return;

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    await dispatch(createOrderThunk(ingredientIds));
  };

  const constructorItemsTyped = constructorItems as {
    bun: TConstructorIngredient | null;
    ingredients: TConstructorIngredient[];
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
    dispatch(clearConstructor());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce((s, v) => s + v.price, 0),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      orderModalData={orderModalData}
      onOrderClick={handleOrderClick}
      closeOrderModal={closeOrderModal}
      constructorItems={{
        bun: constructorItemsTyped.bun
          ? {
              ...constructorItemsTyped.bun,
              id: constructorItemsTyped.bun.id ?? '',
              uniqueId: constructorItemsTyped.bun.uniqueId ?? ''
            }
          : null,
        ingredients: constructorItemsTyped.ingredients.map((item) => ({
          ...item,
          id: item.id ?? '',
          uniqueId: item.uniqueId ?? ''
        }))
      }}
    />
  );
};
