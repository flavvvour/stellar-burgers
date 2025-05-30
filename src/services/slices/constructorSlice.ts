import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import { TIngredient, TConstructorIngredient } from '@utils-types';

export type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: []
};

const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    addBun(state, action: PayloadAction<TIngredient>) {
      const bun = action.payload;

      if (!bun || !bun._id || bun.type !== 'bun') {
        console.warn('Попытка добавить некорректную булку:', bun);
        return;
      }

      state.bun = {
        ...bun,
        id: nanoid(),
        uniqueId: nanoid()
      };
    },

    addIngredient(state, action: PayloadAction<TIngredient>) {
      const ingredient = action.payload;

      if (!ingredient || !ingredient._id || !ingredient.name) {
        console.warn('Некорректный ингредиент:', ingredient);
        return;
      }

      const enriched: TConstructorIngredient = {
        ...ingredient,
        id: nanoid(),
        uniqueId: nanoid()
      };

      state.ingredients.push(enriched);
    },

    removeIngredient(state, action: PayloadAction<string>) {
      state.ingredients = state.ingredients.filter(
        (item) => item.uniqueId !== action.payload
      );
    },

    reorderIngredients(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      const { fromIndex, toIndex } = action.payload;

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.ingredients.length ||
        toIndex >= state.ingredients.length
      ) {
        console.warn('Попытка некорректной перестановки ингредиентов');
        return;
      }

      const dragged = state.ingredients[fromIndex];
      state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, dragged);
    },

    clearConstructor(state) {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const {
  addBun,
  addIngredient,
  removeIngredient,
  reorderIngredients,
  clearConstructor
} = constructorSlice.actions;

export default constructorSlice.reducer;
