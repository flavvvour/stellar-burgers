import { FC, memo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useAppDispatch } from '../../services/store';
import {
  removeIngredient,
  moveIngredient
} from '../../services/slices/constructorBurgerSlice';
import { BurgerConstructorElementUI } from '@ui';
import { BurgerConstructorElementProps } from './type';

export const BurgerConstructorElement: FC<BurgerConstructorElementProps> = memo(
  ({ ingredient, index, totalItems }) => {
    const dispatch = useAppDispatch();
    const ref = useRef<HTMLLIElement>(null);

    // DnD: элемент можно тянуть
    const [, dragRef] = useDrag({
      type: 'ingredient',
      item: { index }
    });

    // DnD: элемент можно принять как цель
    const [, dropRef] = useDrop({
      accept: 'ingredient',
      hover(item: { index: number }) {
        if (item.index === index) return;
        dispatch(moveIngredient({ fromIndex: item.index, toIndex: index }));
        item.index = index; // Обновляем индекс текущего item-а
      }
    });

    dragRef(dropRef(ref)); // Комбинируем drag + drop

    const handleMoveUp = () => {
      if (index > 0) {
        dispatch(moveIngredient({ fromIndex: index, toIndex: index - 1 }));
      }
    };

    const handleMoveDown = () => {
      if (index < totalItems - 1) {
        dispatch(moveIngredient({ fromIndex: index, toIndex: index + 1 }));
      }
    };

    const handleClose = () => {
      dispatch(removeIngredient(ingredient.id));
    };

    return (
      <li ref={ref}>
        <BurgerConstructorElementUI
          ingredient={ingredient}
          index={index}
          totalItems={totalItems}
          handleMoveUp={handleMoveUp}
          handleMoveDown={handleMoveDown}
          handleClose={handleClose}
        />
      </li>
    );
  }
);
