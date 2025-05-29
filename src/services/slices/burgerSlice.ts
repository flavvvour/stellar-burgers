import {
  createSlice,
  createAsyncThunk,
  nanoid,
  PayloadAction
} from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '@utils-types';
import { getIngredientsApi } from '@api';

interface BurgerState {
  ingredients: TIngredient[];
  constructorItems: {
    bun: TIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: BurgerState = {
  ingredients: [],
  constructorItems: {
    bun: null,
    ingredients: []
  },
  loading: false,
  error: null
};

export const fetchIngredients = createAsyncThunk(
  'burger/fetchIngredients',
  async () => {
    const response = await getIngredientsApi();
    return response;
  }
);

const burgerSlice = createSlice({
  name: 'burger',
  initialState,
  reducers: {
    addIngredient: (state, action: PayloadAction<TIngredient>) => {
      const ingredient = action.payload;
      if (ingredient.type === 'bun') {
        state.constructorItems.bun = ingredient;
      } else {
        state.constructorItems.ingredients.push({
          ...ingredient,
          id: ingredient._id,
          uniqueId: nanoid()
        });
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (item) => item.uniqueId !== action.payload
        );
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ dragIndex: number; hoverIndex: number }>
    ) => {
      const { dragIndex, hoverIndex } = action.payload;
      const ingredients = [...state.constructorItems.ingredients];
      const [removed] = ingredients.splice(dragIndex, 1);
      ingredients.splice(hoverIndex, 0, removed);
      state.constructorItems.ingredients = ingredients;
    },
    clearConstructor: (state) => {
      state.constructorItems = {
        bun: null,
        ingredients: []
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch ingredients';
      });
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} = burgerSlice.actions;

export default burgerSlice.reducer;
