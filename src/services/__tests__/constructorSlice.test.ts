import constructorReducer, {
  addIngredient,
  removeIngredient,
  reorderIngredients,
  addBun,
  clearConstructor,
  TConstructorState
} from '../slices/constructorSlice';

import { TConstructorIngredient } from '@utils-types';

jest.mock('nanoid', () => ({
  nanoid: () => 'fixed-id'
}));

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

const mockBun = (id: string): TConstructorIngredient => ({
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
  image_large: '',
  id,
  uniqueId: `uid-${id}`
});

describe('constructorSlice', () => {
  it('добавляет ингредиент', () => {
    const initial = { bun: null, ingredients: [] as TConstructorIngredient[] };
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
    const bun = mockBun('b1');
    const initial = {
      bun: null as TConstructorIngredient | null,
      ingredients: []
    };
    const action = addBun(bun);
    const result = constructorReducer(initial, action);
    expect(result.bun).toMatchObject({
      ...bun,
      id: 'fixed-id',
      uniqueId: 'fixed-id',
      type: 'bun'
    });
  });
  it('сбрасывает конструктор', () => {
    const initial = {
      bun: mockBun('b1'),
      ingredients: [mockIngredient('1'), mockIngredient('2')]
    };
    const action = clearConstructor();
    const result = constructorReducer(initial, action);

    expect(result.bun).toBeNull();
    expect(result.ingredients).toEqual([]);
  });
});
