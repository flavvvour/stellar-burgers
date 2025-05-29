import constructorReducer, {
  addIngredient,
  removeIngredient,
  reorderIngredients,
  addBun,
  clearConstructor
} from '../slices/constructorSlice';

import { TConstructorIngredient, TIngredient } from '@utils-types';

const mockIngredient = (id: string): TConstructorIngredient => ({
  _id: id,
  name: `Начинка ${id}`,
  type: 'sauce',
  uniqueId: `uid-${id}`,
  id,
  proteins: 0,
  fat: 0,
  carbohydrates: 0,
  calories: 0,
  price: 10,
  image: '',
  image_mobile: '',
  image_large: ''
});

const mockBun = (id: string): TIngredient => ({
  _id: id,
  name: `Булка ${id}`,
  type: 'bun',
  proteins: 5,
  fat: 10,
  carbohydrates: 15,
  calories: 200,
  price: 100,
  image: '',
  image_mobile: '',
  image_large: ''
});

describe('constructorSlice', () => {
  it('добавляет ингредиент', () => {
    const initial = { bun: null, ingredients: [] };
    const action = addIngredient(mockIngredient('1'));
    const result = constructorReducer(initial, action);
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]._id).toBe('1');
  });

  it('удаляет ингредиент по индексу', () => {
    const initial = {
      bun: null,
      ingredients: [mockIngredient('1'), mockIngredient('2')]
    };
    const action = removeIngredient(0);
    const result = constructorReducer(initial, action);
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]._id).toBe('2');
  });

  it('меняет порядок ингредиентов', () => {
    const initial = {
      bun: null,
      ingredients: [
        mockIngredient('1'),
        mockIngredient('2'),
        mockIngredient('3')
      ]
    };
    const action = reorderIngredients({ fromIndex: 0, toIndex: 2 });
    const result = constructorReducer(initial, action);

    expect(result.ingredients.map((i) => i._id)).toEqual(['2', '3', '1']);
  });

  it('добавляет булку', () => {
    const initial = { bun: null, ingredients: [] };
    const bun = mockBun('b1');
    const action = addBun(bun);
    const result = constructorReducer(initial, action);
    expect(result.bun).toEqual(bun);
  });

  it('очищает конструктор', () => {
    const initial = {
      bun: mockBun('b1'),
      ingredients: [mockIngredient('1'), mockIngredient('2')]
    };
    const action = clearConstructor();
    const result = constructorReducer(initial, action);

    expect(result.bun).toBeNull();
    expect(result.ingredients).toHaveLength(0);
  });
});
